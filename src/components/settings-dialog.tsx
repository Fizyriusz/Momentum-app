"use client";

import React, { useState } from "react";
import { useAuth } from "./auth-provider";
import { useTheme } from "./theme-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DuveoLogo } from "@/components/duveo-logo";
import { 
  Sun, 
  Moon, 
  Laptop, 
  Globe, 
  User, 
  LogOut, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  Settings
} from "lucide-react";
import Link from "next/link";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState<"pl" | "en">("pl");

  const themeOptions = [
    { id: "light" as const, label: "Jasny", desc: "Czysty, wysoki kontrast pod słońce", icon: Sun },
    { id: "dark" as const, label: "Ciemny", desc: "Dark-Tech zinc-950, głęboka czerń", icon: Moon },
    { id: "system" as const, label: "Systemowy", desc: "Dopasuj do ustawień urządzenia", icon: Laptop },
  ];

  const languages = [
    { id: "pl" as const, label: "Polski", flag: "🇵🇱", active: true },
    { id: "en" as const, label: "English", flag: "🇬🇧", active: false, badge: "Wkrótce" },
  ];

  const handleSignOut = async () => {
    onOpenChange(false);
    await signOut();
  };

  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 sm:max-w-lg w-[92vw] rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center gap-2.5 text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Settings className="w-5 h-5" />
            </div>
            Ustawienia & Profil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* 1. Karta Profilu */}
          <div className="p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              {user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt="Awatar"
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-500/30 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-lg flex items-center justify-center ring-2 ring-purple-500/30 shrink-0">
                  {userInitial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {user?.displayName || "Użytkownik"}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 px-1.5 py-0">
                    FREE
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5 font-medium">
                  {user?.email || "Brak adresu email"}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Wygląd Aplikacji (Motyw) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1">
              Wygląd Aplikacji
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id)}
                    className={`
                      flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all relative
                      ${
                        isActive
                          ? "bg-purple-500/10 border-purple-500/50 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/30 shadow-xs"
                          : "bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className={`p-1.5 rounded-xl ${isActive ? "bg-purple-600 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isActive && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                    </div>
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Język Aplikacji */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Język Interfejsu
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {languages.map((lang) => {
                const isSelected = language === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setLanguage(lang.id)}
                    className={`
                      flex items-center justify-between p-3 rounded-2xl border transition-all text-xs font-semibold
                      ${
                        isSelected
                          ? "bg-purple-500/10 border-purple-500/50 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/30"
                          : "bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </div>
                    {lang.badge && (
                      <span className="text-[10px] font-medium text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">
                        {lang.badge}
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Stopka & Informacje o Duveo */}
          <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
              <div className="flex items-center gap-2">
                <DuveoLogo className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="font-bold text-zinc-700 dark:text-zinc-300">Duveo v0.9.0</span>
              </div>
              <Link
                href="/changelog"
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
              >
                Changelog
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleSignOut}
              className="w-full h-11 border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 rounded-2xl font-bold text-xs gap-2 transition-all mt-1"
            >
              <LogOut className="w-4 h-4" />
              Wyloguj z Duveo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
