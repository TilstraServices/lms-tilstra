import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { haalGebruikerOp } from "../lib/auth";
import "./dashboard/dashboard.css";

export default function ResetWachtwoord() {
  const [wachtwoord, setWachtwoord] = useState("");
  const [bevestiging, setBevestiging] = useState("");
  const [laden, setLaden] = useState(false);
  const [fout, setFout] = useState(null);
  const [succes, setSucces] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase verwerkt de reset token automatisch uit de URL hash
    // We hoeven alleen te checken of er een sessie is
    async function controleer() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
      }
    }
    controleer();
  }, [navigate]);

  async function handleReset() {
    if (!wachtwoord || !bevestiging) {
      setFout("Vul beide velden in.");
      return;
    }
    if (wachtwoord !== bevestiging) {
      setFout("Wachtwoorden komen niet overeen.");
      return;
    }
    if (wachtwoord.length < 6) {
      setFout("Wachtwoord moet minimaal 6 tekens zijn.");
      return;
    }

    setLaden(true);
    setFout(null);

    const { error } = await supabase.auth.updateUser({ password: wachtwoord });

    if (error) {
      setFout("Wachtwoord instellen mislukt. Probeer opnieuw.");
      setLaden(false);
      return;
    }

    // Haal rol op en stuur door naar juist dashboard
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const email = session?.user?.email;
    const gebruiker = await haalGebruikerOp(email);

    if (gebruiker) {
      localStorage.setItem("email", email);
      localStorage.setItem("naam", gebruiker.naam);
      localStorage.setItem("rol", gebruiker.rol);
    }

    setSucces(true);
    setLaden(false);

    setTimeout(() => {
      if (gebruiker?.rol === "trainee") navigate("/dashboard/trainee");
      else if (gebruiker?.rol === "leidinggevende")
        navigate("/dashboard/leidinggevende");
      else if (gebruiker?.rol === "beheerder") navigate("/dashboard/beheer");
      else navigate("/");
    }, 2000);
  }

  return (
    <div className="login-scherm">
      <h1>Tilstra LMS</h1>
      <h2>Nieuw wachtwoord instellen</h2>

      {succes ? (
        <p style={{ color: "#2E7D32", fontWeight: 600 }}>
          ✓ Wachtwoord ingesteld! Je wordt doorgestuurd...
        </p>
      ) : (
        <>
          <input
            type="password"
            placeholder="Nieuw wachtwoord"
            value={wachtwoord}
            onChange={(e) => setWachtwoord(e.target.value)}
          />
          <input
            type="password"
            placeholder="Bevestig wachtwoord"
            value={bevestiging}
            onChange={(e) => setBevestiging(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleReset();
            }}
          />
          {fout && <p style={{ color: "#C62828" }}>{fout}</p>}
          <button
            onClick={handleReset}
            disabled={laden}
            style={{
              background: "#2E7D32",
              color: "white",
              border: "none",
              borderRadius: "50px",
              padding: "12px 32px",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: laden ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif",
              width: "320px",
            }}
          >
            {laden ? "Opslaan..." : "Wachtwoord instellen"}
          </button>
          <p>Druk op Enter of klik op de knop</p>
        </>
      )}
    </div>
  );
}
