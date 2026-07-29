import { Component, Input, signal, inject, ViewChild } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { TextToSpeechService } from '../../services/text-to-speech.service';
import { MarkdownPipe } from './markdown.pipe';
import { Router } from '@angular/router';
import { WarningComponent } from '../../../shared/components/warning-component/warning-component';
import removeMarkdown from 'remove-markdown';

@Component({
  selector: 'app-body-component',
  imports: [NgFor, NgIf, NgClass, MarkdownPipe, WarningComponent],
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
  @ViewChild(WarningComponent) warning!: WarningComponent;
  private router = inject(Router);

  @Input() isInitialized = false;

  @Input() chatHistory: {
    text: string;
    sendBy: 'User' | 'Bot';
    loading: boolean;
    llmType?: 'OLLAMA' | 'GROQ' | 'ERROR';
  }[] = [];

  constructor(public textToSpeechService: TextToSpeechService) {}

  public activeSpeechIndex = signal<number | null>(null);

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

  ngOnInit() {
    this.textoAtual.set(this.texts[0].text);
    setInterval(() => {
      this.textoAtual.set('');
      setTimeout(() => {
        this.indice = (this.indice + 1) % this.texts.length;
        this.textoAtual.set(this.texts[this.indice].text);
      }, 50);
    }, 8000);
  }

  public async speechText(text: any, index: number): Promise<void> {
    let textSpeak = String(text);

    if (/\p{Emoji_Presentation}/gu.test(textSpeak)) {
      textSpeak = textSpeak.replace(/\p{Emoji_Presentation}/gu, '');
    }

    if (!this.textToSpeechService.isSpeechEnabled()) {
      return;
    }

    this.activeSpeechIndex.set(index);

    await this.textToSpeechService.speak(removeMarkdown(textSpeak));

    if (this.activeSpeechIndex() === index) {
      this.activeSpeechIndex.set(null);
    }
  }

  public cancelSpeak(): void {
    this.textToSpeechService.cancelSpeak();
    this.activeSpeechIndex.set(null);
  }

  public copyToClipboard(text: string) {
    navigator.clipboard.writeText(text.replace(/\*/g, '')).then(() => {
      this.warning.openModal('Texto copiado para a área de transferência!');
    });
  }
}
