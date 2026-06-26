import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons,  } from '@ng-icons/core';
import { NgIf, NgClass } from '@angular/common';
import {ServiceAi} from '../shared/service-ai';
import { interval, Subscription, startWith, switchMap, from, map } from 'rxjs';

@Component({
  selector: 'app-login-component',
  imports: [NgIcon, NgIf, NgClass],
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.scss'],
})
export class LoginComponent {

  public facts = signal<any>(null);

  public isEvenCall = signal<boolean>(true);

  private pollingSubscription!: Subscription;

  constructor(private serviceAi: ServiceAi) {}

  ngOnInit(): void {
    this.pollingSubscription = interval(10000) //10 segundos
      .pipe(
        startWith(0),
        switchMap((contador) => 
          from(this.serviceAi.getFacts()).pipe(
            // O map aqui dentro "empacota" o número do contador junto com o texto que veio do backend
            map((fatos) => ({ contador, fatos }))
          )
        )
      )
      .subscribe({
        next: ({ contador, fatos }) => {
          const ePar = contador % 2 === 0;
          
          this.isEvenCall.set(ePar); 
          this.facts.set(fatos);
          
          console.log(`Sincronizado! Chamada ${ePar ? 'Par' : 'Ímpar'} recebeu:`, fatos);
        },
        error: (err) => console.error(err)
      });
  }


  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      console.log('Timer dos fatos destruído com sucesso!');
    }
  }


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
