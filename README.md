# Loja_Bricolage_Gestao_Stock

# Sistema de Gestão de Loja de Bricolage

Este repositório contém o código-fonte de um sistema para gestão de vendas e stock desenvolvido como parte da unidade curricular **Programação para a Web** no curso de **Cibersegurança, Redes e Sistemas Informáticos** (CRSI).

## 📋 Objetivo do Projeto

Desenvolver um sistema integrado que permita a gestão de produtos, controlo de stock, vendas e gestão de clientes de uma loja de bricolage. O sistema também inclui um frontend interativo para clientes e administradores.

---

## 🚀 Funcionalidades

### Backend
- **Gestão de Produto**: CRUD completo para produtos, incluindo título, categoria, descrição, preço, classificação e fotografia.
- **Controlo de Stock**: Monitorização e alertas para reposição automática de produtos.
- **Gestão de Vendas**: Registo de vendas e movimentações de stock.
- **Gestão de Clientes**: Registo e autenticação de utilizadores com diferentes permissões.
- **Autenticação**: Login seguro, autorização por cargos e recuperação de password.

### Frontend
- **Catálogo de Produtos**:
  - Paginação.
  - Ordenação (sort).
  - Pesquisa simples e avançada.
- **Detalhes do Produto**: Exibição de informações detalhadas de um produto.
- **Administração**:
  - Gestão de produtos.
  - Gestão dos clientes.
  - Gestão de vendas.
  - Upload de imagens.
- **Zona do Cliente**:
  - Gestão de perfil.
  - Efetuar compras.
  - Histórico de encomendas.

---

## ⚙️ Tecnologias Utilizadas

### Backend
- **Linguagem**: JavaScript (Node.js).
- **Base de Dados**: MongoDB (base de dados NoSQL para maior flexibilidade).
- **Autenticação**: JWT (JSON Web Tokens) para autenticação e autorização segura.
- **APIs**: Desenvolvimento de endpoints RESTful para operações CRUD e funcionalidades específicas.
- **Mongoose**: ORM/ODM para gestão da base de dados.
- **Bcrypt**: Para encriptação de senhas.
- **Nodemailer**: Para envio de emails, como recuperação de senha.
- **Postman**: Para testar API.

### Frontend
- **Framework**: React (para criar uma WebApp moderna e dinâmica).
- **Axios ou Fetch**: Para comunicação com a API.
- **Design**: CSS (com layouts responsivos).

---

## 🎯 Instalação e Configuração

1. Clone este repositório:
   ```bash
   git clone https://github.com/RobertoBatista28/Loja_Bricolage_Gestao_Stock.git

2. Instalção das dependências e execução:
- Backend:
  ```bash
  cd BACKEND
  npm install
  npm start

- Frontend:
```bash
  cd FRONTEND/tp01
  npm install
  npm start

📦 Estrutura do Repositório
Loja_Bricolage_Gestao_Stock/
├── BACKEND/
│   ├── api/
│   ├── config/
│   ├── controllers/
│   ├── logs/
│   └── ...
├── FRONTEND/
│   ├── src/
│   ├── public/
│   └── ...
├── README.md
├── database.sql
└── LICENSE

  


