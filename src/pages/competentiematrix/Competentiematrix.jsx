import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import LoginScherm from "../../components/shared/LoginScherm";
import LeidinggevendeMenu from "../../components/competentiematrix/LeidinggevendeMenu";
import MatrixTabel from "../../components/competentiematrix/MatrixTabel";
import RadarChart from "../../components/competentiematrix/RadarChart";
import GeschiedenisModal from "../../components/competentiematrix/GeschiedenisModal";

function Competentiematrix({
  rol = "trainee",
  emailProp = null,
  toonUitloggen = true,
}) {
  const [gebruiker, setGebruiker] = useState(null);
  const [scherm, setScherm] = useState(emailProp ? "laden" : "login");
  const [traineeEmail, setTraineeEmail] = useState(null);
  const [traineeNaam, setTraineeNaam] = useState(null);
  const [eigenMatrixModus, setEigenMatrixModus] = useState(false);
  const [scores, setScores] = useState({});
  const [geschiedenisOpen, setGeschiedenisOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [, setLaden] = useState(false);

  // ── State declaraties ──
  useEffect(() => {
    if (emailProp) {
      const eigenModus = rol === "trainee";
      openMatrix(emailProp, emailProp, eigenModus);
    }
  }, [emailProp, rol]);

  // ── Matrix openen ──
  async function openMatrix(email, naam, eigenModus = false) {
    setLaden(true);
    setScherm("laden");
    setTraineeEmail(email);
    setTraineeNaam(naam);
    setEigenMatrixModus(eigenModus);

    const { data, error } = await supabase
      .from("competenties")
      .select("indicator_id, pta, evaluatie")
      .eq("trainee_email", email);

    const geladen = {};
    if (!error && data) {
      data.forEach((r) => {
        geladen[r.indicator_id] = { pta: r.pta, evaluatie: r.evaluatie };
      });
    }

    setScores(geladen);
    setLaden(false);
    setScherm("matrix");
  }

  // ── Login ──
  const handleIngelogd = useCallback(async (gevondenGebruiker) => {
    setGebruiker(gevondenGebruiker);
    localStorage.setItem("lms_email", gevondenGebruiker.email);
    localStorage.setItem("lms_rol", gevondenGebruiker.rol);

    if (gevondenGebruiker.rol === "leidinggevende") {
      setScherm("menu");
    } else {
      await openMatrix(gevondenGebruiker.email, gevondenGebruiker.naam);
    }
  }, []);

  // ── Sessie herstellen bij terugkomen ──
  useEffect(() => {
    const email = localStorage.getItem("lms_email");
    const opgeslagenRol = localStorage.getItem("lms_rol");

    if (email && opgeslagenRol) {
      supabase
        .from("gebruikers")
        .select("email, naam, rol")
        .eq("email", email)
        .single()
        .then(({ data }) => {
          if (data) handleIngelogd(data);
        });
    }
  }, [handleIngelogd]);

  // ── Score wijzigen ──
  function handleScoreWijzig(indicatorId, kolom, waarde) {
    setScores((prev) => ({
      ...prev,
      [indicatorId]: { ...prev[indicatorId], [kolom]: waarde },
    }));
  }

  // ── Opslaan ──
  async function handleOpslaan() {
    setFeedback(null);
    try {
      const beloften = [];
      for (const [indId, sc] of Object.entries(scores)) {
        if (sc.pta !== undefined) {
          beloften.push(
            supabase.from("competenties").upsert(
              {
                trainee_email: traineeEmail,
                indicator_id: indId,
                pta: sc.pta,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "trainee_email,indicator_id" },
            ),
          );
        }
        if (sc.evaluatie !== undefined) {
          beloften.push(
            supabase.from("competenties").upsert(
              {
                trainee_email: traineeEmail,
                indicator_id: indId,
                evaluatie: sc.evaluatie,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "trainee_email,indicator_id" },
            ),
          );
        }
      }
      await Promise.all(beloften);

      const opgeslagenDoor =
        gebruiker?.rol === "leidinggevende" ? gebruiker.email : traineeEmail;

      await supabase.from("snapshots").insert({
        trainee_email: traineeEmail,
        opgeslagen_door: opgeslagenDoor,
        scores: scores,
      });

      setFeedback({
        type: "success",
        tekst: "✓ Opgeslagen! De matrix is bijgewerkt.",
      });
    } catch {
      setFeedback({
        type: "error",
        tekst: "✕ Opslaan mislukt. Probeer opnieuw.",
      });
    }
  }

  // ── Reset ──
  async function handleReset() {
    setFeedback(null);
    await openMatrix(traineeEmail, traineeNaam, eigenMatrixModus);
  }

  // ── Uitloggen ──
  function handleUitloggen() {
    localStorage.removeItem("lms_email");
    localStorage.removeItem("lms_rol");
    setGebruiker(null);
    setScherm("login");
    setScores({});
    setTraineeEmail(null);
    setFeedback(null);
  }

  // ── Schermen ──
  if (scherm === "login") {
    return <LoginScherm rol={rol} onIngelogd={handleIngelogd} />;
  }

  if (scherm === "menu") {
    return (
      <LeidinggevendeMenu
        gebruiker={gebruiker}
        onTraineeGekozen={(t) => openMatrix(t.trainee_email, t.trainee_naam)}
        onEigenMatrix={() => openMatrix(gebruiker.email, gebruiker.naam, true)}
        onUitloggen={handleUitloggen}
      />
    );
  }

  if (scherm === "laden") {
    return (
      <div style={stijlen.laden}>
        <div style={stijlen.spinner} />
        Matrix laden…
      </div>
    );
  }

  return (
    <div style={stijlen.pagina}>
      {/* Terug knop voor leidinggevende */}
      {gebruiker?.rol === "leidinggevende" && (
        <div style={stijlen.terugWrap}>
          <span style={stijlen.terugKnop} onClick={() => setScherm("menu")}>
            ← Terug naar overzicht
          </span>
        </div>
      )}

      {/* Header */}
      <div style={stijlen.headerKaart}>
        <h1 style={stijlen.headerTitel}>
          Competentiematrix – Junior Payroll Professional
        </h1>
        <p style={stijlen.headerSubtitel}>
          Ontwikkelprofiel Young Professional
        </p>
        <div style={stijlen.metaRij}>
          <div style={stijlen.metaVeld}>
            <label style={stijlen.metaLabel}>Naam trainee</label>
            <div style={stijlen.metaWaarde}>{traineeNaam || traineeEmail}</div>
          </div>
          <div style={stijlen.metaVeld}>
            <label style={stijlen.metaLabel}>E-mailadres</label>
            <div style={stijlen.metaWaarde}>{traineeEmail}</div>
          </div>
        </div>
      </div>

      {/* Rolbanner */}
      <div
        style={{
          ...stijlen.rolBanner,
          ...(eigenMatrixModus || rol === "trainee"
            ? stijlen.rolBannerTrainee
            : stijlen.rolBannerLeidinggevende),
        }}
      >
        {eigenMatrixModus
          ? "🎓 Je vult je eigen matrix in — vul de PTA-kolom in op basis van je eigen inschatting."
          : gebruiker?.rol === "leidinggevende"
            ? `👤 Je bekijkt de matrix van ${traineeNaam || traineeEmail} — je kunt de evaluatiekolom invullen.`
            : "🎓 Je vult de matrix in als trainee — vul de PTA-kolom in op basis van je eigen inschatting."}
      </div>

      {/* Radar chart */}
      <RadarChart scores={scores} />

      {/* Matrix tabel */}
      <MatrixTabel
        scores={scores}
        onScoreWijzig={handleScoreWijzig}
        rol={gebruiker?.rol || rol || "trainee"}
        eigenMatrixModus={eigenMatrixModus}
      />

      {/* Acties */}
      <div style={stijlen.actiesBar}>
        <button style={stijlen.btnSecundair} onClick={handleReset}>
          ↺ Opnieuw
        </button>
        <button
          style={stijlen.btnSecundair}
          onClick={() => setGeschiedenisOpen(true)}
        >
          📋 Geschiedenis
        </button>
        <button style={stijlen.btnPrimair} onClick={handleOpslaan}>
          Opslaan ✓
        </button>
        {toonUitloggen && (
          <button
            style={{ ...stijlen.btnSecundair, marginLeft: "auto" }}
            onClick={handleUitloggen}
          >
            ↩ Uitloggen
          </button>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          style={{
            ...stijlen.feedback,
            ...(feedback.type === "success"
              ? stijlen.feedbackSuccess
              : stijlen.feedbackError),
          }}
        >
          {feedback.tekst}
        </div>
      )}

      {/* Geschiedenis modal */}
      {geschiedenisOpen && (
        <GeschiedenisModal
          email={traineeEmail}
          onSluit={() => setGeschiedenisOpen(false)}
        />
      )}
    </div>
  );
}

const stijlen = {
  pagina: {
    padding: "24px 16px 48px",
    background: "#f5f5f5",
    minHeight: "100vh",
  },
  laden: {
    maxWidth: "900px",
    margin: "40px auto",
    textAlign: "center",
    color: "#9e9e9e",
    fontSize: "0.9rem",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #eee",
    borderTopColor: "#2e7d32",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto 12px",
  },
  terugWrap: { maxWidth: "900px", margin: "0 auto 8px" },
  terugKnop: {
    fontSize: "0.82rem",
    fontWeight: "600",
    color: "#2e7d32",
    cursor: "pointer",
  },
  headerKaart: {
    background: "#fff",
    border: "1px solid #eee",
    borderLeft: "5px solid #2e7d32",
    borderRadius: "10px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    padding: "20px 24px",
    maxWidth: "900px",
    margin: "0 auto 20px",
  },
  headerTitel: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#1b5e20",
    marginBottom: "4px",
  },
  headerSubtitel: { fontSize: "0.85rem", color: "#616161" },
  metaRij: {
    display: "flex",
    gap: "12px",
    marginTop: "16px",
    flexWrap: "wrap",
  },
  metaVeld: { flex: 1, minWidth: "180px" },
  metaLabel: {
    display: "block",
    fontSize: "0.72rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#9e9e9e",
    marginBottom: "4px",
  },
  metaWaarde: {
    fontSize: "0.875rem",
    color: "#212121",
    padding: "6px 10px",
    background: "#f5f5f5",
    borderRadius: "6px",
  },
  rolBanner: {
    maxWidth: "900px",
    margin: "0 auto 20px",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "500",
  },
  rolBannerTrainee: {
    background: "#fff3e0",
    border: "1px solid #ffcc80",
    color: "#e65100",
  },
  rolBannerLeidinggevende: {
    background: "#e3f2fd",
    border: "1px solid #90caf9",
    color: "#1565c0",
  },
  actiesBar: {
    maxWidth: "900px",
    margin: "24px auto 0",
    display: "flex",
    gap: "12px",
  },
  btnPrimair: {
    padding: "10px 24px",
    borderRadius: "50px",
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnSecundair: {
    padding: "10px 24px",
    borderRadius: "50px",
    background: "#eee",
    color: "#616161",
    border: "none",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  feedback: {
    maxWidth: "900px",
    margin: "16px auto 0",
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  feedbackSuccess: {
    background: "#e8f5e9",
    border: "1px solid #a5d6a7",
    color: "#1b5e20",
  },
  feedbackError: {
    background: "#ffebee",
    border: "1px solid #ef9a9a",
    color: "#c62828",
  },
};

export default Competentiematrix;
