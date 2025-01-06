import { useState } from 'react';
import { ProjectForm } from '../components/forms/ProjectForm';
import { DataTable } from '../components/DataTable';

export function ProjectsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Projetos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {showForm ? 'Cancelar' : 'Novo Projeto'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <ProjectForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <DataTable />
    </div>
  );
}