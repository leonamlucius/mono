import { Component, signal} from '@angular/core';
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

  constructor(private serviceAi: ServiceAi) {}



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
      
    
  }
  public iniciar(): void {

    const textArea = document.querySelector('textarea');
    
    this.limparEResetar(textArea as HTMLTextAreaElement);

    if (!this.isTypeSomething()){
      alert('Digite algo para iniciar a conversa');
      return;
    }

    this.chatHistory.set([...this.chatHistory(), { text: this.textoValue(), sendBy: 'User', loading: false }]);
    this.chatHistory.set([...this.chatHistory(), { text: '', sendBy: 'Bot', loading: true }]);

    try{
      this.serviceAi.sendMessage(this.textoValue())
        .then(response => {
          console.log('Response:', response);
          this.chatHistory.set([...this.chatHistory().slice(0, -1), { text: response, sendBy: 'Bot', loading: false }]);

          console.log('Chat History:', this.chatHistory());

          this.scrollToBottom();
        });
    }catch(error){
      this.scrollToBottom();
      console.error('Error:', error);
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
