'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { 
  Clock, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Flame,
  ArrowLeft,
  Timer
} from 'lucide-react';
import { workoutsApi } from '@/lib/api';
import { Workout, WorkoutBlock } from '@/types';

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const workoutId = Number(params.id);
  
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set([0]));
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  
  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'rest' | 'stopwatch'>('rest');
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  
  // Level up modal
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: string; workoutsToNextLevel: number } | null>(null);

  // Fetch workout
  const { data: workout, isLoading, error } = useQuery({
    queryKey: ['workout', workoutId],
    queryFn: async () => {
      const response = await workoutsApi.getOne(workoutId);
      return response.data.data.workout as Workout;
    },
    enabled: !!workoutId,
  });

  // Complete workout mutation
  const completeMutation = useMutation({
    mutationFn: () => workoutsApi.complete(workoutId),
    onSuccess: (response) => {
      const data = response.data.data;
      queryClient.invalidateQueries({ queryKey: ['workout', workoutId] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      
      if (data.leveledUp) {
        setLevelUpData({
          newLevel: data.newLevel,
          workoutsToNextLevel: data.workoutsToNextLevel
        });
        setShowLevelUp(true);
      } else {
        router.push('/dashboard');
      }
    },
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerRunning) {
      if (timerMode === 'rest') {
        interval = setInterval(() => {
          setTimerSeconds(prev => {
            if (prev <= 1) {
              setTimerRunning(false);
              // Play sound notification
              if (typeof window !== 'undefined') {
                const audio = new Audio('/timer-end.mp3');
                audio.play().catch(() => {});
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        interval = setInterval(() => {
          setStopwatchSeconds(prev => prev + 1);
        }, 1000);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerMode]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const toggleBlock = (index: number) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedBlocks(newExpanded);
  };

  const toggleExercise = (blockIndex: number, exerciseIndex: number) => {
    const key = `${blockIndex}-${exerciseIndex}`;
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(key)) {
      newCompleted.delete(key);
    } else {
      newCompleted.add(key);
    }
    setCompletedExercises(newCompleted);
  };

  const setRestTimer = (seconds: number) => {
    setTimerMode('rest');
    setTimerSeconds(seconds);
    setTimerRunning(true);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    if (timerMode === 'rest') {
      setTimerSeconds(60);
    } else {
      setStopwatchSeconds(0);
    }
  };

  const toggleTimerMode = () => {
    setTimerRunning(false);
    setTimerMode(prev => prev === 'rest' ? 'stopwatch' : 'rest');
    setTimerSeconds(60);
    setStopwatchSeconds(0);
  };

  const calculateProgress = () => {
    if (!workout?.exercises) return 0;
    const totalExercises = workout.exercises.reduce((acc, block) => acc + block.exercises.length, 0);
    return totalExercises > 0 ? (completedExercises.size / totalExercises) * 100 : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando entrenamiento...</p>
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Error al cargar el entrenamiento</p>
        <button 
          onClick={() => router.push('/workout')}
          className="btn-primary"
        >
          Volver
        </button>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-[#1e1e28] hover:bg-[#2a2a3a] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">
            Entrenamiento {workout.level}
          </h1>
          <p className="text-gray-400 text-sm">
            {new Date(workout.date).toLocaleDateString('es-ES', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })} · {workout.duration} min
          </p>
        </div>
        {workout.completed && (
          <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-xl">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Completado</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {!workout.completed && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Progreso</span>
            <span className="text-orange-400 font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-[#16161d] rounded-full overflow-hidden">
            <div 
              className="h-full gradient-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Timer */}
      {!workout.completed && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Timer className="w-5 h-5 text-orange-400" />
              {timerMode === 'rest' ? 'Temporizador de Descanso' : 'Cronómetro'}
            </h3>
            <button 
              onClick={toggleTimerMode}
              className="text-sm text-orange-400 hover:underline"
            >
              Cambiar a {timerMode === 'rest' ? 'cronómetro' : 'temporizador'}
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-6">
            <div className="text-5xl font-mono font-bold text-white">
              {timerMode === 'rest' ? formatTime(timerSeconds) : formatTime(stopwatchSeconds)}
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className={`p-3 rounded-xl ${
                timerRunning 
                  ? 'bg-orange-500/20 text-orange-400' 
                  : 'bg-green-500/20 text-green-400'
              }`}
            >
              {timerRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button
              onClick={resetTimer}
              className="p-3 rounded-xl bg-[#2a2a3a] text-gray-400 hover:text-white"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
          
          {timerMode === 'rest' && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {[30, 60, 90, 120].map(sec => (
                <button
                  key={sec}
                  onClick={() => setRestTimer(sec)}
                  className="px-3 py-1 rounded-lg bg-[#2a2a3a] text-gray-400 text-sm hover:bg-orange-500/20 hover:text-orange-400 transition-colors"
                >
                  {sec}s
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Exercise blocks */}
      <div className="space-y-4">
        {workout.exercises?.map((block: WorkoutBlock, blockIndex: number) => (
          <div key={blockIndex} className="card">
            <button
              onClick={() => toggleBlock(blockIndex)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold">
                  {blockIndex + 1}
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">{block.block}</h3>
                  <p className="text-gray-500 text-sm">
                    {block.exercises.length} ejercicios · ~{block.duration} min
                  </p>
                </div>
              </div>
              {expandedBlocks.has(blockIndex) ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {expandedBlocks.has(blockIndex) && (
              <div className="mt-4 space-y-2 border-t border-[#2a2a3a] pt-4">
                {block.exercises.map((exercise, exerciseIndex) => {
                  const isCompleted = completedExercises.has(`${blockIndex}-${exerciseIndex}`);
                  return (
                    <div 
                      key={exerciseIndex}
                      onClick={() => !workout.completed && toggleExercise(blockIndex, exerciseIndex)}
                      className={`
                        flex items-center gap-4 p-3 rounded-lg transition-all cursor-pointer
                        ${isCompleted 
                          ? 'bg-green-500/10 border border-green-500/30' 
                          : 'bg-[#16161d] hover:bg-[#1e1e28]'
                        }
                      `}
                    >
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${isCompleted 
                          ? 'border-green-500 bg-green-500' 
                          : 'border-gray-600'
                        }
                      `}>
                        {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isCompleted ? 'text-green-400 line-through' : 'text-white'}`}>
                          {exercise.nombre}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {exercise.grupoMuscular} · {exercise.nivel}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Complete button - fixed at bottom */}
      {!workout.completed && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#12121a] via-[#12121a] to-transparent">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
            >
              {completeMutation.isPending ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  Completar Entrenamiento
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Level up modal */}
      {showLevelUp && levelUpData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              ¡Subiste de Nivel!
            </h2>
            <p className="text-gray-400 mb-6">
              Has alcanzado el nivel <span className="text-orange-400 font-bold">{levelUpData.newLevel}</span>
            </p>
            <div className="bg-[#16161d] rounded-xl p-4 mb-6">
              <p className="text-gray-500 text-sm">Entrenamientos para siguiente nivel</p>
              <p className="text-2xl font-bold text-white">{levelUpData.workoutsToNextLevel}</p>
            </div>
            <button
              onClick={() => {
                setShowLevelUp(false);
                router.push('/dashboard');
              }}
              className="btn-primary w-full py-3"
            >
              ¡Genial!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

