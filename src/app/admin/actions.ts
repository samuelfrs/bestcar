"use server";

import { sql } from '@/lib/db';
import { 
  getSessionUser, 
  hashPassword, 
  verifyPassword, 
  createSessionToken, 
  SESSION_COOKIE_NAME,
  type SessionUser 
} from '@/lib/auth';
import { cookies } from 'next/headers';

// Helper para verificar se quem está chamando é Administrador
async function verifyAdmin(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'moderador';
  created_at: string | Date;
}

// Ação de Login
export async function loginAction(email: string, passwordString: string) {
  try {
    if (!email || !passwordString) {
      return { error: 'E-mail e senha são obrigatórios.' };
    }

    const rows = (await sql`
      SELECT id, name, email, password_hash, role
      FROM users
      WHERE LOWER(email) = LOWER(${email.trim()})
      LIMIT 1
    `) as unknown as UserRow[];

    if (rows.length === 0) {
      return { error: 'Credenciais inválidas. Verifique seu e-mail e senha.' };
    }

    const user = rows[0];
    const passwordMatch = await verifyPassword(passwordString, user.password_hash);

    if (!passwordMatch) {
      return { error: 'Credenciais inválidas. Verifique seu e-mail e senha.' };
    }

    const sessionPayload: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = await createSessionToken(sessionPayload);
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return { success: true, user: sessionPayload };
  } catch (err: unknown) {
    console.error('Erro na autenticação:', err);
    return { error: 'Erro interno ao tentar autenticar.' };
  }
}

// Ação de Logout
export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    return { success: true };
  } catch (err: unknown) {
    console.error('Erro ao deslogar:', err);
    return { error: 'Erro ao deslogar.' };
  }
}

// Obter usuário da sessão
export async function getCurrentUserAction() {
  const user = await getSessionUser();
  return { user };
}

// Criar novo membro da equipe (Apenas Admin)
export async function createUser(email: string, role: string, name: string, passwordString: string) {
  const admin = await verifyAdmin();
  if (!admin) {
    return { error: 'Acesso negado. Apenas Administradores podem criar usuários.' };
  }

  if (!email || !passwordString || !name) {
    return { error: 'Todos os campos são obrigatórios.' };
  }

  if (passwordString.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres.' };
  }

  const validRole = role === 'admin' ? 'admin' : 'moderador';

  try {
    const existing = (await sql`
      SELECT id FROM users WHERE LOWER(email) = LOWER(${email.trim()}) LIMIT 1
    `) as unknown as Array<{ id: string }>;

    if (existing.length > 0) {
      return { error: 'Já existe um usuário cadastrado com este e-mail.' };
    }

    const hashedPassword = await hashPassword(passwordString);

    const inserted = (await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name.trim()}, ${email.trim().toLowerCase()}, ${hashedPassword}, ${validRole})
      RETURNING id, name, email, role, created_at
    `) as unknown as UserRow[];

    const newUser = inserted[0];
    return { 
      success: true, 
      user: { 
        id: newUser.id, 
        email: newUser.email, 
        name: newUser.name, 
        role: newUser.role 
      } 
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao criar usuário.';
    console.error('Erro ao criar usuário:', err);
    return { error: msg };
  }
}

// Excluir usuário (Apenas Admin)
export async function deleteUser(userId: string) {
  const admin = await verifyAdmin();
  if (!admin) {
    return { error: 'Acesso negado.' };
  }

  if (admin.id === userId) {
    return { error: 'Você não pode excluir sua própria conta de administrador.' };
  }

  try {
    await sql`
      DELETE FROM users
      WHERE id = ${userId}
    `;

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao excluir usuário.';
    console.error('Erro ao excluir usuário:', err);
    return { error: msg };
  }
}

// Listar todos os usuários (Apenas Admin)
export async function getUsers() {
  const admin = await verifyAdmin();
  if (!admin) {
    return { error: 'Acesso negado.' };
  }

  try {
    const rows = (await sql`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
    `) as unknown as UserRow[];

    const users = rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    }));

    return { users };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao buscar equipe.';
    console.error('Erro ao listar usuários:', err);
    return { error: msg };
  }
}
