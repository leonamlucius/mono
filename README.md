# Mono  

<p align="center">
  <img src="public/img/mono.svg" alt="Mono Logo" width="400" />
</p> 

Aplicação full-stack de chat inteligente com suporte a múltiplos provedores de IA (Groq e Ollama), transcrição de áudio, resumos automáticos e sistema completo de autenticação.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Funcionalidades](#-funcionalidades)
- [Licença](#-licença)


## 🎯 Visão Geral

Mono é uma aplicação de chat alimentada por IA que oferece uma experiência conversacional rica e inteligente. O sistema integra múltiplos modelos de IA, possui transcrição de áudio em tempo real, geração de resumos automáticos e um sistema robusto de gerenciamento de usuários.

## 🚀 Tecnologias

### Frontend

- **Framework:** Angular 21.2.0
- **Linguagem:** TypeScript 5.9.2
- **Estilização:** SCSS
- **Gerenciamento de Estado:** ngRx
- **Roteamento:** Angular Router
- **Testing:** Jest 30.4.2, Vitest 4.0.8

### Backend

- **Framework:** Spring Boot 3.4.5
- **Linguagem:** Java 21
- **ORM:** Spring Data JPA
- **Banco de Dados:** PostgreSQL 16 (produção), PostgreSQL (Docker)
- **Segurança:** Spring Security + JWT + HttpOnly Cookies
- **Build Tool:** Maven

### Infraestrutura

- **Banco de Dados:** PostgreSQL 16-Alpine

## 📚 Bibliotecas e Dependências

### Frontend (package.json)

#### Dependências de Produção
```json
{
  "@angular/animations": "^21.2.16",
  "@angular/common": "^21.2.0",
  "@angular/compiler": "^21.2.0",
  "@angular/core": "^21.2.0",
  "@angular/forms": "^21.2.0",
  "@angular/platform-browser": "^21.2.0",
  "@angular/router": "^21.2.0",
  "@ng-icons/bootstrap-icons": "^33.2.3",
  "@ng-icons/core": "^33.2.3",
  "@ng-icons/feather-icons": "^33.2.3",
  "@ng-icons/heroicons": "^33.2.3",
  "@ngx-env/builder": "^21.0.1",
  "marked": "^18.0.5",
  "remove-markdown": "^0.6.4",
  "rxjs": "~7.8.0",
  "wavesurfer.js": "^7.12.10"
}
```
#### Dependências de Desenvolvimento
```json
{
  "@angular-builders/jest": "^22.0.0",
  "@angular/build": "^21.2.13",
  "@angular/cli": "^21.2.13",
  "@types/jest": "^30.0.0",
  "@types/marked": "^5.0.2",
  "jest": "^30.4.2",
  "jest-environment-jsdom": "^30.4.1",
  "prettier": "^3.8.1",
  "ts-jest": "^29.4.11"
}
````

### Backend (pom.xml)

- **Spring Boot Starter Web** - API REST
- **Spring Boot Starter Security** - Autenticação e autorização
- **Spring Boot Starter Data JPA** - Persistência de dados
- **Spring Boot Starter Mail** - Envio de emails
- **Spring Boot Starter Validation** - Validação de dados
- **Spring AI Ollama (v1.0.0-M6)** - Integração com Ollama
- **Spring AI OpenAI (v1.0.0-M6)** - Integração com modelos OpenAI
- **PostgreSQL Driver** - Conexão PostgreSQL
- **H2 Database** - Banco de dados em memória para testes
- **Lombok** - Redução de boilerplate
- **JWT (jjwt) v0.12.5** - Autenticação por token
    - **jjwt-api**
    - **jjwt-impl**
    - **jjwt-jackson**
- **Dotenv Java v3.0.0** - Gerenciamento de variáveis de ambiente


## ✨ Funcionalidades

### 🔐 Autenticação e Usuários

- **Registro de usuários com validação**
- **Login com JWT (HttpOnly cookies)**
- **Logout seguro**
- **Recuperação de senha por email**
- **Reset de senha com token temporizado**
- **Atualização de perfil de usuário**
- **Validação de tokens JWT**

### 💬 Chat com IA


- **Chat inteligente com múltiplos provedores:**
  - Groq (openai/gpt-oss-20b)
  - Ollama (qwen2.5:0.5b)
- **Fallback automático entre provedores**
- **Histórico de conversas por usuário**


### 🎤 Transcrição de Áudio


- **Gravação de áudio em tempo real**
- **Transcrição automática via AssemblyAI**
- **Visualização de forma de onda (WaveSurfer.js)**
- **Cancelamento de gravação**
- **Envio automático após gravação**

### 📝 Resumos Automáticos

- **Geração de resumos de conversas**
- **Cache de resumos (2 horas)**
- **Títulos automáticos**

## 📝 Licença

Este projeto está licenciado sob a Licença Pública Geral GNU versão 3 (GPLv3). Para mais detalhes, consulte o arquivo [LICENSE](LICENSE).

###  Bibliotecas de Licença

- **Piper** - Desenvolvida por [Open Home Foundation](https://www.openhomefoundation.org/) e licenciada sob a [GPLv3](https://www.gnu.org/licenses/gpl-3.0.html). Acesse o repositório oficial do [Pipper](https://www.openhomefoundation.org/).
 
