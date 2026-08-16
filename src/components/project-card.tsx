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
import { Play, Square, Briefcase, BookOpen, Code, Layers, History, Edit2, Save, Target, Pause, Archive, AlertCircle, RefreshCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";

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
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
              Budżet na {PeriodLabels[project.period]?.toLowerCase() || project.period.toLowerCase()}
            </p>
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
          
          {/* Modal Historii Sesji */}
          <Dialog>
            <DialogTrigger 
              render={
                <Button 
                  variant="outline" 
                  className="h-12 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white shrink-0 font-bold rounded-2xl shadow-xs"
                  title="Historia Sesji"
                >
                  <History className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                  Historia
                </Button>
              }
            />
            <DialogContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 sm:max-w-md w-[90vw] rounded-3xl p-6 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                  <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Historia Sesji: {project.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="max-h-[60vh] overflow-y-auto pr-2 mt-4 space-y-3">
                {timeLogs && timeLogs.length > 0 ? (
                  timeLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">
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
                        <Play className="w-3 h-3 text-purple-600 dark:text-purple-400" />
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
