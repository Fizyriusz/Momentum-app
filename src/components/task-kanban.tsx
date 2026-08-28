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

  // Usunięcie kolumny (zadania z tej kolumny trafią do pierwszej kolumny)
  const handleDeleteColumn = (colId: string) => {
    if (columns.length <= 1) {
      alert("Musi pozostać przynajmniej jedna kolumna.");
      return;
    }
    if (!confirm("Czy na pewno chcesz usunąć tę kolumnę? Zadania zostaną przeniesione do pierwszej kolumny.")) return;

    const fallbackCol = columns.find(c => c.id !== colId) || columns[0];
    const newCols = columns.filter(c => c.id !== colId);

    // Zaktualizuj zadania w bazie
    const tasksToMove = tasks.filter(t => t.column === colId);
    startTransition(async () => {
      await Promise.all(
        tasksToMove.map(t => setTaskColumn(t.id, fallbackCol.id, !!fallbackCol.isCompletedColumn))
      );
      saveColumns(newCols);
      setEditingColumn(null);
    });
  };

  // Szybkie dodanie zadania bezpośrednio w danej kolumnie
  const handleCreateTaskInCol = (colId: string, isCompletedCol?: boolean) => {
    const clean = newTaskTitle.trim();
    if (!clean) return;

    startTransition(async () => {
      const docRef = await createTask(
        clean,
        taskList?.id || undefined,
        undefined,
        undefined,
        taskList?.projectId || projectId || undefined
      );

      if (docRef) {
        await setTaskColumn(docRef.id, colId, !!isCompletedCol);
      }

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
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 items-start scrollbar-thin">
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
                w-80 shrink-0 bg-zinc-100/80 dark:bg-zinc-900/40 border rounded-3xl flex flex-col max-h-[75vh] backdrop-blur-md transition-all shadow-xs dark:shadow-none
                ${isOver ? "border-purple-500/80 bg-purple-500/10 dark:bg-purple-500/5 shadow-md" : "border-zinc-200 dark:border-zinc-800/60"}
              `}
            >
              {/* Nagłówek Kolumny */}
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${col.isCompletedColumn ? "bg-emerald-500" : (colIndex === 1 ? "bg-amber-500" : "bg-purple-500")}`} />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-800 dark:text-zinc-200 truncate">
                    {col.name}
                  </h3>
                  <span className="text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 px-2 py-0.5 rounded-full shrink-0">
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
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Ustawienia kolumny"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Lista Kart w Kolumnie */}
              <div className="p-3 space-y-2.5 overflow-y-auto flex-1 min-h-[120px]">
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
                      className="group bg-white dark:bg-zinc-950/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 p-3.5 rounded-2xl transition-all shadow-xs cursor-grab active:cursor-grabbing relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-xs font-semibold leading-snug flex-1 ${task.isCompleted ? "line-through text-zinc-400 dark:text-zinc-500" : "text-zinc-900 dark:text-zinc-200"}`}>
                          {task.title}
                        </span>

                        {/* Przełącznik ukończenia */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startTransition(() => toggleTaskComplete(task.id, !task.isCompleted));
                          }}
                          className={`w-4 h-4 rounded-md border shrink-0 flex items-center justify-center transition-colors ${
                            task.isCompleted 
                              ? "bg-purple-600 border-purple-600 text-white" 
                              : "border-zinc-300 dark:border-zinc-700 hover:border-purple-500"
                          }`}
                        >
                          {task.isCompleted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </button>
                      </div>

                      {/* Metadane karty */}
                      {(task.dueDate || task.description || task.placeId || (task.tagNames && task.tagNames.length > 0)) && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-900 flex-wrap text-[10px]">
                          {task.dueDate && (
                            <span className={`flex items-center gap-1 font-bold ${isOverdue ? "text-red-500" : (isToday ? "text-purple-600 dark:text-purple-400" : "text-zinc-500")}`}>
                              <Calendar className="w-2.5 h-2.5" />
                              {isToday ? "Dzisiaj" : new Date(task.dueDate).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}
                            </span>
                          )}

                          {task.description && (
                            <span className="flex items-center gap-0.5 text-zinc-500">
                              <FileText className="w-2.5 h-2.5" />
                              Opis
                            </span>
                          )}

                          {task.placeId && (
                            <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 truncate max-w-[80px]">
                              <MapPin className="w-2.5 h-2.5" />
                              {places.find(p => p.id === task.placeId)?.name || "Miejsce"}
                            </span>
                          )}

                          {task.tagNames?.map(tag => (
                            <span key={tag} className="text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 px-1.5 py-0.5 rounded-md">
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
                          className="p-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-0"
                          title="Przesuń w lewo"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-widest">
                          Przesuń
                        </span>

                        <button
                          type="button"
                          disabled={colIndex === columns.length - 1}
                          onClick={() => handleShiftTask(task.id, "right", colIndex)}
                          className="p-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-0"
                          title="Przesuń w prawo"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="py-8 text-center text-zinc-400 dark:text-zinc-600 text-xs font-medium">
                    Przeciągnij zadanie tutaj
                  </div>
                )}
              </div>

              {/* Dodawanie zadania w tej kolumnie */}
              <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/60">
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
                      className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-xs h-8 rounded-xl shadow-xs"
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
                        className="h-7 text-xs px-2 rounded-lg"
                      >
                        Anuluj
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!newTaskTitle.trim() || isPending}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-7 text-xs px-3 rounded-lg shadow-xs"
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
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors font-medium"
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
                className="p-4 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-3 backdrop-blur-md shadow-xs dark:shadow-none"
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-400">
                  Nowa Kolumna
                </h4>
                <Input
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="np. Weryfikacja, Testy, Gotowe..."
                  className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-xs h-9 rounded-xl"
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
                    className="h-8 text-xs rounded-xl"
                  >
                    Anuluj
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newColumnName.trim() || isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-8 text-xs px-3 rounded-xl shadow-xs"
                  >
                    Utwórz Kolumnę
                  </Button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingColumn(true)}
                className="w-full h-24 border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-purple-500 rounded-3xl flex flex-col items-center justify-center gap-1.5 text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors bg-zinc-100/50 dark:bg-zinc-900/10 hover:bg-purple-500/5 group"
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
        <DialogContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 sm:max-w-md w-[90vw] rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
              <Settings2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
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
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-sm rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl">
              <input
                type="checkbox"
                id="isDoneCol"
                checked={editedColIsDone}
                onChange={(e) => setEditedColIsDone(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700"
              />
              <label htmlFor="isDoneCol" className="text-xs text-zinc-800 dark:text-zinc-300 font-medium cursor-pointer">
                Traktuj zadania w tej kolumnie jako <strong>ukończone</strong>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800/60">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editingColumn && handleDeleteColumn(editingColumn.id)}
                disabled={isPending || columns.length <= 1}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs px-3 rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> Usuń Kolumnę
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingColumn(null)}
                  disabled={isPending}
                  className="rounded-xl text-xs"
                >
                  Anuluj
                </Button>
                <Button
                  onClick={handleSaveEditedColumn}
                  disabled={isPending || !editedColName.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 rounded-xl shadow-xs"
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
