import { useState } from 'react';
import FormTemplateList from '../components/forms/FormTemplateList';
import { FormTemplateCreate } from '../components/forms/FormTemplateCreate';

export function FormTemplatesPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Templates de Formulário</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {showCreate ? 'Cancelar' : 'Novo Template'}
        </button>
      </div>

      {showCreate ? (
        <FormTemplateCreate onSuccess={() => setShowCreate(false)} />
      ) : (
        <FormTemplateList />
      )}
    </div>
  );
}