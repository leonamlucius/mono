import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons,  } from '@ng-icons/core';
import { NgIf, NgClass } from '@angular/common';
import {ServiceAi} from '../shared/service-ai';

@Component({
  selector: 'app-register-component',
  imports: [NgIcon, NgIf, NgClass],
  templateUrl: './register-component.html',
  styleUrls: ['./register-component.scss'],
})
export class RegisterComponent {

   public showModal = false;

   public showLoading = signal<boolean>(false);
  
   public showModalError = signal<boolean>(false);

   public isClosingModal = signal<boolean>(false);

   public modalErrorText = signal<string>('');

   public showPassword = false;

   public showConfirmPassword = false;
    


   constructor(private serviceAi: ServiceAi) {}


  public showLoadingIndicator(): void {
    this.showLoading.set(true);
  }

  public hideLoadingIndicator(): void {
    this.showLoading.set(false);
  }
  

  public registerUser(name: string, email: string, password: string, confirmPassword: string): void {
    this.showLoadingIndicator();

   try{
    this.serviceAi.register(name, email, password, confirmPassword)
      .then((response) => {
          this.showModalErrorFunction(response);
        })
        .finally(() => {
          this.hideLoadingIndicator();
        });

   }catch(error){
    this.hideLoadingIndicator();
    console.error('Error registering user:', error);
    this.showModalErrorFunction('Erro ao registrar usuário. Por favor, tente novamente.');
   }
  }
    
  public togglePasswordConfirmVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  public showModalErrorFunction(text: string): void{
    this.modalErrorText.set(text);
    this.showModalError.set(true);

    setTimeout(() => {
      this.triggerCloseModalError();
    }, 3000);
  }

  public triggerCloseModalError(): void {
    this.isClosingModal.set(true);
    setTimeout(() => {
      this.showModalError.set(false);
      this.isClosingModal.set(false);
    }, 300);
  }

  public goTolinkedin(): void {
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
