'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Zap } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f14]">
      <div className="text-center">
        <Zap className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold text-white mb-2">Training Tracker</h1>
        <p className="text-gray-400">Cargando...</p>
      </div>
    </div>
  );
}
