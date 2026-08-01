import { prisma } from "@/lib/prisma";
import { TaskList } from "@/components/task-list";
import { Hash } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TagPage({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = await params;
  const tagName = decodeURIComponent(resolvedParams.name).toLowerCase();
  
  const tag = await prisma.tag.findUnique({
    where: { name: tagName },
    include: {
      tasks: {
        where: { isCompleted: false },
        include: { tags: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!tag) {
    notFound();
  }

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className={`p-3 rounded-xl bg-${tag.color}/10`}>
          <Hash className={`w-6 h-6 text-${tag.color}`} />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">#{tag.name}</h1>
          <p className="text-zinc-500 text-sm font-medium mt-0.5">Zadania przypisane do tego tagu</p>
        </div>
      </header>

      <section className="mt-4">
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-md p-4">
          <TaskList tasks={tag.tasks} />
        </div>
      </section>
    </main>
  );
}
