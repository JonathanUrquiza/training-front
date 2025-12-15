'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Target, 
  Plus, 
  Check,
  Trash2,
  X,
  Calendar
} from 'lucide-react';
import { goalsApi } from '@/lib/api';
import { Goal } from '@/types';

const goalTypes = [
  { value: 'weight', label: 'Peso (kg)', icon: '🏋️' },
  { value: 'reps', label: 'Repeticiones', icon: '🔄' },
  { value: 'time', label: 'Tiempo (min)', icon: '⏱️' },
  { value: 'workouts', label: 'Entrenamientos', icon: '📅' },
  { value: 'custom', label: 'Personalizado', icon: '⭐' },
];

export default function GoalsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [formData, setFormData] = useState({
    description: '',
    type: 'weight',
    targetValue: '',
    deadline: '',
  });

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals', filter],
    queryFn: async () => {
      const res = await goalsApi.getAll(filter);
      return res.data.data.goals;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['goal-stats'],
    queryFn: async () => {
      const res = await goalsApi.getStats();
      return res.data.data.stats;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => goalsApi.create({
      ...data,
      targetValue: parseFloat(data.targetValue),
      deadline: data.deadline || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal-stats'] });
      setShowModal(false);
      setFormData({ description: '', type: 'weight', targetValue: '', deadline: '' });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => goalsApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal-stats'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => goalsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal-stats'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mis Metas</h1>
          <p className="text-gray-400">Establece objetivos y alcanza tu potencial</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Meta
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-3xl font-bold number-display text-white">
            {stats?.total || 0}
          </p>
          <p className="text-gray-500 text-sm">Total</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold number-display text-emerald-400">
            {stats?.completed || 0}
          </p>
          <p className="text-gray-500 text-sm">Completadas</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold number-display text-amber-400">
            {stats?.active || 0}
          </p>
          <p className="text-gray-500 text-sm">Activas</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold number-display text-red-400">
            {stats?.overdue || 0}
          </p>
          <p className="text-gray-500 text-sm">Vencidas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['active', 'completed', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-4 py-2 rounded-lg transition-all
              ${filter === f 
                ? 'bg-orange-500 text-white' 
                : 'bg-[#1e1e28] text-gray-400 hover:bg-[#252530]'
              }
            `}
          >
            {f === 'active' && 'Activas'}
            {f === 'completed' && 'Completadas'}
            {f === 'all' && 'Todas'}
          </button>
        ))}
      </div>

      {/* Goals List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : goals && goals.length > 0 ? (
        <div className="space-y-4">
          {goals.map((goal: Goal) => (
            <div
              key={goal.id}
              className={`card ${goal.isOverdue ? 'border-red-500/50' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                  ${goal.completed 
                    ? 'bg-emerald-500/20' 
                    : goal.isOverdue 
                      ? 'bg-red-500/20' 
                      : 'bg-amber-500/20'
                  }
                `}>
                  {goalTypes.find(t => t.value === goal.type)?.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-semibold ${goal.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {goal.description}
                    </p>
                    {goal.isOverdue && !goal.completed && (
                      <span className="text-xs text-red-400 bg-red-500/20 px-2 py-0.5 rounded">
                        Vencida
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>Meta: {goal.targetValue}</span>
                    {goal.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(goal.deadline).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </div>
                  
                  <div className="progress-bar mb-1">
                    <div 
                      className={`progress-bar-fill ${
                        goal.completed 
                          ? 'gradient-success' 
                          : goal.progress >= 100 
                            ? 'gradient-success' 
                            : 'gradient-warning'
                      }`}
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {goal.currentValue} / {goal.targetValue} ({goal.progress}%)
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {!goal.completed && (
                    <button
                      onClick={() => completeMutation.mutate(goal.id)}
                      className="p-2 text-gray-500 hover:text-emerald-400 transition-colors"
                      title="Marcar como completada"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('¿Eliminar esta meta?')) {
                        deleteMutation.mutate(goal.id);
                      }
                    }}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No tienes metas {filter !== 'all' && filter === 'active' ? 'activas' : ''}</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            Crear primera meta
          </button>
        </div>
      )}

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e28] rounded-xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Nueva Meta</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  placeholder="Ej: Levantar 100kg en Press Banca"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de meta
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input"
                >
                  {goalTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor objetivo
                </label>
                <input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  className="input"
                  placeholder="Ej: 100"
                  step="0.1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha límite (opcional)
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="input"
                />
              </div>
              
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn-primary w-full"
              >
                {createMutation.isPending ? 'Creando...' : '🎯 Crear Meta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

