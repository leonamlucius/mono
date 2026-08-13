import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login-component/login-component';
import { ChatComponent } from './features/chat/components/chat-component/chat-component';
import { RegisterComponent } from './features/auth/components/register-component/register-component';
import { ForgotPasswordComponent } from './features/auth/components/forgot-password-component/forgot-password-component';
import { ResetPasswordComponent } from './features/auth/components/reset-password-component/reset-password-component';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'mono', component: ChatComponent , canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
];
