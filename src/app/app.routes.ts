import { Routes } from '@angular/router';
import { LoginComponent } from '../app/features/components/login-component/login-component';
import { ChatComponent } from '../app/core/components/chat-component/chat-component';
import { RegisterComponent } from '../app/features/components/register-component/register-component';
import { ForgotPasswordComponent } from '../app/features/components/forgot-password-component/forgot-password-component';
import { ResetPasswordComponent } from '../app/features/components/reset-password-component/reset-password-component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'mono', component: ChatComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
];
