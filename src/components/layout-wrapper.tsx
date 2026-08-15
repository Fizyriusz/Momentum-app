"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "./app-sidebar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, Layers, LayoutDashboard, Inbox, Droplet, Hash, ChevronDown, ChevronRight, Sun, Sunset, CalendarDays, Lightbulb, Briefcase, Network, LogOut, MapPin, FileText } from "lucide-react";
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
  const pathname = usePathname();
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  
  const { projects } = useProjects("ACTIVE");
  const { places } = usePlaces();
  const tags: Tag[] = []; // Tagi

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

  const links = [
    {
      title: "System",
      items: [
        { name: "Przegląd", href: "/", icon: LayoutDashboard },
        { name: "Inbox", href: "/inbox", icon: Inbox },
        { name: "Miejsca", href: "/places", icon: MapPin },
        { name: "Graf", href: "/graph", icon: Network },
        { name: "Dzisiaj", href: "/tasks/today", icon: Sun },
        { name: "Jutro", href: "/tasks/tomorrow", icon: Sunset },
        { name: "7 Dni", href: "/tasks/upcoming", icon: CalendarDays },
      ],
    },
    {
      title: "Rutyny",
      items: [
        { name: "Nawyki", href: "/habits", icon: Droplet },
      ],
    }
  ];

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
                {links.map((section) => (
                  <div key={section.title}>
                    <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-2">
                      {section.title}
                    </h2>
                    <ul className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className={`
                                flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                                ${isActive 
                                  ? "bg-purple-500/10 text-purple-400 font-bold" 
                                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                                }
                              `}
                            >
                              <Icon className={`w-4 h-4 ${isActive ? "text-purple-500" : ""}`} />
                              {item.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}

                {/* Sekcja PROJEKTY */}
                <div>
                  <Collapsible open={isProjectsOpen} onOpenChange={setIsProjectsOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full group px-2 mb-2">
                      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
                        Projekty
                      </h2>
                      {isProjectsOpen ? (
                        <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                      )}
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-1">
                      {projects.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-zinc-600">Brak projektów</div>
                      ) : (
                        projects.map(project => {
                          const href = `/projects?id=${project.id}`;
                          const isActive = pathname === href || (pathname === '/projects' && typeof window !== 'undefined' && window.location.search.includes(project.id));
                          return (
                            <Link
                              key={project.id}
                              href={href}
                              onClick={() => setOpen(false)}
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
                        onClick={() => setOpen(false)}
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
                              onClick={() => setOpen(false)}
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
                  <Collapsible defaultOpen>
                    <CollapsibleTrigger className="flex items-center justify-between w-full group px-2 mb-2">
                      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
                        System
                      </h2>
                      <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1">
                      <Link
                        href="/notes"
                        onClick={() => setOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                          ${pathname === "/notes"
                            ? "bg-purple-500/10 text-purple-400 font-bold" 
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                          }
                        `}
                      >
                        <FileText className={`w-4 h-4 ${pathname === "/notes" ? "text-purple-500" : "text-zinc-500"}`} />
                        <span className="flex-1 truncate">Notatki</span>
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </nav>

              <div className="p-4 border-t border-zinc-800/50 shrink-0">
                <Link 
                  href="/changelog" 
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors group"
                >
                  <span>v0.5.0</span>
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
