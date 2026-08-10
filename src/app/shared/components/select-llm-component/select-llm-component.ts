import { Component, Input } from '@angular/core';
import { signal } from '@angular/core';

@Component({
  selector: 'app-select-llm-component',
  imports: [],
  templateUrl: './select-llm-component.html',
  styleUrls: ['./select-llm-component.scss'],
})
export class SelectLlmComponent {
  @Input() public llmType = signal<'OLLAMA' | 'GROQ' | 'ERROR'>('GROQ')

  public changeLlmType(selectedType: HTMLSelectElement): void {
    this.llmType.set(selectedType.value as 'OLLAMA' | 'GROQ' | 'ERROR');

    console.log('Tipo de LLM selecionado:', selectedType.value);
  }
}
