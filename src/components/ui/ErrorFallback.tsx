import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
  error: string;
  resetError?: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Ops! Algo deu errado
          </h2>
          <p className="text-gray-600">
            {error}
          </p>
          <div className="flex flex-col gap-2">
            {resetError && (
              <button
                onClick={resetError}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Tentar novamente
              </button>
            )}
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Voltar para a página inicial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}