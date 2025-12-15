'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Dumbbell,
  Clock,
  Target,
  BarChart3
} from 'lucide-react';
import { workoutsApi, goalsApi, recordsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function ProgressPage() {
  const { user } = useAuthStore();

  const { data: workoutStats } = useQuery({
    queryKey: ['workout-stats'],
    queryFn: async () => {
      const res = await workoutsApi.getStats();
      return res.data.data;
    },
  });

  const { data: goalStats } = useQuery({
    queryKey: ['goal-stats'],
    queryFn: async () => {
      const res = await goalsApi.getStats();
      return res.data.data.stats;
    },
  });

  const { data: recordStats } = useQuery({
    queryKey: ['record-stats'],
    queryFn: async () => {
      const res = await recordsApi.getStats();
      return res.data.data.stats;
    },
  });

  const totalPRs = recordStats 
    ? Object.values(recordStats).reduce((sum: number, stat: any) => sum + (stat.prs || 0), 0)
    : 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mi Progreso</h1>
        <p className="text-gray-400">Visualiza tu evolución en el tiempo</p>
      </div>

      {/* Level Progress */}
      <div className="card mb-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center text-5xl">
            {user?.currentLevel === 'Principiante' && '🔰'}
            {user?.currentLevel === 'Intermedio' && '⚡'}
            {user?.currentLevel === 'Avanzado' && '🔥'}
          </div>
          
          <div className="flex-1">
            <p className="text-gray-400 mb-1">Nivel Actual</p>
            <p className="text-3xl font-bold text-white mb-3">{user?.currentLevel}</p>
            
            <div className="progress-bar mb-2" style={{ height: '12px' }}>
              <div 
                className="progress-bar-fill gradient-primary"
                style={{ width: `${user?.levelProgress?.percentage || 0}%` }}
              />
            </div>
            
            <p className="text-gray-400">
              <span className="text-orange-400 font-bold">{user?.levelProgress?.current}</span>
              /{user?.levelProgress?.required} entrenamientos para subir de nivel
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <Dumbbell className="w-8 h-8 text-orange-400 mx-auto mb-3" />
          <p className="text-4xl font-bold number-display text-white mb-1">
            {user?.workoutsCompleted || 0}
          </p>
          <p className="text-gray-500">Entrenamientos Totales</p>
        </div>
        
        <div className="card text-center">
          <Clock className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
          <p className="text-4xl font-bold number-display text-white mb-1">
            {Math.round((workoutStats?.total?.totalDuration || 0) / 60)}
          </p>
          <p className="text-gray-500">Horas Entrenando</p>
        </div>
        
        <div className="card text-center">
          <Target className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="text-4xl font-bold number-display text-white mb-1">
            {goalStats?.completed || 0}
          </p>
          <p className="text-gray-500">Metas Cumplidas</p>
        </div>
        
        <div className="card text-center">
          <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <p className="text-4xl font-bold number-display text-white mb-1">
            {totalPRs}
          </p>
          <p className="text-gray-500">Récords Personales</p>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">
          Actividad Semanal
        </h3>
        
        {workoutStats?.weekly && workoutStats.weekly.length > 0 ? (
          <div className="space-y-4">
            {workoutStats.weekly.map((week: any, index: number) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-500">
                  Semana {new Date(week.week).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </div>
                <div className="flex-1">
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill gradient-primary"
                      style={{ width: `${Math.min((week.count / 7) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold">{week.count}</span>
                  <span className="text-gray-500 text-sm"> entrenamientos</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay datos de actividad aún</p>
          </div>
        )}
      </div>

      {/* Level Distribution */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">
          Entrenamientos por Nivel
        </h3>
        
        {workoutStats?.byLevel && Object.keys(workoutStats.byLevel).length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {['Principiante', 'Intermedio', 'Avanzado'].map((level) => {
              const count = workoutStats.byLevel[level] || 0;
              const total = Object.values(workoutStats.byLevel as Record<string, number>).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              
              return (
                <div key={level} className="bg-[#16161d] rounded-lg p-4 text-center">
                  <p className="text-3xl mb-2">
                    {level === 'Principiante' && '🔰'}
                    {level === 'Intermedio' && '⚡'}
                    {level === 'Avanzado' && '🔥'}
                  </p>
                  <p className="text-2xl font-bold number-display text-white">{count}</p>
                  <p className="text-gray-500 text-sm">{level}</p>
                  <p className="text-orange-400 text-xs mt-1">{percentage}%</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No hay datos de niveles aún</p>
          </div>
        )}
      </div>
    </div>
  );
}

