import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Czyszczenie bazy danych...");
  await prisma.task.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.project.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.habit.deleteMany();

  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  const todayStr = new Date(d.getTime() - offset).toISOString().split("T")[0];
  const yesterdayStr = new Date(d.getTime() - offset - 86400000).toISOString().split("T")[0];

  console.log("🌱 Tworzenie Nawyków...");
  await prisma.habit.createMany({
    data: [
      { title: "Zimny prysznic", sortOrder: 1, completedDates: JSON.stringify([todayStr]) },
      { title: "Przegląd rynku (15m)", sortOrder: 2, completedDates: JSON.stringify([yesterdayStr]) },
      { title: "Networking na X / LinkedIn", sortOrder: 3, completedDates: "[]" },
    ],
  });

  console.log("🚀 Tworzenie Projektów (Dawne Skille)...");
  await prisma.skill.createMany({
    data: [
      {
        title: "Aplikacja AI dla księgowych",
        status: "ACTIVE",
        targetMinutes: 1200, // 20h
        period: "MONTH",
        icon: "Bot",
      },
      {
        title: "Kurs: Vibe Coding Masterclass",
        status: "ACTIVE",
        targetMinutes: 600, // 10h
        period: "MONTH",
        icon: "Code",
      },
      {
        title: "Platforma SaaS dla Dietetyków",
        status: "INBOX", // Inkubator
        targetMinutes: 240, 
        period: "WEEK",
        icon: "Lightbulb",
      },
    ],
  });

  const aiApp = await prisma.skill.findFirst({
    where: { title: "Aplikacja AI dla księgowych" }
  });

  console.log("🏷️ Tworzenie Tagów...");
  const tagDev = await prisma.tag.create({ data: { name: "dev", color: "blue-500" } });
  const tagMarketing = await prisma.tag.create({ data: { name: "marketing", color: "orange-500" } });
  const tagBug = await prisma.tag.create({ data: { name: "bug", color: "red-500" } });

  if (aiApp) {
    console.log("🗂️ Tworzenie List Zadań i Zadań...");
    const project = await prisma.project.create({
      data: {
        name: "MVP Faza 1",
        color: "purple-500",
        skillId: aiApp.id,
      }
    });

    await prisma.task.create({
      data: {
        title: "Zintegrować API OpenAI",
        description: "Podpiąć gpt-4o dla automatycznego parsowania faktur. Klucze są w środowisku deweloperskim.",
        projectId: project.id,
        isCompleted: true,
      }
    });

    await prisma.task.create({
      data: {
        title: "Naprawić błąd autoryzacji JWT",
        projectId: project.id,
        isCompleted: false,
        tags: { connect: [{ id: tagBug.id }] }
      }
    });
  }

  // Zadania w Inboxie (Zwykłe zadania)
  await prisma.task.create({
    data: {
      title: "Założyć spółkę LLC",
      description: "Poszukać pośredników na wykopie i sprawdzić koszty w Wyoming.",
      isCompleted: false,
      tags: { connect: [{ id: tagDev.id }] } // Użyjemy dev chociaż nie pasuje idealnie
    }
  });

  await prisma.task.create({
    data: {
      title: "Nagrać rolkę o nowym pomyśle",
      isCompleted: false,
      tags: { connect: [{ id: tagMarketing.id }] }
    }
  });

  console.log("✅ Seed zakończony pomyślnie!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
