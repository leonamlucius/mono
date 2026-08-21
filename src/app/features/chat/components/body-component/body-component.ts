import { Component, Input, signal, inject, ViewChild } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { TextToSpeechService } from '../../../../core/services/text-to-speech.service';
import { MarkdownPipe } from './markdown.pipe';
import { HighlightPipe } from './highlight.pipe';
import { IsVisibleDirective } from './is-visible.directive';
import { Router } from '@angular/router';
import { WarningComponent } from '../../../../shared/components/warning-component/warning-component';
import { ScrollButtonComponent } from '../../../chat/components/scroll-button-component/scroll-button-component';
import removeMarkdown from 'remove-markdown';

import { AsyncPipe } from '@angular/common';
import {
  selectChatHistory,
  selectSearchTerm,
  selectSelectedMessages,
  selectToggleScrollButton,
} from '../../states/chat-ui-selectors';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-body-component',
  imports: [
    NgFor,
    NgIf,
    MarkdownPipe,
    WarningComponent,
    NgClass,
    HighlightPipe,
    AsyncPipe,
    IsVisibleDirective,
    ScrollButtonComponent,
  ],
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

  private store = inject(Store);

  readonly searchTerm$ = this.store.select(selectSearchTerm);

  protected chatHistory = this.store.selectSignal(selectChatHistory);

  protected showScrollButton = this.store.selectSignal(
    selectToggleScrollButton
  );

  @Input() isInitialized = false;

  constructor(public textToSpeechService: TextToSpeechService) {}

  public activeSpeechIndex = signal<number | null>(null);

  public textoAtual = signal('');
  public iconAtual = signal('');

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
    this.adjustTextAlignment();
  }

  public divVisiblechange(isVisible: boolean, index: number): boolean {
    const lastMensagemIndex = this.chatHistory().length - 1;

    if (index !== lastMensagemIndex) {
      return false;
    }

    this.store.dispatch({
      type: '[Chat UI] Toggle Scroll Button',
      showScrollButton: !isVisible,
    });
    return true;
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
          if (width > 350) {
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
