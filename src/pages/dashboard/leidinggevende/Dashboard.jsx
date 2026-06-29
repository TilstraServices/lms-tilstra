import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { haalGebruikerOp } from "../../../lib/auth";
import DashboardLayout from "../DashboardLayout";
import MatrixBlok from "./blokken/MatrixBlok";
import HomeBlok from "./blokken/HomeBlok";
import MijnTraineesBlok from "./blokken/MijnTraineesBlok";
import InstellingenBlok from "./blokken/InstellingenBlok";
import { HouseIcoon } from "../../../assets/icons.jsx";

export default function LeidinggevendeDashboard() {
  const [email, setEmail] = useState(() => localStorage.getItem("email"));
  const [naam, setNaam] = useState(() => localStorage.getItem("naam"));
  const [fout, setFout] = useState(null);
  const [laden, setLaden] = useState(false);
  const navigate = useNavigate();

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
    setEmail(ingevoerdEmail);
    setNaam(gebruiker.naam);

    if (gebruiker.rol === "trainee") navigate("/dashboard/trainee");
    else if (gebruiker.rol === "beheerder") navigate("/dashboard/beheer");

    setLaden(false);
  }

  const navigatie = [
    {
      label: "Home",
      icoon: <HouseIcoon />,
      blok: <HomeBlok email={email} />,
      sectie: "Menu",
    },
    {
      label: "Mijn Trainees",
      icoon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="currentColor"
          viewBox="0 0 256 256"
        >
          <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.43a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.49A8,8,0,0,1,250.14,206.7Z" />
        </svg>
      ),
      blok: <MijnTraineesBlok email={email} />,
      sectie: "Menu",
    },

    {
      label: "Competentiematrix",
      icoon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="currentColor"
          viewBox="0 0 256 256"
        >
          <path d="M96,16h64a8,8,0,0,0,0-16H96a8,8,0,0,0,0,16ZM200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8Z" />
        </svg>
      ),
      blok: <MatrixBlok email={email} />,
      sectie: "Menu",
    },
  ];

  if (!email) {
    return (
      <div className="login-scherm">
        <h1>Tilstra LMS</h1>
        <h2>Inloggen</h2>
        <input
          type="email"
          placeholder="Jouw e-mailadres"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin(e.target.value);
          }}
        />
        {laden && <p>Bezig met inloggen...</p>}
        {fout && <p style={{ color: "red" }}>{fout}</p>}
        <p>Druk op Enter om in te loggen</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      navigatie={navigatie}
      email={email}
      naam={naam || email}
      rol="Leidinggevende"
      instellingenBlok={<InstellingenBlok email={email} />}
    />
  );
}
