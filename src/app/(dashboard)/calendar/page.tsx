'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon
} from 'lucide-react';
import { workoutsApi } from '@/lib/api';
import { CalendarDay } from '@/types';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: calendarData, isLoading } = useQuery({
    queryKey: ['calendar', year, month],
    queryFn: async () => {
      const res = await workoutsApi.getCalendar(year, month);
      return res.data.data.calendar as CalendarDay[];
    },
  });

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  
  const calendarDays = [];
  
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const workout = calendarData?.find(w => w.date.startsWith(dateStr));
    calendarDays.push({ day, workout });
  }

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           month === today.getMonth() + 1 && 
           year === today.getFullYear();
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Calendario</h1>
          <p className="text-gray-400">Visualiza tu historial de entrenamientos</p>
        </div>
        <button
          onClick={goToToday}
          className="btn-secondary flex items-center gap-2"
        >
          <CalendarIcon className="w-5 h-5" />
          Hoy
        </button>
      </div>

      {/* Calendar */}
      <div className="card">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-[#252530] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-400" />
          </button>
          
          <h2 className="text-xl font-bold text-white">
            {MONTHS[month - 1]} {year}
          </h2>
          
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-[#252530] rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Days header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((cell, index) => (
              <div
                key={index}
                className={`
                  aspect-square rounded-lg p-2 flex flex-col items-center justify-center
                  ${cell ? 'bg-[#16161d]' : 'bg-transparent'}
                  ${cell && isToday(cell.day) ? 'ring-2 ring-orange-500' : ''}
                `}
              >
                {cell && (
                  <>
                    <span className={`
                      text-sm font-medium mb-1
                      ${isToday(cell.day) ? 'text-orange-400' : 'text-gray-400'}
                    `}>
                      {cell.day}
                    </span>
                    
                    {cell.workout && (
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm
                        ${cell.workout.completed 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/20 text-amber-400'
                        }
                      `}>
                        {cell.workout.completed ? '✓' : '○'}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-[#2a2a3a]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 border-2 border-emerald-400" />
            <span className="text-sm text-gray-400">Completado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500/20 border-2 border-amber-400" />
            <span className="text-sm text-gray-400">Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full ring-2 ring-orange-500" />
            <span className="text-sm text-gray-400">Hoy</span>
          </div>
        </div>
      </div>
    </div>
  );
}

