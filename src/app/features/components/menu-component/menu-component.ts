import { Component, signal } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-menu',
  imports: [NgIf, NgClass],
  templateUrl: './menu-component.html',
  styleUrls: ['./menu-component.scss'],
})
export class MenuComponent {
  public showModal = false;

  public showModalWarningPai = signal(false);

  public showSidebar = signal(false);

  public sideBarExit = signal(false);

  public isOverflowingInfo = signal(false);

  @ViewChild('nameAndSummaryInfo')
  nameAndSummaryInfo!: ElementRef<HTMLDivElement>;

  @ViewChild('captionInfo') captionInfo!: ElementRef<HTMLSpanElement>;

  public summaryText = signal(
    'Bem vindo ao Mono, ' + (localStorage.getItem('name') + '!' || '')
  );

  public verificarOverflowSidebar() {
    if (!this.nameAndSummaryInfo && !this.captionInfo) {
      return;
    }

    this.isOverflowingInfo.set(false);

    if (this.nameAndSummaryInfo && this.captionInfo) {
      const larguraCaixa = this.nameAndSummaryInfo.nativeElement.clientWidth;
      const larguraTexto = this.captionInfo.nativeElement.scrollWidth;

      this.isOverflowingInfo.set(larguraTexto > larguraCaixa);
    }
  }
  public openSidebar(): void {
    this.showSidebar.set(true);
    this.sideBarExit.set(false);

    setTimeout(() => {
      this.verificarOverflowSidebar();
    }, 800);
  }

  public closeSidebar(): void {
    this.sideBarExit.set(true);

    setTimeout(() => {
      this.showSidebar.set(false);
    }, 400);
  }

  public createModalInfo(): void {
    this.showModal = true;
  }

  public closeModalInfo(): void {
    this.showModal = false;
  }

  
}
