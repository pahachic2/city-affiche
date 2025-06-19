'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppHeader from '@/components/AppHeader';

export default function CreateEventPage() {
  const router = useRouter();

  useEffect(() => {
    // Перенаправляем на главную страницу для выбора города
    router.push('/');
  }, [router]);

  return (
    <ProtectedRoute>
      <AppHeader />
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Перенаправляем на главную страницу для выбора города...
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
} 