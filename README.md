# 🏎️ BestCar // Concessionária Digital

Uma plataforma web moderna e de alta performance desenvolvida para concessionárias digitais de veículos exclusivos. O projeto combina um design **Brutalista/Cyberpunk** com acentos verde neon, vitrine interativa para captura de leads e um **Painel Administrativo** protegido por controle de acesso baseado em funções (RBAC).

---

## 🌟 Principais Funcionalidades

### 🚘 Vitrine Pública
- **Catálogo de Veículos:** Exibição dinâmica da frota com preço formatado em BRL, ano e status de disponibilidade (*Disponível*, *Reservado*, *Vendido*).
- **Captura de Leads:** Modal interativo ("Tenho Interesse") para potenciais clientes enviarem nome e WhatsApp vinculados ao veículo de interesse.
- **Design Responsivo & Brutalista:** Interface escura (*Dark Mode*), linhas de grid marcantes, tipografia moderna e animações sutis.

### 🛡️ Painel Administrativo (`/admin`)
- **Autenticação Segura:** Login administrativo integrado ao Supabase Auth.
- **Controle de Acesso (RBAC):** Permissões diferenciadas entre **Administrador** e **Moderador**.
- **Gestão de Estoque (CRUD):** Adição, edição e exclusão de veículos em tempo real com modal responsivo adaptado para mobile e desktop.
- **Gestão de Leads:** Visualização detalhada dos contatos recebidos com opção de exclusão de leads.
- **Gestão de Equipe (Exclusivo Admin):** Criação e remoção de credenciais de membros da equipe (administradores ou moderadores) utilizando Server Actions com a Supabase Admin API.

---

## 🔒 Segurança e Arquitetura do Backend

- **Row Level Security (RLS):** Regras ativas no banco PostgreSQL (Supabase). Usuários anônimos da vitrine só possuem permissão para **leitura de veículos** e **inserção de leads**. Operações de alteração e exclusão requerem autenticação e validação de perfil.
- **Server Actions Protegidas:** Operações sensíveis de gerenciamento de equipe usam Server Actions no Next.js com verificação em duas etapas (validação do token JWT e checagem de role no servidor).
- **Chaves de API Isoladas:** A `SUPABASE_SERVICE_ROLE_KEY` permanece 100% restrita ao ambiente do servidor (`.env.local`), garantindo que nenhuma credencial administrativa vaze para o frontend.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Banco de Dados & Autenticação:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS)
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
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis do seu projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-privada
```

### 4. Rodar o servidor de desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a vitrine pública, ou acesse [http://localhost:3000/admin](http://localhost:3000/admin) para entrar no painel administrativo.

---

## 📝 Licença

Este projeto foi desenvolvido para fins de portfólio e demonstração.
