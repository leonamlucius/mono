import { Component, signal, ViewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgIf, NgClass } from '@angular/common';
import { LoginService } from '../../services/login-service';
import {
  interval,
  Subscription,
  startWith,
  switchMap,
  from,
  map,
  scan,
} from 'rxjs';
import { timer } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Warning } from '../../../shared/components/warning/warning';

@Component({
  selector: 'app-login-component',
  imports: [NgIcon, NgIf, NgClass, FormsModule, Warning],
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.scss'],
})
export class LoginComponent {
  @ViewChild(Warning) warning!: Warning;
  public facts = signal<any>(null);


  public fatoAtual = signal<any>(null);

  public isEvenCall = signal<boolean>(true);

  private pollingSubscription!: Subscription;

  public showModal = false;

  public showPassword = false;

  public showLoading = signal<boolean>(false);

  public showSkeleton = signal<boolean>(true);

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    this.loginService.getFacts().then((fatos) => {
      this.facts.set(fatos);

      this.pollingSubscription = timer(0, 10000).subscribe((contador) => {
        const ePar = contador % 2 === 0;
        this.isEvenCall.set(ePar);

        const todosOsFatos = this.facts();
        this.fatoAtual.set(todosOsFatos[contador % todosOsFatos.length]);

      });
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      console.log('Timer dos fatos destruído com sucesso!');
    }
  }


  public showImageLogin(): void {
    this.showSkeleton.set(false);
  }

  public showLoadingIndicator(): void {
    this.showLoading.set(true);
  }

  public hideLoadingIndicator(): void {
    this.showLoading.set(false);
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

  public login(email: string, password: string): void {
    if (this.showLoading()) {
      return;
    }

    this.showLoadingIndicator();

    try {
      this.loginService
        .login(email, password)
        .then((response) => {
          this.warning.openModal(response);
        })
        .finally(() => {
          this.hideLoadingIndicator();
        });
    } catch (error) {
      console.error('Error during login:', error);
      this.hideLoadingIndicator();
    }
  }
}
