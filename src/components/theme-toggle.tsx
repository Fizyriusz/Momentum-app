"use client";

import { useTheme } from "./theme-provider";
import { Sun, Moon, Laptop } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-8 w-full bg-zinc-200/50 dark:bg-zinc-900/50 rounded-xl animate-pulse ${className}`} />
    );
  }

  const options = [
    { id: "light" as const, label: "Jasny", icon: Sun },
    { id: "dark" as const, label: "Ciemny", icon: Moon },
    { id: "system" as const, label: "Auto", icon: Laptop },
  ];

  return (
    <div
      className={`flex items-center p-1 bg-zinc-200/60 dark:bg-zinc-900/80 border border-zinc-300/60 dark:border-zinc-800/60 rounded-xl gap-0.5 ${className}`}
      role="radiogroup"
      aria-label="Wybór motywu"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.id;

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            title={`Motyw: ${opt.label}`}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-200
              ${
                isActive
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              }
            `}
            role="radio"
            aria-checked={isActive}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-purple-600 dark:text-purple-400" : ""}`} />
            <span className="hidden sm:inline text-[11px]">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
