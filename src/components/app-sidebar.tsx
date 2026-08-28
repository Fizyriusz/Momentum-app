"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
import { DuveoLogo } from "@/components/duveo-logo";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useProjects, Project } from "@/lib/services/projects";
import { useTaskLists, useTasks } from "@/lib/services/tasks";
import { CreateTaskListDialog, LIST_ICONS, LIST_COLORS } from "./create-task-list-dialog";
import { UserProfileButton } from "./user-profile-button";

type Tag = {
  id: string;
  name: string;
  color: string;
};

export function AppSidebar({ tags: initialTags, projects: initialProjects }: { tags?: Tag[], projects?: Project[] } = {}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentListId = searchParams.get("id");
  const currentTagName = searchParams.get("name");

  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [isListsOpen, setIsListsOpen] = useState(true);
  const [isArchivedListsOpen, setIsArchivedListsOpen] = useState(false);

  const { projects: activeProjects } = useProjects("ACTIVE");
  const projects = initialProjects && initialProjects.length > 0 ? initialProjects : activeProjects;

  const { taskLists } = useTaskLists();
  const { tasks } = useTasks();

  const tags = initialTags && initialTags.length > 0
    ? initialTags
    : Array.from(new Set(tasks.flatMap(t => t.tagNames || []))).map(name => ({ id: name, name, color: "#8b5cf6" }));

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
    <div className="w-64 h-full bg-white/90 dark:bg-zinc-950/80 border-r border-zinc-200/80 dark:border-zinc-800/50 backdrop-blur-xl flex flex-col hidden md:flex text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Link href="/" className="p-6 flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
        <DuveoLogo className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
        <h1 className="text-xl font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
          Duveo
        </h1>
      </Link>

      <nav className="flex-1 px-4 space-y-6 overflow-y-auto pb-6 scrollbar-thin">
        {/* Widoki Czasowe & Główne */}
        <div>
          <ul className="space-y-1">
            {/* Przegląd */}
            <li>
              <Link
                href="/"
                className={`
                  flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                  ${pathname === "/" 
                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" 
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className={`w-4 h-4 ${pathname === "/" ? "text-purple-600 dark:text-purple-400" : ""}`} />
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
                  ${pathname === "/tasks/today" 
                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" 
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Sun className={`w-4 h-4 text-amber-500`} />
                  <span>Dzisiaj</span>
                </div>
                {todayCount > 0 && (
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                    {todayCount}
                  </span>
                )}
              </Link>
            </li>

            {/* Jutro */}
            <li>
              <Link
                href="/tasks/tomorrow"
                className={`
                  flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                  ${pathname === "/tasks/tomorrow" 
                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" 
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Sunset className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                  <span>Jutro</span>
                </div>
              </Link>
            </li>

            {/* 7 Dni */}
            <li>
              <Link
                href="/tasks/upcoming"
                className={`
                  flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                  ${pathname === "/tasks/upcoming" 
                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" 
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-4 h-4" />
                  <span>7 Dni</span>
                </div>
                {upcomingCount > 0 && (
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    {upcomingCount}
                  </span>
                )}
              </Link>
            </li>

            {/* Inbox */}
            <li>
              <Link
                href="/inbox"
                className={`
                  flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                  ${pathname === "/inbox" 
                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" 
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Inbox className="w-4 h-4" />
                  <span>Inbox</span>
                </div>
                {inboxCount > 0 && (
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    {inboxCount}
                  </span>
                )}
              </Link>
            </li>

            {/* Miejsca */}
            <li>
              <Link
                href="/places"
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                  ${pathname === "/places" 
                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" 
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                  }
                `}
              >
                <MapPin className="w-4 h-4" />
                <span>Miejsca</span>
              </Link>
            </li>

            {/* Graf */}
            <li>
              <Link
                href="/graph"
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                  ${pathname === "/graph" 
                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" 
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                  }
                `}
              >
                <Network className="w-4 h-4" />
                <span>Graf</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Sekcja LISTY */}
        <div>
          <Collapsible open={isListsOpen} onOpenChange={setIsListsOpen}>
            <div className="flex items-center justify-between px-2 mb-2 group">
              <CollapsibleTrigger className="flex items-center gap-1">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors">
                  Listy
                </h2>
                {isListsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors" />
                )}
              </CollapsibleTrigger>
              <CreateTaskListDialog
                trigger={
                  <button className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                }
              />
            </div>

            <CollapsibleContent className="space-y-1">
              {activeTaskLists.length === 0 ? (
                <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-600">Brak list zadań</div>
              ) : (
                activeTaskLists.map(list => {
                  const href = `/lists?id=${list.id}`;
                  const isActive = pathname === "/lists" && currentListId === list.id;
                  const count = uncompletedTasks.filter(t => t.taskListId === list.id).length;
                  const IconComp = (list.icon && LIST_ICONS[list.icon]) ? LIST_ICONS[list.icon] : ListTodo;
                  const colorObj = LIST_COLORS.find(c => c.id === list.color) || LIST_COLORS[0];

                  return (
                    <Link
                      key={list.id}
                      href={href}
                      className={`
                        flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                        ${isActive 
                          ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" 
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconComp className="w-4 h-4 shrink-0" />
                        <span className="truncate">{list.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full ${colorObj.bg}`} />
                        {count > 0 && (
                          <span className="text-xs font-medium text-zinc-500">
                            {count}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}

              {/* Zarchiwizowane listy (jeśli istnieją) */}
              {archivedTaskLists.length > 0 && (
                <div className="pt-2">
                  <Collapsible open={isArchivedListsOpen} onOpenChange={setIsArchivedListsOpen}>
                    <CollapsibleTrigger className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400 w-full transition-colors">
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archiwum ({archivedTaskLists.length})</span>
                      {isArchivedListsOpen ? <ChevronDown className="w-3 h-3 ml-auto" /> : <ChevronRight className="w-3 h-3 ml-auto" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 pl-2">
                      {archivedTaskLists.map(list => (
                        <Link
                          key={list.id}
                          href={`/lists?id=${list.id}`}
                          className="flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/30"
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
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors">
                Projekty ({projects.length}/2)
              </h2>
              {isProjectsOpen ? (
                <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors" />
              )}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-1">
              {projects.length === 0 ? (
                <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-600">Brak projektów</div>
              ) : (
                projects.map(project => {
                  const isActive = pathname === "/projects" && currentListId === project.id;
                  return (
                    <Link
                      key={project.id}
                      href={`/projects?id=${project.id}`}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                        ${isActive 
                          ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" 
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                        }
                      `}
                    >
                      <Briefcase className={`w-4 h-4 ${isActive ? "text-purple-600 dark:text-purple-400" : "text-zinc-500"}`} />
                      <span className="flex-1 truncate">{project.title}</span>
                    </Link>
                  );
                })
              )}
              
              {/* Inkubator */}
              <Link
                href="/incubator"
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                  ${pathname === "/incubator" 
                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" 
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                  }
                  mt-1
                `}
              >
                <Lightbulb className={`w-4 h-4 ${pathname === "/incubator" ? "text-purple-600 dark:text-purple-400" : "text-zinc-500"}`} />
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
                  ${pathname === "/habits" ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"}
                `}
              >
                <Droplet className={`w-4 h-4 ${pathname === "/habits" ? "text-purple-600 dark:text-purple-400" : ""}`} />
                <span>Nawyki</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Sekcja TAGI */}
        <div>
          <Collapsible open={isTagsOpen} onOpenChange={setIsTagsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full group px-2 mb-2">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors">
                Tagi
              </h2>
              {isTagsOpen ? (
                <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors" />
              )}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-1">
              {tags.length === 0 ? (
                <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-600">Brak tagów</div>
              ) : (
                tags.map(tag => {
                  const href = `/tag?name=${encodeURIComponent(tag.name)}`;
                  const isActive = pathname === "/tag" && currentTagName === tag.name;
                  return (
                    <Link
                      key={tag.id}
                      href={href}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                        ${isActive 
                          ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" 
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                        }
                      `}
                    >
                      <Hash className={`w-4 h-4 ${isActive ? "text-purple-600 dark:text-purple-400" : "text-zinc-500"}`} />
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
                  ${pathname === "/notes" ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"}
                `}
              >
                <FileText className={`w-4 h-4 ${pathname === "/notes" ? "text-purple-600 dark:text-purple-400" : "text-zinc-500"}`} />
                <span>Notatki</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/50 shrink-0 space-y-2.5">
        <UserProfileButton />

        <Link href="/changelog" className="flex items-center justify-between text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors group px-1">
          <span>v0.9.0</span>
          <span className="flex items-center gap-1">
            Changelog
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      </div>
    </div>
  );
}
