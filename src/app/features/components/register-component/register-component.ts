import { Component, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { NgIf, NgClass } from '@angular/common';
import { RegisterService } from '../../services/register-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-component',
  imports: [NgIcon, NgIf, NgClass, FormsModule],
  templateUrl: './register-component.html',
  styleUrls: ['./register-component.scss'],
})
export class RegisterComponent {
  public showModal = false;

  public showLoading = signal<boolean>(false);

  public showModalWarning = signal<boolean>(false);

  public isClosingModal = signal<boolean>(false);

  public modalWarningText = signal<string>('');

  public showPassword = false;

  public showConfirmPassword = false;

  constructor(private registerService: RegisterService) {}

  public showLoadingIndicator(): void {
    this.showLoading.set(true);
  }

  public hideLoadingIndicator(): void {
    this.showLoading.set(false);
  }

  public registerUser(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): void {
    if (this.showLoading()) {
      return;
    }

    this.showLoadingIndicator();

    try {
      this.registerService
        .register(name, email, password, confirmPassword)
        .then((response) => {
          this.showModalWarningFunction(response);
        })
        .finally(() => {
          this.hideLoadingIndicator();
        });
    } catch (error) {
      this.hideLoadingIndicator();
      console.error('Error registering user:', error);
      this.showModalWarningFunction(
        'Erro ao registrar usuário. Por favor, tente novamente.'
      );
    }
  }

  public togglePasswordConfirmVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  public showModalWarningFunction(text: string): void {
    this.modalWarningText.set(text);
    this.showModalWarning.set(true);

    setTimeout(() => {
      this.triggerCloseModalWarning();
    }, 3000);
  }

  public triggerCloseModalWarning(): void {
    this.isClosingModal.set(true);
    setTimeout(() => {
      this.showModalWarning.set(false);
      this.isClosingModal.set(false);
    }, 300);
  }

  public goToLinkedin(): void {
    window.open('https://www.linkedin.com/in/leonamlucius/', '_blank');
  }

  public goToGithub(): void {
    window.open('https://github.com/leonamlucius', '_blank');
  }

  public goToLogin(): void {
    window.location.href = '/login';
  }

  public createModalInfo(): void {
    this.showModal = true;
  }

  public closeModalInfo(): void {
    this.showModal = false;
  }
}
