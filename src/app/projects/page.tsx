"use client";

import { useSearchParams, notFound } from "next/navigation";
import { Suspense } from "react";
import { ProjectCard } from "@/components/project-card";
import { TaskList } from "@/components/task-list";
import { QuickAddTask } from "@/components/quick-add-task";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo, Briefcase } from "lucide-react";
import { NotesManager } from "@/components/notes-manager";
import { useProject, useProjects } from "@/lib/services/projects";
import { useProjectTasks, createTaskList } from "@/lib/services/tasks";
import { useNotes } from "@/lib/services/notes";
import { useTimeLogs } from "@/lib/services/timeLogs";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

function ProjectDetailsView({ id }: { id: string }) {
  const { project, loading: projectLoading } = useProject(id);
  const { taskLists, tasks, loading: tasksLoading } = useProjectTasks(id);
  const { notes, loading: notesLoading } = useNotes(id);
  const { timeLogs, loading: timeLogsLoading } = useTimeLogs(id);

  if (projectLoading || tasksLoading || notesLoading || timeLogsLoading) {
    return <div className="text-zinc-500 text-center py-20">Ładowanie projektu...</div>;
  }

  if (!project) {
    notFound();
  }

  const handleCreateDefaultList = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTaskList(id, "Główna Lista Zadań");
  };

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-10">
      {/* 1. Projekt i Szczegóły */}
      <section>
        <ProjectCard project={project} timeLogs={timeLogs} />
      </section>

      {/* 2. Notatki */}
      <section>
        <NotesManager initialNotes={notes} projectId={project.id} />
      </section>

      {/* 3. Listy Zadań */}
      <section className="space-y-6 mt-8">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2">Zadania Projektu</h2>
        
        {taskLists.length > 0 ? (
          <div className="space-y-8">
            {taskLists.map(list => {
              const listTasks = tasks.filter(t => t.taskListId === list.id);
              return (
                <div key={list.id} className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <h3 className="text-sm font-bold text-zinc-300">{list.name}</h3>
                  </div>
                  <QuickAddTask projectId={project.id} />
                  <TaskList tasks={listTasks} />
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
                <Plus className="w-4 h-4 mr-2" /> Inicjuj listę zadań
              </Button>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}

function ProjectsOverview() {
  const { projects, loading } = useProjects("ACTIVE");

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <Briefcase className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Projekty</h1>
          <p className="text-zinc-500 text-sm font-medium mt-0.5">Wszystkie aktywne projekty i obszary robocze.</p>
        </div>
      </header>

      <section className="mt-4">
        {loading ? (
          <div className="text-zinc-500 text-sm p-4 text-center">Ładowanie...</div>
        ) : projects.length === 0 ? (
          <div className="text-center p-12 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl">
            <Briefcase className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-zinc-300">Brak aktywnych projektów</h3>
            <p className="text-zinc-500 text-sm mt-2">
              Przejdź do Inkubatora, aby dodać lub aktywować projekt.
            </p>
            <Link href="/incubator" className="inline-block mt-4 text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-4 py-2 rounded-xl hover:bg-purple-500/20 transition-colors">
              Przejdź do Inkubatora
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(project => {
              const percent = Math.min(100, Math.round(((project.loggedMinutes || 0) / (project.targetMinutes || 1)) * 100));
              return (
                <Link
                  key={project.id}
                  href={`/projects?id=${project.id}`}
                  className="bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/60 p-5 rounded-2xl transition-all duration-200 block group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-zinc-100 group-hover:text-purple-300 transition-colors">{project.title}</h3>
                    <span className="text-xs font-bold text-zinc-400">{percent}%</span>
                  </div>
                  {project.goal && (
                    <p className="text-xs text-zinc-400 line-clamp-2 mb-4">{project.goal}</p>
                  )}
                  <Progress value={percent} className="h-1.5 bg-zinc-800" indicatorClassName={percent >= 100 ? "bg-purple-400" : "bg-purple-600"} />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (id) {
    return <ProjectDetailsView id={id} />;
  }

  return <ProjectsOverview />;
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="text-zinc-500 text-center py-20">Ładowanie...</div>}>
      <ProjectsPageContent />
    </Suspense>
  );
}
