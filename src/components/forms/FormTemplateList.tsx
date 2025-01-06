import { useState, useEffect } from 'react';
import { formService } from '../../services/forms';
import { useProfile } from '../../hooks/useProfile';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { DepartmentForm } from './DepartmentFormResponse';
import type { FormTemplate } from '../../types/forms';

export default function FormTemplateList() {
  const { profile } = useProfile();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await formService.listTemplates();
        setTemplates(data);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Erro ao carregar templates');
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchTemplates();
    }
  }, [profile]);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <p className="text-gray-500">
          {profile?.role === 'admin' 
            ? 'Nenhum template criado ainda.'
            : 'Não há formulários disponíveis para seu departamento.'}
        </p>
      </div>
    );
  }

  if (selectedTemplate) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedTemplate(null)}
          className="text-indigo-600 hover:text-indigo-500"
        >
          ← Voltar para lista
        </button>
        
        <DepartmentForm 
          template={selectedTemplate}
          onSuccess={() => setSelectedTemplate(null)}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <div
          key={template.id}
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
          {template.description && (
            <p className="text-gray-600 text-sm mb-4">{template.description}</p>
          )}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>
              Departamento: {template.department?.name || 'N/A'}
            </span>
            <span>
              {new Date(template.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
          {profile?.role === 'department' && (
            <button
              onClick={() => setSelectedTemplate(template)}
              className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Responder Formulário
            </button>
          )}
        </div>
      ))}
    </div>
  );
}