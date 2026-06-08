import { Component, signal} from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { RouterOutlet, ɵEmptyOutletComponent } from '@angular/router';
import {BodyComponent} from "./body-component/body-component";
import {InputComponent} from "./input-component/input-component";
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BodyComponent, InputComponent, ɵEmptyOutletComponent, NgIf, NgClass],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('mono');

  public isInitialized = signal(false);

  public isTypeSomething = signal(false);


  public iniciar(): void {

    if (!this.isTypeSomething()){
      alert('Digite algo para iniciar a conversa');
      return;
    }
    console.log('Iniciar');
    this.isInitialized.set(true);
  }
}
