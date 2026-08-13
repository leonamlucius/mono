import { Injectable, inject, ViewChild } from '@angular/core';

import { environment } from '../../../../environments/environment';

import { WarningComponent } from '../../../shared/components/warning-component/warning-component';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  @ViewChild(WarningComponent) warning!: WarningComponent;

  public async getUserInfo(): Promise<any> {
    try {
      const apiBase = environment.apiUrl;
      const response = await fetch(`${apiBase}/user/get-user-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // Isso é obrigatório para o ngrok funcionar no navegador
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  public async patchUserInfo(name: string): Promise<any> {
    if (!name) {
      return 'No name provided';
    }
    try {
      const apiBase = environment.apiUrl;
      const response = await fetch(`${apiBase}/user/get-user-info`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('name', data.name || '');

        return data;
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }
}
