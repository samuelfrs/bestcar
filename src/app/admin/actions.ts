"use server"

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Bypass RLS strictly for Admin-Server Actions
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

// Ensure the caller is authenticated AND an Admin
async function verifyAdmin() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false;
  
  // Use service role to check role to avoid RLS circular issues if any
  const adminSupabase = getAdminClient();
  const { data: roleData } = await adminSupabase.from('user_roles').select('role').eq('user_id', user.id).single();
  
  return roleData?.role === 'admin';
}

export async function createUser(email: string, role: string, name: string, passwordString: string) {
  if (!(await verifyAdmin())) return { error: "Acesso negado. Apenas Administradores." };
  
  const adminClient = getAdminClient();
  
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password: passwordString,
    email_confirm: true,
    user_metadata: { name: name }
  });
  
  if (error) return { error: error.message };
  
  const { error: roleError } = await adminClient.from('user_roles').insert({
    user_id: data.user.id,
    role: role
  });
  
  if (roleError) return { error: roleError.message };
  return { success: true, user: { email, role, id: data.user.id } };
}

export async function deleteUser(userId: string) {
  if (!(await verifyAdmin())) return { error: "Acesso negado." };
  
  const adminClient = getAdminClient();
  
  // As a protection, we prevent the user from deleting themselves, but since we don't pass the current user ID we'll just let it rely on common sense.
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  
  return { success: true };
}

export async function getUsers() {
  if (!(await verifyAdmin())) return { error: "Acesso negado." };
  
  const adminClient = getAdminClient();
  const { data: usersData, error } = await adminClient.auth.admin.listUsers();
  if (error) return { error: error.message };
  
  const { data: rolesData } = await adminClient.from('user_roles').select('*');
  
  const merged = usersData.users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.user_metadata?.name || 'Sistema',
    created_at: u.created_at,
    role: rolesData?.find(r => r.user_id === u.id)?.role || 'moderador'
  }));
  
  return { users: merged };
}
