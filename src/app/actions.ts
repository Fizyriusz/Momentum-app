"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper: dzisiejsza data jako string YYYY-MM-DD z uwzględnieniem lokalnej strefy czasowej
function getTodayString(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split("T")[0];
}

// ──────────────────────────────────────────
// NAWYKI
// ──────────────────────────────────────────

export async function getHabitsForToday() {
  return prisma.habit.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function toggleHabit(id: number) {
  const habit = await prisma.habit.findUnique({ where: { id } });
  if (!habit) return;

  const today = getTodayString();
  let dates: string[] = [];
  try {
    dates = JSON.parse(habit.completedDates);
  } catch (e) {
    dates = [];
  }

  if (dates.includes(today)) {
    dates = dates.filter(d => d !== today);
  } else {
    dates.push(today);
  }

  await prisma.habit.update({
    where: { id },
    data: { completedDates: JSON.stringify(dates) },
  });

  revalidatePath("/");
  revalidatePath("/habits");
}

// ──────────────────────────────────────────
// SKILLE (PROJEKTY / INICJATYWY)
// ──────────────────────────────────────────

export async function getSkills() {
  const today = getTodayString();

  // Leniwy reset dzisiejszego licznika dla SKILLI
  await prisma.skill.updateMany({
    where: {
      lastLoggedDate: { not: today },
    },
    data: {
      loggedMinutesToday: 0,
      lastLoggedDate: today,
    }
  });

  return prisma.skill.findMany({
    where: { status: "ACTIVE" },
    orderBy: { id: "asc" },
    include: {
      timeLogs: {
        orderBy: { createdAt: "desc" }
      },
      projects: {
        include: {
          tasks: {
            include: {
              tags: true
            }
          },
        }
      }
    }
  });
}

export async function getIncubatorSkills() {
  return prisma.skill.findMany({
    where: { status: "INBOX" },
    orderBy: { createdAt: "desc" },
  });
}

export async function activateSkill(id: number) {
  await prisma.skill.update({
    where: { id },
    data: { status: "ACTIVE" }
  });
  revalidatePath("/incubator");
  revalidatePath("/projects");
  revalidatePath("/");
}

// ----------------------------------------------------------------------
// ACTIVE PROJECTS / SKILLS
// ----------------------------------------------------------------------

export async function updateSkillDetails(id: number, data: { title?: string, goal?: string | null, description?: string | null, targetMinutes?: number, period?: string }) {
  await prisma.skill.update({
    where: { id },
    data
  });
  revalidatePath("/skills/[id]", "page");
  revalidatePath("/projects");
  revalidatePath("/");
}

export async function createProjectList(skillId: number, name: string = "Zadania") {
  await prisma.project.create({
    data: {
      name,
      skillId
    }
  });
  revalidatePath("/skills/[id]", "page");
  revalidatePath("/projects");
  revalidatePath("/");
}

export async function createIncubatorSkill(title: string) {
  if (!title.trim()) return;
  await prisma.skill.create({
    data: {
      title,
      status: "INBOX",
      icon: "Lightbulb",
    }
  });
  revalidatePath("/", "layout");
}

export async function addMinutesToSkill(id: number, minutes: number) {
  if (minutes <= 0) return;

  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill) return;

  const today = getTodayString();
  const isNewDay = skill.lastLoggedDate !== today;

  await prisma.$transaction([
    prisma.skill.update({
      where: { id },
      data: {
        loggedMinutes: skill.loggedMinutes + minutes,
        loggedMinutesToday: isNewDay ? minutes : skill.loggedMinutesToday + minutes,
        lastLoggedDate: today,
      },
    }),
    prisma.timeLog.create({
      data: {
        skillId: id,
        minutes
      }
    })
  ]);

  revalidatePath("/");
  revalidatePath("/skills/[id]", "page");
}

export async function resetSkills() {
  await prisma.skill.updateMany({
    data: {
      loggedMinutes: 0,
      loggedMinutesToday: 0,
      lastLoggedDate: getTodayString(),
    }
  });
}

// ──────────────────────────────────────────
// TASKS, INBOX & TAGS
// ──────────────────────────────────────────

export async function getInboxTasks() {
  return prisma.task.findMany({
    where: {
      projectId: null,
      isCompleted: false, // Pobieramy tylko nieukończone zadania
    },
    include: {
      tags: true
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTaskDetails(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      tags: true,
      project: {
        include: {
          skill: true
        }
      }
    }
  });
}

export async function updateTask(id: string, data: {
  title?: string;
  description?: string | null;
  imageUrl?: string | null;
  projectId?: string | null;
  dueDate?: Date | null;
  tagNames?: string[];
}) {
  const updateData: any = {};
  
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.projectId !== undefined) updateData.projectId = data.projectId;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;

  if (data.tagNames !== undefined) {
    // Najpierw odpinamy stare tagi (ustawiamy pustą listę w update)
    // Prisma `set: []` clears existing connections
    const connectOrCreateTags = data.tagNames.map(tagName => ({
      where: { name: tagName.toLowerCase() },
      create: { name: tagName.toLowerCase(), color: "purple-500" }
    }));
    
    updateData.tags = {
      set: [], // Wyczyść obecne
      connectOrCreate: connectOrCreateTags
    };
  }

  await prisma.task.update({
    where: { id },
    data: updateData
  });

  revalidatePath("/", "layout");
}

