import { Component, signal} from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { NgIcon} from '@ng-icons/core';
import { ɵEmptyOutletComponent } from "@angular/router";
import { ServiceAi } from '../shared/service-ai';
@Component({
  selector: 'app-reset-password-component',
  imports: [NgIf, NgClass, NgIcon, ɵEmptyOutletComponent],
  templateUrl: './reset-password-component.html',
  styleUrl: './reset-password-component.scss',
})
export class ResetPasswordComponent {

    public showLoading = signal<boolean>(false);

    public showModal = false;

    public showModalError = signal<boolean>(false);

    public isClosingModal = signal<boolean>(false);

    public modalErrorText = signal<string>('');

    public showPassword = false;

    public showConfirmPassword = false;


    constructor(private serviceAi: ServiceAi) {}


    public resetPassword( newPassword: string, confirmNewPassword: string): void {

      this.showLoading.set(true);

      const token = new URLSearchParams(window.location.search).get('token');

      this.serviceAi.resetPassword(token, newPassword, confirmNewPassword)
        .then((response) => {
          this.showLoading.set(false);
          this.modalErrorText.set("Senha redefinida com sucesso! Redirecionando para a página de login...");
          this.showModalError.set(true);
          
          // Aguarda 3 segundos para o usuário ler a mensagem
          setTimeout(() => {
            this.triggerCloseModalError();
            
            // Redireciona após fechar o modal
            setTimeout(() => {
              window.location.href = '/login';
            }, 300); // Tempo da animação de fechar
            
          }, 3000);
        })
        .catch((error) => {
          console.error('Error resetting password:', error);
          this.showLoading.set(false);
          this.modalErrorText.set(error);
          this.showModalError.set(true);
          
          // Fecha o modal após 3 segundos (sem redirecionar)
          setTimeout(() => {
            this.triggerCloseModalError();
          }, 3000);
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

   public triggerCloseModalError(): void {
    this.isClosingModal.set(true);
    setTimeout(() => {
      this.showModalError.set(false);
      this.isClosingModal.set(false);
    }, 300);
    }
}
