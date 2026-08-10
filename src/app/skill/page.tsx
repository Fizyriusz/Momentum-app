"use client";

import { useSearchParams, notFound } from "next/navigation";
import { Suspense } from "react";
import { SkillCard } from "@/components/skill-card";
import { TaskList } from "@/components/task-list";
import { QuickAddTask } from "@/components/quick-add-task";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo } from "lucide-react";
import { NotesManager } from "@/components/notes-manager";
import { useSkill } from "@/lib/services/skills";
import { useProjectTasks, createProjectList } from "@/lib/services/tasks";
import { useNotes } from "@/lib/services/notes";
import { useTimeLogs } from "@/lib/services/timeLogs";

function SkillPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const { skill, loading: skillLoading } = useSkill(id || "");
  const { projects, tasks, loading: projectsLoading } = useProjectTasks(id || "");
  const { notes, loading: notesLoading } = useNotes(id || "");
  const { timeLogs, loading: timeLogsLoading } = useTimeLogs(id || "");

  if (!id) return <div className="text-zinc-500 text-center py-20">Brak ID projektu.</div>;

  if (skillLoading || projectsLoading || notesLoading || timeLogsLoading) {
    return <div className="text-zinc-500 text-center py-20">Ładowanie...</div>;
  }

  if (!skill) {
    notFound();
  }

  const handleCreateDefaultList = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProjectList(id, "Główna Lista Zadań");
  };

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-10">
      {/* 1. Projekt i Szczegóły */}
      <section>
        <SkillCard skill={skill} timeLogs={timeLogs} />
      </section>

      {/* 2. Notatki */}
      <section>
        <NotesManager initialNotes={notes} projectId={skill.id} />
      </section>

      {/* 3. Lista Zadań bezpośrednio na ekranie */}
      <section className="space-y-6 mt-8">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2">Zadania Projektu</h2>
        
        {projects.length > 0 ? (
          <div className="space-y-8">
            {projects.map(project => {
              const projectTasks = tasks.filter(t => t.projectId === project.id);
              return (
                <div key={project.id} className="space-y-4">
                  <QuickAddTask projectId={project.id} />
                  <TaskList tasks={projectTasks} />
                </div>
              );
            })}
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
            <form onSubmit={handleCreateDefaultList}>
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

export default function SkillPage() {
  return (
    <Suspense fallback={<div className="text-zinc-500 text-center py-20">Ładowanie...</div>}>
      <SkillPageContent />
    </Suspense>
  );
}
