"use server";

import { sql } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Lead } from '@/types';
import { revalidatePath } from 'next/cache';

export interface CreateLeadInput {
  vehicle_id: string;
  customer_name: string;
  customer_phone: string;
  message?: string;
}

export type LeadWithVehicle = Lead & {
  vehicles: { brand: string; model: string } | null;
};

interface LeadDbRow {
  id: string;
  vehicle_id: string;
  customer_name: string;
  customer_phone: string;
  message: string | null;
  created_at: string | Date;
  v_brand: string | null;
  v_model: string | null;
}

export async function createLead(input: CreateLeadInput) {
  const { vehicle_id, customer_name, customer_phone, message } = input;

  if (!customer_name || !customer_phone) {
    return { error: 'Nome e telefone são obrigatórios.' };
  }

  try {
    await sql`
      INSERT INTO leads (vehicle_id, customer_name, customer_phone, message)
      VALUES (${vehicle_id || null}, ${customer_name}, ${customer_phone}, ${message || null})
    `;

    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    console.error('Erro ao registrar lead:', err);
    return { error: 'Ocorreu um erro ao enviar seu contato. Tente novamente.' };
  }
}

export async function getLeads(): Promise<{ data: LeadWithVehicle[]; error: string | null }> {
  const user = await getSessionUser();
  if (!user) {
    return { data: [], error: 'Acesso não autorizado.' };
  }

  try {
    const rows = (await sql`
      SELECT 
        l.id,
        l.vehicle_id,
        l.customer_name,
        l.customer_phone,
        l.message,
        l.created_at,
        v.brand as v_brand,
        v.model as v_model
      FROM leads l
      LEFT JOIN vehicles v ON l.vehicle_id = v.id
      ORDER BY l.created_at DESC
    `) as unknown as LeadDbRow[];

    const leads: LeadWithVehicle[] = rows.map((r) => ({
      id: r.id,
      vehicle_id: r.vehicle_id,
      customer_name: r.customer_name,
      customer_phone: r.customer_phone,
      message: r.message,
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      vehicles: r.v_brand && r.v_model ? { brand: r.v_brand, model: r.v_model } : null,
    }));

    return { data: leads, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao carregar leads';
    console.error('Erro ao buscar leads:', err);
    return { data: [], error: msg };
  }
}

export async function deleteLead(id: string) {
  const user = await getSessionUser();
  if (!user) {
    return { error: 'Acesso não autorizado.' };
  }

  try {
    await sql`
      DELETE FROM leads
      WHERE id = ${id}
    `;

    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao excluir lead';
    console.error('Erro ao excluir lead:', err);
    return { error: msg };
  }
}
