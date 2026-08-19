
import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(htmlContent: string | null | undefined, searchTerm: string | null | undefined): SafeHtml {
    if (!htmlContent) return '';
    if (!searchTerm || !searchTerm.trim()) return htmlContent;

    // Escapa caracteres especiais do termo de busca
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Regex que destaca APENAS o texto fora de tags HTML <...>
    const regex = new RegExp(`(${escaped})(?![^<]*>)`, 'gi');
    const highlighted = htmlContent.replace(regex, '<mark>$1</mark>');

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}