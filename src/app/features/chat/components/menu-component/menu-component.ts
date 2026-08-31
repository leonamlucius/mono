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
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { MenuService } from '../../services/menu-service';
import { TextToSpeechService } from '../../../../core/services/text-to-speech.service';
import { SearchComponent } from '../../../../shared/components/search-component/search-component';
import { WarningComponent } from '../../../../shared/components/warning-component/warning-component';
import { Subject } from 'rxjs';
import { selectChatHistory, selectSelectedMessages } from '../../states/chat-ui-selectors';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-menu',
  imports: [
    NgIf,
    NgClass,
    NgFor,
    FormsModule,
    WarningComponent,
    SearchComponent,
  ],
  templateUrl: './menu-component.html',
  styleUrls: ['./menu-component.scss'],
})
export class MenuComponent implements OnInit {
  public vozes = [
    {
      title: 'Voz A',
      name: 'Cadu',
    },
    {
      title: 'Voz B',
      name: 'Faber',
    },
  ];
  public showModalInfo = signal(false);

  public activeModal = signal<'info' | 'perfil' | 'settings' | null>(null);

  public showSidebar = signal(false);

  public showIconSound = signal<number | null>(null);

  public sideBarExit = signal(false);

  public isOverflowingInfo = signal(false);

  public userName = signal('');

  public userEmail = signal('');
  public userDate = signal('');

  public editName = signal(false);

  public showLoading = signal<boolean>(false);

  @Input() isInitialized = signal(false);

  private store = inject(Store);

  protected chatHistory = this.store.selectSignal(selectChatHistory);

  @ViewChild('nameAndSummaryInfo')
  nameAndSummaryInfo!: ElementRef<HTMLDivElement>;

  @ViewChild('captionInfo') captionInfo!: ElementRef<HTMLSpanElement>;

  @ViewChild(WarningComponent) warning!: WarningComponent;

  public summaryText = signal(
    'Bem vindo ao Mono, ' + (localStorage.getItem('name') + '!' || '')
  );

  public lastSearchIndex = signal(-1);

  @Input() showButton = signal(false);

  @Input() selectedMessages = this.store.selectSignal(selectSelectedMessages);

  private searchSubject$ = new Subject<string>();

  constructor(
    private menuService: MenuService,
    private textToSpeechService: TextToSpeechService
  ) {}

  ngOnInit(): void {
    this.menuService.getUserInfo().then((userInfo) => {
      if (userInfo) {
        this.userName.set(userInfo.name || '');
        this.userEmail.set(userInfo.email || '');
        this.userDate.set(this.formatDate(userInfo.createdAt) || '');
      }
    });
  }

  public changeVoice(voiceName: string, index: number): void {
    this.showIconSound.set(index);
    this.store.dispatch({
      type: '[Chat UI] Set Voice Selected',
      voiceSelected: voiceName.toLowerCase(),
    });

    this.textToSpeechService.speak(
      `Olá! A voz do Mono foi alterada para ${voiceName}.`
    ).then(() => {
      this.showIconSound.set(null);
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
    this.sideBarExit.set(false);

    this.showSidebar.set(true);

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

  public createModalSettings(): void {
    if (this.activeModal() === 'settings') {
      this.activeModal.set(null);
      return;
    }
    this.activeModal.set('settings');
  }

  public closeModal(): void {
    this.activeModal.set(null);
  }
}
