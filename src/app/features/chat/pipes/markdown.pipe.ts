import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
  standalone: true,
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: SafeHtml | string | undefined | null): SafeHtml {
    if (!value) return '';

    const html = marked.parse(value as string, { breaks: true }) as string;

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
