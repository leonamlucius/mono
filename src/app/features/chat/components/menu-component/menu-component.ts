import {
  Component,
  signal,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  DestroyRef,
  effect,
  Input,
  Output,
  inject,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { MenuService } from '../../services/menu-service';
import { TextToSpeechService } from '../../../../core/services/text-to-speech.service';
import { SearchComponent } from '../../../../shared/components/search-component/search-component';
import { WarningComponent } from '../../../../shared/components/warning-component/warning-component';
import { TimelineComponent } from '../timeline-component/timeline-component';
import { Subject } from 'rxjs';
import {
  selectChatHistory,
  selectSelectedMessages,
} from '../../states/chat-ui-selectors';
import { Store } from '@ngrx/store';
import WaveSurfer from 'wavesurfer.js';

@Component({
  selector: 'app-menu',
  imports: [
    NgIf,
    NgClass,
    NgFor,
    FormsModule,
    WarningComponent,
    SearchComponent,
    TimelineComponent,
  ],
  templateUrl: './menu-component.html',
  styleUrls: ['./menu-component.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {
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

  public activeModal = signal<
    'info' | 'perfil' | 'settings' | 'timeline' | null
  >(null);

  public showSidebar = signal(false);

  public showIconSound = signal<number | null>(null);

  public showSkeleton = signal<number | null>(null);

  public showChecked = signal<number | null>(0);

  public sideBarExit = signal(false);

  public isOverflowingInfo = signal(false);

  public userName = signal('');

  public userEmail = signal('');

  public userDate = signal('');

  public editName = signal(false);

  public showLoading = signal<boolean>(false);

  private waveSurfers: Array<WaveSurfer | null> = [];
  private audioUrls: Array<string | null> = [];

  @ViewChildren('waveformContainerMenu') waveformContainers!: QueryList<
    ElementRef<HTMLDivElement>
  >;

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

  ngOnDestroy(): void {
    this.waveSurfers.forEach((waveSurferInstance) => {
      waveSurferInstance?.destroy();
    });

    this.audioUrls.forEach((audioUrl) => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    });
    this.waveSurfers = [];
    this.audioUrls = [];
  }

  public initializeWaveformMenu(index: number): WaveSurfer | null {
    const container = this.waveformContainers?.toArray()[index];
    if (!container) {
      console.error('Waveform container not found for index:', index);
      return null;
    }

    if (!this.waveSurfers[index]) {
      this.waveSurfers[index] = null;
    }

    this.waveSurfers[index]?.destroy();

    const waveformContainer = container.nativeElement;

    const waveSurferInstance = WaveSurfer.create({
      container: waveformContainer,
      interact: false,
      waveColor: '#4a4a4a',
      progressColor: '#f95903',
      height: 50,
      barWidth: 3,
      barGap: 3,
      barRadius: 3,
      normalize: true,
    });

    this.waveSurfers[index] = waveSurferInstance;
    return waveSurferInstance;
  }
  public changeVoice(voiceName: string, index: number): any {
    this.showIconSound.set(index);
    this.showChecked.set(index);
    this.store.dispatch({
      type: '[Chat UI] Set Voice Selected',
      voiceSelected: voiceName.toLowerCase(),
    });

    this.textToSpeechService
      .speakMute(
        `Olá! A voz do Mono foi alterada para ${voiceName}.`,
        voiceName.toLowerCase()
      )
      .then((res) => {
        this.waveSurfers[index]?.play().then(() => {});
      });

    this.waveSurfers[index]?.once('finish', () => {
      this.waveSurfers[index]?.seekTo(0);
      this.showIconSound.set(null);
      this.showChecked.set(null);
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

  public createModalTimeline(): void {
    if (this.activeModal() === 'timeline') {
      this.activeModal.set(null);
      return;
    }
    this.activeModal.set('timeline');
  }

  public createModalSettings(): void {
    if (this.activeModal() === 'settings') {
      this.activeModal.set(null);
      return;
    }
    this.activeModal.set('settings');

    setTimeout(async () => {
      for (const [index, voz] of this.vozes.entries()) {
        this.showSkeleton.set(index);
        const waveSurfer = this.initializeWaveformMenu(index);

        if (!waveSurfer) {
          continue;
        }

        const blob = await this.textToSpeechService.speakMute(
          `Olá! A voz do Mono foi alterada para ${voz.name}.`,
          voz.name
        );

        if (!blob.size) {
          console.warn(`Áudio vazio para ${voz.name}`);
          continue;
        }
        const audioUrl = URL.createObjectURL(blob);
        this.audioUrls[index] = audioUrl;

        waveSurfer.load(audioUrl);
        this.showSkeleton.set(null);
      }
    }, 0);
  }

  public closeModal(): void {
    this.activeModal.set(null);
  }
}
