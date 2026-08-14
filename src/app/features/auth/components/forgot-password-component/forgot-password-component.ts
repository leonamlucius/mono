import { Component, signal, ViewChild, OnInit } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { ForgotPasswordService } from '../../services/forgot-password-service';
import { FormsModule } from '@angular/forms';
import { WarningComponent } from '../../../../shared/components/warning-component/warning-component';
import { InfoComponent } from '../../../../shared/components/info-component/info-component';

@Component({
  selector: 'app-forgot-password-component',
  imports: [
    NgIf,
    NgClass,
    NgIcon,
    FormsModule,
    WarningComponent,
    InfoComponent,
  ],
  templateUrl: './forgot-password-component.html',
  styleUrls: ['./forgot-password-component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  @ViewChild(WarningComponent) warning!: WarningComponent;
  @ViewChild(InfoComponent) info!: InfoComponent;
  constructor(private forgotPasswordService: ForgotPasswordService) {}

  public storedTime = signal<string | null>(
    localStorage.getItem('timeRemaining')
  );
  public showLoading = signal<boolean>(false);

  public isClosingModal = signal<boolean>(false);

  public timeRemaining = signal<number>(0);

  public isButtonDisabled = signal<boolean>(false);

  public timerInterval: any;

  ngOnInit(): void {
    if (this.storedTime()) {
      const remainingTime = parseInt(this.storedTime()!, 10);
      if (remainingTime > 0) {
        this.startTimer(remainingTime);
        this.showLoading.set(false);
        return;
      }
    }
  }

  public forgotPassword(email: string): void {
    if (!email) {
      this.warning.openModal('Por favor, insira um endereço de e-mail válido.');
      return;
    }
    if (this.isButtonDisabled() || this.showLoading()) {
      return;
    }

    this.showLoading.set(true);

    this.forgotPasswordService
      .forgotPassword(email)
      .then((response) => {
        console.log('Forgot password response:', response);
        this.showLoading.set(false);
        this.warning.openModal(response);

        this.startTimer(30);
      })
      .catch((error) => {
        this.stopTimer();
        this.showLoading.set(false);
        this.warning.openModal(error);
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
        localStorage.removeItem('timeRemaining');
        clearInterval(this.timerInterval);
      } else {
        localStorage.setItem('timeRemaining', (current - 1).toString());
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
    this.info.displayModal();
  }
  public closeModalInfo(): void {
    this.info.closeModal();
  }
}
