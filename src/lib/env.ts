const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copia .env.example a .env.local y complétala.`,
    );
  }
  return value;
};

export const supabaseUrl = (): string => required("NEXT_PUBLIC_SUPABASE_URL");
export const supabasePublicKey = (): string => required("NEXT_PUBLIC_SUPABASE_KEY");
export const supabaseSecretKey = (): string => required("SUPABASE_SECRET_KEY");
