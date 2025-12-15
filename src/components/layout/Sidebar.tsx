'use client';

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
  Zap
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

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#16161d] border-r border-[#2a2a3a] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#2a2a3a]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Zap className="w-8 h-8 text-orange-500" />
          <span className="text-xl font-bold text-white">TRAINING</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-orange-500/20 text-orange-400 border-l-4 border-orange-500' 
                      : 'text-gray-400 hover:bg-[#1e1e28] hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Level */}
      {user && (
        <div className="p-4 border-t border-[#2a2a3a]">
          <div className="bg-[#1e1e28] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{levelIcons[user.currentLevel as keyof typeof levelIcons]}</span>
              <span className={`font-semibold ${levelColors[user.currentLevel as keyof typeof levelColors]}`}>
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
      <div className="p-4 border-t border-[#2a2a3a]">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

