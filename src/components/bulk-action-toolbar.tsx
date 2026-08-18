"use client";

import { useState, useTransition } from "react";
import { 
  batchUpdateTasks, 
  batchDeleteTasks, 
  batchAddTagToTasks,
  useTaskLists 
} from "@/lib/services/tasks";
import { useProjects } from "@/lib/services/projects";
import { usePlaces } from "@/lib/services/places";
import { 
  Calendar, 
  FolderInput, 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  X, 
  Tag as TagIcon, 
  MapPin, 
  Sun, 
  Sunset, 
  CalendarX, 
  Loader2,
  Briefcase,
  ListTodo
} from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";

interface BulkActionToolbarProps {
  selectedTaskIds: string[];
  onClearSelection: () => void;
}

export function BulkActionToolbar({ selectedTaskIds, onClearSelection }: BulkActionToolbarProps) {
  const [isPending, startTransition] = useTransition();

  // Modale operacji
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [customDate, setCustomDate] = useState("");
  
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [tagName, setTagName] = useState("");
  
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Dane do przenoszenia i tagowania
  const { projects } = useProjects("ACTIVE");
  const { taskLists } = useTaskLists();
  const { places } = usePlaces();

  if (selectedTaskIds.length === 0) return null;

  // --- Akcje Daty ---
  const handleSetToday = () => {
    startTransition(async () => {
      const today = new Date();
      await batchUpdateTasks(selectedTaskIds, { dueDate: today.getTime() });
      setDateModalOpen(false);
      onClearSelection();
    });
  };

  const handleSetTomorrow = () => {
    startTransition(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await batchUpdateTasks(selectedTaskIds, { dueDate: tomorrow.getTime() });
      setDateModalOpen(false);
      onClearSelection();
    });
  };

  const handleSetCustomDate = () => {
    if (!customDate) return;
    startTransition(async () => {
      const [year, month, day] = customDate.split("-").map(Number);
      const d = new Date(year, month - 1, day, 12, 0, 0);
      await batchUpdateTasks(selectedTaskIds, { dueDate: d.getTime() });
      setDateModalOpen(false);
      setCustomDate("");
      onClearSelection();
    });
  };

  const handleClearDate = () => {
    startTransition(async () => {
      await batchUpdateTasks(selectedTaskIds, { dueDate: null as any });
      setDateModalOpen(false);
      onClearSelection();
    });
  };

  // --- Akcje Ukończenia ---
  const handleToggleComplete = (isCompleted: boolean) => {
    startTransition(async () => {
      await batchUpdateTasks(selectedTaskIds, { 
        isCompleted, 
        column: isCompleted ? "done" : "todo" 
      });
      onClearSelection();
    });
  };

  // --- Akcja Przeniesienia do Projektu / Listy ---
  const handleMoveToProject = (projectId: string | null) => {
    startTransition(async () => {
      await batchUpdateTasks(selectedTaskIds, { 
        projectId: projectId || null,
        taskListId: null 
      });
      setMoveModalOpen(false);
      onClearSelection();
    });
  };

  const handleMoveToList = (taskListId: string | null, projectId?: string | null) => {
    startTransition(async () => {
      await batchUpdateTasks(selectedTaskIds, { 
        taskListId: taskListId || null,
        projectId: projectId || null
      });
      setMoveModalOpen(false);
      onClearSelection();
    });
  };

  // --- Akcja Dodania Taga ---
  const handleAddTag = () => {
    if (!tagName.trim()) return;
    startTransition(async () => {
      await batchAddTagToTasks(selectedTaskIds, tagName);
      setTagModalOpen(false);
      setTagName("");
      onClearSelection();
    });
  };

  // --- Akcja Przypisania Miejsca ---
  const handleAssignPlace = (placeId: string | null) => {
    startTransition(async () => {
      await batchUpdateTasks(selectedTaskIds, { placeId: placeId || null });
      setPlaceModalOpen(false);
      onClearSelection();
    });
  };

  // --- Akcja Usunięcia ---
  const handleDeleteBatch = () => {
    startTransition(async () => {
      await batchDeleteTasks(selectedTaskIds);
      setDeleteConfirmOpen(false);
      onClearSelection();
    });
  };

  return (
    <>
      {/* Pływający dolny dock akcji masowych */}
      <aside 
        aria-label="Pasek akcji zbiorczych"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl bg-zinc-900/95 dark:bg-zinc-900/95 text-white backdrop-blur-xl border border-zinc-700/80 dark:border-zinc-800 rounded-3xl p-2.5 sm:p-3 shadow-2xl shadow-purple-950/40 animate-in slide-in-from-bottom-6 duration-300 flex items-center justify-between gap-2"
      >
        {/* Licznik zaznaczonych */}
        <div className="flex items-center gap-2 pl-2 shrink-0">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black">
            {selectedTaskIds.length}
          </span>
          <span className="text-xs font-bold text-zinc-200 hidden sm:inline">
            Wybrano
          </span>
        </div>

        {/* Przyciski Akcji */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {/* Termin */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDateModalOpen(true)}
            disabled={isPending}
            className="h-9 px-2.5 sm:px-3 text-zinc-200 hover:text-white hover:bg-zinc-800 rounded-xl text-xs font-bold gap-1.5 shrink-0"
            title="Zmień termin"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Termin</span>
          </Button>

          {/* Przenieś */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMoveModalOpen(true)}
            disabled={isPending}
            className="h-9 px-2.5 sm:px-3 text-zinc-200 hover:text-white hover:bg-zinc-800 rounded-xl text-xs font-bold gap-1.5 shrink-0"
            title="Przenieś do Listy / Projektu"
          >
            <FolderInput className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">Przenieś</span>
          </Button>

          {/* Ukończ */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleToggleComplete(true)}
            disabled={isPending}
            className="h-9 px-2.5 sm:px-3 text-zinc-200 hover:text-white hover:bg-zinc-800 rounded-xl text-xs font-bold gap-1.5 shrink-0"
            title="Oznacz jako wykonane"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Ukończ</span>
          </Button>

          {/* Tagi */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setTagModalOpen(true)}
            disabled={isPending}
            className="h-9 px-2.5 sm:px-3 text-zinc-200 hover:text-white hover:bg-zinc-800 rounded-xl text-xs font-bold gap-1.5 shrink-0"
            title="Dodaj Tag"
          >
            <TagIcon className="w-4 h-4 text-pink-400" />
            <span className="hidden md:inline">Tag</span>
          </Button>

          {/* Miejsce */}
          {places.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPlaceModalOpen(true)}
              disabled={isPending}
              className="h-9 px-2.5 sm:px-3 text-zinc-200 hover:text-white hover:bg-zinc-800 rounded-xl text-xs font-bold gap-1.5 shrink-0"
              title="Przypisz Miejsce"
            >
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="hidden md:inline">Miejsce</span>
            </Button>
          )}

          {/* Usuń */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={isPending}
            className="h-9 px-2.5 sm:px-3 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl text-xs font-bold gap-1.5 shrink-0"
            title="Usuń zaznaczone"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Zamknij / Odznacz */}
        <div className="pl-1 border-l border-zinc-700/60 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            disabled={isPending}
            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl"
            title="Anuluj zaznaczenie"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </aside>

      {/* 1. Modal Wyboru Terminu */}
      <Dialog open={dateModalOpen} onOpenChange={setDateModalOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 max-w-sm rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Zmień Termin ({selectedTaskIds.length})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 my-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSetToday}
                disabled={isPending}
                className="h-11 border-zinc-200 dark:border-zinc-800 hover:bg-purple-500/10 hover:border-purple-500 rounded-2xl flex items-center gap-2 font-bold text-xs"
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Dzisiaj</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSetTomorrow}
                disabled={isPending}
                className="h-11 border-zinc-200 dark:border-zinc-800 hover:bg-purple-500/10 hover:border-purple-500 rounded-2xl flex items-center gap-2 font-bold text-xs"
              >
                <Sunset className="w-4 h-4 text-orange-500" />
                <span>Jutro</span>
              </Button>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Konkretna Data
              </label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs h-10 rounded-xl"
                />
                <Button
                  type="button"
                  onClick={handleSetCustomDate}
                  disabled={!customDate || isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 px-4 rounded-xl shrink-0"
                >
                  Ustaw
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClearDate}
                disabled={isPending}
                className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 h-10"
              >
                <CalendarX className="w-4 h-4" />
                <span>Zdejmij termin (Do Inboxa)</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Modal Przenoszenia do Listy / Projektu */}
      <Dialog open={moveModalOpen} onOpenChange={setMoveModalOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 max-w-md rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
              <FolderInput className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Przenieś Zadania ({selectedTaskIds.length})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-3">
            {/* Opcja: Zdejmij przypisanie (Do wolnego Inboxa) */}
            <button
              type="button"
              onClick={() => handleMoveToList(null, null)}
              disabled={isPending}
              className="w-full p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-purple-500 text-left bg-zinc-50 dark:bg-zinc-900/50 hover:bg-purple-500/5 transition-all flex items-center gap-3"
            >
              <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                <ListTodo className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Brak Listy i Projektu (Czysty Inbox)</p>
                <p className="text-[10px] text-zinc-500">Zdejmij wszelkie przypisania</p>
              </div>
            </button>

            {/* Listy Zadań */}
            {taskLists.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ListTodo className="w-3.5 h-3.5 text-purple-500" />
                  Wybierz Listę Zadań
                </h4>
                <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {taskLists.filter(l => !l.isArchived).map(list => (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => handleMoveToList(list.id, list.projectId || null)}
                      disabled={isPending}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 hover:border-purple-500 text-left bg-white dark:bg-zinc-900/40 hover:bg-purple-500/5 transition-all flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200"
                    >
                      <span className="truncate">{list.name}</span>
                      {list.projectId && (
                        <span className="text-[10px] font-medium text-zinc-400 shrink-0 ml-2">
                          (W projekcie)
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Projekty */}
            {projects.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                  Wybierz Projekt
                </h4>
                <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {projects.map(proj => (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => handleMoveToProject(proj.id)}
                      disabled={isPending}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 hover:border-blue-500 text-left bg-white dark:bg-zinc-900/40 hover:bg-blue-500/5 transition-all flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200"
                    >
                      <span className="truncate">{proj.title}</span>
                      <span className="text-[10px] font-medium text-zinc-400 shrink-0 ml-2">
                        {proj.status === "ACTIVE" ? "Aktywny" : "Wstrzymany"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 3. Modal Dodawania Taga */}
      <Dialog open={tagModalOpen} onOpenChange={setTagModalOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 max-w-sm rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
              <TagIcon className="w-4 h-4 text-pink-500" />
              Dodaj Tag do Zadań ({selectedTaskIds.length})
            </DialogTitle>
          </DialogHeader>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleAddTag();
            }}
            className="space-y-3 my-3"
          >
            <Input
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="np. pilne, zakupy, klient..."
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs h-10 rounded-xl"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setTagModalOpen(false)}
                className="h-9 text-xs rounded-xl"
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                disabled={!tagName.trim() || isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs"
              >
                Dodaj Tag
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. Modal Wyboru Miejsca */}
      <Dialog open={placeModalOpen} onOpenChange={setPlaceModalOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 max-w-sm rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              Przypisz Miejsce ({selectedTaskIds.length})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 my-3 max-h-60 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => handleAssignPlace(null)}
              disabled={isPending}
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-left bg-zinc-50 dark:bg-zinc-900/50 hover:bg-red-500/10 hover:border-red-400 transition-all text-xs font-bold text-red-600 dark:text-red-400"
            >
              Zdejmij przypisane miejsce
            </button>
            {places.map(place => (
              <button
                key={place.id}
                type="button"
                onClick={() => handleAssignPlace(place.id)}
                disabled={isPending}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 text-left bg-white dark:bg-zinc-900/40 hover:bg-blue-500/5 transition-all text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">{place.name}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* 5. Modal Potwierdzenia Usunięcia */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 max-w-sm rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-red-600 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Usuń {selectedTaskIds.length} Zadań
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 my-2">
            Czy na pewno chcesz bezpowrotnie usunąć <strong>{selectedTaskIds.length}</strong> zaznaczonych zadań? Tej operacji nie można cofnąć.
          </p>

          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isPending}
              className="h-9 text-xs rounded-xl"
            >
              Anuluj
            </Button>
            <Button
              type="button"
              onClick={handleDeleteBatch}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Usuń Zaznaczone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
