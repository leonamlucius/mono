import { Component, Output, EventEmitter, ViewChild , ElementRef, signal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common'
import { App } from '../app';
import {ChatComponent} from '../chat-component/chat-component';

@Component({
  selector: 'app-input-component',
  imports: [FormsModule, NgIf],
  templateUrl: './input-component.html',
  styleUrls: ['./input-component.scss'],
})
export class InputComponent {
  @Output() textoChange = new EventEmitter<boolean>();
  @Output() textoValue = new EventEmitter<string>();
  @Output() llmType = new EventEmitter<'OLLAMA' | 'GROQ'>();
  @ViewChild('meuTextarea') meuTextarea!: ElementRef<HTMLTextAreaElement>;
  public showLoading = signal(false);

  constructor(private chatComponent: ChatComponent) {}

showLoadingIndicator() {
    this.showLoading.set(true);
  }

hideLoadingIndicator() {
    this.showLoading.set(false);
  }
public onInput(textarea: HTMLTextAreaElement) {
  const valor = textarea.value;

  this.textoValue.emit(valor);
  this.textoChange.emit(valor.trim().length > 0);

  textarea.style.height = 'auto';
  textarea.style.position = 'relative';
  textarea.style.height = textarea.scrollHeight + 'px';

}

public changeLlmType(selectedType: HTMLSelectElement): void {
  this.llmType.emit(selectedType.value as 'OLLAMA' | 'GROQ');

  console.log('Tipo de LLM selecionado:', selectedType.value);
} 


public async sendText(): Promise<void> {
  
  
  try {
    this.showLoadingIndicator();
    await this.chatComponent.iniciar();
    
  } catch (error) {
      console.error('Erro ao enviar o texto:', error)     
  } finally {
    this.hideLoadingIndicator();
  }
}

public limparEResetar() {
    if (this.meuTextarea) {
      const textarea = this.meuTextarea.nativeElement;
      textarea.value = '';
      textarea.style.height = 'auto'; // Reseta a altura para o min-height do CSS
      
      // Notifica o pai que o texto agora está vazio
      this.textoValue.emit('');
      this.textoChange.emit(false);
    }
  }
}
