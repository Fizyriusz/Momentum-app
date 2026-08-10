"use client";

import { Task } from "@/lib/services/tasks";
import { TaskItem } from "./task-item";

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-500 text-sm font-medium">
        Brak zadań. Jesteś na czysto!
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskItem task={task} />
        </li>
      ))}
    </ul>
  );
}
