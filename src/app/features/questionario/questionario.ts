import {
  afterNextRender,
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, map, of, startWith } from 'rxjs';
import { gsap } from 'gsap';
import { QuestionarioService } from './services/questionario.service';
import { QuestionField } from './components/question-field/question-field';
import { SectionResponse, QuestionResponse } from './models/responses/section.response';
import { AnswerPayload, AnswerValue } from './models/requests/submit-questionnaire.request';
import { emptyAnswer, isAnswerEmpty, validateAnswer } from './utils/validate-answer.util';

type LoadState = {
  loading: boolean;
  sections: SectionResponse[];
  error: string | null;
};

/**
 * Pagina pubblica del questionario PEI: wizard mobile-first, una sezione per step.
 * Le domande arrivano da Supabase; l'invio è una singola RPC atomica.
 *
 * Nota architetturale: il form è interamente dinamico (schema da DB), quindi
 * Signal Forms non è applicabile — lo stato è gestito con signals locali.
 * Le animazioni di ingresso sono orchestrate con GSAP (vedi animateEntrance).
 */
@Component({
  selector: 'app-questionario',
  imports: [QuestionField],
  templateUrl: './questionario.html',
  styleUrl: './questionario.scss',
})
export class Questionario {
  private service = inject(QuestionarioService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly load = toSignal(
    this.service.getSections().pipe(
      map((sections): LoadState => ({ loading: false, sections, error: null })),
      catchError(() =>
        of<LoadState>({
          loading: false,
          sections: [],
          error: 'Impossibile caricare il questionario. Verifica la connessione e riprova.',
        }),
      ),
      startWith<LoadState>({ loading: true, sections: [], error: null }),
    ),
    { requireSync: true },
  );

  /** -1 = schermata introduttiva, 0..n-1 = sezioni */
  protected readonly stepIndex = signal(-1);
  protected readonly attempted = signal(false);
  protected readonly answers = signal<Record<number, AnswerValue>>({});
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly submitted = signal(false);

  protected readonly sections = computed(() => this.load().sections);
  protected readonly totalSteps = computed(() => this.sections().length);
  protected readonly totalQuestions = computed(() =>
    this.sections().reduce((n, s) => n + s.questions.length, 0),
  );
  protected readonly currentSection = computed(() =>
    this.stepIndex() >= 0 ? (this.sections()[this.stepIndex()] ?? null) : null,
  );
  protected readonly isLastStep = computed(() => this.stepIndex() === this.totalSteps() - 1);
  protected readonly progress = computed(() =>
    this.stepIndex() < 0 || this.totalSteps() === 0
      ? 0
      : ((this.stepIndex() + 1) / this.totalSteps()) * 100,
  );

  protected readonly stepValid = computed(() => {
    const section = this.currentSection();
    if (!section) return true;
    const answers = this.answers();
    return section.questions.every((q) => !validateAnswer(q, answers[q.id]));
  });

  private readonly reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    // Blobs decorativi: loop infinito, partono una volta sola
    afterNextRender(() => this.animateBlobs());

    // Ingressi: ogni cambio di schermata (load / step / submit) rianima gli elementi .gs-rise
    afterRenderEffect(() => {
      this.load();
      this.stepIndex();
      this.submitted();
      untracked(() => this.animateEntrance());
    });

    // Barra di avanzamento
    afterRenderEffect(() => {
      const width = this.progress();
      untracked(() => this.animateProgress(width));
    });
  }

  protected answerFor(question: QuestionResponse): AnswerValue {
    return this.answers()[question.id] ?? emptyAnswer(question);
  }

  protected setAnswer(questionId: number, value: AnswerValue) {
    this.answers.update((a) => ({ ...a, [questionId]: value }));
  }

  protected start() {
    this.stepIndex.set(0);
    this.scrollTop();
  }

  protected back() {
    this.attempted.set(false);
    this.submitError.set(null);
    this.stepIndex.update((i) => i - 1);
    this.scrollTop();
  }

  protected next() {
    if (!this.stepValid()) {
      this.attempted.set(true);
      return;
    }
    if (this.isLastStep()) {
      this.send();
      return;
    }
    this.attempted.set(false);
    this.stepIndex.update((i) => i + 1);
    this.scrollTop();
  }

  protected retry() {
    window.location.reload();
  }

  private async send() {
    this.submitting.set(true);
    this.submitError.set(null);

    const answers = this.answers();
    const payload: AnswerPayload[] = [];
    for (const section of this.sections()) {
      for (const question of section.questions) {
        const answer = answers[question.id];
        if (!answer || isAnswerEmpty(answer)) continue;
        payload.push({ question_id: question.id, value: answer });
      }
    }

    try {
      await firstValueFrom(this.service.submit(payload));
      this.submitted.set(true);
      this.scrollTop();
    } catch {
      this.submitError.set('Invio non riuscito. Controlla la connessione e riprova.');
    } finally {
      this.submitting.set(false);
    }
  }

  private scrollTop() {
    window.scrollTo({ top: 0 });
  }

  // ---------- Animazioni GSAP ----------

  private animateEntrance() {
    const root = this.host.nativeElement;
    const items = root.querySelectorAll<HTMLElement>('.gs-rise');
    if (items.length && !this.reducedMotion) {
      gsap.fromTo(
        items,
        { y: 24, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.65,
          ease: 'power3.out',
          stagger: 0.07,
          overwrite: 'auto',
          clearProps: 'transform,opacity,visibility',
        },
      );
    }

    // Spunta di conferma: disegno del tratto SVG
    const check = root.querySelector<SVGElement>('.q-success__check');
    if (check) {
      const circle = check.querySelector('circle');
      const path = check.querySelector('path');
      if (this.reducedMotion) {
        gsap.set([circle, path], { strokeDashoffset: 0 });
      } else {
        gsap.fromTo(
          circle,
          { strokeDashoffset: 183 },
          { strokeDashoffset: 0, duration: 0.7, delay: 0.15, ease: 'power2.inOut' },
        );
        gsap.fromTo(
          path,
          { strokeDashoffset: 36 },
          { strokeDashoffset: 0, duration: 0.45, delay: 0.8, ease: 'power2.out' },
        );
      }
    }
  }

  private animateProgress(width: number) {
    const fill = this.host.nativeElement.querySelector<HTMLElement>('.q-progress__fill');
    if (!fill) return;
    if (this.reducedMotion) {
      gsap.set(fill, { width: `${width}%` });
      return;
    }
    gsap.to(fill, { width: `${width}%`, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
  }

  private animateBlobs() {
    if (this.reducedMotion) return;
    const root = this.host.nativeElement;
    gsap.to(root.querySelector('.q-blob--1'), {
      x: -36,
      y: 48,
      scale: 1.12,
      duration: 11,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    gsap.to(root.querySelector('.q-blob--2'), {
      x: 42,
      y: -38,
      scale: 1.08,
      duration: 13,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }
}
