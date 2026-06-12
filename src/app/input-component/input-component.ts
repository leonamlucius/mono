import { Component, Output, EventEmitter, ViewChild , ElementRef} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-component',
  imports: [FormsModule],
  templateUrl: './input-component.html',
  styleUrls: ['./input-component.scss'],
})
export class InputComponent {
  @Output() textoChange = new EventEmitter<boolean>();
  @Output() textoValueChange = new EventEmitter<string>();
  @ViewChild('meuTextarea') meuTextarea!: ElementRef<HTMLTextAreaElement>;

  
public onInput(textarea: HTMLTextAreaElement) {
  const valor = textarea.value;

  this.textoValueChange.emit(valor);
  this.textoChange.emit(valor.trim().length > 0);

  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';

  

}


public limparEResetar() {
    if (this.meuTextarea) {
      const textarea = this.meuTextarea.nativeElement;
      textarea.value = '';
      textarea.style.height = 'auto'; // Reseta a altura para o min-height do CSS
      
      // Notifica o pai que o texto agora está vazio
      this.textoValueChange.emit('');
      this.textoChange.emit(false);
    }
  }
}
