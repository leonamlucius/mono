import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private router: Router) {}
  public async sendMessage(
    message: string,
    provider: 'OLLAMA' | 'GROQ' | 'ERROR'
  ): Promise<any> {
    try {
      const apiBase = environment.apiUrl;

      const response = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: {
          'X-AI-Provider': provider, // ou 'GROQ' dependendo do provedor que você deseja usar
          'Content-Type': 'text/plain',
        },
        credentials: 'include',
        body: message,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return 'ERROR SENDING MESSAGE';
    }
  }
  public async jwtTest(): Promise<any> {
    try {
      const apiBase = environment.apiUrl;

      const response = await fetch(`${apiBase}/api/jwt-test`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`ERROR ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error during JWT test:', error);
      return error;
    }
  }

  public async summarize(): Promise<any> {
    try {
      const apiBase = environment.apiUrl;

      const response = await fetch(`${apiBase}/api/summarize`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      return result;
    } catch (error) {
      console.error('Error during summarize:', error);
      return 'Erro ao tentar resumir. Verifique suas informações e tente novamente.';
    }
  }

  public async logout(): Promise<void> {
    try {
      const apiBase = environment.apiUrl;
      await fetch(`${apiBase}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      localStorage.clear();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}
