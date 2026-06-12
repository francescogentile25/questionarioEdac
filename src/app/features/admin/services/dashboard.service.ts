import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { SupabaseService } from '../../../core/services/supabase.service';
import { SectionResponse } from '../../questionario/models/responses/section.response';
import {
  AnswerRow,
  DashboardData,
  SubmissionDetailData,
  SubmissionResponse,
} from '../models/responses/dashboard-data.response';

/**
 * Dati per la dashboard amministrativa. Usa il client Supabase autenticato:
 * submissions/answers sono leggibili solo dal ruolo `authenticated` (vedi RLS).
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private supabase = inject(SupabaseService);

  getData(): Observable<DashboardData> {
    return from(this.fetchData());
  }

  getSubmission(id: string): Observable<SubmissionDetailData> {
    return from(this.fetchSubmission(id));
  }

  private async fetchData(): Promise<DashboardData> {
    const client = this.supabase.client;

    const [submissionsRes, answersRes, sectionsRes] = await Promise.all([
      client.from('submissions').select('id, created_at').order('created_at', { ascending: false }),
      client.from('answers').select('question_id, value'),
      this.fetchSections(),
    ]);

    const error = submissionsRes.error ?? answersRes.error;
    if (error) throw error;

    const submissions = (submissionsRes.data ?? []) as SubmissionResponse[];
    return {
      totalSubmissions: submissions.length,
      submissions,
      answers: (answersRes.data ?? []) as AnswerRow[],
      sections: sectionsRes,
    };
  }

  private async fetchSubmission(id: string): Promise<SubmissionDetailData> {
    const client = this.supabase.client;

    const [submissionRes, answersRes, sectionsRes] = await Promise.all([
      client.from('submissions').select('id, created_at').eq('id', id).single(),
      client.from('answers').select('question_id, value').eq('submission_id', id),
      this.fetchSections(),
    ]);

    const error = submissionRes.error ?? answersRes.error;
    if (error) throw error;

    return {
      submission: submissionRes.data as SubmissionResponse,
      answers: (answersRes.data ?? []) as AnswerRow[],
      sections: sectionsRes,
    };
  }

  private async fetchSections(): Promise<SectionResponse[]> {
    const { data, error } = await this.supabase.client
      .from('sections')
      .select('*, questions(*)')
      .order('position')
      .order('position', { referencedTable: 'questions' });
    if (error) throw error;
    return (data ?? []) as SectionResponse[];
  }
}
