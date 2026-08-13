import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private router = inject(Router);
  public async register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<any> {
    if (!name || !email || !password || !confirmPassword) {
      return 'Por favor, preencha todos os campos obrigatórios.';
    }

    if (password.length < 8 || confirmPassword.length < 8) {
      return 'A senha deve ter pelo menos 8 caracteres.';
    }

    if (password !== confirmPassword) {
      return 'As senhas não coincidem. Por favor, verifique e tente novamente.';
    }

    try {
      const apiBase = environment.apiUrl;

      const response = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      if (response.status === 500) {
        return 'Email já cadastrado. Por favor, tente outro email.';
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('name', data.name);
        this.router.navigate(['/mono']);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      return 'Erro no registro. Verifique suas informações e tente novamente.';
    }
  }

  public async registerWithGoogle(idToken: string): Promise<any> {
    if (!idToken) {
      return 'Token do Google não fornecido. Por favor, tente novamente.';
    }
    try {
      const apiBase = environment.apiUrl;

      const response = await fetch(`${apiBase}/auth/register-google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });

      if (response.status === 500) {
        return 'Email já cadastrado. Por favor, tente outro email.';
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('name', data.name);
        this.router.navigate(['/mono']);
      }
    } catch (error) {
      console.error('Error during Google registration:', error);
      return 'Erro no registro com Google. Verifique suas informações e tente novamente.';
    }
  }
}
