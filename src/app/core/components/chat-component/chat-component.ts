import {
  Component,
  signal,
  ViewChild,
  DestroyRef,
  ElementRef,
  effect,
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
import { Warning } from '../../../shared/components/warning/warning';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-chat-component',
  imports: [BodyComponent, InputComponent, NgIf, NgClass, NgIcon, Warning],
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
  @ViewChild(Warning) warning!: Warning;

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

  public showModal = false;

  public showModalWarningPai = signal(false);

  public llmType = signal<'OLLAMA' | 'GROQ' | 'ERROR'>('GROQ');

  public showSidebar = signal(false);

  public sideBarExit = signal(false);

  public summaryText = signal(
    'Bem vindo ao Mono, ' + (localStorage.getItem('name') + '!' || '')
  );

  public IsShowSkeleton = signal(false);

  public dontShowSkeleton = signal(false);

  @ViewChild('nameAndSummary') nameAndSummary!: ElementRef<HTMLDivElement>;

  @ViewChild('caption') caption!: ElementRef<HTMLSpanElement>;

  @ViewChild('nameAndSummaryInfo') nameAndSummaryInfo!: ElementRef<HTMLDivElement>;

  @ViewChild('captionInfo') captionInfo!: ElementRef<HTMLSpanElement>;

  

  public isOverflowing = signal(false);

  public isOverflowingInfo = signal(false);

  constructor(
    private chatService: ChatService,
    private destroyRef: DestroyRef
  ) {
    effect(() => {
      setTimeout(() => {
        this.verificarOverflow();
        this.verificarOverflowSidebar();
      }, 0);
    });
  }

  ngOnInit() {
    const token = localStorage.getItem('tokenUser');
    if (!token) {
      this.goBack();
    }
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
          return this.chatService.jwtTest(token);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((isValid: boolean) => {
        if (!isValid) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      });
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


  private verificarOverflowSidebar() {
    if (!this.nameAndSummaryInfo && !this.captionInfo) {
      return;
    }

    this.isOverflowingInfo.set(false);

    if (this.nameAndSummaryInfo && this.captionInfo) {
      const larguraCaixa = this.nameAndSummaryInfo.nativeElement.clientWidth;
      const larguraTexto = this.captionInfo.nativeElement.scrollWidth;

      this.isOverflowingInfo.set(larguraTexto > larguraCaixa);
    }
  }

  public showSkeletonLoading(): void {
    this.IsShowSkeleton.set(!this.IsShowSkeleton());
  }

  public openSidebar(): void {
    this.showSidebar.set(true);
    this.sideBarExit.set(false);

    setTimeout(() => {
    this.verificarOverflowSidebar();
    }, 800);
  }

  public closeSidebar(): void {
    this.sideBarExit.set(true);

    setTimeout(() => {
      this.showSidebar.set(false);
    }, 400);
  }

  public onLlmTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.llmType.set(select.value as 'OLLAMA' | 'GROQ');
  }

  public goBack(): void {
    window.location.href = '/login';
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
    const token = localStorage.getItem('tokenUser');

    if (!this.dontShowSkeleton()) {
      this.showSkeletonLoading();
    }

    this.chatService.jwtTest(token).then((isValid) => {
      console.log('Token is valid:', isValid);
      if (!isValid) {
        window.location.href = '/login';
      }
    });
    this.scrollToBottom();

    if (this.showModal) {
      this.closeModalInfo();
    }

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

            this.chatService.summarize().then((summary) => {
              this.summaryText.set(summary);

              setTimeout(() => {
                if (!this.dontShowSkeleton()) {
                  this.showSkeletonLoading();
                  this.dontShowSkeleton.set(true);

                  setTimeout(() => {
                  this.verificarOverflow();
                  }, 500);
                }
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
  }

  public goTolinkedin(): void {
    window.open('https://www.linkedin.com/in/leonamlucius/', '_blank');
  }

  public goToGithub(): void {
    window.open('https://github.com/leonamlucius', '_blank');
  }

  public createModalInfo(): void {
    this.showModal = true;
  }

  public closeModalInfo(): void {
    this.showModal = false;
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
