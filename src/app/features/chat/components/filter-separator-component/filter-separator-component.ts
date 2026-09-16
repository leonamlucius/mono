import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { ChatService } from '../../services/chat-service';

@Component({
  selector: 'app-filter-separator-component',
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './filter-separator-component.html',
  styleUrl: './filter-separator-component.scss',
})
export class FilterSeparatorComponent implements OnInit {
  constructor(private chatService: ChatService) {}

  protected availableDates: string[] = [];

  ngOnInit(): void {
    this.chatService.getChatHistory().then((date) => {
      date?.forEach((item: any) => {
        item.content.forEach((dateItem: any, index: number) => {
          if (!this.availableDates.includes(dateItem.date)) {
            this.availableDates.push(dateItem.date);

          }
        });
      });
    });
  }
}
