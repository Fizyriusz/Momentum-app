"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Inbox, 
  LayoutDashboard, 
  Lightbulb, 
  Droplet, 
  Hash, 
  ChevronDown, 
  ChevronRight, 
  Sun, 
  Sunset, 
  CalendarDays, 
  Briefcase, 
  FileText, 
  MapPin, 
  Network, 
  Layers,
  Plus,
  ListTodo,
  Archive
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Project } from "@/lib/services/projects";
import { useTaskLists, useTasks } from "@/lib/services/tasks";
import { CreateTaskListDialog, LIST_ICONS, LIST_COLORS } from "./create-task-list-dialog";

type Tag = {
  id: string;
  name: string;
  color: string;
};

export function AppSidebar({ tags = [], projects = [] }: { tags?: Tag[], projects?: Project[] }) {
  const pathname = usePathname();
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [isListsOpen, setIsListsOpen] = useState(true);
  const [isArchivedListsOpen, setIsArchivedListsOpen] = useState(false);

  const { taskLists } = useTaskLists();
  const { tasks } = useTasks();

  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  const todayStr = new Date(d.getTime() - offset).toISOString().split("T")[0];
  const next7DaysStr = new Date(d.getTime() - offset + 7 * 86400000).toISOString().split("T")[0];

  // Obliczenia liczników zadań
  const uncompletedTasks = tasks.filter(t => !t.isCompleted);
  const todayCount = uncompletedTasks.filter(t => t.dueDate && new Date(t.dueDate).toISOString().split("T")[0] <= todayStr).length;
  const upcomingCount = uncompletedTasks.filter(t => t.dueDate && new Date(t.dueDate).toISOString().split("T")[0] <= next7DaysStr).length;
  const inboxCount = uncompletedTasks.filter(t => !t.projectId).length;

  const activeTaskLists = taskLists.filter(l => !l.isArchived);
  const archivedTaskLists = taskLists.filter(l => l.isArchived);

  return (
    <div className="w-64 h-full bg-zinc-950/80 border-r border-zinc-800/50 backdrop-blur-xl flex flex-col hidden md:flex">
      <Link href="/" className="p-6 flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
        <Layers className="w-6 h-6 text-purple-500" />
        <h1 className="text-xl font-black uppercase tracking-widest text-zinc-100">
          Momentum
        </h1>
      </Link>

      <nav className="flex-1 px-4 space-y-6 overflow-y-auto pb-6">
        {/* Widoki Czasowe & Główne */}
        <div>
          <ul className="space-y-1">
            {/* Przegląd */}
            <li>
              <Link
                href="/"
                className={`
                  flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                  ${pathname === "/" ? "bg-purple-500/10 text-purple-400 font-bold" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"}
                `}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className={`w-4 h-4 ${pathname === "/" ? "text-purple-500" : ""}`} />
                  <span>Przegląd</span>
                </div>
              </Link>
            </li>

            {/* Dzisiaj */}
            <li>
              <Link
                href="/tasks/today"
                className={`
                  flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                  ${pathname === "/tasks/today" ? "bg-purple-500/10 text-purple-400 font-bold" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"}
                `}
              >
                <div className="flex items-center gap-3">
                  <Sun className={`w-4 h-4 ${pathname === "/tasks/today" ? "text-purple-500" : ""}`} />
                  <span>Dzisiaj</span>
                </div>
                {todayCount > 0 && (
                  <span className="text-xs font-bold text-zinc-400">{todayCount}</span>
                )}
              </Link>
            </li>

            {/* 7 Dni */}
            <li>
              <Link
                href="/tasks/upcoming"
                className={`
                  flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                  ${pathname === "/tasks/upcoming" ? "bg-purple-500/10 text-purple-400 font-bold" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"}
                `}
              >
                <div className="flex items-center gap-3">
                  <CalendarDays className={`w-4 h-4 ${pathname === "/tasks/upcoming" ? "text-purple-500" : ""}`} />
                  <span>7 Dni</span>
                </div>
                {upcomingCount > 0 && (
                  <span className="text-xs font-bold text-zinc-400">{upcomingCount}</span>
                )}
              </Link>
            </li>

            {/* Inbox */}
            <li>
              <Link
                href="/inbox"
                className={`
                  flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                  ${pathname === "/inbox" ? "bg-purple-500/10 text-purple-400 font-bold" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"}
                `}
              >
                <div className="flex items-center gap-3">
                  <Inbox className={`w-4 h-4 ${pathname === "/inbox" ? "text-purple-500" : ""}`} />
                  <span>Inbox</span>
                </div>
                {inboxCount > 0 && (
                  <span className="text-xs font-bold text-zinc-400">{inboxCount}</span>
                )}
              </Link>
            </li>

            {/* Miejsca */}
            <li>
              <Link
                href="/places"
                className={`
                  flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                  ${pathname === "/places" ? "bg-purple-500/10 text-purple-400 font-bold" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"}
                `}
              >
                <div className="flex items-center gap-3">
                  <MapPin className={`w-4 h-4 ${pathname === "/places" ? "text-purple-500" : ""}`} />
                  <span>Miejsca</span>
                </div>
              </Link>
            </li>

            {/* Graf */}
            <li>
              <Link
                href="/graph"
                className={`
                  flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                  ${pathname === "/graph" ? "bg-purple-500/10 text-purple-400 font-bold" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"}
                `}
              >
                <div className="flex items-center gap-3">
                  <Network className={`w-4 h-4 ${pathname === "/graph" ? "text-purple-500" : ""}`} />
                  <span>Graf</span>
                </div>
              </Link>
            </li>
          </ul>
        </div>

        {/* Sekcja LISTY ZADAŃ (LISTS) */}
        <div>
          <Collapsible open={isListsOpen} onOpenChange={setIsListsOpen}>
            <div className="flex items-center justify-between px-2 mb-2 group">
              <CollapsibleTrigger className="flex items-center gap-1">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
                  Listy
                </h2>
                {isListsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
                )}
              </CollapsibleTrigger>

              <CreateTaskListDialog 
                trigger={
                  <button 
                    className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
                    title="Dodaj nową listę"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                }
              />
            </div>
            
            <CollapsibleContent className="space-y-1">
              {activeTaskLists.length === 0 ? (
                <div className="px-3 py-2 text-xs text-zinc-600">Brak list zadań</div>
              ) : (
                activeTaskLists.map(list => {
                  const href = `/lists?id=${list.id}`;
                  const isActive = pathname === href || (pathname === '/lists' && typeof window !== 'undefined' && window.location.search.includes(list.id));
                  const count = uncompletedTasks.filter(t => t.taskListId === list.id).length;
                  const IconComp = (list.icon && LIST_ICONS[list.icon]) ? LIST_ICONS[list.icon] : ListTodo;
                  const colorObj = LIST_COLORS.find(c => c.id === list.color) || LIST_COLORS[0];

                  return (
                    <Link
                      key={list.id}
                      href={href}
                      className={`
                        flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm group
                        ${isActive 
                          ? "bg-purple-500/10 text-purple-400 font-bold" 
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconComp className={`w-4 h-4 shrink-0 ${isActive ? "text-purple-400" : "text-zinc-500 group-hover:text-zinc-400"}`} />
                        <span className="truncate">{list.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full ${colorObj.bg}`} />
                        {count > 0 && (
                          <span className="text-xs font-medium text-zinc-500">{count}</span>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}

              {/* Zarchiwizowane Listy */}
              {archivedTaskLists.length > 0 && (
                <div className="pt-2">
                  <Collapsible open={isArchivedListsOpen} onOpenChange={setIsArchivedListsOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-400 rounded-lg transition-colors">
                      <div className="flex items-center gap-2">
                        <Archive className="w-3 h-3" />
                        <span>Zarchiwizowane ({archivedTaskLists.length})</span>
                      </div>
                      {isArchivedListsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 pl-2 pt-1">
                      {archivedTaskLists.map(list => (
                        <Link
                          key={list.id}
                          href={`/lists?id=${list.id}`}
                          className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40"
                        >
                          <span className="truncate">{list.name}</span>
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Sekcja PROJEKTY */}
        <div>
          <Collapsible open={isProjectsOpen} onOpenChange={setIsProjectsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full group px-2 mb-2">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
                Projekty ({projects.length}/2)
              </h2>
              {isProjectsOpen ? (
                <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              )}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-1">
              {projects.length === 0 ? (
                <div className="px-3 py-2 text-xs text-zinc-600">Brak aktywnych projektów</div>
              ) : (
                projects.map(project => {
                  const href = `/projects?id=${project.id}`;
                  const isActive = pathname === href || (pathname === '/projects' && typeof window !== 'undefined' && window.location.search.includes(project.id));
                  return (
                    <Link
                      key={project.id}
                      href={href}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                        ${isActive 
                          ? "bg-purple-500/10 text-purple-400 font-bold" 
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                        }
                      `}
                    >
                      <Briefcase className={`w-4 h-4 ${isActive ? "text-purple-500" : "text-zinc-500"}`} />
                      <span className="flex-1 truncate">{project.title}</span>
                    </Link>
                  );
                })
              )}
              
              {/* Inkubator na stałe na dole listy projektów */}
              <Link
                href="/incubator"
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm mt-1
                  ${pathname === "/incubator"
                    ? "bg-purple-500/10 text-purple-400 font-bold" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                  }
                `}
              >
                <Lightbulb className={`w-4 h-4 ${pathname === "/incubator" ? "text-purple-500" : "text-zinc-500"}`} />
                <span className="flex-1 truncate">Inkubator</span>
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Sekcja RUTYNY */}
        <div>
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2">
            Rutyny
          </h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/habits"
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                  ${pathname === "/habits" ? "bg-purple-500/10 text-purple-400 font-bold" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"}
                `}
              >
                <Droplet className={`w-4 h-4 ${pathname === "/habits" ? "text-purple-500" : ""}`} />
                <span>Nawyki</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Sekcja TAGI */}
        <div>
          <Collapsible open={isTagsOpen} onOpenChange={setIsTagsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full group px-2 mb-2">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
                Tagi
              </h2>
              {isTagsOpen ? (
                <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              )}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-1">
              {tags.length === 0 ? (
                <div className="px-3 py-2 text-xs text-zinc-600">Brak tagów</div>
              ) : (
                tags.map(tag => {
                  const href = `/tag?name=${encodeURIComponent(tag.name)}`;
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={tag.id}
                      href={href}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                        ${isActive 
                          ? "bg-purple-500/10 text-purple-400 font-bold" 
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                        }
                      `}
                    >
                      <Hash className={`w-4 h-4 ${isActive ? "text-purple-500" : "text-zinc-500"}`} />
                      <span className="flex-1 truncate">{tag.name}</span>
                    </Link>
                  );
                })
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Sekcja SYSTEM */}
        <div>
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2">
            System
          </h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/notes"
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                  ${pathname === "/notes" ? "bg-purple-500/10 text-purple-400 font-bold" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"}
                `}
              >
                <FileText className={`w-4 h-4 ${pathname === "/notes" ? "text-purple-500" : "text-zinc-500"}`} />
                <span>Notatki</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-800/50 shrink-0">
        <Link href="/changelog" className="flex items-center justify-between text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors group">
          <span>v0.7.0</span>
          <span className="flex items-center gap-1">
            Changelog
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      </div>
    </div>
  );
}
