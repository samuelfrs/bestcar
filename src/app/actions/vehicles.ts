"use server";

import { sql } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Vehicle } from '@/types';
import { revalidatePath } from 'next/cache';

interface VehicleDbRow {
  id: string;
  brand: string;
  model: string;
  year: number | string;
  price: number | string;
  status: string;
  image_url: string | null;
  created_at: string | Date;
}

export async function getVehicles(): Promise<{ data: Vehicle[]; error: string | null }> {
  try {
    const rows = (await sql`
      SELECT id, brand, model, year, price, status, image_url, created_at
      FROM vehicles
      ORDER BY created_at DESC
    `) as unknown as VehicleDbRow[];

    const vehicles: Vehicle[] = rows.map((r) => ({
      id: r.id,
      brand: r.brand,
      model: r.model,
      year: Number(r.year),
      price: Number(r.price),
      status: r.status,
      image_url: r.image_url,
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    }));

    return { data: vehicles, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao carregar veículos';
    console.error('Erro ao buscar veículos:', err);
    return { data: [], error: msg };
  }
}

export interface SaveVehicleInput {
  id?: string | null;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  image_url?: string | null;
}

export async function saveVehicle(payload: SaveVehicleInput) {
  const user = await getSessionUser();
  if (!user) {
    return { error: 'Acesso não autorizado. Faça login primeiro.' };
  }

  const { id, brand, model, year, price, status, image_url } = payload;

  if (!brand || !model || isNaN(year) || isNaN(price)) {
    return { error: 'Preencha todos os campos obrigatórios corretamente.' };
  }

  try {
    if (id) {
      // Atualização
      await sql`
        UPDATE vehicles
        SET 
          brand = ${brand},
          model = ${model},
          year = ${year},
          price = ${price},
          status = ${status},
          image_url = ${image_url || null}
        WHERE id = ${id}
      `;
    } else {
      // Criação
      await sql`
        INSERT INTO vehicles (brand, model, year, price, status, image_url)
        VALUES (${brand}, ${model}, ${year}, ${price}, ${status}, ${image_url || null})
      `;
    }

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao salvar veículo';
    console.error('Erro ao salvar veículo:', err);
    return { error: msg };
  }
}

export async function deleteVehicle(id: string) {
  const user = await getSessionUser();
  if (!user) {
    return { error: 'Acesso não autorizado. Faça login primeiro.' };
  }

  try {
    await sql`
      DELETE FROM vehicles
      WHERE id = ${id}
    `;

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao excluir veículo';
    console.error('Erro ao excluir veículo:', err);
    return { error: msg };
  }
}
