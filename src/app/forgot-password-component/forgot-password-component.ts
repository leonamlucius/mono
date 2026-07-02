import { Component, signal} from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { NgIcon} from '@ng-icons/core';
import { ɵEmptyOutletComponent } from "@angular/router";
import { ServiceAi } from '../shared/service-ai';1

@Component({
  selector: 'app-forgot-password-component',
  imports: [NgIf, NgClass, NgIcon, ɵEmptyOutletComponent],
  templateUrl: './forgot-password-component.html',
  styleUrls: ['./forgot-password-component.scss'],
})
export class ForgotPasswordComponent {

  constructor(private serviceAi: ServiceAi) {}

  public showLoading = signal<boolean>(false);

  public showModal = false;

  public showModalError = signal<boolean>(false);

  public isClosingModal = signal<boolean>(false);


  public modalErrorText = signal<string>('');

  


  public forgotPassword(email: string): void {
    this.showLoading.set(true);


    this.serviceAi.forgotPassword(email)
      .then((response) => {
        console.log('Forgot password response:', response);
        this.showLoading.set(false);
        this.modalErrorText.set(response);
        this.showModalError.set(true);
         setTimeout(() => {
           this.triggerCloseModalError();
        }, 3000);
      })
      .catch((error) => {
        console.error('Error in forgot password:', error);
        this.showLoading.set(false);
        this.modalErrorText.set('Ocorreu um erro ao tentar redefinir a senha. Por favor, tente novamente.');
        this.showModalError.set(true);
           setTimeout(() => {
           this.triggerCloseModalError();
        }, 3000);
      });
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

  public triggerCloseModalError(): void {
    this.isClosingModal.set(true);
    setTimeout(() => {
      this.showModalError.set(false);
      this.isClosingModal.set(false);
    }, 300);
  }

 
}
