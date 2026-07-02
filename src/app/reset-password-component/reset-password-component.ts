import { Component, signal} from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { NgIcon} from '@ng-icons/core';
import { ɵEmptyOutletComponent } from "@angular/router";
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
