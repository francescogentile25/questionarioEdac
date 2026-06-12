import { Component, computed, input, model } from '@angular/core';
import { QuestionResponse } from '../../models/responses/section.response';
import { AnswerValue } from '../../models/requests/submit-questionnaire.request';
import { validateAnswer } from '../../utils/validate-answer.util';

/**
 * Renderizza una singola domanda del questionario in base al suo tipo
 * (radio / checkbox / text / textarea), inclusi i campi condizionali
 * "Altro" e il testo extra (es. descrizione comportamenti problema).
 */
@Component({
  selector: 'app-question-field',
  imports: [],
  templateUrl: './question-field.html',
  styleUrl: './question-field.scss',
})
export class QuestionField {
  question = input.required<QuestionResponse>();
  answer = model.required<AnswerValue>();
  showErrors = input(false);

  protected readonly error = computed(() => validateAnswer(this.question(), this.answer()));

  protected readonly textValue = computed(() => {
    const v = this.answer().value;
    return typeof v === 'string' ? v : '';
  });

  protected readonly selectedList = computed(() => {
    const v = this.answer().value;
    return Array.isArray(v) ? v : [];
  });

  protected readonly showOther = computed(() => {
    if (!this.question().has_other) return false;
    const v = this.answer().value;
    return Array.isArray(v) ? v.includes('Altro') : v === 'Altro';
  });

  protected readonly showExtra = computed(() => {
    const trigger = this.question().extra_text_trigger;
    return !!trigger && this.answer().value === trigger;
  });

  protected isSelected(option: string): boolean {
    const v = this.answer().value;
    return Array.isArray(v) ? v.includes(option) : v === option;
  }

  protected selectRadio(option: string) {
    this.answer.set({ ...this.answer(), value: option });
  }

  protected toggleCheckbox(option: string) {
    const list = this.selectedList();
    let next = list.includes(option) ? list.filter((o) => o !== option) : [...list, option];
    // "Nessuna" è mutuamente esclusiva con le altre opzioni
    if (option === 'Nessuna') {
      if (next.includes('Nessuna')) next = ['Nessuna'];
    } else {
      next = next.filter((o) => o !== 'Nessuna');
    }
    this.answer.set({ ...this.answer(), value: next });
  }

  protected setText(event: Event) {
    this.answer.set({ ...this.answer(), value: (event.target as HTMLInputElement).value });
  }

  protected setOther(event: Event) {
    this.answer.set({ ...this.answer(), other: (event.target as HTMLInputElement).value });
  }

  protected setExtra(event: Event) {
    this.answer.set({ ...this.answer(), extra: (event.target as HTMLTextAreaElement).value });
  }

  protected pad(n: number): string {
    return n.toString().padStart(2, '0');
  }
}
