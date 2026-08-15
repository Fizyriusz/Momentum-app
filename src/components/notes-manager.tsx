"use client";

import { useState, useTransition } from "react";
import { createNote, updateNote, deleteNote } from "@/lib/services/notes";
import { FileText, Plus, Save, Trash, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

type Note = {
  id: string;
  title: string;
  content: string;
  projectId?: string | null;
  project?: { title: string } | null;
  updatedAt: number;
};

export function NotesManager({ initialNotes, projectId, groupByProject = false }: { initialNotes: Note[], projectId?: string, groupByProject?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Stany formularza
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const isCreating = editingId === "NEW";

  function handleAdd() {
    setEditingId("NEW");
    setTitle("");
    setContent("");
  }

  function handleEdit(note: Note) {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
  }

  function handleCancel() {
    setEditingId(null);
  }

  function handleSave() {
    if (!title.trim() && !content.trim()) return;

    startTransition(async () => {
      if (isCreating) {
        await createNote({ title: title || "Nowa notatka", content, projectId: projectId });
      } else if (editingId) {
        await updateNote(editingId, { title, content });
      }
      setEditingId(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Czy na pewno chcesz usunąć tę notatkę?")) return;
    startTransition(async () => {
      await deleteNote(id);
      if (editingId === id) setEditingId(null);
    });
  }

  return (
    <div className="space-y-4">
      {/* Pasek akcji */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2">Dokumentacja</h2>
        {!isCreating && (
          <Button 
            onClick={handleAdd} 
            size="sm" 
            variant="outline" 
            className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Dodaj Notatkę
          </Button>
        )}
      </div>

      {/* Formularz Edycji / Dodawania */}
      {editingId && (
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-200">
              {isCreating ? "Nowa Notatka" : "Edycja Notatki"}
            </h3>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-400" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <Input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Tytuł notatki..." 
            className="bg-zinc-950 border-zinc-800 text-sm font-bold"
          />

          <Textarea 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            placeholder="Treść notatki (obsługuje Markdown)..." 
            className="bg-zinc-950 border-zinc-800 text-sm min-h-[120px] resize-y"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isPending}>
              Anuluj
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white" onClick={handleSave} disabled={isPending}>
              <Save className="w-3.5 h-3.5 mr-1.5" /> Zapisz
            </Button>
          </div>
        </div>
      )}

      {/* Lista Notatek */}
      {initialNotes.length === 0 && !editingId ? (
        <div className="text-center p-6 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-xl text-zinc-600 text-xs">
          Brak notatek. Dodaj pierwszą notatkę dla tego projektu.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {initialNotes.map(note => (
            <div 
              key={note.id} 
              className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-sm text-zinc-200 line-clamp-1">{note.title}</h4>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(note)} 
                      className="p-1 text-zinc-400 hover:text-zinc-200"
                      title="Edytuj"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(note.id)} 
                      className="p-1 text-zinc-400 hover:text-red-400"
                      title="Usuń"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                {note.project && groupByProject && (
                  <span className="inline-block text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider mb-2">
                    {note.project.title}
                  </span>
                )}

                <div className="prose prose-invert prose-xs text-zinc-400 line-clamp-3">
                  <ReactMarkdown>{note.content}</ReactMarkdown>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-zinc-800/30 flex justify-between items-center text-[10px] text-zinc-600">
                <span>{new Date(note.updatedAt).toLocaleDateString("pl-PL")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
