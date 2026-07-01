import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { haalGebruikerOp } from "../lib/auth";
import { supabase } from "../lib/supabase";
import "./dashboard/dashboard.css";

export default function Start() {
  const [fout, setFout] = useState(null);
  const [laden, setLaden] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function controleerSessie() {
      setLaden(true);

      // Controleer of er een actieve Supabase Auth sessie is
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        localStorage.removeItem("email");
        localStorage.removeItem("naam");
        localStorage.removeItem("rol");
        setLaden(false);
        return;
      }

      const email = session.user.email;
      const gebruiker = await haalGebruikerOp(email);

      if (!gebruiker) {
        await supabase.auth.signOut();
        localStorage.removeItem("email");
        localStorage.removeItem("naam");
        localStorage.removeItem("rol");
        setLaden(false);
        return;
      }

      localStorage.setItem("email", email);
      localStorage.setItem("naam", gebruiker.naam);
      localStorage.setItem("rol", gebruiker.rol);

      const redirect = new URLSearchParams(window.location.search).get(
        "redirect",
      );
      if (gebruiker.rol === "trainee") {
        if (redirect) window.location.href = redirect;
        else navigate("/dashboard/trainee");
      } else if (gebruiker.rol === "leidinggevende") {
        if (redirect) window.location.href = redirect;
        else navigate("/dashboard/leidinggevende");
      } else if (gebruiker.rol === "beheerder") navigate("/dashboard/beheer");
      else if (gebruiker.rol === "klant") {
        const redirect = new URLSearchParams(window.location.search).get(
          "redirect",
        );
        if (redirect) window.location.href = redirect;
        else navigate("/klant");
      }
    }

    controleerSessie();
  }, [navigate]);

  async function handleLogin(ingevoerdEmail, ingevoerdWachtwoord) {
    setLaden(true);
    setFout(null);

    // Stap 1: inloggen via Supabase Auth
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: ingevoerdEmail,
      password: ingevoerdWachtwoord,
    });

    if (authError) {
      setFout("Onjuist e-mailadres of wachtwoord.");
      setLaden(false);
      return;
    }

    // Stap 2: rol en naam ophalen uit gebruikers tabel
    const gebruiker = await haalGebruikerOp(ingevoerdEmail);

    if (!gebruiker) {
      setFout("Dit account is niet gekoppeld aan het systeem.");
      setLaden(false);
      return;
    }

    localStorage.setItem("email", ingevoerdEmail);
    localStorage.setItem("naam", gebruiker.naam);
    localStorage.setItem("rol", gebruiker.rol);

    const redirect = new URLSearchParams(window.location.search).get(
      "redirect",
    );
    if (gebruiker.rol === "trainee") {
      if (redirect) window.location.href = redirect;
      else navigate("/dashboard/trainee");
    } else if (gebruiker.rol === "leidinggevende") {
      if (redirect) window.location.href = redirect;
      else navigate("/dashboard/leidinggevende");
    } else if (gebruiker.rol === "beheerder") navigate("/dashboard/beheer");
    else if (gebruiker.rol === "klant") {
      const redirect = new URLSearchParams(window.location.search).get(
        "redirect",
      );
      if (redirect) window.location.href = redirect;
      else navigate("/klant");
    }
  }

  if (laden) {
    return <p style={{ padding: "2rem" }}>Bezig met inloggen...</p>;
  }

  return (
    <div className="login-scherm">
      <h1>Tilstra LMS</h1>
      <h2>Inloggen</h2>
      <input type="email" placeholder="Jouw e-mailadres" id="email-input" />
      <input
        type="password"
        placeholder="Wachtwoord"
        id="wachtwoord-input"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const email = document.getElementById("email-input").value;
            const wachtwoord =
              document.getElementById("wachtwoord-input").value;
            handleLogin(email, wachtwoord);
          }
        }}
      />
      {fout && <p style={{ color: "red" }}>{fout}</p>}
      <p>Druk op Enter om in te loggen</p>
    </div>
  );
}
