import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function LeidinggevendeMenu({
  gebruiker,
  onTraineeGekozen,
  onEigenMatrix,
  onUitloggen,
}) {
  const navigate = useNavigate();
  const [trainees, setTrainees] = useState([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    async function laadTrainees() {
      const { data, error } = await supabase
        .from("koppeling")
        .select("trainee_email, trainee_naam")
        .eq("leidinggevende_email", gebruiker.email);

      setLaden(false);
      if (!error && data) setTrainees(data);
    }

    laadTrainees();
  }, [gebruiker.email]);

  return (
    <div style={stijlen.wrap}>
      <div style={stijlen.header}>
        <h2 style={stijlen.titel}>👤 Leidinggevende portaal</h2>
        <p style={stijlen.subtitel}>
          Kies een trainee om de competentiematrix te bekijken en te beoordelen.
        </p>
        <p style={stijlen.emailLabel}>Ingelogd als: {gebruiker.email}</p>
      </div>

      {/* Eigen matrix knop */}
      <div style={stijlen.eigenKnop} onClick={onEigenMatrix}>
        <div>
          <div style={{ fontWeight: "600", color: "#1565c0" }}>
            📋 Mijn eigen matrix
          </div>
          <div style={stijlen.mail}>PTA invullen voor jezelf</div>
        </div>
        <span style={{ color: "#1565c0" }}>→</span>
      </div>

      <p style={stijlen.sectieLabel}>Mijn trainees</p>

      {laden && <p style={stijlen.laden}>Laden…</p>}

      {!laden && trainees.length === 0 && (
        <div style={stijlen.geenTrainees}>
          Er zijn nog geen trainees aan jouw account gekoppeld. Neem contact op
          met de beheerder.
        </div>
      )}

      {trainees.map((t) => (
        <div
          key={t.trainee_email}
          style={stijlen.traineeKaart}
          onClick={() => onTraineeGekozen(t)}
        >
          <div>
            <div style={stijlen.naam}>{t.trainee_naam || t.trainee_email}</div>
            <div style={stijlen.mail}>{t.trainee_email}</div>
          </div>
          <span style={stijlen.pijl}>→</span>
        </div>
      ))}
      <div style={stijlen.footer}>
        <button style={stijlen.btnBeheer} onClick={() => navigate("/beheer")}>
          ⚙️ Beheer
        </button>
        <span style={stijlen.uitloggen} onClick={onUitloggen}>
          ↩ Uitloggen
        </span>
      </div>
    </div>
  );
}

const stijlen = {
  wrap: { maxWidth: "560px", margin: "60px auto", padding: "0 16px" },
  header: {
    background: "#fff",
    border: "1px solid #eee",
    borderLeft: "5px solid #2e7d32",
    borderRadius: "10px",
    padding: "24px 28px",
    marginBottom: "16px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  titel: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#1b5e20",
    marginBottom: "4px",
  },
  subtitel: { fontSize: "0.85rem", color: "#616161", marginBottom: "8px" },
  emailLabel: { fontSize: "0.78rem", color: "#9e9e9e" },
  eigenKnop: {
    background: "#e3f2fd",
    border: "1px solid #1565c0",
    borderRadius: "10px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    marginBottom: "6px",
  },
  sectieLabel: {
    fontSize: "0.72rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#9e9e9e",
    margin: "14px 0 8px",
  },
  laden: { color: "#9e9e9e", fontSize: "0.9rem" },
  geenTrainees: {
    background: "#fff3e0",
    border: "1px solid #ffcc80",
    borderRadius: "8px",
    padding: "16px 20px",
    fontSize: "0.875rem",
    color: "#e65100",
  },
  traineeKaart: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "10px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    marginBottom: "10px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",

    btnBeheer: {
      padding: "6px 18px",
      borderRadius: "50px",
      background: "#eee",
      color: "#616161",
      border: "none",
      fontSize: "0.85rem",
      fontWeight: "600",
      cursor: "pointer",
    },
  },
  naam: { fontWeight: "600", fontSize: "0.95rem", color: "#212121" },
  mail: { fontSize: "0.78rem", color: "#9e9e9e", marginTop: "2px" },
  pijl: { fontSize: "1.2rem", color: "#2e7d32" },
  footer: { marginTop: "16px", display: "flex", justifyContent: "flex-end" },
  uitloggen: {
    fontSize: "0.78rem",
    color: "#9e9e9e",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default LeidinggevendeMenu;
