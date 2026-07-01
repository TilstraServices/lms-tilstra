import { useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { haalGebruikerOp } from "../../../lib/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const email = localStorage.getItem("email");
  const naam = localStorage.getItem("naam");
  const [toonLPTest, setToonLPTest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function herstelSessie() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }
      const gebruiker = await haalGebruikerOp(session.user.email);
      if (gebruiker) {
        localStorage.setItem("email", session.user.email);
        localStorage.setItem("naam", gebruiker.naam);
        localStorage.setItem("rol", gebruiker.rol);
        window.location.reload();
      } else {
        navigate("/");
      }
    }
    if (!email) herstelSessie();
  }, [email, navigate]);

  if (!email) return null;

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
