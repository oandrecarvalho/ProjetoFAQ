# Projeto FAQ - Backend

Este é o backend do sistema **FAQ - Perguntas Frequentes**, desenvolvido em **ASP.NET Core 7**. A API permite o gerenciamento de produtos, perguntas e respostas com autenticação baseada em JWT e papéis de usuário (cliente e administrador).

## 🧰 Tecnologias Utilizadas

- **ASP.NET Core 7**
- **Entity Framework Core**
- **JWT Authentication com Identity**
- **AutoMapper**
- **Swagger**
- **SQL Server**

## ⚙️ Instalação e Execução

1. Acesse a pasta do backend:
   ```bash
   cd ProjetoFAQ-backend
   ```

2. Configure a `ConnectionString` no arquivo `appsettings.json` com os dados do seu SQL Server.

3. Restaure e atualize o banco de dados:
   ```bash
   dotnet restore
   dotnet ef database update
   ```

4. Inicie a API:
   ```bash
   dotnet run
   ```

## 🔍 Estrutura de Pastas

```
ProjetoFAQ-backend/
├── Controllers/       # Controllers da API
├── DTO/               # Data Transfer Objects
├── Models/            # Entidades do banco
├── Mappings/          # Configurações do AutoMapper
├── Data/              # Configuração do banco e Seed
├── appsettings.json   # Configurações da aplicação
├── Program.cs         # Ponto de entrada da aplicação
└── ProjetoFAQ.sln     # Solução do projeto
```

## ✅ Funcionalidades da API

- CRUD de produtos (admin)
- Envio de perguntas por clientes autenticados
- Resposta e moderação de perguntas por administradores
- Autenticação e autorização via JWT
- Swagger para testes e documentação da API

## 🔐 Segurança e Autenticação

- **JWT**: tokens gerados no login e utilizados no `Authorization Header`.
- **Identity**: controle de usuários com roles (`Cliente`, `Administrador`).
- **Authorization**: controle de acesso por atributo `[Authorize(Roles = "...")]`.

## 📌 Observações

- O projeto segue o padrão **MVC**.
- Os dados sensíveis (ex: connection strings) devem ser protegidos em produção.
- AutoMapper é usado para evitar exposição de entidades diretamente.

