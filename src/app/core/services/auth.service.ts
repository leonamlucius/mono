import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private router: Router) {}
  public async jwtTest(): Promise<any> {
    try {
      const apiBase = environment.apiUrl;

      const response = await fetch(`${apiBase}/auth/jwt-test`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`ERROR ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error during JWT test:', error);
      return error;
    }
  }

  public async logout(): Promise<void> {
    try {
      const apiBase = environment.apiUrl;
      await fetch(`${apiBase}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      localStorage.clear();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}
