import { useState, useEffect } from 'react';
import { formService } from '../../services/forms';
import { departmentService } from '../../services/departments';
import { useProfile } from '../../hooks/useProfile';
import { QuestionList } from './QuestionList';
import { QuestionForm } from './QuestionForm';
import type { FormQuestion } from '../../types/forms';
import type { Department } from '../../services/departments';

interface FormTemplateCreateProps {
  onSuccess?: () => void;
}

export function FormTemplateCreate({ onSuccess }: FormTemplateCreateProps) {
  const { profile } = useProfile();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Only admins can create form templates
  if (profile?.role !== 'admin') {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-md">
        Apenas administradores podem criar templates de formulário.
      </div>
    );
  }

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await departmentService.list();
        setDepartments(data);
      } catch (err) {
        console.error('Error loading departments:', err);
        setError('Erro ao carregar departamentos');
      }
    };

    loadDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await formService.createTemplate({
        title,
        description,
        department_id: departmentId,
        questions,
      });

      onSuccess?.();
    } catch (err) {
      console.error('Error creating template:', err);
      setError('Erro ao criar template');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = (question: FormQuestion) => {
    setQuestions([...questions, question]);
    setShowQuestionForm(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
            Departamento
          </label>
          <select
            id="department"
            required
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Selecione um departamento</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Título
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Perguntas</h3>
            <button
              type="button"
              onClick={() => setShowQuestionForm(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Adicionar Pergunta
            </button>
          </div>

          {showQuestionForm ? (
            <QuestionForm
              onSave={handleAddQuestion}
              onCancel={() => setShowQuestionForm(false)}
            />
          ) : (
            <QuestionList questions={questions} />
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || questions.length === 0}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Criar Template'}
          </button>
        </div>
      </form>
    </div>
  );
}