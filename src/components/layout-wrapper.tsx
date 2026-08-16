"use client";

import { useState, useEffect } from "react";
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
import { usePathname } from "next/navigation";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FabAddTask } from "./fab-add-task";
import { useAuth } from "./auth-provider";
import { Button } from "./ui/button";
import { initGeofencing, syncGeofences } from "@/lib/services/background-location";
import { usePlaces } from "@/lib/services/places";
import { useProjects } from "@/lib/services/projects";
import { useTaskLists, useTasks } from "@/lib/services/tasks";
import { CreateTaskListDialog, LIST_ICONS, LIST_COLORS } from "./create-task-list-dialog";
import { PermissionsOnboarding } from "./permissions-onboarding";

type Tag = {
  id: string;
  name: string;
  color: string;
};

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [isListsOpen, setIsListsOpen] = useState(true);
  const [isArchivedListsOpen, setIsArchivedListsOpen] = useState(false);

  const pathname = usePathname();
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  
  const { projects } = useProjects("ACTIVE");
  const { places } = usePlaces();
  const { taskLists } = useTaskLists();
  const { tasks } = useTasks();
  const tags: Tag[] = [];

  // Obliczenia liczników zadań
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  const todayStr = new Date(d.getTime() - offset).toISOString().split("T")[0];
  const next7DaysStr = new Date(d.getTime() - offset + 7 * 86400000).toISOString().split("T")[0];

  const uncompletedTasks = tasks.filter(t => !t.isCompleted);
  const todayCount = uncompletedTasks.filter(t => t.dueDate && new Date(t.dueDate).toISOString().split("T")[0] <= todayStr).length;
  const upcomingCount = uncompletedTasks.filter(t => t.dueDate && new Date(t.dueDate).toISOString().split("T")[0] <= next7DaysStr).length;
  const inboxCount = uncompletedTasks.filter(t => !t.projectId).length;

  const activeTaskLists = taskLists.filter(l => !l.isArchived);
  const archivedTaskLists = taskLists.filter(l => l.isArchived);

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
    return <div className="h-full flex items-center justify-center bg-zinc-950 text-zinc-500">Ładowanie...</div>;
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-950 p-4">
        <div className="max-w-md w-full space-y-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-purple-500/20 rounded-3xl mx-auto flex items-center justify-center">
            <Layers className="w-10 h-10 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Momentum</h1>
            <p className="text-zinc-400 mt-2">Zaloguj się, aby uzyskać dostęp do swoich projektów i zadań.</p>
          </div>
          <Button 
            onClick={signInWithGoogle} 
            className="w-full bg-white hover:bg-zinc-200 text-black font-bold h-12 text-lg rounded-xl"
          >
            Kontynuuj z Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden text-zinc-100 selection:bg-purple-500/30">
      <PermissionsOnboarding />
      {/* Desktop Sidebar */}
      <AppSidebar tags={tags} projects={projects} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Navbar */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger className="text-zinc-400 hover:text-white p-2 -ml-2">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-zinc-950 border-zinc-800 p-0 flex flex-col">
                 <VisuallyHidden>
                   <SheetTitle>Menu Główne</SheetTitle>
                 </VisuallyHidden>
                <Link href="/" onClick={() => setOpen(false)} className="p-6 flex items-center gap-3 border-b border-zinc-800/50 shrink-0 hover:opacity-80 transition-opacity">
                  <Layers className="w-6 h-6 text-purple-500" />
                  <h1 className="text-xl font-black uppercase tracking-widest text-zinc-100">
                    Momentum
                  </h1>
                </Link>
              <nav className="p-4 space-y-6 overflow-y-auto flex-1 pb-6">
                {/* Główne widoki */}
                <div>
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href="/"
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium text-sm ${pathname === "/" ? "bg-purple-500/10 text-purple-400 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
                      >
                        <div className="flex items-center gap-3">
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Przegląd</span>
                        </div>
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="/tasks/today"
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium text-sm ${pathname === "/tasks/today" ? "bg-purple-500/10 text-purple-400 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
                      >
                        <div className="flex items-center gap-3">
                          <Sun className="w-4 h-4" />
                          <span>Dzisiaj</span>
                        </div>
                        {todayCount > 0 && <span className="text-xs font-bold text-zinc-400">{todayCount}</span>}
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="/tasks/upcoming"
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium text-sm ${pathname === "/tasks/upcoming" ? "bg-purple-500/10 text-purple-400 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
                      >
                        <div className="flex items-center gap-3">
                          <CalendarDays className="w-4 h-4" />
                          <span>7 Dni</span>
                        </div>
                        {upcomingCount > 0 && <span className="text-xs font-bold text-zinc-400">{upcomingCount}</span>}
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="/inbox"
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium text-sm ${pathname === "/inbox" ? "bg-purple-500/10 text-purple-400 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
                      >
                        <div className="flex items-center gap-3">
                          <Inbox className="w-4 h-4" />
                          <span>Inbox</span>
                        </div>
                        {inboxCount > 0 && <span className="text-xs font-bold text-zinc-400">{inboxCount}</span>}
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="/places"
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium text-sm ${pathname === "/places" ? "bg-purple-500/10 text-purple-400 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
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
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium text-sm ${pathname === "/graph" ? "bg-purple-500/10 text-purple-400 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
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
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
                          Listy
                        </h2>
                        {isListsOpen ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />}
                      </CollapsibleTrigger>
                      <CreateTaskListDialog
                        trigger={
                          <button className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors">
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
                          const isActive = pathname === href;
                          const count = uncompletedTasks.filter(t => t.taskListId === list.id).length;
                          const IconComp = (list.icon && LIST_ICONS[list.icon]) ? LIST_ICONS[list.icon] : ListTodo;
                          const colorObj = LIST_COLORS.find(c => c.id === list.color) || LIST_COLORS[0];

                          return (
                            <Link
                              key={list.id}
                              href={href}
                              onClick={() => setOpen(false)}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all text-sm font-medium ${isActive ? "bg-purple-500/10 text-purple-400 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
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
                      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
                        Projekty ({projects.length}/2)
                      </h2>
                      {isProjectsOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-1">
                      {projects.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-zinc-600">Brak projektów</div>
                      ) : (
                        projects.map(project => (
                          <Link
                            key={project.id}
                            href={`/projects?id=${project.id}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                          >
                            <Briefcase className="w-4 h-4 text-zinc-500" />
                            <span className="flex-1 truncate">{project.title}</span>
                          </Link>
                        ))
                      )}
                      
                      <Link
                        href="/incubator"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 mt-1"
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
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-medium text-sm text-zinc-400 hover:text-zinc-200"
                  >
                    <Droplet className="w-4 h-4" />
                    <span>Nawyki</span>
                  </Link>
                </div>

                {/* Sekcja SYSTEM */}
                <div>
                  <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2">System</h2>
                  <Link
                    href="/notes"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-medium text-sm text-zinc-400 hover:text-zinc-200"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Notatki</span>
                  </Link>
                </div>
              </nav>

              <div className="p-4 border-t border-zinc-800/50 shrink-0">
                <Link 
                  href="/changelog" 
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors group"
                >
                  <span>v0.6.7</span>
                  <span className="flex items-center gap-1">
                    Changelog
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>

            <Link href="/" className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-500" />
              <span className="font-bold text-sm tracking-widest uppercase text-zinc-100">
                Momentum
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={signOut}
              title="Wyloguj"
              className="p-2 text-zinc-400 hover:text-red-400 transition-colors rounded-lg"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <FabAddTask />
    </div>
  );
}
