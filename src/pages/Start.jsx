import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { haalRolOp } from "../lib/auth";

export default function Start() {
  const [fout, setFout] = useState(null);
  const [laden, setLaden] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const opgeslagenEmail = localStorage.getItem("email");
    if (!opgeslagenEmail) return;

    async function stuurDoor() {
      setLaden(true);
      const rol = await haalRolOp(opgeslagenEmail);

      if (!rol) {
        localStorage.removeItem("email");
        setLaden(false);
        return;
      }

      if (rol === "trainee") navigate("/dashboard/trainee");
      else if (rol === "leidinggevende") navigate("/dashboard/leidinggevende");
      else if (rol === "beheerder") navigate("/dashboard/beheer");
    }

    stuurDoor();
  }, [navigate]);

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

    if (rol === "trainee") navigate("/dashboard/trainee");
    else if (rol === "leidinggevende") navigate("/dashboard/leidinggevende");
    else if (rol === "beheerder") navigate("/dashboard/beheer");
  }

  if (laden) {
    return <p style={{ padding: "2rem" }}>Bezig met inloggen...</p>;
  }

  return (
    <div className="dashboard-login">
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
