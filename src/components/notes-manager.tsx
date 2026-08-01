"use client";

import { useState, useTransition } from "react";
import { createNote, updateNote, deleteNote } from "@/app/actions";
import { FileText, Plus, Save, Trash, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

type Note = {
  id: string;
  title: string;
  content: string;
  skillId?: number | null;
  skill?: { title: string } | null;
  updatedAt: Date;
};

export function NotesManager({ initialNotes, projectId }: { initialNotes: Note[], projectId?: number }) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
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
        await createNote({ title: title || "Nowa notatka", content, skillId: projectId });
      } else if (editingId) {
        await updateNote(editingId, { title, content });
      }
      setEditingId(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Na pewno usunąć tę notatkę?")) return;
    startTransition(async () => {
      await deleteNote(id);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2">Notatki</h2>
        {!editingId && (
          <Button onClick={handleAdd} disabled={isPending} className="bg-purple-600 hover:bg-purple-500 text-white h-8 text-xs">
            <Plus className="w-3 h-3 mr-1" /> Nowa notatka
          </Button>
        )}
      </div>

      {editingId && (
        <div className="bg-zinc-900/50 p-4 rounded-xl border border-purple-500/30 space-y-4">
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tytuł notatki..."
            className="bg-zinc-950 border-zinc-800 font-bold"
          />
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Treść notatki (obsługuje Markdown)..."
            className="bg-zinc-950 border-zinc-800 min-h-[150px] resize-y"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isPending}>
              Anuluj
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPending} className="bg-purple-600 hover:bg-purple-500 text-white">
              <Save className="w-4 h-4 mr-2" /> Zapisz
            </Button>
          </div>
        </div>
      )}

      {!editingId && initialNotes.length === 0 && (
        <div className="text-center p-8 text-zinc-500 flex flex-col items-center gap-4 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
          <FileText className="w-6 h-6 text-zinc-600" />
          <p className="text-sm">Brak notatek. Stwórz swoją pierwszą notatkę!</p>
        </div>
      )}

      {!editingId && initialNotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialNotes.map(note => (
            <div key={note.id} className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 group relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-zinc-200">{note.title}</h3>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(note)} className="h-6 w-6 text-zinc-400 hover:text-white">
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(note.id)} className="h-6 w-6 text-red-500/70 hover:text-red-400">
                    <Trash className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-zinc-400 line-clamp-4">
                <ReactMarkdown>{note.content}</ReactMarkdown>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/50 text-[10px] text-zinc-600 flex justify-between items-center uppercase tracking-wider font-bold">
                <span>{new Date(note.updatedAt).toLocaleDateString('pl-PL')}</span>
                {note.skill && (
                  <span className="text-purple-500/70">{note.skill.title}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
