# 🏎️ BestCar // Concessionária Digital

Uma plataforma web moderna e de alta performance desenvolvida para concessionárias digitais de veículos exclusivos. O projeto combina um design **Brutalista/Cyberpunk** com acentos verde neon, vitrine interativa para captura de leads e um **Painel Administrativo** protegido por controle de acesso baseado em funções (RBAC).

---

## 🌟 Principais Funcionalidades

### 🚘 Vitrine Pública
- **Catálogo de Veículos:** Exibição dinâmica da frota com preço formatado em BRL, ano e status de disponibilidade (*Disponível*, *Reservado*, *Vendido*).
- **Captura de Leads:** Modal interativo ("Tenho Interesse") para potenciais clientes enviarem nome e WhatsApp vinculados ao veículo de interesse.
- **Design Responsivo & Brutalista:** Interface escura (*Dark Mode*), linhas de grid marcantes, tipografia moderna e animações sutis.

### 🛡️ Painel Administrativo (`/admin`)
- **Autenticação Segura:** Autenticação nativa com senhas criptografadas em `bcryptjs` e sessões gerenciadas em cookies `HttpOnly` com `jose` (JWT).
- **Controle de Acesso (RBAC):** Permissões diferenciadas entre **Administrador** e **Moderador**.
- **Gestão de Estoque (CRUD):** Adição, edição e exclusão de veículos em tempo real com modal responsivo adaptado para mobile e desktop.
- **Gestão de Leads:** Visualização detalhada dos contatos recebidos com opção de exclusão de leads.
- **Gestão de Equipe (Exclusivo Admin):** Criação e remoção de credenciais de membros da equipe utilizando Server Actions no Next.js.

---

## 🔒 Segurança e Arquitetura do Backend

- **PostgreSQL Serverless (Neon):** Banco de dados relacional moderno com alta disponibilidade, conexão serverless otimizada via `@neondatabase/serverless`.
- **Server Actions Protegidas:** Operações de mutação e consulta administrativa executam estritamente no servidor com validação do usuário logado via cookies de sessão seguros.
- **Isolamento de Credenciais:** `DATABASE_URL` e `JWT_SECRET` permanecem restritos ao ambiente do servidor (`.env.local` / Vercel Environment Variables).

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & React 19)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Banco de Dados:** [Neon PostgreSQL](https://neon.tech/) (`@neondatabase/serverless`)
- **Segurança & Auth:** `bcryptjs` + `jose`
- **Hospedagem:** [Vercel](https://vercel.com/)

---

## 🚀 Como Executar o Projeto Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/bestcar.git
cd bestcar
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com as credenciais do seu banco Neon:

```env
# Connection String do Neon PostgreSQL
DATABASE_URL="postgresql://[usuario]:[senha]@[host-neon].neon.tech/[banco]?sslmode=require"

# Segredo para assinatura de tokens JWT de sessão (ex: string aleatória longa)
JWT_SECRET="sua_chave_secreta_super_segura_aqui"
```

### 4. Executar as Migrações e Seed Inicial
Para criar a estrutura de tabelas e o usuário administrador inicial (`admin@bestcar.com` / `adminpassword123`), execute:

```bash
npm run seed
```

### 5. Rodar o servidor de desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a vitrine pública, ou acesse [http://localhost:3000/admin](http://localhost:3000/admin) para entrar no painel administrativo.

---

## 📝 Licença

Este projeto foi desenvolvido para fins de demonstração e portfólio.
