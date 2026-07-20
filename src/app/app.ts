import { Component, signal, Input} from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { RouterOutlet, ɵEmptyOutletComponent } from '@angular/router';
import { Subject } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { featherAirplay } from '@ng-icons/feather-icons';
import { heroUsers } from '@ng-icons/heroicons/outline';
import { bootstrapLinkedin, bootstrapGithub } from '@ng-icons/bootstrap-icons';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  providers: [provideIcons({ featherAirplay, heroUsers, bootstrapLinkedin, bootstrapGithub })]
})
export class App {
  
}
