"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, LayoutDashboard, Lightbulb, ListTodo, Rocket, Droplet, Hash, ChevronDown, ChevronRight, Sun, Sunset, CalendarDays, Briefcase, FileText } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type Tag = {
  id: string;
  name: string;
  color: string;
};

type Skill = {
  id: number;
  title: string;
};

export function AppSidebar({ tags = [], skills = [] }: { tags?: Tag[], skills?: Skill[] }) {
  const pathname = usePathname();
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(true);

  const links = [
    {
      title: "System",
      items: [
        { name: "Przegląd", href: "/", icon: LayoutDashboard },
        { name: "Inbox", href: "/inbox", icon: Inbox },
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
    },
  ];

  return (
    <div className="w-64 h-full bg-zinc-950/80 border-r border-zinc-800/50 backdrop-blur-xl flex flex-col hidden md:flex">
      <Link href="/" className="p-6 flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
        <Rocket className="w-6 h-6 text-purple-500" />
        <h1 className="text-xl font-black uppercase tracking-widest text-zinc-100">
          Momentum
        </h1>
      </Link>

      <nav className="flex-1 px-4 space-y-6 overflow-y-auto pb-6">
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
          <Collapsible open={isSkillsOpen} onOpenChange={setIsSkillsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full group px-2 mb-2">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
                Projekty
              </h2>
              {isSkillsOpen ? (
                <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              )}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-1">
              {skills.length === 0 ? (
                <div className="px-3 py-2 text-xs text-zinc-600">Brak projektów</div>
              ) : (
                skills.map(skill => {
                  const href = `/skills/${skill.id}`;
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={skill.id}
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
                      <span className="flex-1 truncate">{skill.title}</span>
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
                  const href = `/tags/${encodeURIComponent(tag.name)}`;
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
        <Link href="/changelog" className="flex items-center justify-between text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors group">
          <span>v0.1.0 (Beta)</span>
          <span className="flex items-center gap-1">
            Changelog
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      </div>
    </div>
  );
}


