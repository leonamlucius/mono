import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { ChatService } from '../../services/chat-service';

@Component({
  selector: 'app-timeline-component',
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './timeline-component.html',
  styleUrls: ['./timeline-component.scss'],
})
export class TimelineComponent implements OnInit {
  constructor(private chatService: ChatService) {}

  protected availableDates: {
    date: string;
    firstText: string;
    timestamp: string;
  }[] = [];

  ngOnInit(): void {
    this.chatService.getChatHistory().then((date) => {
      date?.forEach((item: any) => {
        item.content.forEach((dateItem: any, index: number) => {
          if (!this.availableDates.some((d) => d.date === dateItem.date)) {
            this.availableDates.push({
              date: dateItem.date,
              firstText: dateItem.messages[0].message,
              timestamp: dateItem.messages[0].timestamp,
            });
          }
        });
      });
    });
  }

  public formatDate(date: string | undefined): any {
    let actualDate: string = new Date().toLocaleDateString('pt-BR');

    let day = parseInt(date?.slice(0, 2) || '0', 10);
    let month = parseInt(date?.slice(3, 5) || '0', 10);
    let year = parseInt(date?.slice(6, 10) || '0', 10);

    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month).padStart(2, '0');

    if (actualDate && day === new Date().getDate() - 1) {
      return 'Ontem';
    }

    if (!date || date === actualDate) {
      return 'Hoje';
    }

    if (month < new Date().getMonth() + 1) {
      return `${formattedDay}/${formattedMonth}/${year}`;
    }

    const weekday = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
    }).format(new Date(year, month - 1, day));

   return `${weekday.slice(0, 3).charAt(0).toUpperCase()}${weekday.slice(1, 3)}, ${formattedDay}/${formattedMonth}`;
  }
}
