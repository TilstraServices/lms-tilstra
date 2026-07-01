import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import LoginScherm from "../../components/shared/LoginScherm";
import LeidinggevendeMenu from "../../components/competentiematrix/LeidinggevendeMenu";
import MatrixTabel from "../../components/competentiematrix/MatrixTabel";
import RadarChart from "../../components/competentiematrix/RadarChart";
import GeschiedenisModal from "../../components/competentiematrix/GeschiedenisModal";

const BoekenIcoon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 256 256"
    fill="currentColor"
    style={{ marginRight: "6px", flexShrink: 0 }}
  >
    <path d="M160,56H64A16,16,0,0,0,48,72V224a8,8,0,0,0,12.65,6.51L112,193.83l51.36,36.68A8,8,0,0,0,176,224V72A16,16,0,0,0,160,56Zm0,152.46-43.36-31a8,8,0,0,0-9.3,0L64,208.45V72h96ZM208,40V192a8,8,0,0,1-16,0V40H88a8,8,0,0,1,0-16H192A16,16,0,0,1,208,40Z" />
  </svg>
);

function Competentiematrix({
  rol = "trainee",
  emailProp = null,
  toonUitloggen = true,
}) {
  const [gebruiker, setGebruiker] = useState(() => {
    const email = localStorage.getItem("email");
    const rol = localStorage.getItem("rol");
    return email && rol ? { email, rol } : null;
  });
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
        const update = {
          trainee_email: traineeEmail,
          indicator_id: indId,
          updated_at: new Date().toISOString(),
        };
        if (sc.pta !== undefined) update.pta = sc.pta;
        if (sc.evaluatie !== undefined) update.evaluatie = sc.evaluatie;
        beloften.push(
          supabase
            .from("competenties")
            .upsert(update, { onConflict: "trainee_email,indicator_id" }),
        );
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
        popup: true,
      });
    } catch {
      setFeedback({
        type: "error",
        tekst: "✕ Opslaan mislukt. Probeer opnieuw.",
        popup: true,
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
        {(() => {
          if (eigenMatrixModus)
            return (
              <>
                <BoekenIcoon />
                Je vult je eigen matrix in — vul de PTA-kolom in op basis van je
                eigen inschatting.
              </>
            );
          if (gebruiker?.rol === "leidinggevende")
            return (
              <>
                <BoekenIcoon /> Je bekijkt de matrix van{" "}
                {traineeNaam || traineeEmail} — je kunt de evaluatiekolom
                invullen.
              </>
            );
          return (
            <>
              <BoekenIcoon />
              Je vult de matrix in als trainee — vul de PTA-kolom in op basis
              van je eigen inschatting.
            </>
          );
        })()}
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
          style={{
            ...stijlen.btnSecundair,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
          onClick={() => setGeschiedenisOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="21"
            viewBox="0 0 256 256"
            fill="currentColor"
          >
            <path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm-8-48A95.44,95.44,0,0,0,60.08,60.15C52.81,67.51,46.35,74.59,40,82V64a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H49c7.15-8.42,14.27-16.35,22.39-24.57a80,80,0,1,1,1.66,114.75,8,8,0,1,0-11,11.64A96,96,0,1,0,128,32Z" />
          </svg>
          Geschiedenis
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

      {/* Feedback popup */}
      {feedback?.popup && (
        <div style={stijlen.popupOverlay} onClick={() => setFeedback(null)}>
          <div style={stijlen.popup}>
            <p style={{ fontSize: "2rem", marginBottom: "8px" }}>✓</p>
            <p
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#1b5e20",
                marginBottom: "4px",
              }}
            >
              Opgeslagen!
            </p>
            <p style={{ fontSize: "0.85rem", color: "#616161" }}>
              De matrix is bijgewerkt.
            </p>
            <button
              onClick={() => setFeedback(null)}
              style={{
                marginTop: "16px",
                padding: "8px 24px",
                borderRadius: "50px",
                background: "#2e7d32",
                color: "white",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Feedback inline */}
      {feedback && !feedback.popup && (
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
    display: "flex",
    alignItems: "center",
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

  popupOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  popup: {
    background: "white",
    borderRadius: "16px",
    padding: "32px 40px",
    textAlign: "center",
    boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
    maxWidth: "340px",
    width: "90%",
  },
};

export default Competentiematrix;
