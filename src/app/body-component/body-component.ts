import { Component, Input, signal, inject } from '@angular/core';
import { NgFor, NgIf, AsyncPipe, NgClass } from '@angular/common';
import { Observable } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { ServiceAi } from '../shared/service-ai';
import { TextToSpeechService } from '../shared/text-to-speech.service';
import { MarkdownPipe } from './markdown.pipe';
import { Router } from '@angular/router';
import removeMarkdown from 'remove-markdown';

@Component({
  selector: 'app-body-component',
  imports: [NgFor, NgIf, NgClass, MarkdownPipe],
  templateUrl: './body-component.html',
  styleUrls: ['./body-component.scss'],
  animations: [
    trigger('fadeText', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(0)' }),
        animate(
          '1s ease-in-out',
          style({ opacity: 1, transform: 'translateY(10px)' })
        ),
      ]),
    ]),
  ],
})
export class BodyComponent {
  private serviceAi = inject(ServiceAi);
  private textToSpeechService = inject(TextToSpeechService);
  private router = inject(Router);

  @Input() isInitialized = false;

  @Input() chatHistory: {
    text: string;
    sendBy: 'User' | 'Bot';
    loading: boolean;
    llmType?: 'OLLAMA' | 'GROQ' | 'ERROR';
  }[] = [];

  public showModalWarning = signal(false);

  public isClosingModal = signal(false);

  private modalTimer: any;

  public modalWarningText = '';

  public textoAtual = signal('');

  private indice = 0;

  public texts = [
    {
      text: 'Faça sua pergunta, dúvidas, curiosidades e conversas com o Mono!',
    },
    {
      text: 'O Mono é um assistente virtual inteligente, projetado para fornecer respostas rápidas e precisas às suas perguntas. Ele utiliza tecnologia avançada de processamento de linguagem natural para entender suas consultas e oferecer informações relevantes de forma eficiente.',
    },
    {
      text: 'Com o Mono, você pode obter respostas para uma ampla variedade de tópicos, desde informações gerais até questões específicas. Ele é capaz de compreender o contexto das suas perguntas e fornecer respostas personalizadas, tornando a interação mais fluida e satisfatória.',
    },
    {
      text: 'O Mono é uma ferramenta útil para quem busca informações rápidas e confiáveis, seja para resolver dúvidas do dia a dia, obter insights sobre um assunto específico ou simplesmente ter uma conversa interessante. Experimente o Mono e descubra como ele pode facilitar sua vida com respostas inteligentes e eficientes!',
    },
  ];

  public tokenUser = this.serviceAi.tokenUser();

  public speechText(text: any): void {
    if (!this.textToSpeechService.isSpeechEnabled) {
      this.textToSpeechService.toggleSpeech();
      this.textToSpeechService.speak(removeMarkdown(text));
    }
  }

  public mostrarModalErroAutomatico(texto: string): void {
    console.log('Mostrando modal de erro automático:', texto);

    if (this.modalTimer) {
      clearTimeout(this.modalTimer);
    }

    this.isClosingModal.set(false);
    this.modalWarningText = texto;
    this.showModalWarning.set(true);

    this.modalTimer = setTimeout(() => {
      this.fecharModalCOmAnimacao();
    }, 5000);
  }
  public triggerCloseModalWarning(): void {
    if (this.modalTimer) {
      clearTimeout(this.modalTimer);
    }
    this.fecharModalCOmAnimacao();
  }

  public fecharModalCOmAnimacao(): void {
    this.isClosingModal.set(true);

    setTimeout(() => {
      this.showModalWarning.set(false);
      this.isClosingModal.set(false);
    }, 500); // Tempo para a animação de fechamento (ajuste conforme necessário)
  }
  public copyToClipboard(text: string) {
    navigator.clipboard.writeText(text.replace(/\*/g, '')).then(() => {
      this.mostrarModalErroAutomatico(
        'Texto copiado para a área de transferência!'
      );
    });
  }

  ngOnInit() {
    this.textoAtual.set(this.texts[0].text);
    setInterval(() => {
      this.textoAtual.set('');
      setTimeout(() => {
        this.indice = (this.indice + 1) % this.texts.length;
        this.textoAtual.set(this.texts[this.indice].text);
      }, 50);
    }, 8000);

    if (
      localStorage.getItem('tokenUser') == null ||
      localStorage.getItem('tokenUser') == undefined
    ) {
      this.router.navigate(['/login']);
    }
  }
}
