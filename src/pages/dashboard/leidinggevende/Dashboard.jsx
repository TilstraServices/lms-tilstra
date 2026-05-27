import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { haalRolOp } from "../../../lib/auth";

export default function LeidinggevendeDashboard() {
  const [email, setEmail] = useState(() => localStorage.getItem("email"));
  const [fout, setFout] = useState(null);
  const [laden, setLaden] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(ingevoerdEmail) {
    setLaden(true);
    setFout(null);
    const rol = await haalRolOp(ingevoerdEmail);

    if (!rol) {
      setFout("Dit e-mailadres is niet bekend in het systeem.");
      setLaden(false);
      return;
    }

    localStorage.setItem("email", ingevoerdEmail);
    setEmail(ingevoerdEmail);

    if (rol === "trainee") {
      navigate("/dashboard/trainee");
    } else if (rol === "beheerder") {
      navigate("/dashboard/beheer");
    }

    setLaden(false);
  }

  if (!email) {
    return (
      <div className="dashboard-login">
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
        {laden && <p>Bezig met inloggen...</p>}
        {fout && <p style={{ color: "red" }}>{fout}</p>}
        <p>Druk op Enter om in te loggen</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Leidinggevende Dashboard</h1>
        <span>{email}</span>
      </header>
      <nav className="dashboard-nav">
        <button>Mijn Trainees</button>
        <button>Voortgang</button>
        <button>Matrix</button>
      </nav>
      <main className="dashboard-inhoud">
        <p>Welkom! Kies een onderdeel via het menu.</p>
      </main>
    </div>
  );
}
