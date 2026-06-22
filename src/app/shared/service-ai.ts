import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServiceAi {

  public async sendMessage(message: string): Promise<string> {

    try{

      const response = await fetch('https://unarmored-splashing-unturned.ngrok-free.dev/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: message,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      return data;

    }catch(error){
      console.error('Error sending message:', error);
      return 'Desculpe, ocorreu um erro ao processar sua mensagem.';
    }
  }
}



