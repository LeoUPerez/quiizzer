import { NextResponse } from "next/server";
import { loadAttemptDetail } from "@/src/lib/api/attempts";
import { requireUser } from "@/src/lib/api/auth";
import { handle } from "@/src/lib/api/http";
import { createSupabaseAdminClient } from "@/src/lib/supabase/server";

/** GET /api/attempts/:id — intento con examen, preguntas y respuestas dadas. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(async () => {
    const { supabase } = await requireUser();
    const { id } = await params;
    const detail = await loadAttemptDetail(supabase, createSupabaseAdminClient(), id);
    return NextResponse.json(detail);
  });
}
