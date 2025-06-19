import ProtectedRoute from '@/components/ProtectedRoute';
import CreateEventForm from '@/components/CreateEventForm';
import AppHeader from '@/components/AppHeader';

export default function CreateEventPage() {
  return (
    <ProtectedRoute>
      <AppHeader />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <CreateEventForm />
        </div>
      </div>
    </ProtectedRoute>
  );
} 