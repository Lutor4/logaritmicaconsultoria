import type { FormQuestion } from '../../types/forms';

interface QuestionListProps {
  questions: FormQuestion[];
}

export function QuestionList({ questions }: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        Nenhuma pergunta adicionada
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {questions.map((question, index) => (
        <div
          key={question.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
        >
          <div>
            <p className="font-medium">{question.question}</p>
            <p className="text-sm text-gray-500">
              Tipo: {question.type}
              {question.required && ' • Obrigatório'}
            </p>
          </div>
          <span className="text-gray-400">{index + 1}</span>
        </div>
      ))}
    </div>
  );
}