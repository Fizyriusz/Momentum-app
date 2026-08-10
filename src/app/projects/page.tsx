"use client";

import { useProjects, useTasks } from "@/lib/services/tasks";
import { useSkills } from "@/lib/services/skills";
import { Sword } from "lucide-react";
import { TaskList } from "@/components/task-list";
import { QuickAddTask } from "@/components/quick-add-task";

export default function ProjectsPage() {
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const { skills, loading: skillsLoading } = useSkills("ACTIVE"); // Pobieramy skille by zmapować nazwy projektów

  const loading = projectsLoading || tasksLoading || skillsLoading;

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <Sword className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Zbrojownia</h1>
          <p className="text-zinc-500 text-sm font-medium mt-0.5">Twoje projekty i struktury zadań.</p>
        </div>
      </header>

      <section className="space-y-6 mt-4">
        {loading ? (
          <div className="text-zinc-500 text-sm p-4 text-center">Ładowanie...</div>
        ) : projects.length === 0 ? (
          <div className="text-center p-12 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl">
            <Sword className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-zinc-300">Brak projektów</h3>
            <p className="text-zinc-500 text-sm mt-2">
              (W przyszłości pojawi się tutaj kreator projektów z możliwością przypisania do Skilla)
            </p>
          </div>
        ) : (
          projects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const parentSkill = skills.find(s => s.id === project.skillId);

            return (
              <div key={project.id} className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-md">
                <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full bg-${project.color}`} />
                    <h3 className="font-bold text-lg text-zinc-100">{project.name}</h3>
                  </div>
                  {parentSkill && (
                    <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md uppercase tracking-wider">
                      {parentSkill.title}
                    </span>
                  )}
                </div>
                <div className="p-4 bg-zinc-950/50">
                  <QuickAddTask projectId={project.id} />
                  <TaskList tasks={projectTasks} />
                </div>
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}
