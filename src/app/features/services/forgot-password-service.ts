import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ForgotPasswordService {

  public async forgotPassword(email: string): Promise<any> {
      if (!email) {
        return 'Por favor, insira um email válido.';
      }
  
      try {
        const apiBase = environment.apiUrl;
  
        const response = await fetch(`${apiBase}/api/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
  
        if (response.status === 404) {
          console.error('Email not found:', email);
          throw new Error(
            'Email não encontrado. Por favor, verifique o email e tente novamente.'
          );
        }
  
        if (response.status === 400) {
          console.error('Already requested password reset:', email);
          return 'Aguarde uma hora antes de tentar novamente. Se o problema persistir, entre em contato com o suporte.';
        }
  
        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        if (response.ok) {
          return 'Por favor, verifique sua caixa de email para redefinir sua senha.';
        }
      } catch (error) {
        console.error('Error during forgot password:', error);
        throw new Error(
          error instanceof Error ? error.message : 'Erro desconhecido'
        );
      }
    }
}