export async function createTask(title: string, projectId?: string, dueDate?: Date) {
  if (!title.trim()) return;

  // Parsowanie hashtagów (np. #zakupy, #dom)
  const tagRegex = /#[\w\u00C0-\u017F]+/g; // Wspiera polskie znaki
  const foundTags = title.match(tagRegex) || [];
  
  // Oczyszczony tytuł bez hashtagów
  const cleanTitle = title.replace(tagRegex, "").replace(/\s+/g, " ").trim();
  const finalTitle = cleanTitle.length > 0 ? cleanTitle : title.trim();

  const connectOrCreateTags = foundTags.map(tag => {
    const tagName = tag.slice(1).toLowerCase();
    return {
      where: { name: tagName },
      create: { name: tagName, color: "purple-500" }
    };
  });

  await prisma.task.create({
    data: {
      title: finalTitle,
      projectId: projectId || null,
      dueDate: dueDate || null,
      tags: {
        connectOrCreate: connectOrCreateTags
      }
    },
  });

  // Czyścimy cały cache dla pełnej odnowy
  revalidatePath("/", "layout");
}

export async function toggleTaskStatus(id: string, currentStatus: boolean) {
  await prisma.task.update({
    where: { id },
    data: { isCompleted: !currentStatus },
  });

  revalidatePath("/", "layout");
}

export async function getAllTags() {
  return prisma.tag.findMany({
    orderBy: { name: "asc" }
  });
}

export async function getTasksByTimeframe(timeframe: "today" | "tomorrow" | "upcoming") {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localNow = new Date(now.getTime() - offset);
  
  const todayStr = localNow.toISOString().split("T")[0];
  
  const tomorrowDate = new Date(localNow.getTime() + 86400000);
  const tomorrowStr = tomorrowDate.toISOString().split("T")[0];
  
  const next7DaysDate = new Date(localNow.getTime() + (7 * 86400000));
  const next7DaysStr = next7DaysDate.toISOString().split("T")[0];

  let dateFilter = {};
  
  // Zadania na dziś ORAZ wszystkie zadania zaległe (dueDate < dzisiaj)
  if (timeframe === "today") {
    dateFilter = {
      dueDate: { lte: new Date(`${todayStr}T23:59:59Z`) }
    };
  } else if (timeframe === "tomorrow") {
    dateFilter = {
      dueDate: {
        gte: new Date(`${tomorrowStr}T00:00:00Z`),
        lte: new Date(`${tomorrowStr}T23:59:59Z`)
      }
    };
  } else if (timeframe === "upcoming") {
    dateFilter = {
      dueDate: {
        gt: new Date(`${tomorrowStr}T23:59:59Z`),
        lte: new Date(`${next7DaysStr}T23:59:59Z`)
      }
    };
  }

  return prisma.task.findMany({
    where: {
      isCompleted: false,
      ...dateFilter,
    },
    include: {
      tags: true
    },
    orderBy: { dueDate: "asc" },
  });
}

// ──────────────────────────────────────────
// NOTATKI
// ──────────────────────────────────────────

export async function getNotes() {
  return prisma.note.findMany({
    orderBy: { updatedAt: "desc" },
    include: { skill: true }
  });
}

export async function getProjectNotes(skillId: number) {
  return prisma.note.findMany({
    where: { skillId },
    orderBy: { updatedAt: "desc" }
  });
}

export async function createNote(data: { title: string, content: string, skillId?: number }) {
  await prisma.note.create({
    data: {
      title: data.title || "Nowa Notatka",
      content: data.content,
      skillId: data.skillId || null
    }
  });
  revalidatePath("/notes");
  if (data.skillId) {
    revalidatePath("/skills/[id]", "page");
  }
}

export async function updateNote(id: string, data: { title?: string, content?: string }) {
  await prisma.note.update({
    where: { id },
    data
  });
  revalidatePath("/notes");
  // W przypadku aktualizacji notatki w projekcie, ciężko namierzyć skillId z góry, ale możemy revalidate wszystko
  revalidatePath("/", "layout"); 
}

export async function deleteNote(id: string) {
  await prisma.note.delete({ where: { id } });
  revalidatePath("/", "layout");
}

