import { Component, Input, signal, inject, ViewChild } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { TextToSpeechService } from '../../../../core/services/text-to-speech.service';
import { MarkdownPipe } from './markdown.pipe';
import { Router } from '@angular/router';
import { WarningComponent } from '../../../../shared/components/warning-component/warning-component';
import removeMarkdown from 'remove-markdown';

@Component({
  selector: 'app-body-component',
  imports: [NgFor, NgIf, MarkdownPipe, WarningComponent, NgClass],
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
  public iconAtual = signal('');

  private indice = 0;

  public texts = [
    {
      text: 'Faça suas perguntas e conservas com o mono!',
      icon: `<span class="material-symbols-outlined">
        question_mark
        </span>`,
    },
    {
      text: 'O Mono é um assistente virtual inteligente, projetado para fornecer respostas rápidas.',
      icon: `<span class="material-symbols-outlined">
        bolt
        </span>`,
    },
    {
      text: 'Com o Mono, você pode obter respostas para uma ampla variedade de tópicos.',

      icon: `<span class="material-symbols-outlined">
      emoji_objects
      </span>`,
    },
    {
      text: 'O Mono é uma ferramenta útil para quem busca informações rápidas e confiáveis.',

      icon: `<span class="material-symbols-outlined">
      build
      </span>`,
    },
  ];

  ngOnInit() {
    // this.textoAtual.set(this.texts[0].text);
    // this.iconAtual.set(this.texts[0].icon);
    // setInterval(() => {
    //   this.textoAtual.set('');
    //   setTimeout(() => {
    //     this.indice = (this.indice + 1) % this.texts.length;
    //     this.textoAtual.set(this.texts[this.indice].text);
    //     this.iconAtual.set(this.texts[this.indice].icon);
    //   }, 50);
    // }, 8000);

    this.adjustTextAlignment();
  }

  private adjustTextAlignment(): void {
    setTimeout(() => {
      const messageDiv = document.querySelectorAll(
        '.message'
      ) as NodeListOf<HTMLElement>;

      messageDiv.forEach((message) => {
        const width = message.offsetWidth; // ← pega largura REAL renderizada
        const paragraph = message.querySelector('p');

        if (paragraph) {
          if (width > 250) {
            paragraph.style.textAlign = 'left';
          } else {
            paragraph.style.textAlign = 'center';
          }
        }
      });
    }, 100); // aguarda renderização
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
