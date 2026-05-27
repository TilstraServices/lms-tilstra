import { supabase } from "./supabase";

export async function haalGebruikerOp(email) {
  const { data, error } = await supabase
    .from("gebruikers")
    .select("rol, naam")
    .eq("email", email)
    .single();

  if (error || !data) return null;
  return data;
}

export async function haalRolOp(email) {
  const gebruiker = await haalGebruikerOp(email);
  return gebruiker ? gebruiker.rol : null;
}
