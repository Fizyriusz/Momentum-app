"use client";

import { useState, useEffect, useTransition } from "react";
import { addMinutesToProject } from "@/lib/services/timeLogs";
import { updateProject as updateProjectDetails, pauseProject, sendProjectToInbox, activateProject, useProjects, MAX_ACTIVE_PROJECTS, Project } from "@/lib/services/projects";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Play, Square, Briefcase, BookOpen, Code, Layers, History, Edit2, Save, Target, Pause, Archive, AlertCircle, RefreshCcw, Calendar, Clock, Sparkles, CheckCircle2, Rocket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";

function formatProjectDate(ts: any): string {
  if (!ts) return "Niedawno";
  try {
    const millis = ts?.toMillis ? ts.toMillis() : (ts?.seconds ? ts.seconds * 1000 : (typeof ts === 'number' ? ts : new Date(ts).getTime()));
    if (!millis || isNaN(millis)) return "Niedawno";
    return new Date(millis).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch {
    return "Niedawno";
  }
}

function formatProjectDateTime(ts: any): string {
  if (!ts) return "Niedawno";
  try {
    const millis = ts?.toMillis ? ts.toMillis() : (ts?.seconds ? ts.seconds * 1000 : (typeof ts === 'number' ? ts : new Date(ts).getTime()));
    if (!millis || isNaN(millis)) return "Niedawno";
    return new Date(millis).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "Niedawno";
  }
}

type TimeLog = {
  id: string;
  minutes: number;
  createdAt: number;
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [limitAlertOpen, setLimitAlertOpen] = useState(false);
  
  // Detale projektu
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedGoal, setEditedGoal] = useState(project.goal || "");
  const [editedDescription, setEditedDescription] = useState(project.description || "");
  const [editedTargetHours, setEditedTargetHours] = useState(Math.floor(project.targetMinutes / 60));
  const [editedPeriod, setEditedPeriod] = useState(project.period);

  const { projects: activeProjects } = useProjects("ACTIVE");
  const isLimitReached = activeProjects.length >= MAX_ACTIVE_PROJECTS;

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

  function handlePauseProject() {
    if (isTracking) handleStop();
    startTransition(async () => {
      await pauseProject(project.id);
    });
  }

  function handleSendToInbox() {
    if (!confirm("Czy na pewno chcesz przenieść ten projekt z powrotem do Inkubatora?")) return;
    if (isTracking) handleStop();
    startTransition(async () => {
      await sendProjectToInbox(project.id);
      router.push("/projects");
    });
  }

  function handleResumeProject() {
    if (isLimitReached) {
      setLimitAlertOpen(true);
      return;
    }
    startTransition(async () => {
      try {
        await activateProject(project.id);
      } catch (e) {
        setLimitAlertOpen(true);
      }
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
  const isPaused = project.status === "PAUSED";

  return (
    <Card className={`
      relative overflow-hidden transition-all duration-500 rounded-3xl
      bg-white dark:bg-zinc-900/40 backdrop-blur-md border-zinc-200/80 dark:border-zinc-800/50 shadow-xs dark:shadow-none
      ${isTracking ? 'ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/10' : ''}
      ${isPaused ? 'opacity-90 border-amber-500/30' : ''}
      ${isCompleted ? 'border-purple-500/40' : ''}
    `}>
      {isTracking && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent animate-pulse opacity-50 pointer-events-none" />
      )}
      
      <CardHeader className="pb-2 pt-5 px-5 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isTracking ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' : isPaused ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">{project.title}</h3>
              {isPaused && (
                <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-[10px] uppercase font-bold">
                  Wstrzymany
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                Budżet na {PeriodLabels[project.period]?.toLowerCase() || project.period.toLowerCase()}
              </p>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-600">•</span>
              <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-medium">
                <Calendar className="w-2.5 h-2.5" />
                Od: {formatProjectDate(project.createdAt)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isCompleted && (
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-none font-bold">
              Cel osiągnięty
            </Badge>
          )}
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{progressPercent}%</span>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        
        {/* Zintegrowany opis płaski (Flat UI) */}
        <div className="mt-4 mb-6">
          {isEditingDetails ? (
            <div className="space-y-4 bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                  Główny Cel (Jedno zdanie)
                </label>
                <Input 
                  value={editedGoal}
                  onChange={e => setEditedGoal(e.target.value)}
                  placeholder="Np. Wdrożenie produkcyjne do końca miesiąca..."
                  className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-sm rounded-xl"
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
                    className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-sm rounded-xl"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                    Okres
                  </label>
                  <select 
                    value={editedPeriod}
                    onChange={e => setEditedPeriod(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 min-h-[80px] resize-y text-sm rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsEditingDetails(false)}
                  disabled={isPending}
                  className="rounded-xl"
                >
                  Anuluj
                </Button>
                <Button 
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs"
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
                 <p className="text-sm text-zinc-800 dark:text-zinc-300 font-medium leading-relaxed">{project.goal}</p>
               )}
               {project.description && (
                 <div className="prose dark:prose-invert prose-sm max-w-none text-zinc-600 dark:text-zinc-400 mt-2">
                   <ReactMarkdown>{project.description}</ReactMarkdown>
                 </div>
               )}
               {!project.goal && !project.description && (
                 <p className="text-sm text-zinc-400 dark:text-zinc-600 italic">Brak opisu projektu...</p>
               )}
               
               <div className="flex flex-wrap items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 text-xs h-8 rounded-xl shadow-xs"
                  onClick={() => {
                    setEditedGoal(project.goal || "");
                    setEditedDescription(project.description || "");
                    setEditedTargetHours(Math.floor(project.targetMinutes / 60));
                    setIsEditingDetails(true);
                  }}
                >
                  <Edit2 className="w-3 h-3 mr-1.5" /> Edytuj detale
                </Button>

                {project.status === "ACTIVE" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePauseProject}
                      disabled={isPending}
                      className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-zinc-700 dark:text-zinc-400 hover:text-amber-700 dark:hover:text-amber-300 text-xs h-8 rounded-xl shadow-xs"
                    >
                      <Pause className="w-3 h-3 mr-1.5 text-amber-500" /> Wstrzymaj projekt
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendToInbox}
                      disabled={isPending}
                      className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300 text-xs h-8 rounded-xl shadow-xs"
                    >
                      <Archive className="w-3 h-3 mr-1.5" /> Cofnij do Inkubatora
                    </Button>
                  </>
                ) : isPaused ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResumeProject}
                      disabled={isPending}
                      className="border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs h-8 font-bold rounded-xl"
                    >
                      <RefreshCcw className="w-3 h-3 mr-1.5" /> Wznów projekt
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendToInbox}
                      disabled={isPending}
                      className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300 text-xs h-8 rounded-xl shadow-xs"
                    >
                      <Archive className="w-3 h-3 mr-1.5" /> Cofnij do Inkubatora
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResumeProject}
                    disabled={isPending}
                    className="border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs h-8 font-bold rounded-xl"
                  >
                    <Play className="w-3 h-3 mr-1.5" /> Aktywuj projekt
                  </Button>
                )}
               </div>
            </div>
          )}
        </div>

        <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800/50 mb-4" />

        {/* Progress Bar & Labels */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] mb-2 text-zinc-500 font-bold uppercase tracking-widest items-center">
            <span>{formatTime(currentTotalMinutes)} / {formatTime(project.targetMinutes)}</span>
          </div>
          <Progress 
            value={progressPercent} 
            className="h-1.5 bg-zinc-200 dark:bg-zinc-800" 
            indicatorClassName={isCompleted ? "bg-emerald-500" : "bg-purple-600 dark:bg-purple-500"}
          />
        </div>

        {/* Akcje / Stoper */}
        <div className="flex items-center gap-2 mt-4 relative z-10">
          {isTracking ? (
            <Button 
              variant="destructive" 
              onClick={handleStop}
              className="flex-1 bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 border border-red-500/30 font-mono text-lg font-bold h-12 rounded-2xl"
              disabled={isPending}
            >
              <Square className="w-4 h-4 mr-2" fill="currentColor" />
              {formatTimer(elapsedSeconds)}
            </Button>
          ) : (
            <Button 
              onClick={handleStart}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white h-12 transition-colors font-bold rounded-2xl shadow-xs"
              disabled={isPending || isCompleted || isPaused}
            >
              <Play className="w-4 h-4 mr-2" fill="currentColor" />
              {isPaused ? "Projekt Wstrzymany" : "Start"}
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={handleQuickBlock}
            disabled={isTracking || isPending || isCompleted || isPaused}
            className="h-12 px-4 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white shrink-0 font-bold text-xs rounded-2xl shadow-xs"
            title="+25 min blok czasu"
          >
            + 25m
          </Button>
          
          {/* Modal Historii & Osi Czasu (Timeline) */}
          <Dialog>
            <DialogTrigger 
              render={
                <Button 
                  variant="outline" 
                  className="h-12 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white shrink-0 font-bold rounded-2xl shadow-xs"
                  title="Historia i Oś Czasu"
                >
                  <History className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                  Historia
                </Button>
              }
            />
            <DialogContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 sm:max-w-lg w-[92vw] rounded-3xl p-6 shadow-2xl max-h-[80vh] flex flex-col">
              <DialogHeader className="shrink-0">
                <DialogTitle className="flex items-center gap-2.5 text-zinc-900 dark:text-zinc-100 text-lg font-black tracking-tight">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <History className="w-5 h-5" />
                  </div>
                  Oś Czasu & Historia: {project.title}
                </DialogTitle>
              </DialogHeader>
              
              {/* Statystyki podsumowujące */}
              <div className="grid grid-cols-3 gap-2.5 my-3 shrink-0">
                <div className="p-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Przepracowano</span>
                  <span className="text-sm font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">{formatTime(currentTotalMinutes)}</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Liczba Sesji</span>
                  <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 font-mono mt-0.5 block">{timeLogs.length}</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Data Startu</span>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate mt-0.5 block">{formatProjectDate(project.createdAt)}</span>
                </div>
              </div>

              {/* Oś Czasu (Timeline) z połączoną linią */}
              <div className="flex-1 overflow-y-auto pr-2 mt-2 space-y-4 relative before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
                
                {/* 1. Ostatnie sesje skupienia (TimeLogs) */}
                {timeLogs && timeLogs.length > 0 ? (
                  timeLogs.map((log) => (
                    <div key={log.id} className="relative flex items-start gap-4 pl-2 group">
                      <div className="w-9 h-9 rounded-2xl bg-purple-500/15 border-2 border-white dark:border-zinc-950 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 z-10 shadow-xs">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <div className="flex-1 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/60 hover:border-purple-500/30 transition-colors">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
                            +{log.minutes} min skupienia
                          </span>
                          <span className="text-[10px] text-zinc-500 font-medium">
                            {new Date(log.createdAt).toLocaleString('pl-PL', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                          Zarejestrowano sesję pracy nad projektem.
                        </p>
                      </div>
                    </div>
                  ))
                ) : null}

                {/* 2. Zdarzenie Ostatniej Modyfikacji (jeśli istnieje) */}
                {project.updatedAt && (
                  <div className="relative flex items-start gap-4 pl-2">
                    <div className="w-9 h-9 rounded-2xl bg-blue-500/15 border-2 border-white dark:border-zinc-950 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 z-10 shadow-xs">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/60">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          Ostatnia modyfikacja
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          {formatProjectDateTime(project.updatedAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        Zaktualizowano cele, budżet lub status projektu.
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Zdarzenie Utworzenia Projektu (Start Timeline) */}
                <div className="relative flex items-start gap-4 pl-2">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border-2 border-white dark:border-zinc-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 z-10 shadow-xs">
                    <Rocket className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/60">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Utworzenie projektu
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {formatProjectDateTime(project.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      Projekt zainicjalizowany w Duveo z budżetem {formatTime(project.targetMinutes)} na {PeriodLabels[project.period]?.toLowerCase() || project.period.toLowerCase()}.
                    </p>
                  </div>
                </div>

              </div>
            </DialogContent>
          </Dialog>

        </div>
      </CardContent>

      {/* Modal Alert Limitu */}
      <Dialog open={limitAlertOpen} onOpenChange={setLimitAlertOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 sm:max-w-md w-[90vw] rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-5 h-5" />
              Limit 2 aktywnych projektów
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-2 text-sm text-zinc-700 dark:text-zinc-300">
            <p>
              Masz już <strong>2 aktywne projekty</strong>. Aby wznowić ten projekt, musisz najpierw wstrzymać lub cofnąć do Inkubatora jeden z aktualnie prowadzonych projektów.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setLimitAlertOpen(false)} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                Rozumiem
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Alias dla kompatybilności wstecznej
export const SkillCard = ProjectCard;
