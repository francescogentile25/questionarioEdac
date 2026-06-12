/**
 * Valore di una singola risposta, serializzato in `answers.value` (jsonb).
 * - radio / text / textarea → `value: string`
 * - checkbox               → `value: string[]`
 * - `other` → testo libero quando è selezionata l'opzione "Altro"
 * - `extra` → testo condizionale (es. descrizione comportamenti problema se "Sì")
 */
export type AnswerValue = {
  value: string | string[];
  other?: string;
  extra?: string;
};

export type AnswerPayload = {
  question_id: number;
  value: AnswerValue;
};

export type SubmitQuestionnaireRequest = {
  p_answers: AnswerPayload[];
};
