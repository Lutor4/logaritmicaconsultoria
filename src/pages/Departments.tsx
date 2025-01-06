import { useState } from 'react';
import { DepartmentForm } from '../components/forms/DepartmentForm';
import { DepartmentTable } from '../components/tables/DepartmentTable';
import { useDepartments } from '../hooks/useDepartments';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export function DepartmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const { departments, loading, error, refetch } = useDepartments();

  const handleSuccess = () => {
    setShowForm(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Departamentos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {showForm ? 'Cancelar' : 'Novo Departamento'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <DepartmentForm onSuccess={handleSuccess} />
        </div>
      )}

      {error && <ErrorMessage message={error} />}
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <DepartmentTable data={departments} />
      )}
    </div>
  );
}