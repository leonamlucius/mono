import { Component, Input, signal, effect, Output, EventEmitter } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
@Component({
  selector: 'app-filter-button-component',
  imports: [NgIf, NgClass],
  templateUrl: './filter-button-component.html',
  styleUrls: ['./filter-button-component.scss'],
})
export class FilterButtonComponent {
  @Input() selectedMessages = signal<number[]>([]);

   @Output() navigationOccurred = new EventEmitter<void>();
  public index = signal(-1);

  constructor() {
    effect(() => {
      const messages = this.selectedMessages();
      if (messages.length > 0) {
        this.index.set(-1);

        this.disableMessageHighlighting();
      }
    });
  }

  public goingUp() {
    const messages = this.selectedMessages();

    if (messages.length === 0) return;

    this.disableMessageHighlighting();

    if (this.index() === -1) {
      this.index.set(0);
      console.log('Primeira navegação - indo para o primeiro item');
    } else if (this.index() >= messages.length - 1) {
      this.index.set(0);
      console.log('Voltou para o primeiro item');
    } else {
      this.index.set(this.index() + 1);
      console.log('Indo para próximo');
    }

    const currentMessage = messages[this.index()];
    console.log('Valor no índice:', currentMessage);
    this.scrollToMessageAndHighlight([currentMessage]);
    this.navigationOccurred.emit();
  }

  public goingDown() {
    const messages = this.selectedMessages();

    if (messages.length === 0) return;

    this.disableMessageHighlighting();

    if (this.index() === -1) {
      this.index.set(0);
      console.log('Primeira navegação - indo para o primeiro item');
    } else if (this.index() <= 0) {
      this.index.set(messages.length - 1);
      console.log('Voltou para o último item');
    } else {
      this.index.set(this.index() - 1);
      console.log('Indo para anterior');
    }

    const currentMessage = messages[this.index()];
    console.log('Valor no índice:', currentMessage);
    this.scrollToMessageAndHighlight([currentMessage]);
    this.navigationOccurred.emit();
  }

  private scrollToMessageAndHighlight(index: number[]): void {
    console.log('Scrolling to message at index:', index);
    setTimeout(() => {
      const chatContainer = document.querySelector(
        '.chat-container'
      ) as HTMLElement;

      if (!chatContainer) {
        return;
      }

      const messageElements = chatContainer.querySelectorAll('.message');

      if (messageElements.length > 0 && index.length > 0) {
        const targetElement = messageElements[index[0]] as HTMLElement;

        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        targetElement.style.boxShadow = '0 0 0 2px yellow';
      }
    }, 100);
  }

  public disableMessageHighlighting(): void {
    const chatContainer = document.querySelector(
      '.chat-container'
    ) as HTMLElement;

    if (!chatContainer) return;

    const messageElements = chatContainer.querySelectorAll('.message');

    messageElements.forEach((messageElement) => {
      const targetElement = messageElement as HTMLElement;
      targetElement.style.boxShadow = '';
    });
  }
}
