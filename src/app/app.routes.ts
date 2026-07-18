import { Routes } from '@angular/router';
import { LoginComponent } from '../app/features/login-component/login-component';
import { ChatComponent } from '../app/core/chat-component/chat-component';
import { RegisterComponent } from '../app/features/register-component/register-component';
import { ForgotPasswordComponent } from '../app/features/forgot-password-component/forgot-password-component';
import { ResetPasswordComponent } from '../app/features/reset-password-component/reset-password-component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'mono', component: ChatComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
];
