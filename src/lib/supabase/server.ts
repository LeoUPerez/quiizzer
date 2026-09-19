import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabasePublicKey, supabaseSecretKey, supabaseUrl } from "@/src/lib/env";

/**
 * Cliente ligado a la sesión del usuario (cookies). Todas sus consultas pasan
 * por las políticas RLS, así que solo ve lo que el usuario puede ver.
 * Úsalo para leer datos y para verificar identidad/propiedad.
 */
export const createSupabaseServerClient = async (): Promise<SupabaseClient> => {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabasePublicKey(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Llamado desde un Server Component: no se pueden escribir cookies.
          // proxy.ts se encarga de refrescar la sesión en ese caso.
        }
      },
    },
  });
};

/**
 * Cliente con la clave secreta: ignora RLS. Solo se usa en el servidor,
 * después de comprobar con el cliente de sesión que el usuario tiene derecho
 * a la operación (p. ej. calificar un intento, leer respuestas correctas).
 */
export const createSupabaseAdminClient = (): SupabaseClient =>
  createClient(supabaseUrl(), supabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
