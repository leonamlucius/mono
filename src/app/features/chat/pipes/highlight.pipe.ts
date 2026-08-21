import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(
    htmlContent: SafeHtml,
    searchTerm: string | null | undefined
  ): SafeHtml {
    if (!htmlContent) return '';

    if (!searchTerm || !searchTerm.trim()) return htmlContent;

    console.log('HighlightPipe: htmlContent:', htmlContent);
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    let safeContent = htmlContent as any;

    let contentString =
      safeContent.changingThisBreaksApplicationSecurity as string;

    const regex = new RegExp(`(${escaped})(?![^<]*>)`, 'gi');
    const highlighted = contentString.replace(regex, '<mark>$1</mark>');

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
