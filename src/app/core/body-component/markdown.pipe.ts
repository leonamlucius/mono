import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';
    
    // Converte o Markdown bruto em uma string HTML
    // Opcional: configure 'breaks: true' para respeitar quebras de linha automáticas
    return marked.parse(value, { breaks: true }) as string;
  }
}