import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SectionResponse } from '../models/responses/section.response';
import {
  AnswerPayload,
  SubmitQuestionnaireRequest,
} from '../models/requests/submit-questionnaire.request';

/**
 * Chiamate dirette a Supabase (PostgREST) per il questionario PEI.
 * Lettura: sections + questions annidate. Scrittura: solo via RPC `submit_questionnaire`
 * (security definer) — nessun insert diretto su submissions/answers.
 */
@Injectable({ providedIn: 'root' })
export class QuestionarioService {
  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.supabase.url}/rest/v1`;
  private readonly headers = new HttpHeaders({
    apikey: environment.supabase.publishableKey,
    Authorization: `Bearer ${environment.supabase.publishableKey}`,
  });

  getSections(): Observable<SectionResponse[]> {
    const params = new HttpParams()
      .set('select', '*,questions(*)')
      .set('order', 'position.asc')
      .set('questions.order', 'position.asc');

    return this.http.get<SectionResponse[]>(`${this.baseUrl}/sections`, {
      headers: this.headers,
      params,
    });
  }

  submit(answers: AnswerPayload[]): Observable<string> {
    const body: SubmitQuestionnaireRequest = { p_answers: answers };
    return this.http.post<string>(`${this.baseUrl}/rpc/submit_questionnaire`, body, {
      headers: this.headers,
    });
  }
}
