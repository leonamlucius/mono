import { Component, signal } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-warning',
  imports: [NgClass, NgIf],
  templateUrl: './warning.html',
  styleUrls: ['./warning.scss'],
})
export class Warning {
  public isClosingModal = signal(false);

  public modalWarningText = '';

  public showModalWarning = signal(false);

  public openModal(text: string): void {
    if (this.showModalWarning()) {
      return;
    }

    this.modalWarningText = text;
    this.showModalWarning.set(true);

    setTimeout(() => {
      this.isClosingModal.set(true);
      setTimeout(() => {
        this.showModalWarning.set(false);
        this.isClosingModal.set(false);
      }, 500);
    }, 2000);
  }
  public closeModal(): void {
    this.isClosingModal.set(true);
    setTimeout(() => {
      this.showModalWarning.set(false);
      this.isClosingModal.set(false);
    }, 500);
  }
}
