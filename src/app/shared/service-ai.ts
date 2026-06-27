import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})


export class ServiceAi {

  

  public async sendMessage(message: string, provider: 'OLLAMA' | 'GROQ'): Promise<any> {

    try{

      const apiBase = import.meta.env['NG_APP_API_URL'];

      const response = await fetch(`${apiBase}/api/chat`, {
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


  public async getFacts(): Promise<any> {

    try{

      const apiBase = import.meta.env['NG_APP_API_URL'];

      const response = await fetch(`${apiBase}/api/facts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'text/plain',
          'ngrok-skip-browser-warning': 'true' // Isso é obrigatório para o ngrok funcionar no navegador
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      return data;

    }catch(error){
      console.error('Error fetching facts:', error);
      return 'O mono conta fatos interessantes!';
    }
  }
}



