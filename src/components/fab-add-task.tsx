"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { QuickAddTask } from "./quick-add-task";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function FabAddTask() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Inteligentne wykrywanie aktualnego widoku
  let defaultDueDate: Date | null = null;
  let defaultTaskListId = "";
  let defaultProjectId = "";
  let defaultMode: "TASK" | "NOTE" | "IDEA" = "TASK";

  if (pathname === "/tasks/today" || pathname === "/") {
    defaultDueDate = new Date();
  } else if (pathname === "/tasks/tomorrow") {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    defaultDueDate = tomorrow;
  } else if (pathname === "/lists") {
    const id = searchParams.get("id");
    if (id) defaultTaskListId = id;
  } else if (pathname === "/projects") {
    const id = searchParams.get("id");
    if (id) defaultProjectId = id;
  } else if (pathname === "/incubator") {
    defaultMode = "IDEA";
  } else if (pathname === "/notes") {
    defaultMode = "NOTE";
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button
            size="icon"
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-900/50 hover:scale-105 transition-transform z-50 md:bottom-8 md:right-8"
          />
        }
      >
        <Plus className="w-6 h-6" />
        <span className="sr-only">Dodaj zadanie</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 p-6 shadow-2xl rounded-3xl" showCloseButton={false}>
        <VisuallyHidden>
          <DialogTitle>Szybkie dodawanie zadania</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
            {defaultMode === "IDEA" ? "Nowy Pomysł" : defaultMode === "NOTE" ? "Nowa Notatka" : "Nowe Zadanie"}
          </h2>
          <div>
            <QuickAddTask 
              key={`${pathname}_${searchParams.toString()}_${open ? 'open' : 'closed'}`}
              defaultDueDate={defaultDueDate}
              defaultMode={defaultMode}
              taskListId={defaultTaskListId || undefined}
              projectId={defaultProjectId || undefined}
              onSuccess={() => setOpen(false)} 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
