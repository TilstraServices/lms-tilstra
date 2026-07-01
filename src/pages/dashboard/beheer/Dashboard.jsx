import { useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { haalGebruikerOp } from "../../../lib/auth";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../DashboardLayout";
import ModulesBoom from "./blokken/ModulesBoom";
import BeheerHomeBlok from "./blokken/BeheerHomeBlok";
import GebruikersBeheerBlok from "./blokken/GebruikersBeheerBlok";
import { HouseIcoon } from "../../../assets/icons.jsx";

export default function BeheerDashboard() {
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
      blok: <BeheerHomeBlok email={email} />,
      sectie: "Beheer",
    },
    {
      label: "Modules",
      icoon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="currentColor"
          viewBox="0 0 256 256"
        >
          <path d="M224,48H32A16,16,0,0,0,16,64V88a16,16,0,0,0,16,16v88a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM208,192H48V104H208ZM224,88H32V64H224V88ZM96,136a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,136Z" />
        </svg>
      ),
      blok: <ModulesBoom />,
      sectie: "Beheer",
    },
    {
      label: "Gebruikers",
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
      blok: <GebruikersBeheerBlok />,
      sectie: "Beheer",
    },
  ];

  return (
    <DashboardLayout
      navigatie={navigatie}
      email={email}
      naam={naam || email}
      rol="Beheerder"
    />
  );
}
