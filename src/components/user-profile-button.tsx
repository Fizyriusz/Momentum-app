"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "./auth-provider";
import { SettingsDialog } from "./settings-dialog";
import { Settings, LogOut, ChevronUp, User } from "lucide-react";

interface UserProfileButtonProps {
  className?: string;
  onItemClick?: () => void;
}

export function UserProfileButton({ className = "", onItemClick }: UserProfileButtonProps) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName = user?.displayName || (user?.email ? user.email.split("@")[0] : "Użytkownik");
  const email = user?.email || "";
  const userInitial = displayName.charAt(0).toUpperCase();

  // Zamykanie menu po kliknięciu poza komponent
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleOpenSettings = () => {
    setMenuOpen(false);
    setSettingsOpen(true);
    if (onItemClick) onItemClick();
  };

  const handleSignOut = async () => {
    setMenuOpen(false);
    if (onItemClick) onItemClick();
    await signOut();
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Przycisk profilu w stopce */}
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        className={`
          w-full flex items-center justify-between p-2 rounded-2xl transition-all duration-200 text-left outline-none
          bg-zinc-100/80 dark:bg-zinc-900/60 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80
          border border-zinc-200/80 dark:border-zinc-800/80 group ${className}
        `}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {user?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt="Awatar"
              className="w-8 h-8 rounded-xl object-cover ring-1 ring-purple-500/40 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center ring-1 ring-purple-500/40 shrink-0">
              {userInitial}
            </div>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {displayName}
            </span>
            <span className="text-[10px] text-zinc-500 truncate font-medium">
              {email}
            </span>
          </div>
        </div>
        <ChevronUp className={`w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-transform duration-200 shrink-0 ml-1 ${menuOpen ? "rotate-180 text-purple-600 dark:text-purple-400" : ""}`} />
      </button>

      {/* Pływające menu (Popup) */}
      {menuOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
          <div className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
            Konto Duveo
          </div>

          <button
            type="button"
            onClick={handleOpenSettings}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-200 transition-colors text-left"
          >
            <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Ustawienia & Motyw</span>
          </button>

          <div className="h-px bg-zinc-200/80 dark:bg-zinc-800/80 my-1" />

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Wyloguj</span>
          </button>
        </div>
      )}

      {/* Modal Ustawień */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
