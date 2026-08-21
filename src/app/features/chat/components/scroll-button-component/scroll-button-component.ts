import { Component, inject } from '@angular/core';
import {
  selectChatHistory,
  selectSearchTerm,
  selectSelectedMessages,
  selectToggleScrollButton,
} from '../../states/chat-ui-selectors';
import { Store } from '@ngrx/store';
import { NgFor, NgIf, NgClass } from '@angular/common';
@Component({
  selector: 'app-scroll-button-component',
  imports: [ScrollButtonComponent, NgClass],
  templateUrl: './scroll-button-component.html',
  styleUrls: ['./scroll-button-component.scss'],
})
export class ScrollButtonComponent {
  private store = inject(Store);

  protected showScrollButton = this.store.selectSignal(
    selectToggleScrollButton
  );

  public scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector(
        '.chat-container'
      ) as HTMLElement;
      if (chatContainer) {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: 'auto',
        });
      }
    }, 100);
  }
}
