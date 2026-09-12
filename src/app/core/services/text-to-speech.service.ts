import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { selectVoiceSelected } from '../../features/chat/states/chat-ui-selectors';
import { Store } from '@ngrx/store';
@Injectable({
  providedIn: 'root',
})
export class TextToSpeechService {
  private store = inject(Store);

  public isSpeechEnabled = signal(true);

  private audio?: HTMLAudioElement;

  public speechEnabled(): void {
    this.isSpeechEnabled.set(true);
  }

  public speechDisabled(): void {
    this.isSpeechEnabled.set(false);
  }

  public async speakMute(text: string, voice: string): Promise<Blob> {
    return new Promise(async (resolve: (value: Blob) => void) => {
        this.speechDisabled();

        try {
          const apiBase = environment.apiUrl;

          const response = await fetch(
            `${apiBase}/mono/tts?text=${encodeURIComponent(text)}&voice=${voice}`,
            {
              method: 'POST',
              headers: {
                Accept: 'audio/wav, audio/*',
              },
              credentials: 'include',
            }
          );

          if (!response.ok) {
            throw new Error(`ERROR ${response.status}`);
          }

          const audioBlob = await response.blob();

          const audioUrl = URL.createObjectURL(audioBlob);

          const cleanUp = () => {
            URL.revokeObjectURL(audioUrl);
            this.speechEnabled();
            resolve(audioBlob);
          };
          cleanUp();
        } catch (e) {
          console.error('Error during speech synthesis:', e);
          this.speechEnabled();
          resolve(new Blob());
        }
      
    });
  }

  public async speak(text: string): Promise<Blob> {
    return new Promise(async (resolve: (value: Blob) => void) => {
      if (this.isSpeechEnabled()) {
        this.speechDisabled();

        try {
          const apiBase = environment.apiUrl;

          let voice = this.store.selectSignal(selectVoiceSelected)();

          const response = await fetch(
            `${apiBase}/mono/tts?text=${encodeURIComponent(text)}&voice=${voice}`,
            {
              method: 'POST',
              headers: {
                Accept: 'audio/wav, audio/*',
              },
              credentials: 'include',
            }
          );

          if (!response.ok) {
            throw new Error(`ERROR ${response.status}`);
          }

          const audioBlob = await response.blob();

          const audioUrl = URL.createObjectURL(audioBlob);
          this.audio = new Audio(audioUrl);

          const cleanUp = () => {
            URL.revokeObjectURL(audioUrl);
            this.speechEnabled();
            resolve(audioBlob);
          };

          this.audio.onended = cleanUp;

          this.audio.onerror = (error) => {
            console.error('Audio playback error:', error);
            cleanUp();
          };

          await this.audio.play();
        } catch (e) {
          console.error('Error during speech synthesis:', e);
          this.speechEnabled();
          resolve(new Blob());
        }
      } else {
        resolve(new Blob());
      }
    });
  }

  public cancelSpeak(): void {
    this.audio?.pause();
    this.audio = undefined;

    this.speechEnabled();
  }
}
