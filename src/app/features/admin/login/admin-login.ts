import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { email, form, FormField, minLength, required, submit } from '@angular/forms/signals';
import { SupabaseService } from '../../../core/services/supabase.service';
import { FormState } from '../../../core/utils/simple-form-model.util';
import { globalPaths } from '../../_config/global-paths.config';

type Model = { email: string; password: string };

@Component({
  selector: 'app-admin-login',
  imports: [FormField],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLogin {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly authError = signal<string | null>(null);

  protected readonly state = signal<FormState<Model>>({ email: '', password: '' });

  protected readonly loginForm = form(this.state, (p) => {
    required(p.email, { message: 'Email obbligatoria' });
    email(p.email, { message: 'Email non valida' });
    required(p.password, { message: 'Password obbligatoria' });
    minLength(p.password, 6, { message: 'Min. 6 caratteri' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.loginForm, async () => {
      this.loading.set(true);
      this.authError.set(null);
      const { email, password } = this.state();
      const error = await this.supabase.signIn(email, password);
      this.loading.set(false);

      if (error) {
        this.authError.set(
          error.code === 'invalid_credentials'
            ? 'Email o password non corretti.'
            : 'Accesso non riuscito. Riprova più tardi.',
        );
        return;
      }
      this.router.navigateByUrl(globalPaths.adminUrl);
    });
  }
}
