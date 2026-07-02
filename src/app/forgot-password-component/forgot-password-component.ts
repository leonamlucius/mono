import { Component, signal} from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { NgIcon} from '@ng-icons/core';
import { ɵEmptyOutletComponent } from "@angular/router";

@Component({
  selector: 'app-forgot-password-component',
  imports: [NgIf, NgClass, NgIcon, ɵEmptyOutletComponent],
  templateUrl: './forgot-password-component.html',
  styleUrls: ['./forgot-password-component.scss'],
})
export class ForgotPasswordComponent {

  public showLoading = signal<boolean>(false);

  public showModal = false;

  public showModalError = signal<boolean>(false);

  public isClosingModal = signal<boolean>(false);


  public modalErrorText = signal<string>('');

  

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

  public sendEmail(): void {
    this.showLoading.set(true);

    window.open("/reset-password", "_blank");
  
  }
}
