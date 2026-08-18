"use client";

import { useSearchParams, notFound } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { ProjectCard } from "@/components/project-card";
import { TaskList } from "@/components/task-list";
import { TaskKanban } from "@/components/task-kanban";
import { QuickAddTask } from "@/components/quick-add-task";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo, Briefcase, Pause, Lightbulb, AlertCircle, LayoutGrid, List } from "lucide-react";
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

  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  useEffect(() => {
    const saved = localStorage.getItem(`project_view_mode_${id}`);
    if (saved === "list" || saved === "kanban") {
      setViewMode(saved);
    }
  }, [id]);

  const handleToggleView = (mode: "list" | "kanban") => {
    setViewMode(mode);
    localStorage.setItem(`project_view_mode_${id}`, mode);
  };

  if (projectLoading || tasksLoading || notesLoading || timeLogsLoading) {
    return <div className="text-zinc-500 text-center py-20">Ładowanie projektu...</div>;
  }

  if (!project) {
    notFound();
  }

  return (
    <main className={`min-h-full px-4 py-8 lg:px-12 mx-auto flex flex-col gap-10 ${viewMode === "kanban" ? "max-w-full" : "max-w-4xl"}`}>
      {/* 1. Projekt i Szczegóły */}
      <section>
        <ProjectCard project={project} timeLogs={timeLogs} />
      </section>

      {/* 2. Notatki */}
      <section>
        <NotesManager initialNotes={notes} projectId={project.id} />
      </section>

      {/* 3. Listy Zadań */}
      <section className="space-y-6 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Zadania Projektu</h2>
          
          <div className="flex items-center gap-2">
            {/* Przełącznik Widoku */}
            <div className="flex items-center bg-zinc-200/60 dark:bg-zinc-900 border border-zinc-300/60 dark:border-zinc-800 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => handleToggleView("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "list"
                    ? "bg-white dark:bg-purple-600 text-zinc-900 dark:text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleView("kanban")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "kanban"
                    ? "bg-white dark:bg-purple-600 text-zinc-900 dark:text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
            </div>

            <CreateTaskListDialog 
              defaultProjectId={project.id} 
              trigger={
                <Button size="sm" variant="outline" className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 rounded-xl shadow-xs">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Dodaj Listę
                </Button>
              }
            />
          </div>
        </div>
        
        {(() => {
          const unassignedTasks = tasks.filter(t => !t.taskListId || !taskLists.some(l => l.id === t.taskListId));

          if (viewMode === "kanban") {
            return (
              <div className="space-y-8">
                {taskLists.length > 0 ? (
                  <>
                    {taskLists.map(list => {
                      const listTasks = tasks.filter(t => t.taskListId === list.id);
                      return (
                        <div key={list.id} className="space-y-4 bg-zinc-100/60 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800/30 p-4 rounded-3xl shadow-xs dark:shadow-none">
                          <div className="flex items-center justify-between px-1">
                            <Link href={`/lists?id=${list.id}`} className="flex items-center gap-2 group">
                              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 dark:bg-purple-500 group-hover:scale-125 transition-transform" />
                              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-200 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">{list.name}</h3>
                              <span className="text-xs text-zinc-500 font-medium">({listTasks.filter(t => !t.isCompleted).length})</span>
                            </Link>
                            <EditTaskListDialog taskList={list} />
                          </div>
                          <TaskKanban taskList={list} tasks={listTasks} projectId={project.id} />
                        </div>
                      );
                    })}

                    {unassignedTasks.length > 0 && (
                      <div className="space-y-4 bg-zinc-100/60 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800/30 p-4 rounded-3xl shadow-xs dark:shadow-none">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Ogólne Zadania Projektu</h3>
                            <span className="text-xs text-zinc-500 font-medium">({unassignedTasks.filter(t => !t.isCompleted).length})</span>
                          </div>
                        </div>
                        <TaskKanban tasks={unassignedTasks} projectId={project.id} />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-zinc-100/60 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800/30 p-4 rounded-3xl shadow-xs dark:shadow-none">
                    <TaskKanban tasks={tasks} projectId={project.id} />
                  </div>
                )}
              </div>
            );
          }

          // Widok Listy
          return (
            <div className="space-y-8">
              {taskLists.length > 0 ? (
                <>
                  {taskLists.map(list => {
                    const listTasks = tasks.filter(t => t.taskListId === list.id);
                    return (
                      <div key={list.id} className="space-y-4 bg-white dark:bg-zinc-900/20 border border-zinc-200/80 dark:border-zinc-800/40 p-4 rounded-3xl shadow-xs dark:shadow-none">
                        <div className="flex items-center justify-between px-1">
                          <Link href={`/lists?id=${list.id}`} className="flex items-center gap-2 group">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 dark:bg-purple-500 group-hover:scale-125 transition-transform" />
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-200 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">{list.name}</h3>
                            <span className="text-xs text-zinc-500 font-medium">({listTasks.filter(t => !t.isCompleted).length})</span>
                          </Link>
                          <EditTaskListDialog taskList={list} />
                        </div>
                        <QuickAddTask taskListId={list.id} projectId={project.id} />
                        <TaskList tasks={listTasks} />
                      </div>
                    );
                  })}

                  {unassignedTasks.length > 0 && (
                    <div className="space-y-4 bg-white dark:bg-zinc-900/20 border border-zinc-200/80 dark:border-zinc-800/40 p-4 rounded-3xl shadow-xs dark:shadow-none">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Ogólne Zadania Projektu</h3>
                          <span className="text-xs text-zinc-500 font-medium">({unassignedTasks.filter(t => !t.isCompleted).length})</span>
                        </div>
                      </div>
                      <QuickAddTask projectId={project.id} />
                      <TaskList tasks={unassignedTasks} />
                    </div>
                  )}
                </>
              ) : tasks.length > 0 ? (
                <div className="space-y-4 bg-white dark:bg-zinc-900/20 border border-zinc-200/80 dark:border-zinc-800/40 p-4 rounded-3xl shadow-xs dark:shadow-none">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 dark:bg-purple-500" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Zadania Projektu</h3>
                      <span className="text-xs text-zinc-500 font-medium">({tasks.filter(t => !t.isCompleted).length})</span>
                    </div>
                  </div>
                  <QuickAddTask projectId={project.id} />
                  <TaskList tasks={tasks} />
                </div>
              ) : (
                <div className="space-y-6">
                  <QuickAddTask projectId={project.id} />
                  <div className="text-center p-8 text-zinc-500 flex flex-col items-center gap-4 bg-white dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 shadow-xs">
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl">
                      <ListTodo className="w-6 h-6 text-zinc-400 dark:text-zinc-600" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-300">Brak zadań w tym projekcie.</p>
                      <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">Dodaj zadanie powyżej lub utwórz dedykowaną listę zadań.</p>
                    </div>
                    <CreateTaskListDialog defaultProjectId={project.id} />
                  </div>
                </div>
              )}
            </div>
          );
        })()}
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
      {/* Nagłówek */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-2xl">
              <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">Projekty</h1>
              <p className="text-zinc-500 text-sm font-medium mt-0.5">Twoje główne obszary skupienia i egzekucji.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/incubator">
            <Button variant="outline" className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs rounded-xl shadow-xs text-zinc-800 dark:text-zinc-200">
              <Lightbulb className="w-4 h-4 mr-2 text-amber-500" /> Inkubator
            </Button>
          </Link>
        </div>
      </header>

      {/* Aktywne Projekty (Limit 2) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Aktywne Projekty ({activeProjects.length} / {MAX_ACTIVE_PROJECTS})
            </h2>
            {activeProjects.length >= MAX_ACTIVE_PROJECTS && (
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px]">
                Limit Osiągnięty
              </Badge>
            )}
          </div>
          <span className="text-xs text-zinc-500 font-medium">Maksymalne skupienie: max 2 projekty</span>
        </div>

        {isLoading ? (
          <div className="text-zinc-500 text-sm p-4">Ładowanie...</div>
        ) : activeProjects.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-xs">
            <Briefcase className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-300">Brak aktywnych projektów</h3>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto">
              Przejdź do Inkubatora, aby wybrać i aktywować swój pierwszy projekt do egzekucji.
            </p>
            <Link href="/incubator">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white mt-2 rounded-xl shadow-xs">
                <Lightbulb className="w-4 h-4 mr-2 text-amber-300" /> Przejdź do Inkubatora
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* Wstrzymane Projekty (PAUSED) */}
      {pausedProjects.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <Pause className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Wstrzymane Projekty ({pausedProjects.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pausedProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
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
