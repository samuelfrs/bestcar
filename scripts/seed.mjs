import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

// 1. Carregar .env.local se existir
const envLocalPath = path.resolve('.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ ERRO: DATABASE_URL não encontrada no ambiente nem no .env.local");
  console.log("👉 Adicione DATABASE_URL no seu .env.local antes de rodar o seed.");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function main() {
  console.log("\n=======================================================");
  console.log("🏎️  BESTCAR // SEED DO BANCO NEON POSTGRESQL");
  console.log("=======================================================\n");

  // 1. Criar Tabelas e Índices
  console.log("📦 1. Verificando/Criando estrutura de tabelas e índices...");
  await sql`
    CREATE TABLE IF NOT EXISTS vehicles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      brand VARCHAR(100) NOT NULL,
      model VARCHAR(100) NOT NULL,
      year INTEGER NOT NULL,
      price NUMERIC(12, 2) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'disponível',
      image_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'moderador' CHECK (role IN ('admin', 'moderador')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_leads_vehicle_id ON leads(vehicle_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
  console.log("✅ Estrutura de banco pronta.");

  // 2. Criar Usuários da Equipe (Admin e Moderador)
  console.log("\n👥 2. Semeando usuários da equipe...");

  const usersToSeed = [
    {
      name: 'Administrador BestCar',
      email: 'admin@bestcar.com',
      password: 'adminpassword123',
      role: 'admin'
    },
    {
      name: 'Moderador Equipe',
      email: 'moderador@bestcar.com',
      password: 'modpassword123',
      role: 'moderador'
    }
  ];

  for (const user of usersToSeed) {
    const existing = await sql`
      SELECT id FROM users WHERE LOWER(email) = LOWER(${user.email}) LIMIT 1
    `;

    if (existing.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(user.password, salt);
      await sql`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (${user.name}, ${user.email}, ${hash}, ${user.role})
      `;
      console.log(`  ➕ Usuário criado: ${user.email} (${user.role})`);
    } else {
      console.log(`  ℹ️ Usuário já existe: ${user.email}`);
    }
  }

  // 3. Catálogo Completo de Veículos Exclusivos
  console.log("\n🚗 3. Semeando catálogo de veículos...");

  const catalog = [
    {
      brand: 'Porsche',
      model: '911 GT3 RS',
      year: 2024,
      price: 1950000.00,
      status: 'disponível',
      image_url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80'
    },
    {
      brand: 'Ferrari',
      model: 'F8 Tributo',
      year: 2023,
      price: 3400000.00,
      status: 'disponível',
      image_url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80'
    },
    {
      brand: 'Lamborghini',
      model: 'Huracán EVO',
      year: 2023,
      price: 3100000.00,
      status: 'reservado',
      image_url: 'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?auto=format&fit=crop&w=1200&q=80'
    },
    {
      brand: 'BMW',
      model: 'M4 Competition',
      year: 2024,
      price: 890000.00,
      status: 'disponível',
      image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80'
    },
    {
      brand: 'Mercedes-AMG',
      model: 'GT Black Series',
      year: 2023,
      price: 2450000.00,
      status: 'disponível',
      image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80'
    },
    {
      brand: 'McLaren',
      model: '720S Spider',
      year: 2023,
      price: 2850000.00,
      status: 'disponível',
      image_url: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=1200&q=80'
    },
    {
      brand: 'Audi',
      model: 'RS6 Avant Performance',
      year: 2024,
      price: 1150000.00,
      status: 'vendido',
      image_url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80'
    },
    {
      brand: 'Aston Martin',
      model: 'Vantage V8',
      year: 2023,
      price: 1850000.00,
      status: 'disponível',
      image_url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  for (const car of catalog) {
    const existing = await sql`
      SELECT id FROM vehicles 
      WHERE LOWER(brand) = LOWER(${car.brand}) AND LOWER(model) = LOWER(${car.model}) 
      LIMIT 1
    `;

    if (existing.length === 0) {
      await sql`
        INSERT INTO vehicles (brand, model, year, price, status, image_url)
        VALUES (${car.brand}, ${car.model}, ${car.year}, ${car.price}, ${car.status}, ${car.image_url})
      `;
      console.log(`  ➕ Veículo adicionado: ${car.brand} ${car.model}`);
    } else {
      console.log(`  ℹ️ Veículo já existente: ${car.brand} ${car.model}`);
    }
  }

  // 4. Semeando Leads de Demonstração
  console.log("\n📩 4. Semeando leads de demonstração...");
  const leadsCount = await sql`SELECT COUNT(*) as count FROM leads`;

  if (parseInt(leadsCount[0].count, 10) === 0) {
    const firstVehicle = await sql`SELECT id FROM vehicles LIMIT 1`;
    const vehicleId = firstVehicle.length > 0 ? firstVehicle[0].id : null;

    const sampleLeads = [
      {
        customer_name: 'Roberto Silva',
        customer_phone: '(11) 98765-4321',
        message: 'Tenho interesse na compra à vista.'
      },
      {
        customer_name: 'Mariana Duarte',
        customer_phone: '(21) 99123-8877',
        message: 'Gostaria de agendar uma visita e test-drive.'
      }
    ];

    for (const lead of sampleLeads) {
      await sql`
        INSERT INTO leads (vehicle_id, customer_name, customer_phone, message)
        VALUES (${vehicleId}, ${lead.customer_name}, ${lead.customer_phone}, ${lead.message})
      `;
      console.log(`  ➕ Lead cadastrado: ${lead.customer_name}`);
    }
  } else {
    console.log(`  ℹ️ Leads já cadastrados (${leadsCount[0].count} registros encontrados).`);
  }

  console.log("\n=======================================================");
  console.log("🎉 BANCO NEON TOTALMENTE POPULADO COM SUCESSO!");
  console.log("=======================================================");
  console.log("Credenciais de Acesso ao Painel Admin (/admin):");
  console.log("  👑 Administrador: admin@bestcar.com     | Senha: adminpassword123");
  console.log("  🛡️  Moderador:     moderador@bestcar.com | Senha: modpassword123");
  console.log("=======================================================\n");
}

main().catch(err => {
  console.error("❌ Erro fatal durante o seed:", err);
  process.exit(1);
});
