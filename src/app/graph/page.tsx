"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useProjects } from "@/lib/services/projects";
import { useTasks, useTaskLists } from "@/lib/services/tasks";
import { useNotes } from "@/lib/services/notes";
import { usePlaces } from "@/lib/services/places";
import { Network } from "lucide-react";

// Importujemy z wyłączonym SSR, ponieważ biblioteka korzysta z canvas i obiektu window
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export default function GraphPage() {
  const { projects, loading: projectsLoading } = useProjects();
  const { taskLists, loading: taskListsLoading } = useTaskLists();
  const { tasks, loading: tasksLoading } = useTasks();
  const { notes, loading: notesLoading } = useNotes(undefined);
  const { places, loading: placesLoading } = usePlaces();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
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
        color: project.status === "ACTIVE" ? "#a855f7" : "#52525b", // Fioletowy lub szary
        type: "Projekt"
      });
    });

    // Węzły Podlist
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
        color: task.isCompleted ? "#10b981" : "#71717a", // Zielony lub cynkowy
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
        color: "#3b82f6",
        type: "Miejsce"
      });
    });

    return { nodes, links };
  }, [projects, taskLists, tasks, notes, places]);

  const isLoading = projectsLoading || taskListsLoading || tasksLoading || notesLoading || placesLoading;

  return (
    <main className="min-h-full flex flex-col">
      <header className="flex items-center gap-3 px-4 py-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <Network className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Graf Relacji</h1>
          <p className="text-zinc-500 text-sm font-medium mt-0.5">Wizualizacja powiązań między projektami, zadaniami i miejscami.</p>
        </div>
      </header>

      <section className="flex-1 bg-zinc-950 relative overflow-hidden flex items-center justify-center">
        {isLoading ? (
          <div className="text-zinc-500">Ładowanie grafu...</div>
        ) : graphData.nodes.length === 0 ? (
          <div className="text-zinc-500">Brak danych do wygenerowania grafu.</div>
        ) : (
          <div ref={containerRef} className="border-t border-zinc-900 w-full h-[calc(100vh-100px)] flex-1">
            <ForceGraph2D
              graphData={graphData}
              width={dimensions.width}
              height={dimensions.height}
              nodeLabel="name"
              nodeColor="color"
              nodeRelSize={6}
              linkColor={() => "rgba(161, 161, 170, 0.2)"}
              backgroundColor="#09090b"
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.name;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); 

                ctx.fillStyle = 'rgba(9, 9, 11, 0.8)';
                ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = node.color;
                ctx.fillText(label, node.x, node.y);

                node.__bckgDimensions = bckgDimensions;
              }}
              nodePointerAreaPaint={(node: any, color, ctx) => {
                ctx.fillStyle = color;
                const bckgDimensions = node.__bckgDimensions;
                bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
              }}
            />
          </div>
        )}
      </section>
    </main>
  );
}
