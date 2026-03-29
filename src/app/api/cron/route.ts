import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Instância leve e direta para o ping
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  // Verificação de segurança: Garantir que apenas a infraestrutura da Vercel consiga disparar isso.
  // A Vercel automaticamente envia um Bearer token contendo a chave CRON_SECRET que ela mesma gera.
  const authHeader = request.headers.get('authorization');
  if (
    process.env.VERCEL_ENV === 'production' && 
    process.env.CRON_SECRET && 
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Acesso negado: Cron Secret inválido.' }, { status: 401 });
  }

  try {
    // O chamado de "Keep Alive": Um simples SELECT buscando apenas 1 ID. 
    // É o suficiente para acionar computação no banco de dados e evitar que o Supabase desligue o seu projeto no Plano Grátis.
    const { data, error } = await supabase
      .from('vehicles')
      .select('id')
      .limit(1);
    
    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Ping de Manutenção (Keep Alive) realizado com sucesso.',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Erro na rotina cron:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
