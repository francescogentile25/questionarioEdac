import { computed, Injectable, signal } from '@angular/core';
import { AuthError, createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Client Supabase condiviso + stato di autenticazione come signal.
 *
 * `ready` diventa true dopo il primo recupero della sessione (da storage):
 * i guard devono attendere `ready` prima di valutare `isAuthenticated`.
 *
 * Nota: la sessione Supabase Auth è gestita da supabase-js (storage del browser),
 * non dal cookie HttpOnly del backend C# — l'auth del template resta separata.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient = createClient(
    environment.supabase.url,
    environment.supabase.publishableKey,
  );

  private readonly _session = signal<Session | null>(null);
  readonly session = this._session.asReadonly();
  readonly ready = signal(false);
  readonly isAuthenticated = computed(() => !!this._session());
  readonly userEmail = computed(() => this._session()?.user.email ?? '');

  constructor() {
    this.client.auth.getSession().then(({ data }) => {
      this._session.set(data.session);
      this.ready.set(true);
    });

    this.client.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
    });
  }

  async signIn(email: string, password: string): Promise<AuthError | null> {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    return error;
  }

  async signOut(): Promise<void> {
    await this.client.auth.signOut();
  }
}
