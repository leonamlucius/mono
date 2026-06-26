import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServiceAi {

  public async sendMessage(message: string, provider: 'OLLAMA' | 'GROQ'): Promise<any> {

    try{

      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: {
          'X-AI-Provider': provider, // ou 'GROQ' dependendo do provedor que você deseja usar
          'Content-Type': 'text/plain',
        },
        body: message,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    }catch(error){
      console.error('Error sending message:', error);
      return 'Desculpe, ocorreu um erro ao processar sua mensagem.';
    }
  }
}



