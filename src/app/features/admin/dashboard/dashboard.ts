import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith } from 'rxjs';
import { ChartModule } from 'primeng/chart';
import { SupabaseService } from '../../../core/services/supabase.service';
import { DashboardService } from '../services/dashboard.service';
import { DashboardData } from '../models/responses/dashboard-data.response';
import {
  QuestionResponse,
  SectionResponse,
} from '../../questionario/models/responses/section.response';
import { globalPaths } from '../../_config/global-paths.config';

type LoadState = {
  loading: boolean;
  data: DashboardData | null;
  error: string | null;
};

type QuestionChart = {
  question: QuestionResponse;
  answered: number;
  chartType: 'doughnut' | 'bar';
  chartData: object;
  chartOptions: object;
  height: string;
};

type SectionStat = {
  section: SectionResponse;
  charts: QuestionChart[];
  freeTextCount: number;
};

// Palette grafici derivata dal logo EA
const CHART_COLORS = [
  '#2a1a55',
  '#30aede',
  '#6c5ca8',
  '#1a85b5',
  '#8fd0ec',
  '#463c7a',
  '#74b9d6',
  '#bfb9dd',
  '#1d113e',
  '#9d94c4',
];

const TICK_COLOR = '#5e5a78';
const GRID_COLOR = '#e8e7f1';

@Component({
  selector: 'app-dashboard',
  imports: [ChartModule, RouterLink],
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
    const submissions = this.load().data?.submissions ?? [];
    return submissions.length ? this.formatDate(submissions[0].created_at) : '—';
  });

  /** Linea: invii per giorno, dal primo all'ultimo invio (buchi a 0). */
  protected readonly timelineChart = computed(() => {
    const submissions = this.load().data?.submissions ?? [];
    if (!submissions.length) return null;

    const perDay = new Map<string, number>();
    for (const sub of submissions) {
      const day = sub.created_at.slice(0, 10);
      perDay.set(day, (perDay.get(day) ?? 0) + 1);
    }

    const days = [...perDay.keys()].sort();
    const labels: string[] = [];
    const counts: number[] = [];
    const cursor = new Date(days[0]);
    const end = new Date(days[days.length - 1]);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      labels.push(new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit' }).format(cursor));
      counts.push(perDay.get(key) ?? 0);
      cursor.setDate(cursor.getDate() + 1);
    }

    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Invii',
            data: counts,
            borderColor: '#30aede',
            backgroundColor: 'rgba(48, 174, 222, 0.15)',
            pointBackgroundColor: '#2a1a55',
            fill: true,
            tension: 0.35,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: TICK_COLOR }, grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { color: TICK_COLOR, precision: 0 },
            grid: { color: GRID_COLOR },
          },
        },
      },
    };
  });

  /** Un grafico per ogni domanda a scelta, raggruppati per sezione. */
  protected readonly sectionStats = computed<SectionStat[]>(() => {
    const data = this.load().data;
    if (!data) return [];

    const byQuestion = new Map<number, DashboardData['answers']>();
    for (const row of data.answers) {
      const list = byQuestion.get(row.question_id) ?? [];
      list.push(row);
      byQuestion.set(row.question_id, list);
    }

    return data.sections
      .map((section) => {
        const choiceQuestions = section.questions.filter(
          (q) => q.type === 'radio' || q.type === 'checkbox',
        );
        const freeTextCount = section.questions.length - choiceQuestions.length;

        const charts = choiceQuestions.map((question): QuestionChart => {
          const rows = byQuestion.get(question.id) ?? [];
          const options = question.options ?? [];

          const counts = new Map<string, number>(options.map((o) => [o, 0]));
          for (const row of rows) {
            const v = row.value.value;
            for (const selected of Array.isArray(v) ? v : [v]) {
              counts.set(selected, (counts.get(selected) ?? 0) + 1);
            }
          }
          const values = options.map((o) => counts.get(o) ?? 0);

          if (question.type === 'radio') {
            return {
              question,
              answered: rows.length,
              chartType: 'doughnut',
              height: '240px',
              chartData: {
                labels: options,
                datasets: [{ data: values, backgroundColor: CHART_COLORS, borderWidth: 0 }],
              },
              chartOptions: {
                maintainAspectRatio: false,
                cutout: '58%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: TICK_COLOR, boxWidth: 12, font: { size: 11 } },
                  },
                },
              },
            };
          }

          return {
            question,
            answered: rows.length,
            chartType: 'bar',
            height: `${options.length * 34 + 70}px`,
            chartData: {
              labels: options,
              datasets: [
                {
                  data: values,
                  backgroundColor: 'rgba(48, 174, 222, 0.75)',
                  borderRadius: 6,
                  barThickness: 18,
                },
              ],
            },
            chartOptions: {
              indexAxis: 'y',
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: {
                  beginAtZero: true,
                  ticks: { color: TICK_COLOR, precision: 0 },
                  grid: { color: GRID_COLOR },
                },
                y: { ticks: { color: TICK_COLOR, font: { size: 11 } }, grid: { display: false } },
              },
            },
          };
        });

        return { section, charts, freeTextCount };
      })
      .filter((s) => s.charts.length > 0);
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
