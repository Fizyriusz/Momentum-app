"use client";

import { useState, useEffect, Suspense } from "react";
import { AppSidebar } from "./app-sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { 
  Menu, 
  Layers, 
  LayoutDashboard, 
  Inbox, 
  Droplet, 
  Hash, 
  ChevronDown, 
  ChevronRight, 
  Sun, 
  Sunset, 
  CalendarDays, 
  Lightbulb, 
  Briefcase, 
  Network, 
  LogOut, 
  MapPin, 
  FileText,
  Plus,
  ListTodo,
  Archive
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FabAddTask } from "./fab-add-task";
import { useAuth } from "./auth-provider";
import { Button } from "./ui/button";
import { initGeofencing, syncGeofences } from "@/lib/services/background-location";
import { usePlaces } from "@/lib/services/places";
import { useProjects, Project } from "@/lib/services/projects";
import { useTaskLists, useTasks } from "@/lib/services/tasks";
import { CreateTaskListDialog, LIST_ICONS, LIST_COLORS } from "./create-task-list-dialog";
import { PermissionsOnboarding } from "./permissions-onboarding";
import { ThemeToggle } from "./theme-toggle";

type Tag = {
  id: string;
  name: string;
  color: string;
};

function MobileSidebarNav({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentListId = searchParams.get("id");

  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [isListsOpen, setIsListsOpen] = useState(true);

  const { projects } = useProjects("ACTIVE");
  const { taskLists } = useTaskLists();
  const { tasks } = useTasks();

  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  const todayStr = new Date(d.getTime() - offset).toISOString().split("T")[0];
  const next7DaysStr = new Date(d.getTime() - offset + 7 * 86400000).toISOString().split("T")[0];

  const uncompletedTasks = tasks.filter(t => !t.isCompleted);
  const todayCount = uncompletedTasks.filter(t => t.dueDate && new Date(t.dueDate).toISOString().split("T")[0] <= todayStr).length;
  const upcomingCount = uncompletedTasks.filter(t => t.dueDate && new Date(t.dueDate).toISOString().split("T")[0] <= next7DaysStr).length;
  const inboxCount = uncompletedTasks.filter(t => !t.projectId).length;

  const activeTaskLists = taskLists.filter(l => !l.isArchived);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Link href="/" onClick={onClose} className="p-6 flex items-center gap-3 border-b border-zinc-200/80 dark:border-zinc-800/50 shrink-0 hover:opacity-80 transition-opacity">
        <Layers className="w-6 h-6 text-purple-600 dark:text-purple-500" />
        <h1 className="text-xl font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
          Momentum
        </h1>
      </Link>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        <div>
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2">Zadania</h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/tasks/today"
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium text-sm ${pathname === "/tasks/today" ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"}`}
              >
                <div className="flex items-center gap-3">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Dzisiaj</span>
                </div>
                {todayCount > 0 && <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{todayCount}</span>}
              </Link>
            </li>

            <li>
              <Link
                href="/tasks/tomorrow"
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium text-sm ${pathname === "/tasks/tomorrow" ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"}`}
              >
                <div className="flex items-center gap-3">
                  <Sunset className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                  <span>Jutro</span>
                </div>
              </Link>
            </li>

            <li>
              <Link
                href="/tasks/upcoming"
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium text-sm ${pathname === "/tasks/upcoming" ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"}`}
              >
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-4 h-4" />
                  <span>7 Dni</span>
                </div>
                {upcomingCount > 0 && <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{upcomingCount}</span>}
              </Link>
            </li>

            <li>
              <Link
                href="/inbox"
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium text-sm ${pathname === "/inbox" ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"}`}
              >
                <div className="flex items-center gap-3">
                  <Inbox className="w-4 h-4" />
                  <span>Inbox</span>
                </div>
                {inboxCount > 0 && <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{inboxCount}</span>}
              </Link>
            </li>

            <li>
              <Link
                href="/places"
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium text-sm ${pathname === "/places" ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"}`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4" />
                  <span>Miejsca</span>
                </div>
              </Link>
            </li>

            <li>
              <Link
                href="/graph"
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium text-sm ${pathname === "/graph" ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"}`}
              >
                <div className="flex items-center gap-3">
                  <Network className="w-4 h-4" />
                  <span>Graf</span>
                </div>
              </Link>
            </li>
          </ul>
        </div>

        {/* Sekcja LISTY ZADAŃ */}
        <div>
          <Collapsible open={isListsOpen} onOpenChange={setIsListsOpen}>
            <div className="flex items-center justify-between px-2 mb-2 group">
              <CollapsibleTrigger className="flex items-center gap-1">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors">
                  Listy
                </h2>
                {isListsOpen ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />}
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
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all text-sm font-medium ${isActive ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconComp className="w-4 h-4 shrink-0" />
                        <span className="truncate">{list.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full ${colorObj.bg}`} />
                        {count > 0 && <span className="text-xs font-medium text-zinc-500">{count}</span>}
                      </div>
                    </Link>
                  );
                })
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
              {isProjectsOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
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
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm ${isActive ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"}`}
                    >
                      <Briefcase className="w-4 h-4 text-zinc-500" />
                      <span className="flex-1 truncate">{project.title}</span>
                    </Link>
                  );
                })
              )}
              
              <Link
                href="/incubator"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 mt-1"
              >
                <Lightbulb className="w-4 h-4 text-zinc-500" />
                <span className="flex-1 truncate">Inkubator</span>
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Sekcja RUTYNY */}
        <div>
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2">Rutyny</h2>
          <Link
            href="/habits"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-medium text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
          >
            <Droplet className="w-4 h-4" />
            <span>Nawyki</span>
          </Link>
        </div>

        {/* Sekcja DOKUMENTACJA / SYSTEM */}
        <div>
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2">System</h2>
          <Link
            href="/notes"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-medium text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
          >
            <FileText className="w-4 h-4" />
            <span>Notatki</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800/50 shrink-0 space-y-3">
        <ThemeToggle />
        
        <Link 
          href="/changelog" 
          onClick={onClose}
          className="flex items-center justify-between text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors group"
        >
          <span>v0.7.5</span>
          <span className="flex items-center gap-1">
            Changelog
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      </div>
    </div>
  );
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const { projects } = useProjects("ACTIVE");
  const { places } = usePlaces();
  const tags: Tag[] = [];

  // Inicjalizacja usług tła
  useEffect(() => {
    if (user) {
      initGeofencing().then(() => {
        if (places.length > 0) {
          syncGeofences(places);
        }
      });
    }
  }, [user, places]);

  if (loading) {
    return <div className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500">Ładowanie...</div>;
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="max-w-md w-full space-y-8 text-center animate-in fade-in zoom-in duration-500 bg-white dark:bg-zinc-900/60 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-lg dark:shadow-none">
          <div className="w-20 h-20 bg-purple-500/15 rounded-3xl mx-auto flex items-center justify-center">
            <Layers className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Momentum</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-sm">Zaloguj się, aby uzyskać dostęp do swoich projektów i zadań.</p>
          </div>
          <Button 
            onClick={signInWithGoogle} 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 text-base rounded-xl shadow-md transition-all"
          >
            Kontynuuj z Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden text-zinc-900 dark:text-zinc-100 selection:bg-purple-500/30 transition-colors duration-200">
      <PermissionsOnboarding />

      {/* Desktop Sidebar z Suspense */}
      <aside className="w-64 border-r border-zinc-200/80 dark:border-zinc-800/60 shrink-0 hidden md:block">
        <Suspense fallback={<div className="w-64 h-full bg-zinc-50 dark:bg-zinc-950" />}>
          <AppSidebar tags={tags} projects={projects} />
        </Suspense>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        {/* Mobile Navbar */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-zinc-200/80 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-2 -ml-2">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-0 flex flex-col">
                 <VisuallyHidden>
                   <SheetTitle>Menu Główne</SheetTitle>
                 </VisuallyHidden>
                 <Suspense fallback={<div className="p-4 text-zinc-500">Ładowanie menu...</div>}>
                   <MobileSidebarNav onClose={() => setOpen(false)} />
                 </Suspense>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600 dark:text-purple-500" />
              <span className="font-bold text-sm tracking-widest uppercase text-zinc-900 dark:text-zinc-100">
                Momentum
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={signOut}
              title="Wyloguj"
              className="p-2 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
          {children}
        </main>
      </div>

      <FabAddTask />
    </div>
  );
}
