import { Component, signal} from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { RouterOutlet, ɵEmptyOutletComponent } from '@angular/router';
import {BodyComponent} from "./body-component/body-component";
import {InputComponent} from "./input-component/input-component";
import { Subject } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { featherAirplay } from '@ng-icons/feather-icons';
import { heroUsers } from '@ng-icons/heroicons/outline';
import { bootstrapLinkedin, bootstrapGithub } from '@ng-icons/bootstrap-icons';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BodyComponent, InputComponent, ɵEmptyOutletComponent, NgIf, NgClass, NgIcon],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  providers: [provideIcons({ featherAirplay, heroUsers, bootstrapLinkedin, bootstrapGithub })]
})
export class App {
  protected readonly title = signal('mono');

  public isInitialized = signal(false);

  public isTypeSomething = signal(false);

  public showModal = false;


  public iniciar(): void {

    if (!this.isTypeSomething()){
      alert('Digite algo para iniciar a conversa');
      return;
    }
    console.log('Iniciar');
    this.isInitialized.set(true);
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
