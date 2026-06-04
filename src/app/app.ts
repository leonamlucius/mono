import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {BodyComponent} from "./body-component/body-component";
import {InputComponent} from "./input-component/input-component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BodyComponent, InputComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('mono');
}
