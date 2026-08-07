import {
  Component,
  signal,
  OnInit,
  ViewChild,
  ElementRef,
  DestroyRef,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { MenuService } from '../../services/menu-service';
import { WarningComponent } from '../../../shared/components/warning-component/warning-component';
import { Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-menu',
  imports: [NgIf, NgClass, FormsModule, WarningComponent],
  templateUrl: './menu-component.html',
  styleUrls: ['./menu-component.scss'],
})
export class MenuComponent implements OnInit {
  public showModalInfo = signal(false);

  public activeModal = signal<'info' | 'perfil' | null>(null);

  public showSidebar = signal(false);

  public sideBarExit = signal(false);

  public isOverflowingInfo = signal(false);

  public userName = signal('');

  public userEmail = signal('');
  public userDate = signal('');

  public editName = signal(false);

  public showLoading = signal<boolean>(false);

  public isInitialized = signal(false);

  public chatHistory = signal<
    {
      text: string;
      sendBy: 'User' | 'Bot';
      loading: boolean;
      llmType?: 'OLLAMA' | 'GROQ' | 'ERROR';
    }[]
  >([]);

  @ViewChild('nameAndSummaryInfo')
  nameAndSummaryInfo!: ElementRef<HTMLDivElement>;

  @ViewChild('captionInfo') captionInfo!: ElementRef<HTMLSpanElement>;

  @ViewChild(WarningComponent) warning!: WarningComponent;

  public summaryText = signal(
    'Bem vindo ao Mono, ' + (localStorage.getItem('name') + '!' || '')
  );

  public lastSearchIndex = signal(-1);

  public searchTerm = signal('');

  public selectedMessages = signal<number[]>([]);

  private searchSubject$ = new Subject<string>();

  constructor(
    private menuService: MenuService,
    private destroyRef: DestroyRef
  ) {
    this.searchSubject$
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.performSearch();
      });
  }

  ngOnInit(): void {
    this.menuService.getUserInfo().then((userInfo) => {
      if (userInfo) {
        this.userName.set(userInfo.name || '');
        this.userEmail.set(userInfo.email || '');
        this.userDate.set(this.formatDate(userInfo.createdAt) || '');
      }
    });
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

    setTimeout(() => {
      this.disableMessageHighlighting();
    }, 3000);
  }

  public clearSearch(): void {
    this.lastSearchIndex.set(-1);
    const searchInput = document.querySelector(
      '.search-container input'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
    this.searchTerm.set('');

    const chatContainer = document.querySelector(
      '.chat-container'
    ) as HTMLElement;

    const messageElements = chatContainer.querySelectorAll('.message');

    messageElements.forEach((messageElement) => {
      const targetElement = messageElement as HTMLElement;
      targetElement.style.boxShadow = '';
    });
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
      return;
    }

    let filterMessages = this.chatHistory().filter((item) =>
      item.text.toLowerCase().includes(this.searchTerm())
    );

    if (filterMessages.length === 0) {
      this.warning.openModal('Nenhum resultado encontrado');
      this.disableMessageHighlighting();
      this.scrollToBottom();
      return;
    }

    console.log('Filtered messages:', filterMessages);

    if (filterMessages.length > 0) {
      const newIndices: number[] = [];
      filterMessages.forEach((item) => {
        const index = this.chatHistory().indexOf(item);
        newIndices.push(index);
      });
      this.selectedMessages.set(newIndices);
    }
    this.scrollToMessage(this.selectedMessages());
    this.closeSidebar();
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

  public showLoadingIndicator(): void {
    this.showLoading.set(true);
  }

  public hideLoadingIndicator(): void {
    this.showLoading.set(false);
  }

  public async onSubmit(name: string) {
    this.showLoadingIndicator();
    if (!this.editName()) {
      this.hideLoadingIndicator();
      return;
    }

    try {
      await this.menuService.patchUserInfo(name).then((updatedUserInfo) => {
        if (updatedUserInfo) {
          if (updatedUserInfo === 'No name provided') {
            this.warning.openModal('Por favor, insira um nome válido.');
            this.hideLoadingIndicator();
            return;
          }
          this.warning.openModal(
            'Atualização do nome foi realizada com sucesso!'
          );
          this.editName.set(false);

          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      });
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  }
  public formatDate(dateString: string): string {
    return dateString.split('T')[0];
  }

  public startEditName() {
    this.editName.set(!this.editName());
  }

  public verificarOverflowSidebar() {
    if (!this.nameAndSummaryInfo && !this.captionInfo) {
      return;
    }

    this.isOverflowingInfo.set(false);

    if (this.nameAndSummaryInfo && this.captionInfo) {
      const larguraCaixa = this.nameAndSummaryInfo.nativeElement.clientWidth;
      const larguraTexto = this.captionInfo.nativeElement.scrollWidth;

      this.isOverflowingInfo.set(larguraTexto > larguraCaixa);
    }
  }
  public openSidebar(): void {
    this.showSidebar.set(true);
    this.sideBarExit.set(false);

    setTimeout(() => {
      this.verificarOverflowSidebar();
    }, 800);
  }

  public closeSidebar(): void {
    this.sideBarExit.set(true);

    setTimeout(() => {
      this.showSidebar.set(false);
    }, 400);
  }

  public createModalInfo(): void {
    if (this.activeModal() === 'info') {
      this.activeModal.set(null);
      return;
    }

    this.activeModal.set('info');
  }

  public createModalPerfil(): void {
    if (this.activeModal() === 'perfil') {
      this.activeModal.set(null);
      return;
    }
    this.activeModal.set('perfil');
  }

  public closeModal(): void {
    this.activeModal.set(null);
  }
}
