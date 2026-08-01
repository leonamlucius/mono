import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;

  private audioChunks: Blob[] = [];

  public estaGravando = signal(false);
  public audioBlobResult = signal<Blob | null>(null);

  public textTranscription = signal<string | null>(null);
  public audioCancelado = signal(false);

  public async iniciarGravacao(): Promise<void> {
    this.audioCancelado.set(false);
    this.audioChunks = [];
    this.audioBlobResult.set(null);

    this.textTranscription.set('');

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.mediaRecorder = new MediaRecorder(stream);
    this.estaGravando.set(true);

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      console.log(
        'Gravação de áudio concluída. Blob de áudio resultante:',
        audioBlob
      );
      this.audioBlobResult.set(audioBlob);
      this.estaGravando.set(false);

      stream.getTracks().forEach((track) => track.stop());

      if (this.audioChunks.length > 0 && !this.audioCancelado()) {
        this.enviarAudio().then((transcription) => {

          if (transcription.trim() === '') {
            console.error('Transcrição vazia recebida do servidor.');
            this.textTranscription.set('ERRO: Transcrição vazia recebida do servidor.');
            return;
          }
          this.textTranscription.set(transcription);
        });
      }
    };

    this.mediaRecorder.start();
  }

  public pararGravacao(): void {
    if (this.mediaRecorder && this.estaGravando()) {
      this.mediaRecorder.stop();
    }
  }

  public cancelarGravacao(): void {
    if (this.mediaRecorder && this.estaGravando()) {
      this.audioCancelado.set(true);
      this.audioChunks = [];
      this.pararGravacao();
      this.audioBlobResult.set(null);
      this.textTranscription.set('');
    }
  }

  public async enviarAudio(): Promise<string> {
    const apiBase = environment.apiUrl;

    const formData = new FormData();
    const audioBlob = this.audioBlobResult();

    if (audioBlob) {
      formData.append('file', audioBlob, 'audio.webm');
      console.log('Enviando áudio para o servidor:', audioBlob);
    }

    try {
      const response = await fetch(`${apiBase}/api/transcribe`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.ok) {
        const transcription = await response.text();
        console.log('Transcrição recebida do servidor:', transcription);

        if (transcription.trim() === '') {
          throw new Error('Transcrição vazia recebida do servidor.');
        }
        return transcription;
      }
    } catch (error) {
      console.error('Erro ao enviar o áudio:', error);
    }

    return ''; // Retorna uma string vazia se não houver resposta ok
  }
}
