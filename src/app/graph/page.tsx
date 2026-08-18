"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useProjects } from "@/lib/services/projects";
import { useTasks, useTaskLists } from "@/lib/services/tasks";
import { useNotes } from "@/lib/services/notes";
import { usePlaces } from "@/lib/services/places";
import { useTheme } from "@/components/theme-provider";
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  Focus
} from "lucide-react";

// Dynamiczny import wyłączający SSR dla silnika Canvas 2D
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

type FilterType = "projects" | "incubator" | "lists" | "tasks" | "notes" | "places" | "tags";

const FILTER_CONFIG: Record<FilterType, { label: string; color: string; bgActive: string; border: string }> = {
  projects: { label: "Projekty", color: "#a855f7", bgActive: "bg-purple-500/15 text-purple-700 dark:text-purple-300", border: "border-purple-500/40" },
  incubator: { label: "Inkubator", color: "#f59e0b", bgActive: "bg-amber-500/15 text-amber-700 dark:text-amber-300", border: "border-amber-500/40" },
  lists: { label: "Listy Zadań", color: "#6366f1", bgActive: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300", border: "border-indigo-500/40" },
  tasks: { label: "Zadania Otwarte", color: "#94a3b8", bgActive: "bg-slate-500/15 text-slate-700 dark:text-slate-300", border: "border-slate-500/40" },
  notes: { label: "Notatki", color: "#3b82f6", bgActive: "bg-blue-500/15 text-blue-700 dark:text-blue-300", border: "border-blue-500/40" },
  places: { label: "Miejsca", color: "#06b6d4", bgActive: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300", border: "border-cyan-500/40" },
  tags: { label: "Tagi", color: "#ec4899", bgActive: "bg-pink-500/15 text-pink-700 dark:text-pink-300", border: "border-pink-500/40" },
};

export default function GraphPage() {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [theme]);

  const { projects, loading: projectsLoading } = useProjects();
  const { taskLists, loading: taskListsLoading } = useTaskLists();
  const { tasks, loading: tasksLoading } = useTasks();
  const { notes, loading: notesLoading } = useNotes(undefined);
  const { places, loading: placesLoading } = usePlaces();

  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const hasInitiallyFittedRef = useRef(false);
  
  // Zapamiętywanie pozycji współrzędnych węzłów (zapobiega resetowaniu / eksplozji od środka przy przełączaniu filtrów)
  const nodeCoordsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 800
  });

  // Filtry widoczności kategorii
  const [filters, setFilters] = useState<Record<FilterType, boolean>>({
    projects: true,
    incubator: true,
    lists: true,
    tasks: true,
    notes: true,
    places: true,
    tags: true,
  });

  const toggleFilter = (key: FilterType) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth || window.innerWidth;
        const height = containerRef.current.clientHeight || (window.innerHeight - 100);
        if (width > 50 && height > 50) {
          setDimensions({ width, height });
        }
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    
    const t1 = setTimeout(updateSize, 100);
    const t2 = setTimeout(updateSize, 500);

    return () => {
      window.removeEventListener("resize", updateSize);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Zliczanie elementów dla filtrów
  const counts = useMemo(() => {
    const activeProjectsCount = projects.filter(p => p.status === "ACTIVE" || p.status === "PAUSED").length;
    const incubatorCount = projects.filter(p => p.status === "INBOX").length;
    const openTasksCount = tasks.filter(t => !t.isCompleted).length;
    const tagsSet = new Set<string>();
    tasks.filter(t => !t.isCompleted).forEach(t => t.tagNames?.forEach(tag => tagsSet.add(tag.toLowerCase())));

    return {
      projects: activeProjectsCount,
      incubator: incubatorCount,
      lists: taskLists.length,
      tasks: openTasksCount,
      notes: notes.length,
      places: places.length,
      tags: tagsSet.size,
    };
  }, [projects, taskLists, tasks, notes, places]);

  // Generowanie grafu z zachowaniem istniejących pozycji węzłów
  const graphData = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];

    const getInitialCoords = (id: string) => {
      return nodeCoordsRef.current.get(id);
    };

    // 1. Główne Projekty (ACTIVE / PAUSED)
    if (filters.projects) {
      projects.filter(p => p.status === "ACTIVE" || p.status === "PAUSED").forEach(project => {
        const id = `project_${project.id}`;
        const coords = getInitialCoords(id);
        nodes.push({
          id,
          name: project.title,
          radius: 12,
          color: "#a855f7",
          glowColor: "rgba(168, 85, 247, 0.4)",
          category: "projects",
          type: "Projekt",
          ...(coords ? { x: coords.x, y: coords.y } : {})
        });
      });
    }

    // 2. Inkubator (INBOX)
    if (filters.incubator) {
      projects.filter(p => p.status === "INBOX").forEach(idea => {
        const id = `project_${idea.id}`;
        const coords = getInitialCoords(id);
        nodes.push({
          id,
          name: idea.title,
          radius: 8.5,
          color: "#f59e0b",
          glowColor: "rgba(245, 158, 11, 0.35)",
          category: "incubator",
          type: "Inkubator",
          ...(coords ? { x: coords.x, y: coords.y } : {})
        });
      });
    }

    // 3. Listy Zadań
    if (filters.lists) {
      taskLists.forEach(list => {
        const id = `list_${list.id}`;
        const coords = getInitialCoords(id);
        nodes.push({
          id,
          name: list.name,
          radius: 7.5,
          color: "#6366f1",
          glowColor: "rgba(99, 102, 241, 0.35)",
          category: "lists",
          type: "Lista",
          ...(coords ? { x: coords.x, y: coords.y } : {})
        });

        if (list.projectId) {
          links.push({
            source: id,
            target: `project_${list.projectId}`
          });
        }
      });
    }

    // 4. Zadania Otwarte (Ukrywamy zadania wykonane)
    const activeTasks = tasks.filter(t => !t.isCompleted);
    if (filters.tasks) {
      activeTasks.forEach(task => {
        const id = `task_${task.id}`;
        const coords = getInitialCoords(id);
        nodes.push({
          id,
          name: task.title,
          radius: 4,
          color: isDark ? "#e2e8f0" : "#475569",
          glowColor: "transparent",
          category: "tasks",
          type: "Zadanie",
          ...(coords ? { x: coords.x, y: coords.y } : {})
        });

        // Relacje zadania
        if (task.taskListId) {
          links.push({
            source: id,
            target: `list_${task.taskListId}`
          });
        } else if (task.projectId) {
          links.push({
            source: id,
            target: `project_${task.projectId}`
          });
        }
        
        if (task.placeId) {
          links.push({
            source: id,
            target: `place_${task.placeId}`
          });
        }
      });
    }

    // 5. Tagi (Powiązane z otwartymi zadaniami)
    if (filters.tags) {
      activeTasks.forEach(task => {
        if (task.tagNames) {
          task.tagNames.forEach(tag => {
            const tagId = `tag_${tag.toLowerCase()}`;
            if (!nodes.find(n => n.id === tagId)) {
              const coords = getInitialCoords(tagId);
              nodes.push({
                id: tagId,
                name: `#${tag}`,
                radius: 5,
                color: "#ec4899",
                glowColor: "rgba(236, 72, 153, 0.3)",
                category: "tags",
                type: "Tag",
                ...(coords ? { x: coords.x, y: coords.y } : {})
              });
            }
            if (filters.tasks) {
              links.push({
                source: `task_${task.id}`,
                target: tagId
              });
            }
          });
        }
      });
    }

    // 6. Notatki
    if (filters.notes) {
      notes.forEach(note => {
        const id = `note_${note.id}`;
        const coords = getInitialCoords(id);
        nodes.push({
          id,
          name: note.title,
          radius: 5,
          color: "#3b82f6",
          glowColor: "rgba(59, 130, 246, 0.3)",
          category: "notes",
          type: "Notatka",
          ...(coords ? { x: coords.x, y: coords.y } : {})
        });

        if (note.projectId) {
          links.push({
            source: id,
            target: `project_${note.projectId}`
          });
        }
      });
    }

    // 7. Miejsca GPS
    if (filters.places) {
      places.forEach(place => {
        const id = `place_${place.id}`;
        const coords = getInitialCoords(id);
        nodes.push({
          id,
          name: place.name,
          radius: 6.5,
          color: "#06b6d4",
          glowColor: "rgba(6, 182, 212, 0.35)",
          category: "places",
          type: "Miejsce",
          ...(coords ? { x: coords.x, y: coords.y } : {})
        });
      });
    }

    // Bezpieczne linki (oba końce muszą istnieć w widocznych węzłach)
    const nodeIdsSet = new Set(nodes.map(n => n.id));
    const safeLinks = links.filter(l => 
      nodeIdsSet.has(typeof l.source === "object" ? l.source.id : l.source) && 
      nodeIdsSet.has(typeof l.target === "object" ? l.target.id : l.target)
    );

    return { nodes, links: safeLinks };
  }, [projects, taskLists, tasks, notes, places, isDark, filters]);

  // Ustawienie sił D3 w celu zbliżenia kulek (gęstsze klastry)
  useEffect(() => {
    if (fgRef.current) {
      // Zmniejszamy siłę odpychania (charge) oraz skracamy dystans połączeń (link distance)
      fgRef.current.d3Force("charge")?.strength(-30);
      fgRef.current.d3Force("link")?.distance(22);
    }
  }, [graphData]);

  const isLoading = projectsLoading || taskListsLoading || tasksLoading || notesLoading || placesLoading;

  const handleCenter = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(500, 60);
    }
  };

  const handleZoomIn = () => {
    if (fgRef.current) {
      fgRef.current.zoom(fgRef.current.zoom() * 1.35, 300);
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current) {
      fgRef.current.zoom(fgRef.current.zoom() * 0.65, 300);
    }
  };

  return (
    <main className="h-[calc(100vh-3.5rem)] md:h-screen flex flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Pasek nagłówka */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-2xl text-purple-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black uppercase tracking-tight text-zinc-100 flex items-center gap-2">
              <span>GRAF</span>
              <span className="text-zinc-600 font-normal">•</span>
              <span className="text-xs text-zinc-400 font-mono tracking-wider font-semibold">POWIĄZANIA RYSOWANE NA ŻYWO</span>
            </h1>
          </div>
        </div>

        {/* Przyciski sterowania powiększeniem */}
        <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 p-1 rounded-2xl shadow-xs">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
            title="Przybliż"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
            title="Oddal"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleCenter}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
            title="Wyśrodkuj cały graf"
          >
            <Focus className="w-3.5 h-3.5" /> Wyśrodkuj
          </button>
        </div>
      </header>

      {/* Główny kontener Canvas 2D */}
      <section ref={containerRef} className="flex-1 w-full h-full relative overflow-hidden bg-[#0d0f14]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm font-mono animate-pulse">
            Ładowanie węzłów wiedzy...
          </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm font-mono">
            Brak widocznych elementów dla zaznaczonych filtrów.
          </div>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            nodeLabel="name"
            nodeColor="color"
            nodeRelSize={5}
            linkColor={() => "rgba(113, 113, 122, 0.22)"}
            linkWidth={1.2}
            backgroundColor="#0d0f14"
            cooldownTicks={40}
            d3VelocityDecay={0.45}
            onEngineStop={() => {
              if (fgRef.current && !hasInitiallyFittedRef.current) {
                hasInitiallyFittedRef.current = true;
                fgRef.current.zoomToFit(500, 60);
              }
            }}
            onNodeClick={(node: any) => {
              if (fgRef.current && node.x !== undefined && node.y !== undefined && !isNaN(node.x) && !isNaN(node.y)) {
                fgRef.current.centerAt(node.x, node.y, 600);
                fgRef.current.zoom(2.8, 600);
              }
            }}
            onBackgroundClick={() => {
              if (fgRef.current) {
                fgRef.current.zoomToFit(600, 60);
              }
            }}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              if (node.x === undefined || node.y === undefined || isNaN(node.x) || isNaN(node.y)) return;
              
              // Zapisujemy pozycję na żywo w pamięci podręcznej (dla stabilności filtrów)
              nodeCoordsRef.current.set(node.id, { x: node.x, y: node.y });

              const radius = node.radius || 5;

              // 1. Rysowanie subtelnej poświaty (Aura / Glow) dla większych węzłów
              if (node.glowColor && node.glowColor !== "transparent") {
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius + 2.2, 0, 2 * Math.PI, false);
                ctx.fillStyle = node.glowColor;
                ctx.fill();
              }

              // 2. Rysowanie głównej, soczystej kuli (Solid Orb)
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
              ctx.fillStyle = node.color || "#a855f7";
              ctx.fill();
              
              // Cienki obrys dla kontrastu
              ctx.lineWidth = 1.2 / globalScale;
              ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
              ctx.stroke();

              // 3. Rysowanie etykiety monospace pod kulą
              const label = node.name || "";
              const truncated = label.length > 20 ? label.substring(0, 18) + "..." : label;
              const fontSize = Math.max(10 / globalScale, 3.2);
              
              ctx.font = `600 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';

              // Cień tekstu dla maksymalnej czytelności na ciemnym tle
              ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
              ctx.shadowBlur = 4;
              ctx.fillStyle = node.category === "projects" || node.category === "incubator" ? "#f4f4f5" : "#a1a1aa";
              ctx.fillText(truncated, node.x, node.y + radius + (2.5 / globalScale));
              
              // Reset cienia dla reszty rysowania
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
            }}
            nodePointerAreaPaint={(node: any, color, ctx) => {
              if (node.x === undefined || node.y === undefined || isNaN(node.x) || isNaN(node.y)) return;
              const radius = (node.radius || 5) + 4;
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
              ctx.fill();
            }}
          />
        )}

        {/* Pływający dolny pasek filtrów kategorii & Legenda */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-[95vw] overflow-x-auto p-1.5 bg-zinc-900/90 border border-zinc-800/90 rounded-2xl backdrop-blur-md shadow-2xl flex items-center gap-1.5 scrollbar-none">
          {(Object.keys(FILTER_CONFIG) as FilterType[]).map((key) => {
            const cfg = FILTER_CONFIG[key];
            const isVisible = filters[key];
            const count = counts[key];

            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleFilter(key)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 border select-none ${
                  isVisible 
                    ? `${cfg.bgActive} ${cfg.border} shadow-xs scale-100` 
                    : "bg-zinc-950/60 border-zinc-800/60 text-zinc-600 opacity-50 hover:opacity-80"
                }`}
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full shadow-xs" 
                  style={{ backgroundColor: isVisible ? cfg.color : "#52525b" }} 
                />
                <span className="uppercase tracking-wider">{cfg.label}</span>
                <span className="text-[10px] font-black opacity-80 ml-0.5">({count})</span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
