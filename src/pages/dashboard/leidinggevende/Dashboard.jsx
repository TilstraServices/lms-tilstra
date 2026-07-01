import { useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { haalGebruikerOp } from "../../../lib/auth";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../DashboardLayout";
import MatrixBlok from "./blokken/MatrixBlok";
import HomeBlok from "./blokken/HomeBlok";
import MijnTraineesBlok from "./blokken/MijnTraineesBlok";
import InstellingenBlok from "./blokken/InstellingenBlok";
import { HouseIcoon } from "../../../assets/icons.jsx";

export default function LeidinggevendeDashboard() {
  const email = localStorage.getItem("email");
  const naam = localStorage.getItem("naam");

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
