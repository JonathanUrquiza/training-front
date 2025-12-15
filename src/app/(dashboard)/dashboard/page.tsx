'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Dumbbell, 
  Target, 
  Trophy, 
  TrendingUp, 
  Clock,
  ChevronRight,
  Flame
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { workoutsApi, goalsApi, recordsApi } from '@/lib/api';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['workout-stats'],
    queryFn: async () => {
      const res = await workoutsApi.getStats();
      return res.data.data;
    },
  });

  const { data: goals } = useQuery({
    queryKey: ['goals-active'],
    queryFn: async () => {
      const res = await goalsApi.getAll('active');
      return res.data.data.goals;
    },
  });

  const { data: recentPRs } = useQuery({
    queryKey: ['recent-prs'],
    queryFn: async () => {
      const res = await recordsApi.getRecentPRs(3);
      return res.data.data.prs;
    },
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">
          ¡Hola, {user?.name}! 👋
        </h1>
        <p className="text-gray-400 text-sm lg:text-base">
          Tu resumen de entrenamiento y progreso
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
        <div className="card group">
          <div className="flex items-center justify-between mb-2 lg:mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 lg:w-6 lg:h-6 text-orange-400" />
            </div>
            <span className="text-xs text-gray-500 hidden sm:block">Este mes</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold number-display text-white mb-0.5 lg:mb-1">
            {stats?.total?.completedWorkouts || 0}
          </p>
          <p className="text-gray-400 text-xs lg:text-sm">Entrenamientos</p>
        </div>

        <div className="card group">
          <div className="flex items-center justify-between mb-2 lg:mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-400" />
            </div>
            <span className="text-xs text-gray-500 hidden sm:block">Total</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold number-display text-white mb-0.5 lg:mb-1">
            {Math.round((stats?.total?.totalDuration || 0) / 60)}h
          </p>
          <p className="text-gray-400 text-xs lg:text-sm">Tiempo</p>
        </div>

        <div className="card group">
          <div className="flex items-center justify-between mb-2 lg:mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 lg:w-6 lg:h-6 text-amber-400" />
            </div>
            <span className="text-xs text-gray-500 hidden sm:block">Activas</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold number-display text-white mb-0.5 lg:mb-1">
            {goals?.length || 0}
          </p>
          <p className="text-gray-400 text-xs lg:text-sm">Metas</p>
        </div>

        <div className="card group">
          <div className="flex items-center justify-between mb-2 lg:mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
            </div>
            <span className="text-xs text-gray-500 hidden sm:block">Récords</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold number-display text-white mb-0.5 lg:mb-1">
            {recentPRs?.length || 0}
          </p>
          <p className="text-gray-400 text-xs lg:text-sm">PRs</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Start Workout */}
        <Link href="/workout" className="card group cursor-pointer">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
              <Flame className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base lg:text-xl font-bold text-white mb-0.5 lg:mb-1">
                Comenzar Entrenamiento
              </h3>
              <p className="text-gray-400 text-xs lg:text-sm truncate">
                Genera una rutina personalizada
              </p>
            </div>
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500 group-hover:text-orange-400 transition-colors flex-shrink-0" />
          </div>
        </Link>

        {/* Level Progress */}
        <div className="card">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-2xl lg:text-3xl flex-shrink-0">
              {user?.currentLevel === 'Principiante' && '🔰'}
              {user?.currentLevel === 'Intermedio' && '⚡'}
              {user?.currentLevel === 'Avanzado' && '🔥'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base lg:text-xl font-bold text-white mb-0.5 lg:mb-1">
                Nivel {user?.currentLevel}
              </h3>
              <div className="progress-bar mb-1 lg:mb-2">
                <div 
                  className="progress-bar-fill gradient-success"
                  style={{ width: `${user?.levelProgress?.percentage || 0}%` }}
                />
              </div>
              <p className="text-gray-400 text-xs lg:text-sm">
                {user?.levelProgress?.current}/{user?.levelProgress?.required} para subir
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Active Goals */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Metas Activas</h3>
            <Link href="/goals" className="text-orange-400 text-sm hover:text-orange-300">
              Ver todas
            </Link>
          </div>
          
          {goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal: any) => (
                <div key={goal.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">{goal.description}</p>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill gradient-warning"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-amber-400 font-bold number-display">
                    {goal.progress}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No tienes metas activas
            </p>
          )}
        </div>

        {/* Recent PRs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">PRs Recientes</h3>
            <Link href="/records" className="text-orange-400 text-sm hover:text-orange-300">
              Ver todos
            </Link>
          </div>
          
          {recentPRs && recentPRs.length > 0 ? (
            <div className="space-y-4">
              {recentPRs.map((pr: any) => (
                <div key={pr.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{pr.exercise}</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(pr.date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <span className="text-orange-400 font-bold number-display">
                    {pr.value} {pr.unit}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No tienes PRs recientes
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

