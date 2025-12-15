'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Calendar, 
  TrendingUp, 
  Target, 
  Trophy,
  History,
  LogOut,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/workout', icon: Dumbbell, label: 'Entrenar' },
  { href: '/calendar', icon: Calendar, label: 'Calendario' },
  { href: '/progress', icon: TrendingUp, label: 'Progreso' },
  { href: '/goals', icon: Target, label: 'Metas' },
  { href: '/records', icon: Trophy, label: 'Mis Marcas' },
  { href: '/history', icon: History, label: 'Historial' },
];

const levelColors = {
  'Principiante': 'text-emerald-400',
  'Intermedio': 'text-amber-400',
  'Avanzado': 'text-orange-500',
};

const levelIcons = {
  'Principiante': '🔰',
  'Intermedio': '⚡',
  'Avanzado': '🔥',
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-[#16161d] border-r border-[#2a2a3a] flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-[#2a2a3a] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Zap className="w-7 h-7 lg:w-8 lg:h-8 text-orange-500" />
            <span className="text-lg lg:text-xl font-bold text-white">TRAINING</span>
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4 overflow-y-auto">
          <ul className="space-y-1 lg:space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all
                      ${isActive 
                        ? 'bg-orange-500/20 text-orange-400 border-l-4 border-orange-500' 
                        : 'text-gray-400 hover:bg-[#1e1e28] hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm lg:text-base">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Level */}
        {user && (
          <div className="p-3 lg:p-4 border-t border-[#2a2a3a]">
            <div className="bg-[#1e1e28] rounded-lg p-3 lg:p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl lg:text-2xl">{levelIcons[user.currentLevel as keyof typeof levelIcons]}</span>
                <span className={`font-semibold text-sm lg:text-base ${levelColors[user.currentLevel as keyof typeof levelColors]}`}>
                  {user.currentLevel}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="progress-bar mb-2">
                <div 
                  className="progress-bar-fill gradient-primary"
                  style={{ width: `${user.levelProgress.percentage}%` }}
                />
              </div>
              
              <p className="text-xs text-gray-500">
                {user.levelProgress.current}/{user.levelProgress.required} entrenamientos
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-3 lg:p-4 border-t border-[#2a2a3a]">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm lg:text-base">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// Mobile Header Component
export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuthStore();
  
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#16161d] border-b border-[#2a2a3a] flex items-center justify-between px-4 z-30 lg:hidden">
      <button 
        onClick={onMenuClick}
        className="p-2 text-gray-400 hover:text-white -ml-2"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <Link href="/dashboard" className="flex items-center gap-2">
        <Zap className="w-6 h-6 text-orange-500" />
        <span className="text-lg font-bold text-white">TRAINING</span>
      </Link>
      
      <div className="w-10 flex justify-end">
        {user && (
          <span className="text-lg">{levelIcons[user.currentLevel as keyof typeof levelIcons]}</span>
        )}
      </div>
    </header>
  );
}

