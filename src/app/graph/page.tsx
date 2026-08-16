"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useProjects } from "@/lib/services/projects";
import { useTasks, useTaskLists } from "@/lib/services/tasks";
import { useNotes } from "@/lib/services/notes";
import { usePlaces } from "@/lib/services/places";
import { Network, ZoomIn, ZoomOut, Focus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamic import with SSR disabled for Canvas 2D
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export default function GraphPage() {
  const { projects, loading: projectsLoading } = useProjects();
  const { taskLists, loading: taskListsLoading } = useTaskLists();
  const { tasks, loading: tasksLoading } = useTasks();
  const { notes, loading: notesLoading } = useNotes(undefined);
  const { places, loading: placesLoading } = usePlaces();

  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 800
  });

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
    const t3 = setTimeout(() => {
      updateSize();
      if (fgRef.current) {
        fgRef.current.zoomToFit(400, 50);
      }
    }, 1000);

    return () => {
      window.removeEventListener("resize", updateSize);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const graphData = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];

    // Główne węzły (Projekty)
    projects.forEach(project => {
      nodes.push({
        id: `project_${project.id}`,
        name: project.title,
        val: 10,
        color: project.status === "ACTIVE" ? "#a855f7" : (project.status === "PAUSED" ? "#f59e0b" : "#71717a"),
        type: "Projekt"
      });
    });

    // Węzły List Zadań
    taskLists.forEach(list => {
      nodes.push({
        id: `list_${list.id}`,
        name: list.name,
        val: 6,
        color: "#c084fc",
        type: "Lista"
      });

      if (list.projectId) {
        links.push({
          source: `list_${list.id}`,
          target: `project_${list.projectId}`
        });
      }
    });

    // Węzły Zadań
    tasks.forEach(task => {
      nodes.push({
        id: `task_${task.id}`,
        name: task.title,
        val: 3,
        color: task.isCompleted ? "#10b981" : "#e4e4e7",
        type: "Zadanie"
      });

      // Powiązanie z listą lub projektem
      if (task.taskListId) {
        links.push({
          source: `task_${task.id}`,
          target: `list_${task.taskListId}`
        });
      } else if (task.projectId) {
        links.push({
          source: `task_${task.id}`,
          target: `project_${task.projectId}`
        });
      }
      
      // Powiązanie z miejscem
      if (task.placeId) {
        links.push({
          source: `task_${task.id}`,
          target: `place_${task.placeId}`
        });
      }
      
      // Tagi
      if (task.tagNames) {
        task.tagNames.forEach(tag => {
          const tagId = `tag_${tag.toLowerCase()}`;
          if (!nodes.find(n => n.id === tagId)) {
            nodes.push({
              id: tagId,
              name: `#${tag}`,
              val: 5,
              color: "#f43f5e",
              type: "Tag"
            });
          }
          links.push({
            source: `task_${task.id}`,
            target: tagId
          });
        });
      }
    });

    // Węzły Notatek
    notes.forEach(note => {
      nodes.push({
        id: `note_${note.id}`,
        name: note.title,
        val: 4,
        color: "#3b82f6",
        type: "Notatka"
      });

      if (note.projectId) {
        links.push({
          source: `note_${note.id}`,
          target: `project_${note.projectId}`
        });
      }
    });

    // Węzły Miejsc
    places.forEach(place => {
      nodes.push({
        id: `place_${place.id}`,
        name: `📍 ${place.name}`,
        val: 8,
        color: "#06b6d4",
        type: "Miejsce"
      });
    });

    return { nodes, links };
  }, [projects, taskLists, tasks, notes, places]);

  const isLoading = projectsLoading || taskListsLoading || tasksLoading || notesLoading || placesLoading;

  const handleCenter = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 50);
    }
  };

  const handleZoomIn = () => {
    if (fgRef.current) {
      fgRef.current.zoom(fgRef.current.zoom() * 1.3, 300);
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current) {
      fgRef.current.zoom(fgRef.current.zoom() * 0.7, 300);
    }
  };

  return (
    <main className="h-[calc(100vh-3.5rem)] md:h-screen flex flex-col overflow-hidden bg-zinc-950">
      {/* Pasek nagłówka */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-950/90 backdrop-blur shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-xl">
            <Network className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-base font-black uppercase tracking-tight text-zinc-100">Graf Relacji</h1>
            <p className="text-zinc-500 text-xs font-medium">Wizualizacja powiązań między projektami, zadaniami i miejscami.</p>
          </div>
        </div>

        {/* Przyciski sterowania */}
        <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800/80 p-1 rounded-xl">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="Przybliż"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="Oddal"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleCenter}
            className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="Wyśrodkuj cały graf"
          >
            <Focus className="w-3.5 h-3.5" /> Wyśrodkuj
          </button>
        </div>
      </header>

      {/* Kontener canvas na 100% szerokości i wysokości */}
      <section ref={containerRef} className="flex-1 w-full h-full relative overflow-hidden bg-zinc-950">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
            Ładowanie grafu powiązań...
          </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
            Brak danych do wygenerowania grafu.
          </div>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            nodeLabel="name"
            nodeColor="color"
            nodeRelSize={6}
            linkColor={() => "rgba(161, 161, 170, 0.2)"}
            backgroundColor="#09090b"
            cooldownTicks={100}
            onEngineStop={() => {
              if (fgRef.current) {
                fgRef.current.zoomToFit(400, 50);
              }
            }}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.name || "";
              const fontSize = Math.max(12 / globalScale, 4);
              ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.3);

              ctx.fillStyle = 'rgba(9, 9, 11, 0.85)';
              ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = node.color || "#a855f7";
              ctx.fillText(label, node.x, node.y);

              node.__bckgDimensions = bckgDimensions;
            }}
            nodePointerAreaPaint={(node: any, color, ctx) => {
              ctx.fillStyle = color;
              const bckgDimensions = node.__bckgDimensions;
              bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
            }}
          />
        )}
      </section>
    </main>
  );
}
