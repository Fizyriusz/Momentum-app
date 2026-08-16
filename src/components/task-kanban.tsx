"use client";

import { useState, useTransition, useMemo } from "react";
import { 
  Task, 
  TaskList, 
  KanbanColumn, 
  DEFAULT_KANBAN_COLUMNS, 
  setTaskColumn, 
  createTask, 
  updateTaskListColumns,
  toggleTaskComplete 
} from "@/lib/services/tasks";
import { TaskItem } from "./task-item";
import { 
  Plus, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  FileText, 
  CheckCircle2,
  Settings2
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { usePlaces } from "@/lib/services/places";

export function TaskKanban({ 
  taskList, 
  tasks,
  projectId
}: { 
  taskList?: TaskList | null, 
  tasks: Task[],
  projectId?: string | null
}) {
  const [isPending, startTransition] = useTransition();
  const { places } = usePlaces();

  // Kolumny listy (lub domyślne)
  const columns: KanbanColumn[] = useMemo(() => {
    if (taskList?.columns && taskList.columns.length > 0) {
      return taskList.columns;
    }
    return DEFAULT_KANBAN_COLUMNS;
  }, [taskList?.columns]);

  // Stan dodawania nowej kolumny
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  // Stan edycji istniejącej kolumny
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const [editedColName, setEditedColName] = useState("");
  const [editedColIsDone, setEditedColIsDone] = useState(false);

  // Stan szybkiego dodawania zadania w danej kolumnie (np. colId -> text)
  const [activeAddColId, setActiveAddColId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Drag & Drop
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Zapisz kolumny w bazie
  const saveColumns = (newCols: KanbanColumn[]) => {
    if (!taskList) return;
    startTransition(async () => {
      await updateTaskListColumns(taskList.id, newCols);
    });
  };

  // Dodawanie nowej kolumny
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newColumnName.trim();
    if (!clean) return;

    const newId = clean.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now().toString().slice(-4);
    const newCols = [...columns, { id: newId, name: clean, isCompletedColumn: false }];
    saveColumns(newCols);
    setNewColumnName("");
    setIsAddingColumn(false);
  };

  // Zapisanie edycji kolumny
  const handleSaveEditedColumn = () => {
    if (!editingColumn) return;
    const clean = editedColName.trim();
    if (!clean) return;

    const newCols = columns.map(c => {
      if (c.id === editingColumn.id) {
        return {
          ...c,
          name: clean,
          isCompletedColumn: editedColIsDone
        };
      }
      return c;
    });

    saveColumns(newCols);
    setEditingColumn(null);
  };

  // Usunięcie kolumny
  const handleDeleteColumn = (colId: string) => {
    if (columns.length <= 1) {
      alert("Musisz posiadać co najmniej jedną kolumnę.");
      return;
    }
    if (!confirm("Czy na pewno chcesz usunąć tę kolumnę? Zadania zostaną przeniesione do pierwszej kolumny.")) return;

    const remainingCols = columns.filter(c => c.id !== colId);
    const fallbackColId = remainingCols[0].id;
    const isFallbackDone = !!remainingCols[0].isCompletedColumn;

    startTransition(async () => {
      // Przepnij zadania z usuwanej kolumny
      const affectedTasks = tasks.filter(t => t.column === colId);
      for (const t of affectedTasks) {
        await setTaskColumn(t.id, fallbackColId, isFallbackDone);
      }
      saveColumns(remainingCols);
      setEditingColumn(null);
    });
  };

  // Szybkie dodawanie zadania w konkretnej kolumnie
  const handleCreateTaskInCol = (colId: string, isCompletedCol?: boolean) => {
    const clean = newTaskTitle.trim();
    if (!clean) return;

    startTransition(async () => {
      await createTask(
        clean,
        taskList?.id || undefined,
        undefined,
        undefined,
        projectId || taskList?.projectId || undefined,
        colId
      );
      setNewTaskTitle("");
      setActiveAddColId(null);
    });
  };

  // Przenoszenie zadania (Drag & Drop)
  const handleDropOnColumn = (targetCol: KanbanColumn) => {
    if (!draggedTaskId) return;
    const taskId = draggedTaskId;
    setDraggedTaskId(null);
    setDragOverColId(null);

    startTransition(async () => {
      await setTaskColumn(taskId, targetCol.id, !!targetCol.isCompletedColumn);
    });
  };

  // Przenoszenie strzałkami (mobile/touch)
  const handleShiftTask = (taskId: string, currentDirection: "left" | "right", currentColIndex: number) => {
    const targetIndex = currentDirection === "left" ? currentColIndex - 1 : currentColIndex + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const targetCol = columns[targetIndex];
    startTransition(async () => {
      await setTaskColumn(taskId, targetCol.id, !!targetCol.isCompletedColumn);
    });
  };

  return (
    <div className="w-full">
      {/* Kontener tablicy Kanban z poziomym przewijaniem */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 items-start scrollbar-thin scrollbar-thumb-zinc-800">
        {columns.map((col, colIndex) => {
          // Przypisanie zadań do kolumny
          const colTasks = tasks.filter(t => {
            if (colIndex === 0 && (!t.column || !columns.some(c => c.id === t.column))) {
              return true; // Fallback dla nieprzypisanych
            }
            return t.column === col.id;
          });

          const isOver = dragOverColId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverColId(col.id);
              }}
              onDragLeave={() => {
                if (dragOverColId === col.id) setDragOverColId(null);
              }}
              onDrop={() => handleDropOnColumn(col)}
              className={`
                w-80 shrink-0 bg-zinc-900/40 border rounded-2xl flex flex-col max-h-[75vh] backdrop-blur-md transition-all
                ${isOver ? "border-purple-500/80 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "border-zinc-800/60"}
              `}
            >
              {/* Nagłówek Kolumny */}
              <div className="p-3.5 border-b border-zinc-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${col.isCompletedColumn ? "bg-emerald-500" : (colIndex === 1 ? "bg-yellow-500" : "bg-purple-500")}`} />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-200 truncate">
                    {col.name}
                  </h3>
                  <span className="text-[10px] font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full shrink-0">
                    {colTasks.length}
                  </span>
                </div>

                {taskList && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingColumn(col);
                      setEditedColName(col.name);
                      setEditedColIsDone(!!col.isCompletedColumn);
                    }}
                    className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                    title="Ustawienia kolumny"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Lista Kart w Kolumnie */}
              <div className="p-2.5 space-y-2 overflow-y-auto flex-1 min-h-[120px]">
                {colTasks.map(task => {
                  const isOverdue = task.dueDate && new Date(task.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
                  const isToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedTaskId(task.id);
                        e.dataTransfer.setData("text/plain", task.id);
                      }}
                      className="group bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 p-3 rounded-xl transition-all shadow-sm cursor-grab active:cursor-grabbing relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-xs font-medium leading-snug flex-1 ${task.isCompleted ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                          {task.title}
                        </span>

                        {/* Przełącznik ukończenia */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startTransition(() => toggleTaskComplete(task.id, !task.isCompleted));
                          }}
                          className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                            task.isCompleted 
                              ? "bg-purple-500 border-purple-500 text-white" 
                              : "border-zinc-700 hover:border-purple-400"
                          }`}
                        >
                          {task.isCompleted && <Check className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Metadane karty */}
                      {(task.dueDate || task.description || task.placeId || (task.tagNames && task.tagNames.length > 0)) && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-900 flex-wrap text-[10px]">
                          {task.dueDate && (
                            <span className={`flex items-center gap-1 font-bold ${isOverdue ? "text-red-400" : (isToday ? "text-purple-400" : "text-zinc-500")}`}>
                              <Calendar className="w-2.5 h-2.5" />
                              {isToday ? "Dzisiaj" : new Date(task.dueDate).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}
                            </span>
                          )}

                          {task.description && (
                            <span className="flex items-center gap-0.5 text-zinc-500">
                              <FileText className="w-2.5 h-2.5" />
                              Notatka
                            </span>
                          )}

                          {task.placeId && (
                            <span className="flex items-center gap-0.5 text-blue-400 truncate max-w-[80px]">
                              <MapPin className="w-2.5 h-2.5" />
                              {places.find(p => p.id === task.placeId)?.name || "Miejsce"}
                            </span>
                          )}

                          {task.tagNames?.map(tag => (
                            <span key={tag} className="text-zinc-400 bg-zinc-800/60 px-1.5 py-0.2 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Strzałki szybkiego przesuwania między kolumnami */}
                      <div className="flex items-center justify-between pt-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          disabled={colIndex === 0}
                          onClick={() => handleShiftTask(task.id, "left", colIndex)}
                          className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-0"
                          title="Przesuń w lewo"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                          Przesuń
                        </span>

                        <button
                          type="button"
                          disabled={colIndex === columns.length - 1}
                          onClick={() => handleShiftTask(task.id, "right", colIndex)}
                          className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-0"
                          title="Przesuń w prawo"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="py-6 text-center text-zinc-600 text-xs font-medium">
                    Przeciągnij zadanie tutaj
                  </div>
                )}
              </div>

              {/* Dodawanie zadania w tej kolumnie */}
              <div className="p-2.5 border-t border-zinc-800/60">
                {activeAddColId === col.id ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCreateTaskInCol(col.id, col.isCompletedColumn);
                    }}
                    className="space-y-2"
                  >
                    <Input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Co masz do zrobienia?"
                      className="bg-zinc-950 border-zinc-800 text-xs h-8"
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveAddColId(null);
                          setNewTaskTitle("");
                        }}
                        className="h-7 text-xs px-2"
                      >
                        Anuluj
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!newTaskTitle.trim() || isPending}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-7 text-xs px-3"
                      >
                        Dodaj
                      </Button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAddColId(col.id);
                      setNewTaskTitle("");
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-xl transition-colors font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Dodaj zadanie</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Przycisk / Formularz Tworzenia Nowej Kolumny */}
        {taskList && (
          <div className="w-72 shrink-0">
            {isAddingColumn ? (
              <form 
                onSubmit={handleAddColumn}
                className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-3 backdrop-blur-md"
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Nowa Kolumna
                </h4>
                <Input
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="np. Weryfikacja, Testy, Gotowe..."
                  className="bg-zinc-950 border-zinc-800 text-xs h-9"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnName("");
                    }}
                    className="h-8 text-xs"
                  >
                    Anuluj
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newColumnName.trim() || isPending}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-8 text-xs px-3"
                  >
                    Utwórz Kolumnę
                  </Button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingColumn(true)}
                className="w-full h-24 border border-dashed border-zinc-800 hover:border-purple-500/50 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-zinc-500 hover:text-purple-400 transition-colors bg-zinc-900/10 hover:bg-purple-500/5 group"
              >
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Nowa Kolumna</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal Ustawień / Edycji Kolumny */}
      <Dialog open={!!editingColumn} onOpenChange={(open) => !open && setEditingColumn(null)}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 sm:max-w-md w-[90vw] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black uppercase tracking-tight">
              <Settings2 className="w-4 h-4 text-purple-500" />
              Ustawienia Kolumny
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
                Nazwa Kolumny
              </label>
              <Input
                value={editedColName}
                onChange={(e) => setEditedColName(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
              <input
                type="checkbox"
                id="isDoneCol"
                checked={editedColIsDone}
                onChange={(e) => setEditedColIsDone(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-zinc-950 border-zinc-700"
              />
              <label htmlFor="isDoneCol" className="text-xs text-zinc-300 font-medium cursor-pointer">
                Traktuj zadania w tej kolumnie jako <strong>ukończone</strong>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/60">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editingColumn && handleDeleteColumn(editingColumn.id)}
                disabled={isPending || columns.length <= 1}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs px-2"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Usuń Kolumnę
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingColumn(null)}
                  disabled={isPending}
                >
                  Anuluj
                </Button>
                <Button
                  onClick={handleSaveEditedColumn}
                  disabled={isPending || !editedColName.trim()}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  Zapisz
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
