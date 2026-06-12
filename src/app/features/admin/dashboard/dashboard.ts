import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';
import { SupabaseService } from '../../../core/services/supabase.service';
import { DashboardService } from '../services/dashboard.service';
import { DashboardData } from '../models/responses/dashboard-data.response';
import { QuestionResponse, SectionResponse } from '../../questionario/models/responses/section.response';
import { globalPaths } from '../../_config/global-paths.config';

type LoadState = {
  loading: boolean;
  data: DashboardData | null;
  error: string | null;
};

type OptionStat = { label: string; count: number; pct: number };
type QuestionStat = { question: QuestionResponse; answered: number; options: OptionStat[] };
type SectionStat = { section: SectionResponse; questions: QuestionStat[] };

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private service = inject(DashboardService);
  private router = inject(Router);
  protected supabase = inject(SupabaseService);

  protected readonly load = toSignal(
    this.service.getData().pipe(
      map((data): LoadState => ({ loading: false, data, error: null })),
      catchError(() =>
        of<LoadState>({
          loading: false,
          data: null,
          error: 'Impossibile caricare le statistiche. Riprova più tardi.',
        }),
      ),
      startWith<LoadState>({ loading: true, data: null, error: null }),
    ),
    { requireSync: true },
  );

  protected readonly totalAnswers = computed(() => this.load().data?.answers.length ?? 0);

  protected readonly lastSubmission = computed(() => {
    const recent = this.load().data?.recent ?? [];
    return recent.length ? this.formatDate(recent[0].created_at) : '—';
  });

  /** Distribuzioni per le domande a scelta; conteggio risposte per le testuali. */
  protected readonly sectionStats = computed<SectionStat[]>(() => {
    const data = this.load().data;
    if (!data) return [];

    const byQuestion = new Map<number, DashboardData['answers']>();
    for (const row of data.answers) {
      const list = byQuestion.get(row.question_id) ?? [];
      list.push(row);
      byQuestion.set(row.question_id, list);
    }

    return data.sections.map((section) => ({
      section,
      questions: section.questions.map((question) => {
        const rows = byQuestion.get(question.id) ?? [];
        const answered = rows.length;

        let options: OptionStat[] = [];
        if (question.type === 'radio' || question.type === 'checkbox') {
          const counts = new Map<string, number>();
          for (const opt of question.options ?? []) counts.set(opt, 0);
          for (const row of rows) {
            const v = row.value.value;
            for (const selected of Array.isArray(v) ? v : [v]) {
              counts.set(selected, (counts.get(selected) ?? 0) + 1);
            }
          }
          options = [...counts.entries()].map(([label, count]) => ({
            label,
            count,
            pct: answered ? Math.round((count / answered) * 100) : 0,
          }));
        }

        return { question, answered, options };
      }),
    }));
  });

  protected formatDate(iso: string): string {
    return new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(
      new Date(iso),
    );
  }

  protected async logout() {
    await this.supabase.signOut();
    this.router.navigateByUrl(globalPaths.adminLoginUrl);
  }

  protected retry() {
    window.location.reload();
  }
}
