import { Component, Input, signal} from '@angular/core';
import { NgFor, NgIf, AsyncPipe} from '@angular/common';
import { Observable } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';




@Component({
  selector: 'app-body-component',
  imports: [NgFor, NgIf, AsyncPipe],
  templateUrl: './body-component.html',
  styleUrls: ['./body-component.scss'],
   animations: [
    trigger('fadeText', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(0)' }),
        animate('1s ease-in-out', style({ opacity: 1, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class BodyComponent {

  @Input() isInitialized = false;

  public mockUp = [
    {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "User",
      loading: true
    },
     {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "Bot",
      loading: true

    },

    {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "User",
       loading: false
    },
     {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "Bot",
      loading: false
    },
    {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "User",
       loading: true

    },
     {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "Bot",
      loading: true
    },

    {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "User",
      loading: false
    },
     {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "Bot",
      loading: false
    },

    {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "User",
      loading: false
    },
     {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "Bot",
      loading: false
    },
    

  ]


 public textoAtual = signal('');
  private indice = 0;
  public texts = [
    {
      text: 'Faça sua pergunta, dúvidas, curiosidades e conversas com o Mono!',
    }
    ,
    {
      text: 'O Mono é um assistente virtual inteligente, projetado para fornecer respostas rápidas e precisas às suas perguntas. Ele utiliza tecnologia avançada de processamento de linguagem natural para entender suas consultas e oferecer informações relevantes de forma eficiente.',
    }
    ,
    {
      text: 'Com o Mono, você pode obter respostas para uma ampla variedade de tópicos, desde informações gerais até questões específicas. Ele é capaz de compreender o contexto das suas perguntas e fornecer respostas personalizadas, tornando a interação mais fluida e satisfatória.',
    },
    {
      text: 'O Mono é uma ferramenta útil para quem busca informações rápidas e confiáveis, seja para resolver dúvidas do dia a dia, obter insights sobre um assunto específico ou simplesmente ter uma conversa interessante. Experimente o Mono e descubra como ele pode facilitar sua vida com respostas inteligentes e eficientes!',
    }
  ]


  ngOnInit() {
  this.textoAtual.set(this.texts[0].text);
  
  setInterval(() => {
  this.textoAtual.set('');
  setTimeout(() => {
    this.indice = (this.indice + 1) % this.texts.length;
    this.textoAtual.set(this.texts[this.indice].text);
  }, 50);
}, 8000);
}
}
