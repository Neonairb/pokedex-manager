import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly showPassword = signal(false);

  protected readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected submit(): void {
    this.errorMessage.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.loginForm.disable();

    this.auth.login(this.loginForm.getRawValue()).subscribe({
      next: () => void this.router.navigate(['/home']),
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error));
        this.isSubmitting.set(false);
        this.loginForm.enable();
      },
    });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Unable to reach the Pokédex network. Please try again.';
    }

    if (error.status === 401) {
      return 'Trainer ID or password not recognized.';
    }

    const apiMessage = error.error?.message;
    return typeof apiMessage === 'string'
      ? apiMessage
      : 'Authentication failed. Please try again.';
  }
}
