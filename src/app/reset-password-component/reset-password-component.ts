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

    public showModalWarning = signal<boolean>(false);

    public isClosingModal = signal<boolean>(false);

    public modalWarningText = signal<string>('');

    public tokenExperied = signal<boolean>(false);

    public showPassword = false;

    public showConfirmPassword = false;


    constructor(private serviceAi: ServiceAi) {}


    ngOnInit(): void {
      const token = new URLSearchParams(window.location.search).get('token');

      if (!token) {
        this.modalWarningText.set("Token de redefinição de senha ausente. Redirecionando para a página de login...");
        this.showModalWarning.set(true);

        setTimeout(() => {
            this.triggerCloseModalWarning();
          }, 3000);

        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      }


      this.serviceAi.tokenIsExpired(token)
        .then((response) => {
          if (response === true) {
            this.modalWarningText.set("Link de redefinição de senha inválido ou expirado. Redirecionando para a página de login...");
            this.showModalWarning.set(true);

            setTimeout(() => {
            this.triggerCloseModalWarning();
          }, 3000);

          this.tokenExperied.set(response);

          setTimeout(() => {
          window.location.href = '/login';
          }, 18000);

          }else{
            return;
          }
        }).catch((error) => {
          console.error('Error validating token:', error);
          this.modalWarningText.set("Ocorreu um erro ao validar o token. Redirecionando para a página de login...");
          this.showModalWarning.set(true);

          setTimeout(() => {
            this.triggerCloseModalWarning();
          }, 3000);
        });

    }



    public resetPassword( newPassword: string, confirmNewPassword: string): void {

      this.showLoading.set(true);

      const token = new URLSearchParams(window.location.search).get('token');

      this.serviceAi.resetPassword(token, newPassword, confirmNewPassword)
        .then((response) => {
          this.showLoading.set(false);
          this.modalWarningText.set("Senha redefinida com sucesso! Redirecionando para a página de login...");
          this.showModalWarning.set(true);
          
          // Aguarda 3 segundos para o usuário ler a mensagem
          setTimeout(() => {
            this.triggerCloseModalWarning();
            
            // Redireciona após fechar o modal
            setTimeout(() => {
              window.location.href = '/login';
            }, 300); // Tempo da animação de fechar
            
          }, 3000);
        })
        .catch((error) => {
          console.error('Error resetting password:', error);
          this.showLoading.set(false);
          this.modalWarningText.set(error);
          this.showModalWarning.set(true);
          
          // Fecha o modal após 3 segundos (sem redirecionar)
          setTimeout(() => {
            this.triggerCloseModalWarning();
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

   public triggerCloseModalWarning(): void {
    this.isClosingModal.set(true);
    setTimeout(() => {
      this.showModalWarning.set(false);
      this.isClosingModal.set(false);
    }, 300);
    }
}
