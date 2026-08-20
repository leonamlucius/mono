import { Component, signal } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-warning',
  imports: [NgClass, NgIf],
  templateUrl: './warning-component.html',
  styleUrls: ['./warning-component.scss'],
})
export class WarningComponent {
  public isClosingModal = signal(false);

  public modalWarningText = '';

  public showModalWarning = signal(false);

  private startY = 0;

  private readonly minSwipeDistance = 30;

  private openTimer: any;

  private closeTimer: any;

  public onTouchStart(event: TouchEvent): void {
    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
      return;
    }
    this.startY = event.touches[0].clientY;
  }

  public onTouchEnd(event: TouchEvent): void {
    const endY = event.changedTouches[0].clientY;
    const distance = endY - this.startY;

    if (distance > this.minSwipeDistance) {
      this.closeModal();
    }
  }

  public openModal(text: string): void {
    if (this.showModalWarning()) {
      return;
    }

    this.modalWarningText = text;
    this.showModalWarning.set(true);

    this.openTimer = setTimeout(() => {
      this.isClosingModal.set(true);
      this.closeTimer = setTimeout(() => {
        this.showModalWarning.set(false);
        this.isClosingModal.set(false);
      }, 500);
    }, 2000);
  }
  public closeModal(): void {
    this.clearTimer();
    this.isClosingModal.set(true);
    this.closeTimer = setTimeout(() => {
      this.showModalWarning.set(false);
      this.isClosingModal.set(false);
    }, 500);
  }

  public clearTimer(): void {
    if (this.openTimer) {
      clearTimeout(this.openTimer);
      this.openTimer = null;
    }
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
}
