import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TextToSpeechService {
  public isSpeechEnabled = signal(true);

  public speechEnabled(): void {
    this.isSpeechEnabled.set(true);
  }

  public speechDisabled(): void {
    this.isSpeechEnabled.set(false);
  }

  public speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.isSpeechEnabled() && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        this.speechDisabled();

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.lang = 'pt-BR';
        utterance.rate = 1.3;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = () => {
          this.speechEnabled();
          resolve();
        };

        utterance.onerror = (error) => {
          this.speechEnabled();
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  }

  public cancelSpeak(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
