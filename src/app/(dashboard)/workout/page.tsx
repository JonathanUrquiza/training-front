'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  Dumbbell, 
  Play, 
  Flame,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { workoutsApi } from '@/lib/api';
import { Workout, WorkoutPreview } from '@/types';

const durations = [
  { value: 30, label: '30 min', description: 'Sesión rápida' },
  { value: 45, label: '45 min', description: 'Entrenamiento corto' },
  { value: 60, label: '60 min', description: 'Sesión estándar' },
  { value: 90, label: '90 min', description: 'Entrenamiento completo' },
  { value: 120, label: '120 min', description: 'Sesión intensiva' },
];

export default function WorkoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [preview, setPreview] = useState<WorkoutPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const generateMutation = useMutation({
    mutationFn: (duration: number) => workoutsApi.generate(duration),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      router.push(`/workout/${response.data.data.workout.id}`);
    },
  });

  const loadPreview = async (duration: number) => {
    setIsLoadingPreview(true);
    try {
      const response = await workoutsApi.preview(user?.currentLevel, duration);
      setPreview(response.data.data.preview);
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(duration);
    loadPreview(duration);
  };

  const handleStart = () => {
    generateMutation.mutate(selectedDuration);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Nuevo Entrenamiento
        </h1>
        <p className="text-gray-400">
          Selecciona la duración y genera tu rutina personalizada
        </p>
      </div>

      {/* Level indicator */}
      <div className="card mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-2xl">
            {user?.currentLevel === 'Principiante' && '🔰'}
            {user?.currentLevel === 'Intermedio' && '⚡'}
            {user?.currentLevel === 'Avanzado' && '🔥'}
          </div>
          <div>
            <p className="text-gray-400 text-sm">Tu nivel actual</p>
            <p className="text-2xl font-bold text-white">{user?.currentLevel}</p>
          </div>
        </div>
      </div>

      {/* Duration selector */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          ¿Cuánto tiempo tienes?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {durations.map((d) => (
            <button
              key={d.value}
              onClick={() => handleDurationSelect(d.value)}
              className={`
                p-4 rounded-xl border-2 transition-all text-center
                ${selectedDuration === d.value 
                  ? 'border-orange-500 bg-orange-500/10' 
                  : 'border-[#2a2a3a] bg-[#1e1e28] hover:border-orange-500/50'
                }
              `}
            >
              <Clock className={`w-6 h-6 mx-auto mb-2 ${
                selectedDuration === d.value ? 'text-orange-400' : 'text-gray-500'
              }`} />
              <p className={`font-bold text-lg ${
                selectedDuration === d.value ? 'text-orange-400' : 'text-white'
              }`}>
                {d.label}
              </p>
              <p className="text-xs text-gray-500">{d.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            Vista previa de la rutina
          </h2>
          
          <div className="space-y-3">
            {preview.blocks.map((block, index) => (
              <div 
                key={block.key}
                className="flex items-center gap-4 p-3 bg-[#16161d] rounded-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{block.name}</p>
                  <p className="text-gray-500 text-sm">
                    ~{block.exerciseCount} ejercicios
                  </p>
                </div>
                <span className="text-gray-400 font-mono">
                  {block.duration} min
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={generateMutation.isPending}
        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
      >
        {generateMutation.isPending ? (
          <>
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generando rutina...
          </>
        ) : (
          <>
            <Play className="w-6 h-6" />
            Comenzar Entrenamiento
          </>
        )}
      </button>
    </div>
  );
}

