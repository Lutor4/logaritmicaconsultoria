import { useState, useEffect } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { formService } from '../../services/forms';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { FormTemplate, FormQuestion } from '../../types/forms';

interface DepartmentFormProps {
  template: FormTemplate;
  onSuccess?: () => void;
}

export function DepartmentForm({ template, onSuccess }: DepartmentFormProps) {
  const { profile } = useProfile();
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await formService.listQuestions(template.id);
        setQuestions(data);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Erro ao carregar perguntas');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [template.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.department_id) {
      setError('Departamento não encontrado');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      await formService.submitResponse({
        template_id: template.id,
        department_id: profile.department_id,
        responses,
      });
      
      setSuccess(true);
      setResponses({});
      onSuccess?.();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Erro ao enviar formulário');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: FormQuestion) => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={responses[question.id] || ''}
            onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
            required={question.required}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={responses[question.id] || ''}
            onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
            required={question.required}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        );
      case 'boolean':
        return (
          <select
            value={responses[question.id] || ''}
            onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value === 'true' })}
            required={question.required}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Selecione...</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        );
      case 'select':
        return (
          <select
            value={responses[question.id] || ''}
            onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
            required={question.required}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Selecione...</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-4">
      <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
      {template.description && (
        <p className="text-gray-600 mb-4">{template.description}</p>
      )}

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-500 p-3 rounded-md text-sm mb-4">
          Formulário enviado com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((question) => (
          <div key={question.id}>
            <label className="block text-sm font-medium text-gray-700">
              {question.question}
              {question.required && <span className="text-red-500">*</span>}
            </label>
            {renderQuestion(question)}
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Enviando...' : 'Enviar Formulário'}
        </button>
      </form>
    </div>
  );
}