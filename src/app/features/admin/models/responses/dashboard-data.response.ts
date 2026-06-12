import { SectionResponse } from '../../../questionario/models/responses/section.response';
import { AnswerValue } from '../../../questionario/models/requests/submit-questionnaire.request';

export type SubmissionResponse = {
  id: string;
  created_at: string;
};

export type AnswerRow = {
  question_id: number;
  value: AnswerValue;
};

export type DashboardData = {
  totalSubmissions: number;
  submissions: SubmissionResponse[];
  answers: AnswerRow[];
  sections: SectionResponse[];
};

export type SubmissionDetailData = {
  submission: SubmissionResponse;
  answers: AnswerRow[];
  sections: SectionResponse[];
};
