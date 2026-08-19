import { Component, signal, Signal } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-info-component',
  imports: [NgIf],
  templateUrl: './info-component.html',
  styleUrls: ['./info-component.scss'],
})
export class InfoComponent {
  public showModal = signal<boolean>(false);

  public displayModal(): void {


    this.showModal.set(true);
  }

  public closeModal(): void {
    this.showModal.set(false);
  }
}
