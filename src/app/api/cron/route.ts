import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  // Verificação de segurança: Garantir que apenas a infraestrutura da Vercel consiga disparar isso.
  const authHeader = request.headers.get('authorization');
  if (
    process.env.VERCEL_ENV === 'production' && 
    process.env.CRON_SECRET && 
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Acesso negado: Cron Secret inválido.' }, { status: 401 });
  }

  try {
    // Ping de verificação / health check no Neon PostgreSQL
    const rows = await sql`
      SELECT id FROM vehicles LIMIT 1
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Ping de Manutenção realizado com sucesso no Neon PostgreSQL.',
      count: rows.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error("Erro na rotina cron:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
