import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { SupabaseService } from '../../../core/services/supabase.service';
import { SectionResponse } from '../../questionario/models/responses/section.response';
import {
  AnswerRow,
  DashboardData,
  RecentSubmission,
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

  private async fetchData(): Promise<DashboardData> {
    const client = this.supabase.client;

    const [countRes, recentRes, answersRes, sectionsRes] = await Promise.all([
      client.from('submissions').select('*', { count: 'exact', head: true }),
      client
        .from('submissions')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(8),
      client.from('answers').select('question_id, value'),
      client
        .from('sections')
        .select('*, questions(*)')
        .order('position')
        .order('position', { referencedTable: 'questions' }),
    ]);

    const error = countRes.error ?? recentRes.error ?? answersRes.error ?? sectionsRes.error;
    if (error) throw error;

    return {
      totalSubmissions: countRes.count ?? 0,
      recent: (recentRes.data ?? []) as RecentSubmission[],
      answers: (answersRes.data ?? []) as AnswerRow[],
      sections: (sectionsRes.data ?? []) as SectionResponse[],
    };
  }
}
