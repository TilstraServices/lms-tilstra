import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { haalGebruikerOp } from "../../../lib/auth";
import DashboardLayout from "../DashboardLayout";
import MatrixBlok from "./blokken/MatrixBlok";
import HomeBlok from "./blokken/HomeBlok";
import VoortgangBlok from "./blokken/VoortgangBlok";
import LearningPathBlok from "./blokken/LearningPathBlok";
import InstellingenBlok from "./blokken/InstellingenBlok";
import { StackSimpleIcoon, HouseIcoon } from "../../../assets/icons.jsx";
//
import LPTestBlok from "./blokken/LPTestBlok";
//

export default function TraineeDashboard() {
  const [email, setEmail] = useState(() => localStorage.getItem("email"));
  const [naam, setNaam] = useState(() => localStorage.getItem("naam"));
  const [fout, setFout] = useState(null);
  const [laden, setLaden] = useState(false);
  const [toonLPTest, setToonLPTest] = useState(false);
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

    if (gebruiker.rol === "leidinggevende")
      navigate("/dashboard/leidinggevende");
    else if (gebruiker.rol === "beheerder") navigate("/dashboard/beheer");

    setLaden(false);
  }

  const navigatie = [
    {
      label: "Home",
      icoon: <HouseIcoon />,
      blok: <HomeBlok email={email} naam={naam} />,
      sectie: "Menu",
    },
    {
      label: "Mijn Modules",
      icoon: <StackSimpleIcoon />,
      blok: <VoortgangBlok email={email} />,
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
    {
      label: "Learning Path",
      icoon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="currentColor"
          viewBox="0 0 256 256"
        >
          <path d="M200,168a32.06,32.06,0,0,0-31,24H72a32,32,0,0,1,0-64h96a40,40,0,0,0,0-80H72a8,8,0,0,0,0,16h96a24,24,0,0,1,0,48H72a48,48,0,0,0,0,96h97a32,32,0,1,0,31-40Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,200,216Z" />
        </svg>
      ),
      blok: (
        <LearningPathBlok email={email} onTest={() => setToonLPTest(true)} />
      ),
      sectie: "Menu",
      volledigBreed: true,
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
      rol="Trainee"
      instellingenBlok={<InstellingenBlok email={email} />}
      overrideBlok={
        toonLPTest ? <LPTestBlok onTerug={() => setToonLPTest(false)} /> : null
      }
      onNavigeer={() => setToonLPTest(false)}
    />
  );
}
