import { Component, Output, EventEmitter, signal } from '@angular/core';
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

  
public onInput(event: Event) {
  const valor = (event.target as HTMLTextAreaElement).value;

  this.textoValueChange.emit(valor);
  this.textoChange.emit(valor.trim().length > 0);
}
}
