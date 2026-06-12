import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { DashboardService } from '../services/dashboard.service';
import { SubmissionDetailData } from '../models/responses/dashboard-data.response';
import {
  QuestionResponse,
  SectionResponse,
} from '../../questionario/models/responses/section.response';
import { AnswerValue } from '../../questionario/models/requests/submit-questionnaire.request';

type LoadState = {
  loading: boolean;
  data: SubmissionDetailData | null;
  error: string | null;
};

type AnswerView = {
  question: QuestionResponse;
  lines: string[];
  missing: boolean;
};

type SectionView = {
  section: SectionResponse;
  items: AnswerView[];
};

/** Dettaglio di un singolo invio: tutte le risposte, incluse quelle a testo libero. */
@Component({
  selector: 'app-submission-detail',
  imports: [RouterLink],
  templateUrl: './submission-detail.html',
  styleUrl: './submission-detail.scss',
})
export class SubmissionDetail {
  private service = inject(DashboardService);

  /** Route param (withComponentInputBinding) */
  id = input.required<string>();

  protected readonly load = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) =>
        this.service.getSubmission(id).pipe(
          map((data): LoadState => ({ loading: false, data, error: null })),
          catchError(() =>
            of<LoadState>({
              loading: false,
              data: null,
              error: 'Invio non trovato o non raggiungibile.',
            }),
          ),
          startWith<LoadState>({ loading: true, data: null, error: null }),
        ),
      ),
    ),
    { initialValue: { loading: true, data: null, error: null } satisfies LoadState },
  );

  protected readonly submittedAt = computed(() => {
    const iso = this.load().data?.submission.created_at;
    if (!iso) return '';
    return new Intl.DateTimeFormat('it-IT', { dateStyle: 'long', timeStyle: 'short' }).format(
      new Date(iso),
    );
  });

  protected readonly sectionViews = computed<SectionView[]>(() => {
    const data = this.load().data;
    if (!data) return [];

    const byQuestion = new Map<number, AnswerValue>();
    for (const row of data.answers) byQuestion.set(row.question_id, row.value);

    return data.sections.map((section) => ({
      section,
      items: section.questions.map((question) => {
        const answer = byQuestion.get(question.id);
        return {
          question,
          lines: answer ? this.toLines(question, answer) : [],
          missing: !answer,
        };
      }),
    }));
  });

  private toLines(question: QuestionResponse, answer: AnswerValue): string[] {
    const other = (answer.other ?? '').trim();
    const withOther = (v: string) => (v === 'Altro' && other ? `Altro: ${other}` : v);

    const lines = Array.isArray(answer.value)
      ? answer.value.map(withOther)
      : [withOther(answer.value)];

    const extra = (answer.extra ?? '').trim();
    if (extra && question.extra_text_label) {
      lines.push(`${question.extra_text_label}: ${extra}`);
    }
    return lines;
  }
}
