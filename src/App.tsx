import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { useAuth } from './auth/AuthContext';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

export function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default App;