import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SpeechService {

  private recognition: any;


  public transcricao = signal<string>("");
  public estaOuvindo = signal<boolean>(false);


  constructor() {
    // Valida se o navegador suporta a API de voz (Chrome/Edge usam webkitSpeechRecognition)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Este navegador não suporta reconhecimento de voz.');
      return;
    }

    this.recognition = new SpeechRecognition();
    
    // Configurações da API
    this.recognition.continuous = true; // Continua ouvindo mesmo se o usuário pausar a fala
    this.recognition.interimResults = true; // Captura resultados parciais enquanto o usuário fala
    this.recognition.lang = 'pt-BR'; // Define o idioma para Português do Brasil

    // Evento disparado quando a API detecta voz e converte em texto
    this.recognition.onresult = (evento: any) => {
      let textoResultado = '';
      for (let i = evento.resultIndex; i < evento.results.length; i++) {
        textoResultado += evento.results[i][0].transcript;
      }
      // Atualiza o Signal reativo com o texto capturado
      this.transcricao.set(textoResultado);

      console.log('Transcrição parcial:', textoResultado);
    };

    // Evento disparado quando o microfone desliga
    this.recognition.onend = () => {
      this.estaOuvindo.set(false);
    };

    // Trata erros (como microfone bloqueado pelo usuário)
    this.recognition.onerror = (erro: any) => {
      console.error('Erro no reconhecimento de voz:', erro);
      this.estaOuvindo.set(false);
    };
  }


  public iniciar(): void {
    if (!this.recognition || this.estaOuvindo()) return;
    this.transcricao.set('');
    this.estaOuvindo.set(true);
    this.recognition.start();

    console.log('Iniciando reconhecimento de voz...');
    
  }


  public parar(): void {
    if (!this.recognition || !this.estaOuvindo()) return;
    this.recognition.stop();
    this.estaOuvindo.set(false);

    console.log('Reconhecimento de voz parado.');

    console.log('Transcrição final:', this.transcricao());


  }

}
