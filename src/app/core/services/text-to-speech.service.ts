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

  public pauseSpeak(): void {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
      } else if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();

        setTimeout(() => {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            const wakeUp = new SpeechSynthesisUtterance('');
            wakeUp.volume = 0;
            window.speechSynthesis.speak(wakeUp);
          }
        }, 50);
      }
    }
  }
}
