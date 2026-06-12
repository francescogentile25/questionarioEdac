import { SectionResponse } from '../../../questionario/models/responses/section.response';
import { AnswerValue } from '../../../questionario/models/requests/submit-questionnaire.request';

export type RecentSubmission = {
  id: string;
  created_at: string;
};

export type AnswerRow = {
  question_id: number;
  value: AnswerValue;
};

export type DashboardData = {
  totalSubmissions: number;
  recent: RecentSubmission[];
  answers: AnswerRow[];
  sections: SectionResponse[];
};
