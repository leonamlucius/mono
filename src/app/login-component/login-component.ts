import { Component } from '@angular/core';
import { NgIcon, provideIcons,  } from '@ng-icons/core';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-login-component',
  imports: [NgIcon, NgIf, NgClass],
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.scss'],
})
export class LoginComponent {

  public showModal = false;

  public showPassword = false;

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

   public goTolinkedin(): void {
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
