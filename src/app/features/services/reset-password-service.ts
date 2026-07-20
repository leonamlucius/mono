import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ResetPasswordService {
    private router = inject(Router);

     public async resetPassword(
    token: any,
    newPassword: string,
    confirmNewPassword: string
  ): Promise<any> {
    if (!token || !newPassword || !confirmNewPassword) {
      return 'Por favor, preencha todos os campos obrigatórios.';
    }

    if (newPassword.length < 8 || confirmNewPassword.length < 8) {
      return 'A senha deve ter pelo menos 8 caracteres.';
    }

    if (newPassword !== confirmNewPassword) {
      return 'As senhas não coincidem. Por favor, verifique e tente novamente.';
    }

    try {
      const apiBase = environment.apiUrl;

      const response = await fetch(`${apiBase}/api/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword, confirmNewPassword }),
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.ok) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
        return 'Senha redefinida com sucesso! Redirecionando para a página de login...';
      }
    } catch (error) {
      console.error('Error during password reset:', error);
      return 'Erro ao tentar redefinir a senha. Verifique suas informações e tente novamente.';
    }
  }

  public async tokenIsExpired(token: any): Promise<any> {
    try {
      const apiBase = environment.apiUrl;

      const response = await fetch(`${apiBase}/api/token-test?token=${token}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.status === 400) {
        console.error('Token is invalid or expired:', token);
        return true;
      }

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error during token test:', error);
      return 'Erro ao tentar verificar o token. Verifique suas informações e tente novamente.';
    }
  }

}
