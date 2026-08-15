"use client";

import { useState, useEffect, useTransition } from "react";
import { addMinutesToProject } from "@/lib/services/timeLogs";
import { updateProject as updateProjectDetails } from "@/lib/services/projects";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Play, Square, Briefcase, BookOpen, Code, Layers, History, Edit2, Save, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

type TimeLog = {
  id: string;
  minutes: number;
  createdAt: number;
};

export type Project = {
  id: string;
  title: string;
  targetMinutes: number;
  period: string;
  loggedMinutes: number;
  icon: string;
  goal?: string | null;
  description?: string | null;
  status: string;
};

const IconMap: Record<string, React.ElementType> = {
  Briefcase,
  Target,
  BookOpen,
  Code,
  Layers,
};

const PeriodLabels: Record<string, string> = {
  WEEK: "Tydzień",
  MONTH: "Miesiąc",
  QUARTER: "Kwartał",
  YEAR: "Rok"
};

export function ProjectCard({ project, timeLogs = [] }: { project: Project, timeLogs?: TimeLog[] }) {
  const [isPending, startTransition] = useTransition();
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Detale projektu
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedGoal, setEditedGoal] = useState(project.goal || "");
  const [editedDescription, setEditedDescription] = useState(project.description || "");
  const [editedTargetHours, setEditedTargetHours] = useState(Math.floor(project.targetMinutes / 60));
  const [editedPeriod, setEditedPeriod] = useState(project.period);

  const storageKey = `project-timer-${project.id}`;

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const { startTime, accumulated } = JSON.parse(stored);
      setIsTracking(true);
      
      const now = Date.now();
      const diffSeconds = Math.floor((now - startTime) / 1000);
      setElapsedSeconds(accumulated + diffSeconds);
    }
  }, [storageKey]);

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
  }, [isTracking, elapsedSeconds, storageKey]);

  function handleStart() {
    setIsTracking(true);
    localStorage.setItem(storageKey, JSON.stringify({
      startTime: Date.now(),
      accumulated: elapsedSeconds
    }));
  }

  function handleStop() {
    setIsTracking(false);
    localStorage.removeItem(storageKey);
    
    const minutesToLog = Math.floor(elapsedSeconds / 60);
    
    if (minutesToLog > 0) {
      startTransition(async () => {
        await addMinutesToProject(project.id, minutesToLog);
        setElapsedSeconds(0);
      });
    } else {
      setElapsedSeconds(0);
    }
  }

  function handleQuickBlock() {
    startTransition(async () => {
      await addMinutesToProject(project.id, 25);
    });
  }

  function handleSaveDetails() {
    startTransition(async () => {
      await updateProjectDetails(project.id, {
        goal: editedGoal || null,
        description: editedDescription || null,
        targetMinutes: (editedTargetHours || 0) * 60,
        period: editedPeriod
      });
      setIsEditingDetails(false);
    });
  }

  const IconComponent = IconMap[project.icon] || Briefcase;
  
  const currentTotalMinutes = project.loggedMinutes;
  const progressPercent = Math.min(100, Math.round((currentTotalMinutes / project.targetMinutes) * 100));
  
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isCompleted = currentTotalMinutes >= project.targetMinutes;

  return (
    <Card className={`
      relative overflow-hidden transition-all duration-500
      bg-zinc-900/40 backdrop-blur-md border-zinc-800/50
      ${isTracking ? 'ring-1 ring-purple-500/50 shadow-lg shadow-purple-500/10' : ''}
      ${isCompleted ? 'border-purple-500/30' : ''}
    `}>
      {isTracking && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent animate-pulse opacity-50 pointer-events-none" />
      )}
      
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isTracking ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-400'}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-100 text-lg">{project.title}</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
              Budżet na {PeriodLabels[project.period]?.toLowerCase() || project.period.toLowerCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && (
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-none">
              Cel osiągnięty
            </Badge>
          )}
          <span className="text-xs font-bold text-zinc-400">{progressPercent}%</span>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        
        {/* Zintegrowany opis płaski (Flat UI) */}
        <div className="mt-4 mb-6">
          {isEditingDetails ? (
            <div className="space-y-4 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                  Główny Cel (Jedno zdanie)
                </label>
                <Input 
                  value={editedGoal}
                  onChange={e => setEditedGoal(e.target.value)}
                  placeholder="Np. Wdrożenie produkcyjne do końca miesiąca..."
                  className="bg-zinc-950 border-zinc-800 text-sm"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                    Budżet (Godziny)
                  </label>
                  <Input 
                    type="number"
                    min="1"
                    value={editedTargetHours}
                    onChange={e => setEditedTargetHours(parseInt(e.target.value) || 0)}
                    className="bg-zinc-950 border-zinc-800 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                    Okres
                  </label>
                  <select 
                    value={editedPeriod}
                    onChange={e => setEditedPeriod(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-md bg-zinc-950 border border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="WEEK">Tydzień</option>
                    <option value="MONTH">Miesiąc</option>
                    <option value="QUARTER">Kwartał</option>
                    <option value="YEAR">Rok</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                  Opis Projektu (Markdown)
                </label>
                <Textarea 
                  value={editedDescription}
                  onChange={e => setEditedDescription(e.target.value)}
                  placeholder="Zakres, specyfikacja, linki..."
                  className="bg-zinc-950 border-zinc-800 min-h-[80px] resize-y text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsEditingDetails(false)}
                  disabled={isPending}
                >
                  Anuluj
                </Button>
                <Button 
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-500 text-white"
                  onClick={handleSaveDetails}
                  disabled={isPending}
                >
                  <Save className="w-4 h-4 mr-2" /> Zapisz
                </Button>
              </div>
            </div>
          ) : (
            <div className="group relative pr-8">
               {project.goal && (
                 <p className="text-sm text-zinc-300 font-medium leading-relaxed">{project.goal}</p>
               )}
               {project.description && (
                 <div className="prose prose-invert prose-sm max-w-none text-zinc-500 mt-2">
                   <ReactMarkdown>{project.description}</ReactMarkdown>
                 </div>
               )}
               {!project.goal && !project.description && (
                 <p className="text-sm text-zinc-600 italic">Brak opisu projektu...</p>
               )}
               
               <Button
                 variant="outline"
                 size="sm"
                 className="mt-4 border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs h-8"
                 onClick={() => {
                   setEditedGoal(project.goal || "");
                   setEditedDescription(project.description || "");
                   setEditedTargetHours(Math.floor(project.targetMinutes / 60));
                   setIsEditingDetails(true);
                 }}
               >
                 <Edit2 className="w-3 h-3 mr-1.5" /> Edytuj detale projektu
               </Button>
            </div>
          )}
        </div>

        <div className="w-full h-px bg-zinc-800/50 mb-4" />

        {/* Progress Bar & Labels */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] mb-2 text-zinc-500 font-bold uppercase tracking-widest items-center">
            <span>{formatTime(currentTotalMinutes)} / {formatTime(project.targetMinutes)}</span>
          </div>
          <Progress 
            value={progressPercent} 
            className="h-1.5 bg-zinc-800" 
            indicatorClassName={isCompleted ? "bg-purple-400" : "bg-purple-600"}
          />
        </div>

        {/* Akcje / Stoper */}
        <div className="flex items-center gap-2 mt-4 relative z-10">
          {isTracking ? (
            <Button 
              variant="destructive" 
              onClick={handleStop}
              className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 font-mono text-lg font-bold h-12"
              disabled={isPending}
            >
              <Square className="w-4 h-4 mr-2" fill="currentColor" />
              {formatTimer(elapsedSeconds)}
            </Button>
          ) : (
            <Button 
              onClick={handleStart}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 h-12 transition-colors font-bold"
              disabled={isPending || isCompleted}
            >
              <Play className="w-4 h-4 mr-2" fill="currentColor" />
              Start
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={handleQuickBlock}
            disabled={isTracking || isPending || isCompleted}
            className="h-12 px-4 border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:text-white shrink-0 font-bold text-xs"
            title="+25 min blok czasu"
          >
            + 25m
          </Button>
          
          {/* Modal Historii Sesji */}
          <Dialog>
            <DialogTrigger 
              render={
                <Button 
                  variant="outline"
                  className="h-12 border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:text-white shrink-0 font-bold"
                  title="Historia Sesji"
                >
                  <History className="w-4 h-4 mr-2 text-purple-400" />
                  Historia
                </Button>
              }
            />
            <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 sm:max-w-md w-[90vw] rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-500" />
                  Historia Sesji: {project.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="max-h-[60vh] overflow-y-auto pr-2 mt-4 space-y-3">
                {timeLogs && timeLogs.length > 0 ? (
                  timeLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-200">
                          +{log.minutes} min
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(log.createdAt).toLocaleString('pl-PL', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Play className="w-3 h-3 text-purple-400" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500 text-center py-4">Brak zarejestrowanych sesji.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </CardContent>
    </Card>
  );
}

// Alias dla kompatybilności wstecznej
export const SkillCard = ProjectCard;
