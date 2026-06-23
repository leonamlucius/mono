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

  public chatHistory = signal<{ text: string, sendBy: 'User' | 'Bot', loading: boolean , llmType?: 'OLLAMA' | 'GROQ' }[]>([]);

  public isTypeSomething = signal(false);

  public textoValue = signal('');

  public textValueSend = signal('');

  public showModal = false;

  public showModalErrorPai = signal(false);

  public isClosingModalPai = signal(false);

  public modalErrorTextPai = '';

  private modalTimerPai: any;


  public llmType = signal<'OLLAMA' | 'GROQ'>('GROQ');
 

  
  constructor(private serviceAi: ServiceAi) {}


  

  public mostrarModalErroPai(texto: string): void {
  if (this.modalTimerPai) {
    clearTimeout(this.modalTimerPai);
  }

  this.isClosingModalPai.set(false);
  this.modalErrorTextPai = texto;
  this.showModalErrorPai.set(true);

  this.modalTimerPai = setTimeout(() => {
    this.fecharModalPaiComAnimacao();
  }, 5000);
}

public triggerCloseModalPai(): void {
  if (this.modalTimerPai) {
    clearTimeout(this.modalTimerPai);
  }
  this.fecharModalPaiComAnimacao();
}

private fecharModalPaiComAnimacao(): void {
  this.isClosingModalPai.set(true);
  setTimeout(() => {
    this.showModalErrorPai.set(false);
    this.isClosingModalPai.set(false);
  }, 500); // Tempo sincronizado com o CSS
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
  public async iniciar(): Promise<void> {
    this.scrollToBottom();

    if(this.showModal){
      this.closeModalInfo();
    }
   
    const textArea = document.querySelector('textarea');
    

    if (!this.isTypeSomething()){
      this.mostrarModalErroPai('Digite algo para iniciar a conversa');
     
     
      this.scrollToBottom();
      return;
    }

    this.chatHistory.set([...this.chatHistory(), { text: this.textoValue(), sendBy: 'User', loading: false }]);
    this.chatHistory.set([...this.chatHistory(), { text: '', sendBy: 'Bot', loading: true , llmType: this.llmType()}]);

    try{

      if(this.textoValue().trim() === ''){
        this.mostrarModalErroPai('Digite algo para continuar a conversa');
        this.chatHistory.set(this.chatHistory().slice(0, -2));
        this.scrollToBottom();
        return;
      }

       this.textValueSend.set(this.textoValue());
       this.limparEResetar(textArea as HTMLTextAreaElement);

       
       await this.serviceAi.sendMessage(this.textValueSend(), this.llmType())
        .then(response => {
          setTimeout(() => {
             console.log('Response:', response);
            this.chatHistory.set([...this.chatHistory().slice(0, -1), { text: response.message, sendBy: 'Bot', loading: false , llmType: response.model}]);
            console.log('Chat History:', this.chatHistory());
            
            this.scrollToBottom();
          }, 500);
          
        });
    }catch(error){
      this.scrollToBottom();
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
}
