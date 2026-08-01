"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { QuickAddTask } from "./quick-add-task";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function FabAddTask() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button
            size="icon"
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-900/50 hover:scale-105 transition-transform z-50 md:bottom-8 md:right-8"
          />
        }
      >
        <Plus className="w-6 h-6" />
        <span className="sr-only">Dodaj zadanie</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 p-6 shadow-2xl" showCloseButton={false}>
        <VisuallyHidden>
          <DialogTitle>Szybkie dodawanie zadania</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-black uppercase tracking-tight text-zinc-100">
            Nowe Zadanie
          </h2>
          <div onClick={() => setTimeout(() => setOpen(false), 500)}>
            <QuickAddTask />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
