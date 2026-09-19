import PharmacologyQuizApp from "@/src/PharmacologyQuiz";
import { loadProfile } from "@/src/lib/api/profile";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/src/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await loadProfile(createSupabaseAdminClient(), user.id) : null;

  return <PharmacologyQuizApp initialProfile={profile} />;
}
