import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private router = inject(Router);
  public async getFacts(): Promise<any> {
    try {
      const apiBase = environment.apiUrl;

      const response = await fetch(`${apiBase}/api/facts`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true', // Isso é obrigatório para o ngrok funcionar no navegador
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
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

      const response = await fetch(`${apiBase}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('tokenUser', data.token);
        localStorage.setItem('name', data.name);
        this.router.navigate(['/mono']);
      }
    } catch (error) {
      console.error('Error during login:', error);
      return 'Erro no login. Verifique suas credenciais e tente novamente.';
    }
  }
}
