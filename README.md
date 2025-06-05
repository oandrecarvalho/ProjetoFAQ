
André Luís dos Santos Carvalho - 1987381  
Luiz Henrique Costa Romualdo - 1996932

# Projeto FAQ - Sistema de Perguntas Frequentes

## Visão Geral

O **Projeto FAQ** é uma aplicação web desenvolvida com o objetivo de oferecer uma plataforma centralizada para gerenciamento de perguntas frequentes (FAQs) sobre produtos. O sistema possibilita que os clientes enviem perguntas relacionadas a produtos e que administradores respondam, mantendo uma base de conhecimento acessível e organizada.

## Funcionalidades

### Cliente
- Visualização de produtos cadastrados.
- Visualização de perguntas e respostas relacionadas a um produto.
- Envio de perguntas sobre produtos.
- Registro e autenticação de usuários via JWT.

### Administrador
- Gerenciamento de produtos (CRUD).
- Resposta às perguntas cadastradas pelos clientes.
- Visualização e moderação de perguntas pendentes.

## Tecnologias Utilizadas

### Backend
- ASP.NET Core 7 com C#
- Entity Framework Core com Migrations
- JWT Authentication (com Identity)
- AutoMapper para mapeamento de DTOs
- Swagger para documentação da API
- SQL Server

### Frontend
- Vue.js 3
- Vue Router
- Tailwind CSS
- Font Awesome
- Axios
- SweetAlert2
- LocalStorage

## Instalação

### Backend

1. Navegue até a pasta `ProjetoFAQ-backend`
2. Configure a string de conexão no `appsettings.json`
3. Execute os comandos:
   ```bash
   dotnet restore
   dotnet ef database update
   dotnet run
   ```

### Frontend

1. Navegue até a pasta `ProjetoFAQ-frontend`
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Para iniciar o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Para criar uma versão de produção:
   ```bash
   npm run build
   ```

## Estrutura do Projeto

```
├── ProjetoFAQ-backend/
│   ├── bin/
│   ├── Controllers/
│   ├── Data/
│   ├── DTO/
│   ├── Mappings/
│   ├── Models/
│   ├── obj/
│   ├── Properties/
│   ├── appsettings.json
│   ├── Program.cs
│   ├── ProjetoFAQ.csproj
│   ├── ProjetoFAQ.http
│   └── ProjetoFAQ.sln 
│
├── ProjetoFAQ-frontend/
│   ├── src/
│   │   ├── views/
│   │   ├── components/
│   │   ├── router/
│   │   └── assets/
│   ├── App.vue
│   ├── main.js
│   └── tailwind.config.js
```

## Observações Finais

- O sistema foi desenvolvido como parte da disciplina **Fábrica de Projetos** do curso de **Análise e Desenvolvimento de Sistemas**.
- A aplicação respeita o padrão MVC no backend e SPA no frontend.
- A autenticação é diferenciada por papéis (`Cliente`, `Administrador`), com regras de autorização claras na API.
