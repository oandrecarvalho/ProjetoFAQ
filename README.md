# Projeto FAQ - Frontend

Este é o frontend do sistema **FAQ - Perguntas Frequentes**, desenvolvido com Vue.js 3. Ele permite que clientes visualizem produtos, façam perguntas e acompanhem as respostas fornecidas por administradores. Administradores utilizam a interface para responder perguntas e gerenciar os produtos.

## 🧰 Tecnologias Utilizadas

- **Vue.js 3**
- **Vue Router**
- **Tailwind CSS**
- **Font Awesome**
- **Axios**
- **SweetAlert2**
- **LocalStorage** (para armazenamento do token JWT)

## 🔧 Instalação e Execução

1. Acesse a pasta do frontend:
   ```bash
   cd ProjetoFAQ-frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Para gerar uma versão de produção:
   ```bash
   npm run build
   ```

## 🔍 Estrutura de Pastas

```
src/
├── assets/           # Imagens e estilos estáticos
├── components/       # Componentes reutilizáveis (ex: Navbar, Sidebar)
├── router/           # Rotas da aplicação
├── views/            # Telas principais (Login, Produtos, FAQ, Admin)
├── App.vue           # Componente raiz
└── main.js           # Ponto de entrada do Vue
```

## ✅ Funcionalidades

- Registro e login de usuários (clientes e administradores)
- Listagem de produtos disponíveis
- Envio e visualização de perguntas por produto
- Resposta e moderação de perguntas (admin)
- Interface amigável com feedback visual (SweetAlert)

## 📌 Observações

- O token JWT é armazenado no `LocalStorage` e utilizado nos headers das requisições via Axios.
- A visibilidade das rotas é baseada no papel do usuário (cliente ou administrador).
