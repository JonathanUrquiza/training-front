'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Clock, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { workoutsApi } from '@/lib/api';
import { Workout } from '@/types';

const levelColors = {
  'Principiante': 'badge-principiante',
  'Intermedio': 'badge-intermedio',
  'Avanzado': 'badge-avanzado',
};

export default function HistoryPage() {
  const { data: workouts, isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      const res = await workoutsApi.getAll(1, 50);
      return res.data.data.workouts;
    },
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Historial</h1>
        <p className="text-gray-400">Todos tus entrenamientos anteriores</p>
      </div>

      {/* Workouts List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : workouts && workouts.length > 0 ? (
        <div className="space-y-4">
          {workouts.map((workout: Workout) => (
            <Link
              key={workout.id}
              href={`/workout/${workout.id}`}
              className="card flex items-center gap-4 group cursor-pointer"
            >
              <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                ${workout.completed 
                  ? 'bg-emerald-500/20' 
                  : 'bg-amber-500/20'
                }
              `}>
                {workout.completed ? '✓' : '○'}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge ${levelColors[workout.level as keyof typeof levelColors]}`}>
                    {workout.level}
                  </span>
                  {workout.completed && (
                    <span className="text-emerald-400 text-xs">Completado</span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(workout.date).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {workout.duration} min
                  </span>
                  <span>
                    {workout.exercises?.length || 0} bloques
                  </span>
                </div>
              </div>
              
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-orange-400 transition-colors" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No tienes entrenamientos registrados</p>
          <Link href="/workout" className="btn-primary">
            Comenzar primer entrenamiento
          </Link>
        </div>
      )}
    </div>
  );
}

