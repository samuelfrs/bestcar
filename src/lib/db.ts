import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

export function getDb(): NeonQueryFunction<false, false> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL não está definida nas variáveis de ambiente.');
  }
  return neon(connectionString);
}

// Wrapper seguro que resolve a conexão em runtime (evita erros em build sem env configurada)
export const sql: NeonQueryFunction<false, false> = ((
  strings: TemplateStringsArray,
  ...values: unknown[]
) => {
  const db = getDb();
  return db(strings, ...values);
}) as NeonQueryFunction<false, false>;
