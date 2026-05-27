import { supabase } from "./supabase";

export async function haalRolOp(email) {
  const { data, error } = await supabase
    .from("gebruikers")
    .select("rol")
    .eq("email", email)
    .single();

  if (error || !data) return null;
  return data.rol;
}
