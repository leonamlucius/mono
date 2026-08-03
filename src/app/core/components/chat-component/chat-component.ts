import {
  Component,
  signal,
  ViewChild,
  DestroyRef,
  ElementRef,
  effect,
  inject,
} from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { merge, fromEvent, of, throttleTime, startWith, timer } from 'rxjs';
import { BodyComponent } from '../../../core/components/body-component/body-component';
import { InputComponent } from '../../../core/components/input-component/input-component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { featherAirplay } from '@ng-icons/feather-icons';
import { heroUsers } from '@ng-icons/heroicons/outline';
import { bootstrapLinkedin, bootstrapGithub } from '@ng-icons/bootstrap-icons';
import { ChatService } from '../../services/chat-service';
import { WarningComponent } from '../../../shared/components/warning-component/warning-component';
import { MenuComponent } from '../../../features/components/menu-component/menu-component';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-chat-component',
  imports: [
    BodyComponent,
    InputComponent,
    NgIf,
    NgClass,
    NgIcon,
    WarningComponent,
    MenuComponent,
  ],
  templateUrl: './chat-component.html',
  styleUrls: ['./chat-component.scss'],
  providers: [
    provideIcons({
      featherAirplay,
      heroUsers,
      bootstrapLinkedin,
      bootstrapGithub,
    }),
  ],
})
export class ChatComponent {
  @ViewChild(WarningComponent) warning!: WarningComponent;

  @ViewChild(MenuComponent) menu!: MenuComponent;

  protected readonly title = signal('mono');

  public isInitialized = signal(false);

  public chatHistory = signal<
    {
      text: string;
      sendBy: 'User' | 'Bot';
      loading: boolean;
      llmType?: 'OLLAMA' | 'GROQ' | 'ERROR';
    }[]
  >([]);

  public isTypeSomething = signal(false);

  public textoValue = signal('');

  public textValueSend = signal('');

  public llmType = signal<'OLLAMA' | 'GROQ' | 'ERROR'>('GROQ');

  public summaryText = signal(
    'Bem vindo ao Mono, ' + (localStorage.getItem('name') + '!' || '')
  );

  public IsShowSkeleton = signal(false);

  public dontShowSkeleton = signal(false);

  @ViewChild('nameAndSummary') nameAndSummary!: ElementRef<HTMLDivElement>;

  @ViewChild('caption') caption!: ElementRef<HTMLSpanElement>;

  public llmTypeValue = signal<'OLLAMA' | 'GROQ'>('OLLAMA');

  public isOverflowing = signal(false);

  public isOverflowingInfo = signal(false);

  constructor(
    private chatService: ChatService,
    private destroyRef: DestroyRef
  ) {
    effect(() => {
      setTimeout(() => {
        this.verificarOverflow();
      }, 0);
    });
  }

  @ViewChild(InputComponent) inputComponent!: InputComponent;

