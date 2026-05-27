import { useState } from "react";

export default function BeheerDashboard() {
  const [email, setEmail] = useState(() => localStorage.getItem("email"));

  if (!email) {
    return (
      <div className="dashboard-login">
        <h2>Inloggen</h2>
        <input
          type="email"
          placeholder="Jouw e-mailadres"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              localStorage.setItem("email", e.target.value);
              setEmail(e.target.value);
            }
          }}
        />
        <p>Druk op Enter om in te loggen</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Beheer Dashboard</h1>
        <span>{email}</span>
      </header>
      <nav className="dashboard-nav">
        <button>Modules</button>
        <button>Gebruikers</button>
        <button>Sjablonen</button>
        <button>Matrix Beheer</button>
      </nav>
      <main className="dashboard-inhoud">
        <p>Welkom! Kies een onderdeel via het menu.</p>
      </main>
    </div>
  );
}
