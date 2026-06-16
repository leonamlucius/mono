import { Component, signal, Input} from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { RouterOutlet, ɵEmptyOutletComponent } from '@angular/router';
import {BodyComponent} from "./body-component/body-component";
import {InputComponent} from "./input-component/input-component";
import { Subject } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { featherAirplay } from '@ng-icons/feather-icons';
import { heroUsers } from '@ng-icons/heroicons/outline';
import { bootstrapLinkedin, bootstrapGithub } from '@ng-icons/bootstrap-icons';
import { ServiceAi } from './shared/service-ai';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BodyComponent, InputComponent, ɵEmptyOutletComponent, NgIf, NgClass, NgIcon],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  providers: [provideIcons({ featherAirplay, heroUsers, bootstrapLinkedin, bootstrapGithub })]
})
export class App {
  protected readonly title = signal('mono');

  public isInitialized = signal(false);


  public chatHistory = signal<{ text: string, sendBy: 'User' | 'Bot', loading: boolean }[]>([]);

  public isTypeSomething = signal(false);

  public textoValue = signal('');

  public showModal = false;

  public modalErrorText = '';

  public showModalError = false;

  private modalTimer: any;

  public isClosingModal = signal(false);

  

  constructor(private serviceAi: ServiceAi) {}



  public mostrarModalErroAutomatico(texto: string): void {

    console.log('Mostrando modal de erro automático:', texto);

    if (this.modalTimer) {
      clearTimeout(this.modalTimer);
    }


    this.isClosingModal.set(false);
    this.modalErrorText = texto;
    this.showModalError = true;


    const tempoVisivel = 5000; // Tempo que o modal ficará visível

    this.modalTimer = setTimeout(() => {
      this.fecharModalCOmAnimacao();
    }, tempoVisivel);

    
  }
  public triggerCloseModalError(modalElement: HTMLElement | null): void {
    if (modalElement) {
      clearTimeout(this.modalTimer);
    }
    this.fecharModalCOmAnimacao();
  }
  
 
  public fecharModalCOmAnimacao(): void {
    this.isClosingModal.set(true);

    setTimeout(() => {
      this.showModalError = false;
      this.isClosingModal.set(false);
    }, 900); // Tempo para a animação de fechamento (ajuste conforme necessário)
  }
  public scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-container') as HTMLElement;
      if (chatContainer) {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: 'smooth'
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
  public iniciar(buttonEnviar: HTMLButtonElement): void {

    buttonEnviar.classList.add('disabled');

    const textArea = document.querySelector('textarea');
    

    if (!this.isTypeSomething()){
      this.mostrarModalErroAutomatico('Digite algo para iniciar a conversa');
      buttonEnviar.classList.remove('disabled');
      return;
    }

    this.chatHistory.set([...this.chatHistory(), { text: this.textoValue(), sendBy: 'User', loading: false }]);
    this.chatHistory.set([...this.chatHistory(), { text: '', sendBy: 'Bot', loading: true }]);

    try{

      if(this.textoValue().trim() === ''){
        this.mostrarModalErroAutomatico('Digite algo para continuar a conversa');
        buttonEnviar.classList.remove('disabled');
        this.chatHistory.set(this.chatHistory().slice(0, -2));
        return;
      }
      
      this.serviceAi.sendMessage(this.textoValue())
        .then(response => {

          this.limparEResetar(textArea as HTMLTextAreaElement);

          setTimeout(() => {
             console.log('Response:', response);
            this.chatHistory.set([...this.chatHistory().slice(0, -1), { text: response, sendBy: 'Bot', loading: false }]);
            console.log('Chat History:', this.chatHistory());
            buttonEnviar.classList.remove('disabled');
            this.scrollToBottom();
          }, 500);
          
        });
    }catch(error){
      this.scrollToBottom();
      console.error('Error:', error);
      buttonEnviar.classList.remove('disabled');
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
}
