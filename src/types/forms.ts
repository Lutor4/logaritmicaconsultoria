export type QuestionType = 'text' | 'number' | 'boolean' | 'select';

export interface FormTemplate {
  id: string;
  department_id: string;
  title: string;
  description?: string;
  created_at: string;
  created_by: string;
}

export interface FormQuestion {
  id: string;
  template_id: string;
  question: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  order_index: number;
  created_at: string;
}

export interface FormResponse {
  id: string;
  template_id: string;
  department_id: string;
  responses: Record<string, any>;
  submitted_at: string;
  submitted_by: string;
}