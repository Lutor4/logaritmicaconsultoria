import { useState } from 'react';
import { EmployeeForm } from '../components/forms/EmployeeForm';
import { EmployeeTable } from '../components/tables/EmployeeTable';
import { useEmployees } from '../hooks/useEmployees';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export function EmployeesPage() {
  const [showForm, setShowForm] = useState(false);
  const { employees, loading, error, refetch } = useEmployees();

  const handleSuccess = () => {
    setShowForm(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Funcionários</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {showForm ? 'Cancelar' : 'Novo Funcionário'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <EmployeeForm onSuccess={handleSuccess} />
        </div>
      )}

      {error && <ErrorMessage message={error} />}
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <EmployeeTable data={employees} />
      )}
    </div>
  );
}