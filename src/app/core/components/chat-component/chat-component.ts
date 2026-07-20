import { Component, signal, ViewChild } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { BodyComponent } from '../../../core/components/body-component/body-component';
import { InputComponent } from '../../../core/components/input-component/input-component';
import { Subject } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { featherAirplay } from '@ng-icons/feather-icons';
import { heroUsers } from '@ng-icons/heroicons/outline';
import { bootstrapLinkedin, bootstrapGithub } from '@ng-icons/bootstrap-icons';
import { ChatService } from '../../services/chat-service';
import { Warning } from '../../../shared/components/warning/warning';

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

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    const token = localStorage.getItem('tokenUser');
    if (!token) {
      this.goBack();
    }

    this.chatService.jwtTest(token).then((isValid) => {
      if (!isValid) {
        window.location.href = '/login';
      }
    });
  }

  public openSidebar(): void {
    this.showSidebar.set(true);
    this.sideBarExit.set(false);
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
