export type QuestionType = 'radio' | 'checkbox' | 'text' | 'textarea';

export type QuestionResponse = {
  id: number;
  section_id: number;
  position: number;
  text: string;
  description: string | null;
  type: QuestionType;
  options: string[] | null;
  required: boolean;
  has_other: boolean;
  extra_text_trigger: string | null;
  extra_text_label: string | null;
};

export type SectionResponse = {
  id: number;
  position: number;
  title: string;
  questions: QuestionResponse[];
};
