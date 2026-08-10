import {
  Component,
  signal,
  OnInit,
  ViewChild,
  ElementRef,
  DestroyRef,
  effect,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { MenuService } from '../../services/menu-service';
import { SearchComponent } from '../search-component/search-component';
import { WarningComponent } from '../../../shared/components/warning-component/warning-component';
import { Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-menu',
  imports: [NgIf, NgClass, FormsModule, WarningComponent, SearchComponent],
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

  @Input() isInitialized = signal(false);

  @Input() chatHistory = signal<
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

  @Input() searchTerm = signal('');

  @Input() showButton = signal(false);

  @Input() selectedMessages = signal<number[]>([]);

  private searchSubject$ = new Subject<string>();

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.menuService.getUserInfo().then((userInfo) => {
      if (userInfo) {
        this.userName.set(userInfo.name || '');
        this.userEmail.set(userInfo.email || '');
        this.userDate.set(this.formatDate(userInfo.createdAt) || '');
      }
    });
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

    const sidebarOverlay = document.querySelector(
      '.side-bar-overlay'
    ) as HTMLElement;

    

    if (sidebarOverlay.classList.contains('close')) {
      sidebarOverlay.classList.remove('close');
      
    }

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
