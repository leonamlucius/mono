import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-body-component',
  imports: [NgFor, NgIf],
  templateUrl: './body-component.html',
  styleUrls: ['./body-component.scss'],
})
export class BodyComponent {

  public mockUp = [
    {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "User"
    },
     {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "Bot"
    },

    {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "User"
    },
     {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "Bot"
    },
    {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "User"
    },
     {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "Bot"
    },

    {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "User"
    },
     {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "Bot"
    },

    {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "User"
    },
     {
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.',
      sendBy: "Bot"
    },
    

  ]
}
