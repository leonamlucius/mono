import {
  Directive,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
  output,
} from '@angular/core';

@Directive({
  selector: '[appIsVisible]',
  standalone: true,
})
export class IsVisibleDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);
  private observer?: IntersectionObserver;

  // Emite 'true' quando entra na tela e 'false' quando sai
  isVisibleChange = output<boolean>();

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        this.isVisibleChange.emit(entry.isIntersecting);
      },
      {
        threshold: 0, // 0 significa: dispara assim que 0% da div estiver visível (sumiu totalmente)
      }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
