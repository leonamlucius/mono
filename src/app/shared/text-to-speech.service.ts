import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TextToSpeechService {
  public isSpeechEnabled: boolean = false;

  toggleSpeech(): void {
    this.isSpeechEnabled = !this.isSpeechEnabled;
  }

  speak(text: string): void {
    if (this.isSpeechEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = 'pt-BR';
      utterance.rate = 1.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
      this.toggleSpeech();
    }
  }
}
