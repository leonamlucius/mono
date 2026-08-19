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
import {
  selectChatHistory,
  selectSearchTerm,
  selectSelectedMessages,
  selectShowButton,
} from '../../../features/chat/states/chat-ui-selectors';
import { Store } from '@ngrx/store';
import { ChatUiActions } from '../../../features/chat/states/chat-ui.actions';

@Component({
  selector: 'app-search-component',
  imports: [NgIf, WarningComponent, FilterButtonComponent],
  templateUrl: './search-component.html',
  styleUrls: ['./search-component.scss'],
})
export class SearchComponent {
  public lastSearchIndex = signal(-1);

  private store = inject(Store);

  protected searchTerm = this.store.selectSignal(selectSearchTerm);

  protected showButton = this.store.selectSignal(selectShowButton);

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

  protected chatHistory = this.store.selectSignal(selectChatHistory);

  @ViewChild(WarningComponent) warning!: WarningComponent;

  public closeSidebarOnNavigation(): void {
    this.sideBarExitSignal.emit(true);
    setTimeout(() => {
      this.showSidebarSignal.emit(false);
    }, 400);
  }

  public showButtons(): void {
    this.store.dispatch(ChatUiActions.toggleFilterButton({ showButton: true }));
  }

  public hideButtons(): void {
    this.store.dispatch(
      ChatUiActions.toggleFilterButton({ showButton: false })
    );
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
      targetElement.classList.remove('highlighted');
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
        targetElement.classList.add('highlighted');
      }
    });
  }

  public clearSearch(): void {
    this.hideButtons();
    this.lastSearchIndex.set(-1);

    this.store.dispatch(ChatUiActions.clearSearchTerm({ searchTerm: '' }));
    this.store.dispatch(
      ChatUiActions.setSelectedMessage({ selectedMessages: [] })
    );

    this.disableMessageHighlighting();
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

    this.store.dispatch(
      ChatUiActions.setSearchTerm({
        searchTerm: input.value.toLowerCase().trim(),
      })
    );

    console.log('Search term:', this.store.selectSignal(selectSearchTerm));

    this.searchSubject$.next(this.searchTerm());
  }

  public performSearch(): void {
    this.disableMessageHighlighting();

    this.store.dispatch(
      ChatUiActions.setSelectedMessage({ selectedMessages: [] })
    );

    if (!this.searchTerm()) {
      this.lastSearchIndex.set(-1);
      this.store.dispatch(
        ChatUiActions.setSelectedMessage({ selectedMessages: [] })
      );
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
      this.store.dispatch(
        ChatUiActions.setSelectedMessage({ selectedMessages: newIndices })
      );
    }
    this.scrollToMessage(this.store.selectSignal(selectSelectedMessages)());
    this.sideBarExitSignal.emit(true);
    setTimeout(() => {
      this.showSidebarSignal.emit(false);
    }, 400);
  }
}
