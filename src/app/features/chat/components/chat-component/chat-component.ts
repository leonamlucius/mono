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
import {
  merge,
  fromEvent,
  of,
  throttleTime,
  startWith,
  timer,
  Subject,
} from 'rxjs';
import { BodyComponent } from '../body-component/body-component';
import { InputComponent } from '../input-component/input-component';
import { SearchComponent } from '../../../../shared/components/search-component/search-component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { featherAirplay } from '@ng-icons/feather-icons';
import { heroUsers } from '@ng-icons/heroicons/outline';
import { bootstrapLinkedin, bootstrapGithub } from '@ng-icons/bootstrap-icons';
import { AuthService } from '../../../../core/services/auth.service';
import { ChatService } from '../../services/chat-service';
import { WarningComponent } from '../../../../shared/components/warning-component/warning-component';
import { MenuComponent } from '../../../../features/chat/components/menu-component/menu-component';
import { SelectLlmComponent } from '../../../../shared/components/select-llm-component/select-llm-component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap} from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ChatUiActions } from '../../states/chat-ui.actions';
import { selectSelectedMessages } from '../../states/chat-ui-selectors';

@Component({
  selector: 'app-chat-component',
  imports: [
    BodyComponent,
    InputComponent,
    NgClass,
    NgIcon,
    WarningComponent,
    MenuComponent,
    SearchComponent,
    SelectLlmComponent,
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

  @ViewChild(SearchComponent) search!: SearchComponent;

  protected readonly title = signal('mono');

  private store = inject(Store);

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

  public lastSearchIndex = signal(-1);

  public searchTerm = signal('');

  public showButton = signal(false);

  protected selectedMessages = this.store.selectSignal(selectSelectedMessages);

  constructor(
    private chatService: ChatService,
    private destroyRef: DestroyRef,
    private authService: AuthService
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

    idleLoop$
      .pipe(
        switchMap(() => {
          return this.authService.jwtTest();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((isValid: string) => {
        if (isValid == 'Error: ERROR 401') {
          this.authService.logout();
        }
      });

    this.chatService.getChatHistory().then((history) => {
      if (history === 'ERROR FETCHING CHAT HISTORY') {
        this.warning.openModal(
          'Desculpe, ocorreu um erro ao buscar o histórico de chat.'
        );
        return;
      }

      history.forEach((item: any) => {
       this.store.dispatch(ChatUiActions.setChatHistory({
         chatHistory: [
           {
             text: item.message,
             sendBy: item.model == 'USER' ? 'User' : 'Bot',
             loading: false,
             llmType: item.model == 'USER' ? undefined : item.model,
           },
         ],
       }));
      });
    });
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
    this.IsShowSkeleton.set(true);
  }

  public hideSkeletonLoading(): void {
    this.IsShowSkeleton.set(false);
  }

  public goBack(): void {
    this.authService.logout();
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

    this.authService.jwtTest().then((isValid) => {
      if (isValid == 'Error: ERROR 401') {
        this.authService.logout();
      }
    });
    this.scrollToBottom();

    const textArea = document.querySelector('textarea');

    if (!this.isTypeSomething()) {
      this.warning.openModal('Digite algo para iniciar a conversa');
      this.scrollToBottom();
      if (!this.dontShowSkeleton()) {
        this.hideSkeletonLoading();
      }
      return;
    }

    this.store.dispatch(ChatUiActions.setChatHistory({
      chatHistory: [
        ...this.chatHistory(),
        { text: this.textoValue(), sendBy: 'User', loading: false },
      ],
    }));

    this.store.dispatch(ChatUiActions.setChatHistory({
      chatHistory: [
        ...this.chatHistory(),
        { text: '', sendBy: 'Bot', loading: true, llmType: this.llmType() },
      ],
    }));

    try {
      if (this.textoValue().trim() === '') {
        this.warning.openModal('Digite algo para continuar a conversa');
        this.store.dispatch(ChatUiActions.setChatHistory({
          chatHistory: this.chatHistory().slice(0, -2),
        }));
        if (!this.dontShowSkeleton()) {
          this.hideSkeletonLoading();
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
            
              this.store.dispatch(ChatUiActions.setChatHistory({
                chatHistory: [
                  ...this.chatHistory().slice(0, -1),
                  {
                    text: 'Erro ao enviar a mensagem.',
                    sendBy: 'Bot',
                    loading: false,
                    llmType: 'ERROR',
                  },
                ],
              }));

              this.makeTextAreaEnabled(textArea as HTMLTextAreaElement);
              this.scrollToBottom();
              if (!this.dontShowSkeleton()) {
                this.hideSkeletonLoading();
              }

              return;
            }

      
            this.store.dispatch(ChatUiActions.deleteLastChatHistory({
              chatHistory: [
                {
                  text: '',
                  sendBy: 'Bot',
                  loading: true,
                  llmType: this.llmType(),
                },
              ],
            }));
            
            this.store.dispatch(ChatUiActions.setChatHistory({
              chatHistory: [
                ...this.chatHistory(),
                {
                  text: response.message,
                  sendBy: 'Bot',
                  loading: false,
                  llmType: response.model,
                },
              ],
            }));
            console.log('Chat History:', this.chatHistory());
            this.makeTextAreaEnabled(textArea as HTMLTextAreaElement);
            this.adjustTextAlignment();
            this.scrollToBottom();

            const nameOfLLM = response.model
              ? response.model.split('-')[0]
              : '';

            this.llmType.set(nameOfLLM as 'OLLAMA' | 'GROQ' | 'ERROR');

            this.chatService.summarize().then((summary) => {
              if (
                this.summaryText() === summary ||
                this.menu.summaryText() === summary
              ) {
                return;
              }

              this.showSkeletonLoading();
              this.summaryText.set(summary);
              this.menu.summaryText.set(summary);

              setTimeout(() => {
                this.hideSkeletonLoading();
                this.dontShowSkeleton.set(true);

                setTimeout(() => {
                  this.verificarOverflow();
                  this.menu.verificarOverflowSidebar();
                }, 500);
              }, 1000);
            });
          }, 500);
        });
    } catch (error) {
      console.error('Error:', error);
      this.scrollToBottom();
    }
    console.log('Iniciar');
    this.isInitialized.set(true);
    this.menu.isInitialized.set(true);
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
