import { useState } from 'react';
import type { FormQuestion, QuestionType } from '../../types/forms';

interface QuestionFormProps {
  onSave: (question: FormQuestion) => void;
  onCancel: () => void;
}

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'boolean', label: 'Sim/Não' },
  { value: 'select', label: 'Múltipla Escolha' },
];

export function QuestionForm({ onSave, onCancel }: QuestionFormProps) {
  const [question, setQuestion] = useState('');
  const [type, setType] = useState<QuestionType>('text');
  const [required, setRequired] = useState(true);
  const [options, setOptions] = useState('');

  const handleSubmit = () => {
    const newQuestion: FormQuestion = {
      id: crypto.randomUUID(),
      question,
      type,
      required,
      options: type === 'select' ? options.split(',').map(o => o.trim()) : undefined,
      order_index: 0,
      created_at: new Date().toISOString(),
    };

    onSave(newQuestion);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <div className="space-y-4">
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700">
            Pergunta
          </label>
          <input
            id="question"
            type="text"
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Tipo
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as QuestionType)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {questionTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {type === 'select' && (
          <div>
            <label htmlFor="options" className="block text-sm font-medium text-gray-700">
              Opções (separadas por vírgula)
            </label>
            <input
              id="options"
              type="text"
              required
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              placeholder="Opção 1, Opção 2, Opção 3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}

        <div className="flex items-center">
          <input
            id="required"
            type="checkbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
            Obrigatório
          </label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}