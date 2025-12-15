'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Trophy, 
  Plus, 
  Filter,
  TrendingUp,
  Trash2,
  Edit,
  X
} from 'lucide-react';
import { recordsApi } from '@/lib/api';
import { PersonalRecord } from '@/types';

const recordTypes = [
  { value: 'weight', label: 'Peso (kg)', icon: '🏋️' },
  { value: 'reps', label: 'Repeticiones', icon: '🔄' },
  { value: 'time', label: 'Tiempo (s)', icon: '⏱️' },
  { value: 'distance', label: 'Distancia (m)', icon: '📏' },
];

export default function RecordsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [formData, setFormData] = useState({
    exercise: '',
    type: 'weight',
    value: '',
    notes: '',
  });

  const { data: records, isLoading } = useQuery({
    queryKey: ['records', filterType],
    queryFn: async () => {
      const res = await recordsApi.getAll(filterType || undefined);
      return res.data.data.records;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['record-stats'],
    queryFn: async () => {
      const res = await recordsApi.getStats();
      return res.data.data.stats;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => recordsApi.create({
      ...data,
      value: parseFloat(data.value),
    }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['recent-prs'] });
      setShowModal(false);
      setFormData({ exercise: '', type: 'weight', value: '', notes: '' });
      
      if (response.data.data.isPR) {
        // Show celebration toast
        alert('🎉 ¡Nuevo PR!');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => recordsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getTypeInfo = (type: string) => {
    return recordTypes.find(t => t.value === type) || recordTypes[0];
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mis Marcas</h1>
          <p className="text-gray-400">Registra y supera tus récords personales</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Marca
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {recordTypes.map((type) => (
          <div key={type.value} className="card text-center">
            <span className="text-3xl mb-2 block">{type.icon}</span>
            <p className="text-2xl font-bold number-display text-white">
              {stats?.[type.value]?.totalRecords || 0}
            </p>
            <p className="text-gray-500 text-sm">{type.label}</p>
            <p className="text-orange-400 text-xs mt-1">
              {stats?.[type.value]?.prs || 0} PRs
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <Filter className="w-5 h-5 text-gray-500" />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input w-48"
        >
          <option value="">Todos los tipos</option>
          {recordTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Records List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : records && records.length > 0 ? (
        <div className="space-y-4">
          {records.map((record: PersonalRecord) => (
            <div
              key={record.id}
              className="card flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-2xl">
                {getTypeInfo(record.type).icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold">{record.exercise}</p>
                  {record.isPR && (
                    <span className="badge badge-pr text-xs">PR</span>
                  )}
                </div>
                <p className="text-gray-500 text-sm">
                  {new Date(record.date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                  {record.notes && ` · ${record.notes}`}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold number-display text-orange-400">
                  {record.value}
                </p>
                <p className="text-gray-500 text-sm">{record.unit}</p>
              </div>
              
              <button
                onClick={() => {
                  if (confirm('¿Eliminar esta marca?')) {
                    deleteMutation.mutate(record.id);
                  }
                }}
                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No tienes marcas registradas</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            Registrar primera marca
          </button>
        </div>
      )}

      {/* Add Record Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e28] rounded-xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Nueva Marca</h2>
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
                  Ejercicio
                </label>
                <input
                  type="text"
                  value={formData.exercise}
                  onChange={(e) => setFormData({ ...formData, exercise: e.target.value })}
                  className="input"
                  placeholder="Ej: Press Banca, Sentadilla..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de marca
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {recordTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`
                        p-3 rounded-lg border-2 transition-all text-left flex items-center gap-2
                        ${formData.type === type.value 
                          ? 'border-orange-500 bg-orange-500/10' 
                          : 'border-[#2a2a3a] hover:border-orange-500/50'
                        }
                      `}
                    >
                      <span>{type.icon}</span>
                      <span className="text-sm text-white">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="input"
                  placeholder={getTypeInfo(formData.type).label}
                  step="0.1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notas (opcional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input"
                  placeholder="Ej: Con pausa, sin cinturón..."
                />
              </div>
              
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn-primary w-full"
              >
                {createMutation.isPending ? 'Guardando...' : '💪 Guardar Marca'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

