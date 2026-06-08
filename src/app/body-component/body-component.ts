import { Component, Input } from '@angular/core';
import { NgFor, NgIf, AsyncPipe} from '@angular/common';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-body-component',
  imports: [NgFor, NgIf, AsyncPipe],
  templateUrl: './body-component.html',
  styleUrls: ['./body-component.scss'],
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
}
