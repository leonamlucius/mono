import { Routes } from '@angular/router';
import {LoginComponent} from './login-component/login-component';
import {ChatComponent} from './chat-component/chat-component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {path: 'mono', component: ChatComponent},
  {path: 'login', component: LoginComponent},
  
];
