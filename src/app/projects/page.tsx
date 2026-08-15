"use client";

import { useSearchParams, notFound } from "next/navigation";
import { Suspense } from "react";
import { ProjectCard } from "@/components/project-card";
import { TaskList } from "@/components/task-list";
import { QuickAddTask } from "@/components/quick-add-task";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo, Briefcase, Pause, Lightbulb, AlertCircle } from "lucide-react";
import { NotesManager } from "@/components/notes-manager";
import { useProject, useProjects, MAX_ACTIVE_PROJECTS } from "@/lib/services/projects";
import { useProjectTasks, createTaskList } from "@/lib/services/tasks";
import { useNotes } from "@/lib/services/notes";
import { useTimeLogs } from "@/lib/services/timeLogs";
import { CreateTaskListDialog } from "@/components/create-task-list-dialog";
import { EditTaskListDialog } from "@/components/edit-task-list-dialog";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Listy Zadań Projektu</h2>
          <CreateTaskListDialog 
            defaultProjectId={project.id} 
            trigger={
              <Button size="sm" variant="outline" className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-xs text-zinc-300">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Dodaj Listę
              </Button>
            }
          />
        </div>
        
        {taskLists.length > 0 ? (
          <div className="space-y-8">
            {taskLists.map(list => {
              const listTasks = tasks.filter(t => t.taskListId === list.id);
              return (
                <div key={list.id} className="space-y-4 bg-zinc-900/20 border border-zinc-800/40 p-4 rounded-2xl">
                  <div className="flex items-center justify-between px-1">
                    <Link href={`/lists?id=${list.id}`} className="flex items-center gap-2 group">
                      <span className="w-2 h-2 rounded-full bg-purple-500 group-hover:scale-125 transition-transform" />
                      <h3 className="text-sm font-bold text-zinc-200 group-hover:text-purple-300 transition-colors">{list.name}</h3>
                      <span className="text-xs text-zinc-500 font-medium">({listTasks.filter(t => !t.isCompleted).length})</span>
                    </Link>
                    <EditTaskListDialog taskList={list} />
                  </div>
                  <QuickAddTask taskListId={list.id} projectId={project.id} />
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
              <p className="text-xs mt-1 max-w-sm mx-auto">Aby zacząć dodawać zadania, utwórz nową listę dla tego projektu.</p>
            </div>
            <CreateTaskListDialog defaultProjectId={project.id} />
          </div>
        )}
      </section>
    </main>
  );
}

function ProjectsOverview() {
  const { projects: activeProjects, loading: activeLoading } = useProjects("ACTIVE");
  const { projects: pausedProjects, loading: pausedLoading } = useProjects("PAUSED");

  const isLoading = activeLoading || pausedLoading;

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <Briefcase className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Projekty</h1>
            <p className="text-zinc-500 text-sm font-medium mt-0.5">Obszary robocze i zarządzanie realizacją celów.</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
            Aktywne: <strong className={activeProjects.length >= MAX_ACTIVE_PROJECTS ? "text-amber-400" : "text-purple-400"}>{activeProjects.length}/{MAX_ACTIVE_PROJECTS}</strong>
          </span>
        </div>
      </header>

      {/* Sekcja 1: Aktywne Projekty */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Aktywne Projekty ({activeProjects.length}/{MAX_ACTIVE_PROJECTS})
          </h2>
          {activeProjects.length < MAX_ACTIVE_PROJECTS && (
            <Link href="/incubator" className="text-xs font-bold text-purple-400 hover:text-purple-300">
              + Aktywuj z Inkubatora
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="text-zinc-500 text-sm p-4 text-center">Ładowanie...</div>
        ) : activeProjects.length === 0 ? (
          <div className="text-center p-10 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl">
            <Briefcase className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-300">Brak aktywnych projektów</h3>
            <p className="text-zinc-500 text-xs mt-1">
              Przejdź do Inkubatora, aby dodać lub aktywować projekt do realizacji.
            </p>
            <Link href="/incubator" className="inline-block mt-4 text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-4 py-2 rounded-xl hover:bg-purple-500/20 transition-colors">
              Przejdź do Inkubatora
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProjects.map(project => {
              const percent = Math.min(100, Math.round(((project.loggedMinutes || 0) / (project.targetMinutes || 1)) * 100));
              return (
                <Link
                  key={project.id}
                  href={`/projects?id=${project.id}`}
                  className="bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/60 p-5 rounded-2xl transition-all duration-200 block group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-base text-zinc-100 group-hover:text-purple-300 transition-colors">{project.title}</h3>
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

      {/* Sekcja 2: Wstrzymane Projekty (PAUSED) */}
      {pausedProjects.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-zinc-800/40">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Pause className="w-3.5 h-3.5 text-amber-500" />
            Wstrzymane Projekty ({pausedProjects.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pausedProjects.map(project => {
              const percent = Math.min(100, Math.round(((project.loggedMinutes || 0) / (project.targetMinutes || 1)) * 100));
              return (
                <Link
                  key={project.id}
                  href={`/projects?id=${project.id}`}
                  className="bg-zinc-900/20 border border-zinc-800/40 hover:bg-zinc-900/50 p-5 rounded-2xl transition-all duration-200 block group opacity-80 hover:opacity-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">{project.title}</h3>
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-[10px] uppercase font-bold">
                      Wstrzymany
                    </Badge>
                  </div>
                  {project.goal && (
                    <p className="text-xs text-zinc-500 line-clamp-1 mb-3">{project.goal}</p>
                  )}
                  <Progress value={percent} className="h-1.5 bg-zinc-800" indicatorClassName="bg-amber-500" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Skrót do Inkubatora */}
      <section className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500/10 rounded-xl">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-200">Inkubator Projektów</h3>
            <p className="text-xs text-zinc-500">Poczekalnia na nowe koncepcje i pomysły.</p>
          </div>
        </div>
        <Link href="/incubator">
          <Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200">
            Przejdź do Inkubatora
          </Button>
        </Link>
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
