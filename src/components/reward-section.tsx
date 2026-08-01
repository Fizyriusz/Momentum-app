"use client";

// Sekcja nagrody – aktywuje się po ukończeniu 60 min dziennie lub wszystkich nawyków
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, Lock } from "lucide-react";

export function RewardSection({ unlocked }: { unlocked: boolean }) {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <Gamepad2
          className={`h-5 w-5 transition-colors duration-500 ${
            unlocked ? "text-purple-400" : "text-zinc-700"
          }`}
        />
        <h2
          className={`text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${
            unlocked ? "text-purple-400" : "text-zinc-600"
          }`}
        >
          Nagroda / Chill Zone
        </h2>
      </div>

      <Card
        className={`
          relative overflow-hidden transition-all duration-700 ease-out
          ${unlocked
            ? "border-purple-500/50 bg-purple-950/20 shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)] animate-glow-pulse"
            : "border-zinc-900 bg-zinc-950/80 opacity-60"
          }
        `}
      >
        {/* Animowany glow wewnątrz */}
        {unlocked && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 animate-shimmer" />
        )}

        <CardContent className="relative py-6 px-5 flex flex-col items-center text-center">
          {unlocked ? (
            <div className="flex flex-col gap-3 items-center">
              <div className="bg-purple-500/20 p-3 rounded-full mb-1">
                 <Gamepad2 className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-black text-purple-300 uppercase tracking-wide">
                Quest Zaliczony!
              </h3>
              <p className="text-sm text-purple-200/80 leading-relaxed font-medium">
                Czas na Anime i gry bez wyrzutów sumienia.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <Lock className="h-8 w-8 text-zinc-700 shrink-0" />
              <p className="text-sm text-zinc-500 font-medium max-w-[200px]">
                Zaloguj 60 min lub zrób nawyki aby odblokować.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
