import { Component, signal } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { ForgotPasswordService } from '../../services/forgot-password-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password-component',
  imports: [NgIf, NgClass, NgIcon, FormsModule],
  templateUrl: './forgot-password-component.html',
  styleUrls: ['./forgot-password-component.scss'],
})
export class ForgotPasswordComponent {
  constructor(private forgotPasswordService: ForgotPasswordService) {}

  public showLoading = signal<boolean>(false);

  public showModal = false;

  public showModalWarning = signal<boolean>(false);

  public isClosingModal = signal<boolean>(false);

  public modalWarningText = signal<string>('');

  public timeRemaining = signal<number>(0);

  public isButtonDisabled = signal<boolean>(false);

  public timerInterval: any;

  public forgotPassword(email: string): void {
    if (this.isButtonDisabled() || this.showLoading()) {
      return;
    }

    this.showLoading.set(true);

    this.forgotPasswordService
      .forgotPassword(email)
      .then((response) => {
        console.log('Forgot password response:', response);
        this.showLoading.set(false);
        this.modalWarningText.set(response);
        this.showModalWarning.set(true);

        this.startTimer(30);

        setTimeout(() => {
          this.triggerCloseModalWarning();
        }, 3000);
      })
      .catch((error) => {
        this.stopTimer();
        this.showLoading.set(false);
        this.modalWarningText.set(error);
        this.showModalWarning.set(true);
        setTimeout(() => {
          this.triggerCloseModalWarning();
        }, 3000);
      });
  }

  private startTimer(seconds: number): void {
    this.timeRemaining.set(seconds);
    this.isButtonDisabled.set(true);

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      const current = this.timeRemaining();
      if (current <= 1) {
        this.timeRemaining.set(0);
        this.isButtonDisabled.set(false);
        clearInterval(this.timerInterval);
      } else {
        this.timeRemaining.set(current - 1);
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.timeRemaining.set(0);
    this.isButtonDisabled.set(false);
  }

  public goToLogin(): void {
    window.location.href = '/login';
  }

  public goToLinkedin(): void {
    window.open('https://www.linkedin.com/in/leonamlucius/', '_blank');
  }

  public goToGithub(): void {
    window.open('https://github.com/leonamlucius', '_blank');
  }

  public createModalInfo(): void {
    this.showModal = true;
  }

  public closeModalInfo(): void {
    this.showModal = false;
  }

  public triggerCloseModalWarning(): void {
    this.isClosingModal.set(true);
    setTimeout(() => {
      this.showModalWarning.set(false);
      this.isClosingModal.set(false);
    }, 300);
  }
}
