"use client";

import { useState, useEffect, useTransition } from "react";
import { addMinutesToSkill } from "@/app/actions";
import { Play, Square } from "lucide-react";

type Skill = {
  id: number;
  title: string;
};

export function MiniTimer({ skills }: { skills: Skill[] }) {
  const [isPending, startTransition] = useTransition();
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeSkillId, setActiveSkillId] = useState<number | null>(
    skills.length > 0 ? skills[0].id : null
  );

  const storageKey = `quest-log-mini-timer`;

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const { startTime, accumulated, skillId } = JSON.parse(stored);
      setIsTracking(true);
      setActiveSkillId(skillId);
      
      const now = Date.now();
      const diffSeconds = Math.floor((now - startTime) / 1000);
      setElapsedSeconds(accumulated + diffSeconds);
    } else if (skills.length > 0 && !activeSkillId) {
       setActiveSkillId(skills[0].id);
    }
  }, [skills, activeSkillId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        
        if (elapsedSeconds % 5 === 0) {
           const stored = localStorage.getItem(storageKey);
           if (stored) {
             const data = JSON.parse(stored);
             localStorage.setItem(storageKey, JSON.stringify({
               ...data,
               accumulated: elapsedSeconds
             }));
           }
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isTracking, elapsedSeconds]);

  function handleStart() {
    if (!activeSkillId) return;
    setIsTracking(true);
    localStorage.setItem(storageKey, JSON.stringify({
      startTime: Date.now(),
      accumulated: elapsedSeconds,
      skillId: activeSkillId
    }));
  }

  function handleStop() {
    setIsTracking(false);
    localStorage.removeItem(storageKey);
    
    const minutesToLog = Math.floor(elapsedSeconds / 60);
    
    if (minutesToLog > 0 && activeSkillId) {
      startTransition(async () => {
        await addMinutesToSkill(activeSkillId, minutesToLog);
        setElapsedSeconds(0);
      });
    } else {
      setElapsedSeconds(0);
    }
  }

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (skills.length === 0) return null;

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 backdrop-blur-md ${isTracking ? 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/30' : 'bg-zinc-900/40 border-zinc-800/50'}`}>
      
      <div className="flex-1 flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Uniwersalny Stoper</label>
        <select
          disabled={isTracking}
          value={activeSkillId || ""}
          onChange={(e) => setActiveSkillId(Number(e.target.value))}
          className="bg-transparent text-zinc-200 text-sm font-medium focus:outline-none appearance-none cursor-pointer w-full"
        >
          {skills.map(s => (
            <option key={s.id} value={s.id} className="bg-zinc-900">{s.title}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        {isTracking ? (
          <div className="font-mono text-lg font-bold text-purple-400 w-16 text-center tabular-nums">
            {formatTimer(elapsedSeconds)}
          </div>
        ) : null}
        
        <button
          onClick={isTracking ? handleStop : handleStart}
          disabled={isPending}
          className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
            isTracking 
              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
              : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/50'
          }`}
        >
          {isTracking ? <Square className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-1" fill="currentColor" />}
        </button>
      </div>
      
    </div>
  );
}
