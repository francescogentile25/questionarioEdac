import { QuestionResponse } from '../models/responses/section.response';
import { AnswerValue } from '../models/requests/submit-questionnaire.request';

export function emptyAnswer(question: QuestionResponse): AnswerValue {
  return { value: question.type === 'checkbox' ? [] : '' };
}

export function isAnswerEmpty(answer: AnswerValue): boolean {
  return Array.isArray(answer.value) ? answer.value.length === 0 : answer.value.trim() === '';
}

/** Ritorna il messaggio di errore, o null se la risposta è valida. */
export function validateAnswer(
  question: QuestionResponse,
  answer: AnswerValue | undefined,
): string | null {
  const a = answer ?? emptyAnswer(question);
  const empty = isAnswerEmpty(a);

  if (question.required && empty) {
    return question.type === 'radio' || question.type === 'checkbox'
      ? 'Seleziona una risposta'
      : 'Campo obbligatorio';
  }

  if (!empty) {
    const v = a.value;
    const otherSelected =
      question.has_other && (Array.isArray(v) ? v.includes('Altro') : v === 'Altro');
    if (otherSelected && !(a.other ?? '').trim()) {
      return 'Specificare il campo "Altro"';
    }
    if (question.extra_text_trigger && v === question.extra_text_trigger && !(a.extra ?? '').trim()) {
      return question.extra_text_label ?? 'Campo obbligatorio';
    }
  }

  return null;
}
