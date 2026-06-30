import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root',
})


export class ServiceAi {

  private router = inject(Router);

  public idUser = signal<any>(null);

  public tokenUser = signal<any>(null);


  

  public async sendMessage(message: string, provider: 'OLLAMA' | 'GROQ'| 'ERROR'): Promise<any> {

    try{

      const apiBase = import.meta.env['NG_APP_API_URL'];

      const response = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: {
          'X-AI-Provider': provider, // ou 'GROQ' dependendo do provedor que você deseja usar
          'Content-Type': 'text/plain',
          'Authorization': `Bearer ${localStorage.getItem('tokenUser')}`,
        },
        body: message,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    }catch(error){
      console.error('Error sending message:', error);
      return 'ERROR SENDING MESSAGE';
    }
  }


  public async getFacts(): Promise<any> {

    try{

      const apiBase = import.meta.env['NG_APP_API_URL'];

      const response = await fetch(`${apiBase}/api/facts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'text/plain',
          'ngrok-skip-browser-warning': 'true' // Isso é obrigatório para o ngrok funcionar no navegador
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      return data;

    }catch(error){
      console.error('Error fetching facts:', error);
      return 'O mono conta fatos interessantes!';
    }
  }

  public async login(email: string, password: string): Promise<any> {

    if(!email || !password){
      
      if(!email && password){
        return 'Por favor, insira um email válido.';
      }
      if(!password && email){
        return 'Por favor, insira uma senha válida.';
      }

      return 'Por favor, insira um email e senha válidos.';
    }


    try{

      const apiBase = import.meta.env['NG_APP_API_URL'];

      const response  = await fetch(`${apiBase}/api/login`, {
        method: 'POST',
        headers:
        {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('tokenUser', data.token);
        this.router.navigate(['/mono']);
       
      }
     
      

    }catch(error){
      console.error('Error during login:', error);
      return 'Erro no login. Verifique suas credenciais e tente novamente.';
    }
  }

  public async register(name: string, email: string, password: string, confirmPassword: string): Promise<any> {


    if(!name || !email || !password || !confirmPassword){
      return 'Por favor, preencha todos os campos obrigatórios.';
    }

    if(password.length < 8 || confirmPassword.length < 8){
      return 'A senha deve ter pelo menos 8 caracteres.';
    }

    if(password !== confirmPassword){
      return 'As senhas não coincidem. Por favor, verifique e tente novamente.';
    }
      
    try{

      const apiBase = import.meta.env['NG_APP_API_URL'];

      const response  = await fetch(`${apiBase}/api/register`, {
        method: 'POST',
        headers:
        {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      if(response.status === 500){
        return 'Email já cadastrado. Por favor, tente outro email.';
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }



      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('tokenUser', data.token);
        this.router.navigate(['/mono']);
      }

    }catch(error){
      console.error('Error during registration:', error);
      return 'Erro no registro. Verifique suas informações e tente novamente.';
    }

  }
}



