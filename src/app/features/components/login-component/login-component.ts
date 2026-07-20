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

  public isEvenCall = signal<boolean>(true);

  private pollingSubscription!: Subscription;

  public showModal = false;

  public showPassword = false;

  public showLoading = signal<boolean>(false);

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    this.pollingSubscription = interval(10000) //10 segundos
      .pipe(
        startWith(0),
        scan((acumulador) => acumulador + 1, -1),
        switchMap((contadorVerdadeiro) =>
          from(this.loginService.getFacts()).pipe(
            map((fatos) => ({ contador: contadorVerdadeiro, fatos }))
          )
        )
      )
      .subscribe({
        next: ({ contador, fatos }) => {
          const ePar = contador % 2 == 0;

          this.isEvenCall.set(ePar);
          this.facts.set(fatos);

          console.log(
            `Sincronizado! Chamada ${ePar ? 'Par' : 'Ímpar'} recebeu:`,
            fatos
          );
        },
        error: (err) => console.error(err),
      });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      console.log('Timer dos fatos destruído com sucesso!');
    }
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
