import { prisma } from "@/lib/prisma";
import { SkillCard } from "@/components/skill-card";
import { notFound } from "next/navigation";
import { TaskList } from "@/components/task-list";
import { QuickAddTask } from "@/components/quick-add-task";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo } from "lucide-react";
import { createProjectList } from "@/app/actions";

import { getProjectNotes } from "@/app/actions";
import { NotesManager } from "@/components/notes-manager";

export const dynamic = "force-dynamic";

export default async function SkillPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  
  if (isNaN(id)) {
    notFound();
  }

  const skill = await prisma.skill.findUnique({
    where: { id },
    include: {
      timeLogs: {
        orderBy: { createdAt: "desc" }
      },
      notes: {
        orderBy: { updatedAt: "desc" }
      },
      projects: {
        include: {
          tasks: {
            include: { tags: true },
            orderBy: { createdAt: "desc" }
          },
        }
      }
    }
  });

  if (!skill) {
    notFound();
  }

  // Akcja serwerowa wywoływana z przycisku (inline server action na rzecz wygenerowania listy)
  async function handleCreateDefaultList() {
    "use server";
    await createProjectList(id, "Główna Lista Zadań");
  }

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-10">
      {/* 1. Projekt i Szczegóły */}
      <section>
        <SkillCard skill={skill} />
      </section>

      {/* 2. Notatki */}
      <section>
        <NotesManager initialNotes={skill.notes} projectId={skill.id} />
      </section>

      {/* 3. Lista Zadań bezpośrenio na ekranie */}
      <section className="space-y-6 mt-8">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2">Zadania Projektu</h2>
        
        {skill.projects.length > 0 ? (
          <div className="space-y-8">
            {skill.projects.map(project => (
              <div key={project.id} className="space-y-4">
                <QuickAddTask projectId={project.id} />
                <TaskList tasks={project.tasks} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-zinc-500 flex flex-col items-center gap-4 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
            <div className="p-3 bg-zinc-800/50 rounded-full">
              <ListTodo className="w-6 h-6 text-zinc-600" />
            </div>
            <div>
              <p className="font-medium text-zinc-300">Projekt nie posiada jeszcze listy zadań.</p>
              <p className="text-xs mt-1 max-w-sm mx-auto">Aby zacząć dodawać zadania, kliknij poniższy przycisk szybkiego startu.</p>
            </div>
            <form action={handleCreateDefaultList}>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white mt-2 shadow-lg shadow-purple-900/20">
                <Plus className="w-4 h-4 mr-2" /> Inicjuj przestrzeń roboczą
              </Button>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}
