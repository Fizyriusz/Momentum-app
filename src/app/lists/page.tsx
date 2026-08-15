"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useTaskList, useTasks, useTaskLists } from "@/lib/services/tasks";
import { useProject } from "@/lib/services/projects";
import { TaskList } from "@/components/task-list";
import { QuickAddTask } from "@/components/quick-add-task";
import { EditTaskListDialog } from "@/components/edit-task-list-dialog";
import { CreateTaskListDialog, LIST_ICONS, LIST_COLORS } from "@/components/create-task-list-dialog";
import { ListTodo, CheckCircle2, Circle, Layers, Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function ListDetailsView({ id }: { id: string }) {
  const { taskList, loading: listLoading } = useTaskList(id);
  const { tasks: allTasks, loading: tasksLoading } = useTasks();
  const { project } = useProject(taskList?.projectId || "");

  if (listLoading || tasksLoading) {
    return <div className="text-zinc-500 text-center py-20">Ładowanie listy...</div>;
  }

  if (!taskList) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-zinc-400">Nie znaleziono wybranej listy zadań.</p>
        <Link href="/inbox">
          <Button variant="outline" className="border-zinc-800 text-zinc-300">Wróć do Inboxa</Button>
        </Link>
      </div>
    );
  }

  const tasks = allTasks.filter(t => t.taskListId === taskList.id);
  const activeTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  const IconComponent = (taskList.icon && LIST_ICONS[taskList.icon]) ? LIST_ICONS[taskList.icon] : ListTodo;
  const colorObj = LIST_COLORS.find(c => c.id === taskList.color) || LIST_COLORS[0];

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-8">
      {/* Nagłówek Listy */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl bg-zinc-900 border border-zinc-800/80 shrink-0 ${colorObj.text}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">{taskList.name}</h1>
              <span className={`w-2.5 h-2.5 rounded-full ${colorObj.bg} shadow-[0_0_8px_rgba(168,85,247,0.5)]`} />
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 font-medium">
              <span>{activeTasks.length} otwartych • {completedTasks.length} ukończonych</span>
              {project && (
                <Link 
                  href={`/projects?id=${project.id}`} 
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md"
                >
                  <Briefcase className="w-3 h-3" />
                  <span>Projekt: {project.title}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <EditTaskListDialog taskList={taskList} />
        </div>
      </header>

      {/* Szybkie dodawanie do tej listy */}
      <section>
        <QuickAddTask taskListId={taskList.id} projectId={taskList.projectId || undefined} />
      </section>

      {/* Zadania */}
      <section className="space-y-6">
        <div>
          <TaskList tasks={activeTasks} />
        </div>

        {completedTasks.length > 0 && (
          <div className="pt-6 border-t border-zinc-900 space-y-3">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2">
              Ukończone ({completedTasks.length})
            </h3>
            <TaskList tasks={completedTasks} />
          </div>
        )}
      </section>
    </main>
  );
}

function ListsOverview() {
  const { taskLists, loading } = useTaskLists();
  const { tasks } = useTasks();

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <ListTodo className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Wszystkie Listy</h1>
            <p className="text-zinc-500 text-sm font-medium mt-0.5">Zarządzaj swoimi przestrzeniami na zadania.</p>
          </div>
        </div>

        <CreateTaskListDialog />
      </header>

      <section className="mt-4">
        {loading ? (
          <div className="text-zinc-500 text-sm p-4 text-center">Ładowanie...</div>
        ) : taskLists.length === 0 ? (
          <div className="text-center p-12 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl space-y-4">
            <ListTodo className="w-12 h-12 text-zinc-700 mx-auto" />
            <h3 className="text-lg font-bold text-zinc-300">Brak utworzonych list zadań</h3>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto">
              Utwórz dedykowaną listę, aby grupować zadania wg obszarów (np. Content, Finanse, Personal).
            </p>
            <CreateTaskListDialog />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {taskLists.map(list => {
              const listTasks = tasks.filter(t => t.taskListId === list.id && !t.isCompleted);
              const IconComp = (list.icon && LIST_ICONS[list.icon]) ? LIST_ICONS[list.icon] : ListTodo;
              const col = LIST_COLORS.find(c => c.id === list.color) || LIST_COLORS[0];

              return (
                <Link
                  key={list.id}
                  href={`/lists?id=${list.id}`}
                  className="p-5 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl bg-zinc-800 text-zinc-300 group-hover:${col.text} transition-colors`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-200 group-hover:text-white transition-colors">{list.name}</h4>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                        {list.projectId ? "Powiązana z projektem" : "Lista ogólna"}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-full">
                    {listTasks.length}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function ListsPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (id) {
    return <ListDetailsView id={id} />;
  }

  return <ListsOverview />;
}

export default function ListsPage() {
  return (
    <Suspense fallback={<div className="text-zinc-500 text-center py-20">Ładowanie...</div>}>
      <ListsPageContent />
    </Suspense>
  );
}
