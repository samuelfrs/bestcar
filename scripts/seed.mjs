import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

// Carregar .env.local se existir
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
  console.log("👉 Adicione DATABASE_URL=\"postgresql://...\" no seu .env.local antes de rodar o seed.");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function main() {
  console.log("🚀 Iniciando migração e seed no Neon PostgreSQL...\n");

  // 1. Criar Tabelas e Índices
  console.log("📦 1. Criando estrutura das tabelas...");
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
  console.log("✅ Tabelas e índices verificados/criados com sucesso.");

  // 2. Criar Usuário Administrador Inicial
  const adminEmail = 'admin@bestcar.com';
  const adminPassword = 'adminpassword123';
  const adminName = 'Administrador Principal';

  console.log(`\n👤 2. Verificando administrador inicial (${adminEmail})...`);
  const existingUsers = await sql`
    SELECT id, email FROM users WHERE LOWER(email) = LOWER(${adminEmail}) LIMIT 1
  `;

  if (existingUsers.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${adminName}, ${adminEmail}, ${passwordHash}, 'admin')
    `;
    console.log("✅ Usuário administrador criado com sucesso!");
  } else {
    console.log("ℹ️ Administrador inicial já existe no banco de dados.");
  }

  // 3. Inserir Veículos de Demonstração (se o estoque estiver vazio)
  console.log("\n🏎️ 3. Verificando estoque de veículos...");
  const vehicleCount = await sql`SELECT COUNT(*) as count FROM vehicles`;
  
  if (parseInt(vehicleCount[0].count, 10) === 0) {
    console.log("🚗 Inserindo catálogo inicial de veículos...");
    const sampleVehicles = [
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
      }
    ];

    for (const car of sampleVehicles) {
      await sql`
        INSERT INTO vehicles (brand, model, year, price, status, image_url)
        VALUES (${car.brand}, ${car.model}, ${car.year}, ${car.price}, ${car.status}, ${car.image_url})
      `;
    }
    console.log(`✅ ${sampleVehicles.length} veículos de demonstração inseridos!`);
  } else {
    console.log(`ℹ️ O banco já possui ${vehicleCount[0].count} veículos.`);
  }

  console.log("\n==========================================");
  console.log("🎉 BANCO NEON CONFIGURADO COM SUCESSO!");
  console.log("==========================================");
  console.log(`Credenciais do Administrador:`);
  console.log(`  E-mail: ${adminEmail}`);
  console.log(`  Senha:  ${adminPassword}`);
  console.log("==========================================\n");
}

main().catch(err => {
  console.error("❌ Erro durante o seed:", err);
  process.exit(1);
});
