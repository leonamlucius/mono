import { Injectable, signal } from '@angular/core';

declare const puter: any;

@Injectable({
  providedIn: 'root',
})
export class TextToSpeechService {
  private currentAudio?: HTMLAudioElement;
  public isSpeechEnabled = signal(true);

  public speechEnabled(): void {
    this.isSpeechEnabled.set(true);
  }

  public speechDisabled(): void {
    this.isSpeechEnabled.set(false);
  }

  public speak(text: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.speechDisabled();
      puter.quiet == true;
      puter.ai
        .txt2speech(text, {
          voice: 'Ricardo',
          engine: 'standard',
          language: 'pt-BR',
        })
        .then((audio: HTMLAudioElement) => {
          this.currentAudio = audio;

          audio.onended = () => {
            this.currentAudio = undefined;
            this.speechEnabled();
            resolve(true);
          };

          audio.onerror = (error) => {
            console.error('Erro na reprodução do áudio:', error);
            this.currentAudio = undefined;
            this.speechEnabled();
            resolve(false);
          };

          audio.play().catch((error) => {
            console.error('Erro ao tentar reproduzir o áudio:', error);
            this.currentAudio = undefined;
            this.speechEnabled();
            resolve(false);
          });
        });
    });
  }

  public cancelSpeak(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = undefined;
    }
    this.speechEnabled();
  }
}
