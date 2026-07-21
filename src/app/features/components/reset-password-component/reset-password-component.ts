import { Component, signal, ViewChild } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { ResetPasswordService } from '../../services/reset-password-service';
import { FormsModule } from '@angular/forms';
import { Warning } from '../../../shared/components/warning/warning';
@Component({
  selector: 'app-reset-password-component',
  imports: [NgIf, NgClass, NgIcon, FormsModule, Warning],
  templateUrl: './reset-password-component.html',
  styleUrls: ['./reset-password-component.scss'],
})
export class ResetPasswordComponent {
  @ViewChild(Warning) warning!: Warning;
  public showLoading = signal<boolean>(false);

  public showModal = false;

  public tokenExperied = signal<boolean>(false);

  public showPassword = false;

  public showConfirmPassword = false;

  constructor(private resetPasswordService: ResetPasswordService) {}

  ngOnInit(): void {
    const token = new URLSearchParams(window.location.search).get('token');

    if (!token) {
      this.warning.openModal(
        'Token de redefinição de senha ausente. Redirecionando para a página de login...'
      );

      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    }

    this.resetPasswordService
      .tokenIsExpired(token)
      .then((response) => {
        if (response === true) {
          this.warning.openModal(
            'Link de redefinição de senha inválido ou expirado. Redirecionando para a página de login...'
          );

          this.tokenExperied.set(response);

          setTimeout(() => {
            window.location.href = '/login';
          }, 18000);
        } else {
          return;
        }
      })
      .catch((error) => {
        console.error('Error validating token:', error);
        this.warning.openModal(
          'Ocorreu um erro ao validar o token. Redirecionando para a página de login...'
        );
      });
  }

  public resetPassword(newPassword: string, confirmNewPassword: string): void {
    if (this.showLoading()) {
      return;
    }

    this.showLoading.set(true);

    const token = new URLSearchParams(window.location.search).get('token');

    this.resetPasswordService
      .resetPassword(token, newPassword, confirmNewPassword)
      .then((response) => {
        this.warning.openModal(response);
      })
      .catch((error) => {
        console.error('Error resetting password:', error);
        this.showLoading.set(false);
        this.warning.openModal(error);
      });
  }
  public togglePasswordConfirmVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
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
}
