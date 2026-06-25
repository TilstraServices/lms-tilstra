import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { haalGebruikerOp } from "../lib/auth";
import "./dashboard/dashboard.css";

export default function Start() {
  const [fout, setFout] = useState(null);
  const [laden, setLaden] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const opgeslagenEmail = localStorage.getItem("email");
    if (!opgeslagenEmail) return;

    async function stuurDoor() {
      setLaden(true);
      const gebruiker = await haalGebruikerOp(opgeslagenEmail);

      if (!gebruiker) {
        localStorage.removeItem("email");
        localStorage.removeItem("naam");
        setLaden(false);
        return;
      }

      localStorage.setItem("naam", gebruiker.naam);
      localStorage.setItem("rol", gebruiker.rol);

      if (gebruiker.rol === "trainee") navigate("/dashboard/trainee");
      else if (gebruiker.rol === "leidinggevende")
        navigate("/dashboard/leidinggevende");
      else if (gebruiker.rol === "beheerder") navigate("/dashboard/beheer");
      else if (gebruiker.rol === "klant") {
        const redirect = new URLSearchParams(window.location.search).get(
          "redirect",
        );
        if (redirect) window.location.href = redirect;
        else navigate("/klant");
      }
    }

    stuurDoor();
  }, [navigate]);

  async function handleLogin(ingevoerdEmail) {
    setLaden(true);
    setFout(null);
    const gebruiker = await haalGebruikerOp(ingevoerdEmail);

    if (!gebruiker) {
      setFout("Dit e-mailadres is niet bekend in het systeem.");
      setLaden(false);
      return;
    }

    localStorage.setItem("email", ingevoerdEmail);
    localStorage.setItem("naam", gebruiker.naam);
    localStorage.setItem("rol", gebruiker.rol);

    if (gebruiker.rol === "trainee") navigate("/dashboard/trainee");
    else if (gebruiker.rol === "leidinggevende")
      navigate("/dashboard/leidinggevende");
    else if (gebruiker.rol === "beheerder") navigate("/dashboard/beheer");
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
      <input
        type="email"
        placeholder="Jouw e-mailadres"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleLogin(e.target.value);
          }
        }}
      />
      {fout && <p style={{ color: "red" }}>{fout}</p>}
      <p>Druk op Enter om in te loggen</p>
    </div>
  );
}
