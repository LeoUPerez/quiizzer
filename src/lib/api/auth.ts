import type { SupabaseClient, User } from "@supabase/supabase-js";
import { HttpError } from "@/src/lib/api/http";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export interface AuthedContext {
  supabase: SupabaseClient;
  user: User;
}

/** Devuelve el cliente de sesión y el usuario, o lanza 401. */
export const requireUser = async (): Promise<AuthedContext> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new HttpError(401, "Registra tu nombre y correo para continuar");
  return { supabase, user };
};
