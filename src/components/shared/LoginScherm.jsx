import { useState } from "react";
import { supabase } from "../../lib/supabase";

function LoginScherm({ rol, onIngelogd }) {
  const [email, setEmail] = useState("");
  const [fout, setFout] = useState("");
  const [laden, setLaden] = useState(false);

  async function bevestigLogin() {
    const geldig = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!geldig) {
      setFout("Vul een geldig e-mailadres in.");
      return;
    }

    setFout("");
    setLaden(true);

    const { data, error } = await supabase
      .from("gebruikers")
      .select("email, naam, rol")
      .eq("email", email.toLowerCase());

    setLaden(false);

    if (error || !data || data.length === 0) {
      setFout("Dit e-mailadres is onbekend. Neem contact op met de beheerder.");
      return;
    }

    onIngelogd(data[0]);
  }

  return (
    <div style={stijlen.kaart}>
      <h2 style={stijlen.titel}>
        {rol === "leidinggevende"
          ? "Leidinggevende portaal"
          : "Competentiematrix"}
      </h2>
      <p style={stijlen.subtitel}>
        {rol === "leidinggevende"
          ? "Vul je eigen e-mailadres in om het trainee-overzicht te openen."
          : "Vul je e-mailadres in om je matrix te openen."}
      </p>

      <label style={stijlen.label}>E-mailadres</label>
      <input
        type="email"
        placeholder="naam@bedrijf.nl"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && bevestigLogin()}
        style={stijlen.input}
      />

      {fout && <p style={stijlen.fout}>{fout}</p>}

      <button onClick={bevestigLogin} disabled={laden} style={stijlen.knop}>
        {laden ? "Controleren…" : "Openen →"}
      </button>
    </div>
  );
}

const stijlen = {
  kaart: {
    maxWidth: "480px",
    margin: "80px auto",
    background: "#fff",
    border: "1px solid #eee",
    borderLeft: "5px solid #2e7d32",
    borderRadius: "10px",
    padding: "32px 28px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  titel: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#1b5e20",
    marginBottom: "6px",
  },
  subtitel: {
    fontSize: "0.85rem",
    color: "#616161",
    marginBottom: "24px",
  },
  label: {
    display: "block",
    fontSize: "0.72rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#9e9e9e",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "0.9rem",
    marginBottom: "16px",
    fontFamily: "inherit",
  },
  fout: {
    fontSize: "0.82rem",
    color: "#c62828",
    marginBottom: "12px",
  },
  knop: {
    width: "100%",
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "50px",
    padding: "10px 24px",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default LoginScherm;
