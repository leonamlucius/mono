import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
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
          Authorization: `Bearer ${localStorage.getItem('tokenUser')}`,
        },
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
  public async jwtTest(token: any): Promise<any> {
    try {
      const apiBase = environment.apiUrl;

      const response = await fetch(`${apiBase}/api/jwt-test`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error during JWT test:', error);
      return 'Erro ao tentar verificar o JWT. Verifique suas informações e tente novamente.';
    }
  }
}
