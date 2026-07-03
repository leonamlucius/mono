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


  public async forgotPassword(email: string): Promise<any> {

    if(!email){
      return 'Por favor, insira um email válido.';
    }

    try{
      const apiBase = import.meta.env['NG_APP_API_URL'];

      const response  = await fetch(`${apiBase}/api/forgot-password`, {
        method: 'POST',
        headers:
        {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });


      if(response.status === 404){
        console.error('Email not found:', email);
        return 'Email não encontrado. Por favor, verifique o email e tente novamente.';
    
      }


      if(response.status === 400){
        console.error('Email not found:', email);
        return 'Aguarde uma hora antes de tentar novamente. Se o problema persistir, entre em contato com o suporte.';
    
      }


      

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.ok) {
        return 'Por favor, verifique sua caixa de email para redefinir sua senha.';
      }

      

    }catch(error){
      console.error('Error during forgot password:', error);
      return 'Erro ao tentar redefinir a senha. Verifique suas informações e tente novamente.';
    }

  }

  public async resetPassword(token: any, newPassword: string, confirmNewPassword: string): Promise<any> {

    if(!token || !newPassword || !confirmNewPassword){
      return 'Por favor, preencha todos os campos obrigatórios.';
    }

    if(newPassword.length < 8 || confirmNewPassword.length < 8){
      return 'A senha deve ter pelo menos 8 caracteres.';
    }

    if(newPassword !== confirmNewPassword){
      return 'As senhas não coincidem. Por favor, verifique e tente novamente.';
    }


    try{

      const apiBase = import.meta.env['NG_APP_API_URL'];

      const response  = await fetch(`${apiBase}/api/reset-password`, {
        method: 'POST',
        headers:
        {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword, confirmNewPassword }),
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.ok) {
        return 'Senha redefinida com sucesso. Por favor, faça login com sua nova senha.';
      }

    }catch(error){
      console.error('Error during password reset:', error);
      return 'Erro ao tentar redefinir a senha. Verifique suas informações e tente novamente.';
    }
  }


  public async tokenIsExpired(token: any): Promise<any> {
    try{
      const apiBase = import.meta.env['NG_APP_API_URL'];

      const response  = await fetch(`${apiBase}/api/token-test?token=${token}`, {
        method: 'GET',
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;

    }catch(error){
      console.error('Error during token test:', error);
      return 'Erro ao tentar verificar o token. Verifique suas informações e tente novamente.';
    }
  }


  public async jwtTest(token: any): Promise<any> {
      try{
        const apiBase = import.meta.env['NG_APP_API_URL'];

        const response  = await fetch(`${apiBase}/api/jwt-test`, {
          method: 'GET',
          headers: {
            "ngrok-skip-browser-warning": "true",
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;

      }catch(error){
        console.error('Error during JWT test:', error);
        return 'Erro ao tentar verificar o JWT. Verifique suas informações e tente novamente.';
      }
  }
}