  ngOnInit() {
    const minutes = 30 * 60 * 1000;

    const idleCheck$ = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'click'),
      fromEvent(document, 'scroll')
    ).pipe(throttleTime(1000), startWith(null));

    const idleLoop$ = idleCheck$.pipe(switchMap(() => timer(minutes, minutes)));

    merge(of(null), idleLoop$)
      .pipe(
        switchMap(() => {
          return this.chatService.jwtTest();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((isValid: string) => {
        if (isValid == 'Error: ERROR 401') {
          this.chatService.logout();
        }
      });
  }

  public abrirMenu() {
    this.menu.openSidebar();
  }

  private verificarOverflow() {
    if (!this.nameAndSummary && !this.caption) {
      return;
    }

    this.isOverflowing.set(false);

    if (this.nameAndSummary && this.caption) {
      const larguraCaixa = this.nameAndSummary.nativeElement.clientWidth;
      const larguraTexto = this.caption.nativeElement.scrollWidth;

      this.isOverflowing.set(larguraTexto > larguraCaixa);
    }
  }

  public showSkeletonLoading(): void {
    this.IsShowSkeleton.set(!this.IsShowSkeleton());
  }

  public onLlmTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.llmType.set(select.value as 'OLLAMA' | 'GROQ');
  }

  public goBack(): void {
    this.chatService.logout();
  }

  public scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector(
        '.chat-container'
      ) as HTMLElement;
      if (chatContainer) {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 100);
  }

  public limparEResetar(meuTextarea: HTMLTextAreaElement): void {
    const textarea = meuTextarea;
    textarea.value = '';
    textarea.style.height = 'auto'; // Reseta a altura para o min-height do CSS
    this.textoValue.set('');
  }
  public async iniciar(): Promise<void> {
    if (!this.dontShowSkeleton()) {
      this.showSkeletonLoading();
    }

    this.chatService.jwtTest().then((isValid) => {
      if (isValid == 'Error: ERROR 401') {
        this.chatService.logout();
      }
    });
    this.scrollToBottom();

    const textArea = document.querySelector('textarea');

    if (!this.isTypeSomething()) {
      this.warning.openModal('Digite algo para iniciar a conversa');
      this.scrollToBottom();
      if (!this.dontShowSkeleton()) {
        this.showSkeletonLoading();
      }
      return;
    }

    this.chatHistory.set([
      ...this.chatHistory(),
      { text: this.textoValue(), sendBy: 'User', loading: false },
    ]);
    this.chatHistory.set([
      ...this.chatHistory(),
      { text: '', sendBy: 'Bot', loading: true, llmType: this.llmType() },
    ]);

    try {
      if (this.textoValue().trim() === '') {
        this.warning.openModal('Digite algo para continuar a conversa');
        this.chatHistory.set(this.chatHistory().slice(0, -2));
        if (!this.dontShowSkeleton()) {
          this.showSkeletonLoading();
        }
        this.scrollToBottom();
        return;
      }

      this.textValueSend.set(this.textoValue());
      this.makeTextAreaDisabled(textArea as HTMLTextAreaElement);
      this.limparEResetar(textArea as HTMLTextAreaElement);

      await this.chatService
        .sendMessage(this.textValueSend(), this.llmType())
        .then((response) => {
          setTimeout(() => {
            console.log('Response:', response);

            if (response === 'ERROR SENDING MESSAGE') {
              this.warning.openModal(
                'Desculpe, ocorreu um erro ao processar sua mensagem.'
              );
              this.chatHistory.set([
                ...this.chatHistory().slice(0, -1),
                {
                  text: 'Erro ao enviar a mensagem.',
                  sendBy: 'Bot',
                  loading: false,
                  llmType: 'ERROR',
                },
              ]);
              this.makeTextAreaEnabled(textArea as HTMLTextAreaElement);
              this.scrollToBottom();
              if (!this.dontShowSkeleton()) {
                this.showSkeletonLoading();
              }

              return;
            }

            this.chatHistory.set([
              ...this.chatHistory().slice(0, -1),
              {
                text: response.message,
                sendBy: 'Bot',
                loading: false,
                llmType: response.model,
              },
            ]);
            console.log('Chat History:', this.chatHistory());
            this.makeTextAreaEnabled(textArea as HTMLTextAreaElement);
            this.scrollToBottom();

            const nameOfLLM = response.model
              ? response.model.split('-')[0]
              : '';

            this.llmType.set(nameOfLLM as 'OLLAMA' | 'GROQ' | 'ERROR');

            if (!this.dontShowSkeleton()) {
              this.chatService.summarize().then((summary) => {
                this.summaryText.set(summary);

                this.menu.summaryText.set(summary);

                setTimeout(() => {
                  if (!this.dontShowSkeleton()) {
                    this.showSkeletonLoading();
                    this.dontShowSkeleton.set(true);

                    setTimeout(() => {
                      this.verificarOverflow();
                      this.menu.verificarOverflowSidebar();
                    }, 500);
                  }
                }, 1000);
              });
            }
          }, 500);
        });
    } catch (error) {
      console.error('Error:', error);
      this.scrollToBottom();
    }
    console.log('Iniciar');
    this.isInitialized.set(true);
  }

  public goTolinkedin(): void {
    window.open('https://www.linkedin.com/in/leonamlucius/', '_blank');
  }

  public goToGithub(): void {
    window.open('https://github.com/leonamlucius', '_blank');
  }

  public makeTextAreaDisabled(textarea: HTMLTextAreaElement): void {
    textarea.disabled = true;
    textarea.style.cursor = 'wait';
  }

  public makeTextAreaEnabled(textarea: HTMLTextAreaElement): void {
    textarea.disabled = false;
    textarea.style.cursor = 'text';
  }
}
