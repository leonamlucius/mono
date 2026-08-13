import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private router = inject(Router);
  public async getFacts(): Promise<any> {
    try {
      const apiBase = environment.apiUrl;

      const response = await fetch(`${apiBase}/mono/facts`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true', // Isso é obrigatório para o ngrok funcionar no navegador
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching facts:', error);
      return 'O mono conta fatos interessantes!';
    }
  }

  public async login(email: string, password: string): Promise<any> {
    if (!email || !password) {
      if (!email && password) {
        return 'Por favor, insira um email válido.';
      }
      if (!password && email) {
        return 'Por favor, insira uma senha válida.';
      }

      return 'Por favor, insira um email e senha válidos.';
    }

    try {
      const apiBase = environment.apiUrl;

      const response = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('name', data.name);
        this.router.navigate(['/mono']);
      }
    } catch (error) {
      console.error('Error during login:', error);
      return 'Erro no login. Verifique suas credenciais e tente novamente.';
    }
  }

  public async loginGoogle(idToken: string): Promise<any> {
    if (!idToken) {
      return 'Por favor, forneça um ID Token válido para o login do Google.';
    }

    try {
      const apiBase = environment.apiUrl;

      const response = await fetch(`${apiBase}/auth/login-google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('name', data.name);
        this.router.navigate(['/mono']);
      }
    } catch (error) {
      console.error('Error during Google login:', error);
    }
  }
}
