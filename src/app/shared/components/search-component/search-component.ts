import {
  Component,
  signal,
  ViewChild,
  Input,
  DestroyRef,
  inject,
  Output,
  EventEmitter,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WarningComponent } from '../warning-component/warning-component';
import { FilterButtonComponent } from '../filter-button-component/filter-button-component';

@Component({
  selector: 'app-search-component',
  imports: [NgIf, WarningComponent, FilterButtonComponent],
  templateUrl: './search-component.html',
  styleUrls: ['./search-component.scss'],
})
export class SearchComponent {
  public lastSearchIndex = signal(-1);

  @Input() searchTerm = signal('');

  @Input() showButton = signal(false);

  @Input() selectedMessages = signal<number[]>([]);

  private searchSubject$ = new Subject<string>();

  @Output() showSidebarSignal = new EventEmitter<boolean>();

  @Output() sideBarExitSignal = new EventEmitter<boolean>();

  constructor(private destroyRef: DestroyRef) {
    this.searchSubject$
      .pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.performSearch();
      });
  }

  @ViewChild(WarningComponent) warning!: WarningComponent;

  @Input() chatHistory = signal<
    {
      text: string;
      sendBy: 'User' | 'Bot';
      loading: boolean;
      llmType?: 'OLLAMA' | 'GROQ' | 'ERROR';
    }[]
  >([]);

  public closeSidebarOnNavigation(): void {
    this.sideBarExitSignal.emit(true);
    setTimeout(() => {
      this.showSidebarSignal.emit(false);
    }, 400);
  }

  public showButtons(): void {
    this.showButton.set(true);
  }

  public hideButtons(): void {
    this.showButton.set(false);
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
  public disableMessageHighlighting(): void {
    const chatContainer = document.querySelector(
      '.chat-container'
    ) as HTMLElement;

    const messageElements = chatContainer.querySelectorAll('.message');

    messageElements.forEach((messageElement) => {
      const targetElement = messageElement as HTMLElement;
      targetElement.style.boxShadow = '';
    });
  }

  public makeMessageHighlighted(index: number[]): void {
    const chatContainer = document.querySelector(
      '.chat-container'
    ) as HTMLElement;
    const messageElements = chatContainer.querySelectorAll('.message');

    index.forEach((i) => {
      if (messageElements[i]) {
        const targetElement = messageElements[i] as HTMLElement;
        targetElement.style.boxShadow = '0 0 0 2px yellow';
        targetElement.style.transition = 'box-shadow 0.3s ease';
      }
    });
  }

  public clearSearch(): void {
    this.hideButtons();
    this.lastSearchIndex.set(-1);
    this.searchTerm.set('');
    this.selectedMessages.set([]);

    const chatContainer = document.querySelector(
      '.chat-container'
    ) as HTMLElement;

    if (chatContainer) {
      const messageElements = chatContainer.querySelectorAll('.message');
      messageElements.forEach((messageElement) => {
        const targetElement = messageElement as HTMLElement;
        targetElement.style.boxShadow = '';
      });
    }
  }

  private scrollToMessage(index: number[]): void {
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

        this.makeMessageHighlighted(index);
      }
    }, 100);
  }

  public search(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value.toLowerCase().trim());

    console.log('Search term:', this.searchTerm());

    this.searchSubject$.next(this.searchTerm());
  }

  public performSearch(): void {
    this.disableMessageHighlighting();
    this.selectedMessages.set([]);

    if (!this.searchTerm()) {
      this.lastSearchIndex.set(-1);
      this.selectedMessages.set([]);
      this.disableMessageHighlighting();
      this.scrollToBottom();
      this.hideButtons();
      return;
    }

    let filterMessages = this.chatHistory().filter((item) =>
      item.text.toLowerCase().includes(this.searchTerm())
    );

    if (filterMessages.length === 0) {
      this.warning.openModal('Nenhum resultado encontrado');
      this.disableMessageHighlighting();
      this.scrollToBottom();
      this.hideButtons();
      return;
    }

    console.log('Filtered messages:', filterMessages);

    if (filterMessages.length > 0) {
      this.showButtons();
      const newIndices: number[] = [];
      filterMessages.forEach((item) => {
        const index = this.chatHistory().indexOf(item);
        newIndices.push(index);
      });
      this.selectedMessages.set(newIndices);
    }
    this.scrollToMessage(this.selectedMessages());
    this.sideBarExitSignal.emit(true);
    setTimeout(() => {
      this.showSidebarSignal.emit(false);
    }, 400);
  }
}
