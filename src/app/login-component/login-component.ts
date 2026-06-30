import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons,  } from '@ng-icons/core';
import { NgIf, NgClass } from '@angular/common';
import {ServiceAi} from '../shared/service-ai';
import { interval, Subscription, startWith, switchMap, from, map, scan } from 'rxjs';

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

  public modalErrorText = signal<string>('');

  public showModalError = signal<boolean>(false);

  public isClosingModal = signal<boolean>(false);

  public showModal = false;

  public showPassword = false;

  public showLoading = signal<boolean>(false);





  constructor(private serviceAi: ServiceAi) {}

  ngOnInit(): void {
    this.pollingSubscription = interval(10000) //10 segundos
      .pipe(
        startWith(0),
        scan((acumulador) => acumulador + 1, -1),
        switchMap((contadorVerdadeiro) => 
          from(this.serviceAi.getFacts()).pipe(
            map((fatos) => ({ contador: contadorVerdadeiro, fatos }))
          )
        )
      )
      .subscribe({
        next: ({ contador , fatos }) => {
          const ePar = contador % 2 == 0;
          
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
  
  public showLoadingIndicator(): void {
    this.showLoading.set(true);
  }

  public hideLoadingIndicator(): void {
    this.showLoading.set(false);
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


  public login(email: string, password: string): void {

    this.showLoadingIndicator();

    try{
      this.serviceAi.login(email, password)
        .then((response) => {
          this.showModalErrorFunction(response);
        })
        .finally(() => {
          this.hideLoadingIndicator();
        });
    }catch(error){
      console.error('Error during login:', error);
      this.hideLoadingIndicator();
    }

  }

  
}
