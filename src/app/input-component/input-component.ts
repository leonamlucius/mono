import {
  Component,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  signal,
  effect,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ChatComponent } from '../chat-component/chat-component';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';
import { AudioRecordingService } from '../shared/audio-recording.service';

@Component({
  selector: 'app-input-component',
  imports: [FormsModule, NgIf],
  templateUrl: './input-component.html',
  styleUrls: ['./input-component.scss'],
})
export class InputComponent implements OnDestroy {
  @Output() textoChange = new EventEmitter<boolean>();
  @Output() textoValue = new EventEmitter<string>();
  @Output() llmType = new EventEmitter<'OLLAMA' | 'GROQ'>();
  @ViewChild('meuTextarea') meuTextarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('waveformContainer')
  waveformContainer!: ElementRef<HTMLDivElement>;
  private waveSurfer: WaveSurfer | null = null;
  private recordPlugin: RecordPlugin | null = null;
  public showLoading = signal(false);
  public micIsON = signal(false);
  public micValue = '';
  private jaEnviou = false;

  constructor(
    private chatComponent: ChatComponent,
    private audioRecordingService: AudioRecordingService
  ) {
    effect(() => {
      const transcricao = this.audioRecordingService.textTranscription();

      if (transcricao) {
        this.micValue = transcricao.trim();

        if (this.micValue.length > 0) {
          this.micValue =
            this.micValue.charAt(0).toUpperCase() + this.micValue.slice(1);

          // Emite os eventos para notificar o componente pai
          this.textoValue.emit(this.micValue);
          this.textoChange.emit(true);

          console.log('📝 Transcrição recebida:', this.micValue);

          if (!this.micIsON() && !this.jaEnviou) {
            console.log('✅ Enviando automaticamente...');
            this.jaEnviou = true;
            setTimeout(() => {
              this.sendText();
            }, 100);
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.recordPlugin?.destroy();
    this.waveSurfer?.destroy();
    this.waveSurfer = null;
    this.recordPlugin = null;
  }
  public initializeWaveform(): void {
    if (!this.waveformContainer?.nativeElement) {
      console.error('Waveform container não encontrado');
      return;
    }

    if (this.waveSurfer) {
      return; // Já foi inicializado
    }
    // 1. Inicializa o Wavesurfer básico apontando para a nossa div
    this.waveSurfer = WaveSurfer.create({
      container: this.waveformContainer.nativeElement,
      waveColor: '#4a4a4a', // Cor da linha guia de fundo
      progressColor: '#00ff80', // Verde Mono do progresso
      height: 50,
      barWidth: 3, // Efeito moderno de barrinhas separadas
      barGap: 3, // Espaçamento entre as barrinhas
      barRadius: 3,
    });

    // 2. Inicializa e conecta o Plugin de Gravação (Microfone)
    this.recordPlugin = this.waveSurfer.registerPlugin(
      RecordPlugin.create({
        scrollingWaveform: true, // A onda vai correndo para o lado enquanto você fala
        renderRecordedAudio: false, // Não precisa re-renderizar o áudio estático por cima ao parar
      })
    );
  }

  public recordingMic() {
    if (this.audioRecordingService.estaGravando()) {
      this.audioRecordingService.pararGravacao();
      this.micIsON.set(false);
      this.recordPlugin?.stopRecording();

      this.showLoadingIndicator();
    } else {
      this.micIsON.set(true);
      this.jaEnviou = false;

      setTimeout(() => {
        this.initializeWaveform();
        this.recordPlugin?.startRecording();
        this.audioRecordingService.iniciarGravacao();
      }, 0);
    }
  }

  public cancelRecording() {
    this.micIsON.set(false);

    if (this.audioRecordingService.estaGravando()) {
      this.audioRecordingService.cancelarGravacao();
      this.recordPlugin?.stopRecording();
    }
  }
  showLoadingIndicator() {
    this.showLoading.set(true);
  }

  hideLoadingIndicator() {
    this.showLoading.set(false);
  }

  public onInput(textarea: HTMLTextAreaElement) {
    const valor = textarea.value;

    this.textoValue.emit(valor);
    this.textoChange.emit(valor.trim().length > 0);

    textarea.style.height = 'auto';
    textarea.style.position = 'relative';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  public changeLlmType(selectedType: HTMLSelectElement): void {
    this.llmType.emit(selectedType.value as 'OLLAMA' | 'GROQ');

    console.log('Tipo de LLM selecionado:', selectedType.value);
  }

  public async sendText(): Promise<void> {
    if (this.micValue.trim().length === 0) {
      this.showLoadingIndicator();
    }
    try {
      await this.chatComponent.iniciar();
    } catch (error) {
      console.error('Erro ao enviar o texto:', error);
    } finally {
      this.hideLoadingIndicator();
    }
  }

  public limparEResetar() {
    if (this.meuTextarea) {
      const textarea = this.meuTextarea.nativeElement;
      textarea.value = '';
      textarea.style.height = 'auto'; // Reseta a altura para o min-height do CSS

      // Notifica o pai que o texto agora está vazio
      this.textoValue.emit('');
      this.textoChange.emit(false);
    }
  }
}
