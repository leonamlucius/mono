import { Component, signal, ViewChild, AfterViewInit } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { NgIf } from '@angular/common';
import { RegisterService } from '../../services/register-service';
import { FormsModule } from '@angular/forms';
import { WarningComponent } from '../../../../shared/components/warning-component/warning-component';

declare const google: any;

@Component({
  selector: 'app-register-component',
  imports: [NgIcon, NgIf, FormsModule, WarningComponent],
  templateUrl: './register-component.html',
  styleUrls: ['./register-component.scss'],
})
export class RegisterComponent {
  @ViewChild(WarningComponent) warning!: WarningComponent;
  public showModal = false;

  public showLoading = signal<boolean>(false);

  public showModalWarning = signal<boolean>(false);

  public isClosingModal = signal<boolean>(false);

  public modalWarningText = signal<string>('');

  public showPassword = false;

  public showConfirmPassword = false;

  constructor(private registerService: RegisterService) {}

  ngAfterViewInit(): void {
    this.inicializarGoogleAuth();
  }

  private inicializarGoogleAuth(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id:
          '702780356802-kk87855m6nqj8fjrs4kn7d89hmhuangd.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleCallback(response),
      });

      google.accounts.id.renderButton(document.getElementById('google-btn'), {
        theme: 'outline',
        shape: 'circle',
        size: 'large',
        text: 'signup_with',
        width: '100%',
      });
    } else {
      setTimeout(() => this.inicializarGoogleAuth(), 100);
    }
  }

  private handleGoogleCallback(response: any): void {
    const idToken = response.credential;

    this.registerService
      .registerWithGoogle(idToken)
      .then((response) => {
        this.warning.openModal(response);
      })
      .catch((error) => {
        console.error('Error during Google registration:', error);
        this.warning.openModal(
          'Erro ao registrar com o Google. Por favor, tente novamente.'
        );
      });
  }

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
          this.warning.openModal(response);
        })
        .finally(() => {
          this.hideLoadingIndicator();
        });
    } catch (error) {
      this.hideLoadingIndicator();
      console.error('Error registering user:', error);
      this.warning.openModal(
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
