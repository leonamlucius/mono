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

  public async speak(text: string): Promise<void> {
    return new Promise(async (resolve) => {
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
            resolve();
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
          resolve();
        }
      } else {
        resolve();
      }
    });
  }

  public cancelSpeak(): void {
    this.audio?.pause();
    this.audio = undefined;

    this.speechEnabled();
  }
}
