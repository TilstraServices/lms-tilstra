import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

// ── Meerkeuze vraag component ──
function MeerkeuzVraag({ vraag, antwoorden, onChange, gecontroleerd }) {
  const [geselecteerd, setGeselecteerd] = useState([]);
  const meerdere = vraag.meerdere_correct;

  function selecteer(antwoordId) {
    if (gecontroleerd) return;
    let nieuweSelectie;
    if (meerdere) {
      nieuweSelectie = geselecteerd.includes(antwoordId)
        ? geselecteerd.filter((id) => id !== antwoordId)
        : [...geselecteerd, antwoordId];
    } else {
      nieuweSelectie = [antwoordId];
    }
    setGeselecteerd(nieuweSelectie);
    onChange(nieuweSelectie);
  }

  function getStatus(antwoord) {
    if (!gecontroleerd)
      return geselecteerd.includes(antwoord.id) ? "selected" : "idle";
    const isGeselecteerd = geselecteerd.includes(antwoord.id);
    if (antwoord.is_correct && isGeselecteerd) return "correct";
    if (antwoord.is_correct && !isGeselecteerd) return "gemist";
    if (!antwoord.is_correct && isGeselecteerd) return "fout";
    return "idle";
  }

  const stijlen = {
    idle: {
      border: "1.5px solid #DADCE0",
      background: "#F0F2F5",
      color: "#1A1A1A",
    },
    selected: {
      border: "1.5px solid #43A047",
      background: "#E8F5E9",
      color: "#1A1A1A",
      boxShadow: "0 0 0 3px rgba(67,160,71,0.15)",
    },
    correct: {
      border: "1.5px solid #2E7D32",
      background: "#E8F5E9",
      color: "#2E7D32",
      fontWeight: 600,
    },
    fout: {
      border: "1.5px solid #C62828",
      background: "#FFEBEE",
      color: "#C62828",
    },
    gemist: {
      border: "1.5px dashed #2E7D32",
      background: "#F1F8E9",
      color: "#2E7D32",
      opacity: 0.8,
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {antwoorden
        .sort((a, b) => a.volgorde - b.volgorde)
        .map((antwoord) => {
          const status = getStatus(antwoord);
          return (
            <div
              key={antwoord.id}
              onClick={() => selecteer(antwoord.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 16px",
                borderRadius: "8px",
                cursor: gecontroleerd ? "default" : "pointer",
                transition: "all 0.12s",
                userSelect: "none",
                ...stijlen[status],
              }}
            >
              {/* Radio/checkbox indicator */}
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: meerdere ? "4px" : "50%",
                  border: `2px solid ${status === "idle" ? "#DADCE0" : status === "selected" ? "#43A047" : status === "correct" || status === "gemist" ? "#2E7D32" : "#C62828"}`,
                  background:
                    status === "correct"
                      ? "#2E7D32"
                      : status === "fout"
                        ? "#C62828"
                        : status === "selected"
                          ? "#43A047"
                          : "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.12s",
                }}
              >
                {(status === "correct" || status === "selected") && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                    <path
                      d="M1.5 5L4 7.5L8.5 2.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                )}
                {status === "fout" && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                    <path
                      d="M2 2L8 8M8 2L2 8"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: "14px", lineHeight: 1.5 }}>
                {antwoord.tekst}
              </span>
              {status === "gemist" && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "12px",
                    color: "#2E7D32",
                  }}
                >
                  ✓ correct antwoord
                </span>
              )}
            </div>
          );
        })}
    </div>
  );
}

// ── Open vraag component ──
function OpenVraag({ vraag, onChange, gecontroleerd }) {
  const [waarde, setWaarde] = useState("");
  const [toonAntwoord, setToonAntwoord] = useState(false);

  function normaliseer(tekst) {
    return tekst.trim().toLowerCase().replace(/\s+/g, " ");
  }

  const modelantwoorden = vraag.antwoorden.map((a) => normaliseer(a.tekst));
  const isCorrect =
    gecontroleerd && modelantwoorden.includes(normaliseer(waarde));
  const isLeeg = waarde.trim() === "";

  return (
    <div>
      <textarea
        value={waarde}
        onChange={(e) => {
          setWaarde(e.target.value);
          onChange(e.target.value);
        }}
        disabled={gecontroleerd}
        placeholder="Typ hier je antwoord..."
        style={{
          width: "100%",
          padding: "12px 14px",
          border: `1.5px solid ${gecontroleerd && !isLeeg ? (isCorrect ? "#2E7D32" : "#C62828") : "#DADCE0"}`,
          borderRadius: "8px",
          background:
            gecontroleerd && !isLeeg
              ? isCorrect
                ? "#E8F5E9"
                : "#FFEBEE"
              : gecontroleerd
                ? "#F5F5F5"
                : "#F0F2F5",
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          color:
            gecontroleerd && !isLeeg
              ? isCorrect
                ? "#2E7D32"
                : "#C62828"
              : "#1A1A1A",
          fontWeight: gecontroleerd && !isLeeg ? 500 : 400,
          resize: "vertical",
          minHeight: "100px",
          outline: "none",
          transition: "border-color 0.12s",
          cursor: gecontroleerd ? "default" : "text",
        }}
        onFocus={(e) => {
          if (!gecontroleerd) e.target.style.borderColor = "#43A047";
        }}
        onBlur={(e) => {
          if (!gecontroleerd) e.target.style.borderColor = "#DADCE0";
        }}
      />

      {/* Feedback na controleren */}
      {gecontroleerd && !isLeeg && (
        <div
          style={{
            marginTop: "8px",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: isCorrect ? "#E8F5E9" : "#FFEBEE",
            color: isCorrect ? "#2E7D32" : "#C62828",
            border: `1px solid ${isCorrect ? "#A5D6A7" : "#EF9A9A"}`,
          }}
        >
          <span>{isCorrect ? "✓" : "✕"}</span>
          <span>
            {isCorrect
              ? "Correct!"
              : "Niet correct. Probeer opnieuw of toon het antwoord."}
          </span>
          {!isCorrect && !toonAntwoord && (
            <button
              onClick={() => setToonAntwoord(true)}
              style={{
                marginLeft: "auto",
                background: "#fff8e1",
                color: "#e65100",
                border: "1px solid #ffd54f",
                borderRadius: "100px",
                padding: "3px 12px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Toon Antwoord
            </button>
          )}
        </div>
      )}

      {/* Toon antwoord */}
      {toonAntwoord && (
        <div
          style={{
            marginTop: "6px",
            padding: "10px 14px",
            borderRadius: "8px",
            background: "#F5F5F5",
            border: "1px solid #E0E0E0",
            fontSize: "13px",
            color: "#5F6368",
          }}
        >
          <span
            style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}
          >
            Correct antwoord:
          </span>
          <span>{vraag.antwoorden[0]?.tekst}</span>
        </div>
      )}

      {/* Info tekst */}
      {(!gecontroleerd || isLeeg) && (
        <p style={{ fontSize: "12px", color: "#9E9E9E", marginTop: "6px" }}>
          Open vragen tellen niet mee in de score.
        </p>
      )}
    </div>
  );
}

// ── Hoofd component ──
export default function QuizContainer() {
  const [quiz, setQuiz] = useState(null);
  const [vragen, setVragen] = useState([]);
  const [laden, setLaden] = useState(true);
  const [antwoorden, setAntwoorden] = useState({});
  const [gecontroleerd, setGecontroleerd] = useState(false);
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [score, setScore] = useState(null);
  const [resetTeller, setResetTeller] = useState(0);

  const params = new URLSearchParams(window.location.search);
  const quizId = params.get("id");
  const email = localStorage.getItem("email");

  useEffect(() => {
    async function laadData() {
      if (!quizId) {
        setLaden(false);
        return;
      }

      const { data: quizData } = await supabase
        .from("quizen")
        .select("*")
        .eq("id", quizId)
        .single();

      if (quizData) setQuiz(quizData);

      const { data: vragenData } = await supabase
        .from("vragen")
        .select("*, antwoorden(*)")
        .eq("quiz_id", quizId)
        .order("volgorde");

      if (vragenData) setVragen(vragenData);
      setLaden(false);
    }
    laadData();
  }, [quizId]);

  function updateAntwoord(vraagId, waarde) {
    setAntwoorden((prev) => ({ ...prev, [vraagId]: waarde }));
  }

  function controleer() {
    let aantalCorrect = 0;
    let aantalMeerkeuze = 0;

    vragen.forEach((vraag) => {
      if (vraag.type !== "meerkeuze") return;
      aantalMeerkeuze++;

      const geselecteerdeIds = antwoorden[vraag.id] || [];
      const correcteIds = vraag.antwoorden
        .filter((a) => a.is_correct)
        .map((a) => a.id);

      const alleCorrectGeselecteerd =
        correcteIds.every((id) => geselecteerdeIds.includes(id)) &&
        geselecteerdeIds.every((id) => correcteIds.includes(id));

      if (alleCorrectGeselecteerd) aantalCorrect++;
    });

    const scorePercentage =
      aantalMeerkeuze > 0
        ? Math.round((aantalCorrect / aantalMeerkeuze) * 100)
        : null;

    setScore(scorePercentage);
    setGecontroleerd(true);

    // Sla score op
    if (email && scorePercentage !== null) {
      slaScoreOp(scorePercentage);
    }
  }

  async function slaScoreOp(scoreWaarde) {
    const { data: pogingen } = await supabase
      .from("quiz_scores")
      .select("poging_nummer")
      .eq("trainee_email", email)
      .eq("quiz_id", quizId)
      .order("poging_nummer", { ascending: false })
      .limit(1);

    const volgendPoging =
      pogingen && pogingen.length > 0 ? pogingen[0].poging_nummer + 1 : 1;

    await supabase.from("quiz_scores").insert({
      trainee_email: email,
      quiz_id: quizId,
      score: scoreWaarde,
      poging_nummer: volgendPoging,
    });

    setOpgeslagen(true);
  }

  function reset() {
    setAntwoorden({});
    setGecontroleerd(false);
    setOpgeslagen(false);
    setScore(null);
    setResetTeller((prev) => prev + 1);
  }

  const aantalMeerkeuze = vragen.filter((v) => v.type === "meerkeuze").length;
  const aantalOpen = vragen.filter((v) => v.type === "open").length;

  if (laden)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "Inter, sans-serif",
          color: "#5F6368",
        }}
      >
        Quiz laden...
      </div>
    );

  if (!quizId)
    return (
      <div
        style={{
          padding: "2rem",
          fontFamily: "Inter, sans-serif",
          color: "#C62828",
        }}
      >
        Geen quiz ID opgegeven.
      </div>
    );

  return (
    <div
      style={{
        background: "#F0F2F5",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #DADCE0",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#9E9E9E",
              marginBottom: "2px",
            }}
          >
            Quiz
          </p>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1A1A1A" }}>
            {quiz?.naam || "Quiz"}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Vraag teller */}
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#9E9E9E",
                marginBottom: "2px",
              }}
            >
              Vragen
            </p>
            <p
              style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1A1A1A" }}
            >
              {aantalMeerkeuze} meerkeuze
              {aantalOpen > 0 ? ` · ${aantalOpen} open` : ""}
            </p>
          </div>

          {/* Score */}
          {gecontroleerd && score !== null && (
            <div
              style={{
                background: score >= 70 ? "#E8F5E9" : "#FFEBEE",
                border: `1px solid ${score >= 70 ? "#A5D6A7" : "#EF9A9A"}`,
                borderRadius: "10px",
                padding: "8px 16px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: score >= 70 ? "#2E7D32" : "#C62828",
                  marginBottom: "2px",
                }}
              >
                Score
              </p>
              <p
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: score >= 70 ? "#2E7D32" : "#C62828",
                }}
              >
                {score}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Vragen */}
      <div
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {vragen.map((vraag, index) => (
          <div
            key={vraag.id}
            style={{
              background: "white",
              borderRadius: "10px",
              border: "1px solid #DADCE0",
              overflow: "hidden",
            }}
          >
            {/* Vraag header */}
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid #DADCE0",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: vraag.type === "open" ? "#FAFAFA" : "white",
              }}
            >
              <span
                style={{
                  background: vraag.type === "open" ? "#9E9E9E" : "#2E7D32",
                  color: "white",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </span>
              <p
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#1A1A1A",
                  flex: 1,
                }}
              >
                {vraag.vraag}
              </p>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "100px",
                  background: vraag.type === "open" ? "#F5F5F5" : "#E8F5E9",
                  color: vraag.type === "open" ? "#9E9E9E" : "#2E7D32",
                }}
              >
                {vraag.type === "open"
                  ? "Open"
                  : vraag.meerdere_correct
                    ? "Meerdere correct"
                    : "Meerkeuze"}
              </span>
            </div>

            {/* Vraag inhoud */}
            <div style={{ padding: "16px 20px" }}>
              {vraag.type === "meerkeuze" ? (
                <MeerkeuzVraag
                  key={resetTeller}
                  vraag={vraag}
                  antwoorden={vraag.antwoorden}
                  onChange={(selectie) => updateAntwoord(vraag.id, selectie)}
                  gecontroleerd={gecontroleerd}
                />
              ) : (
                <OpenVraag
                  key={resetTeller}
                  vraag={vraag}
                  onChange={(tekst) => updateAntwoord(vraag.id, tekst)}
                  gecontroleerd={gecontroleerd}
                />
              )}
            </div>
          </div>
        ))}

        {/* Knoppen */}
        {vragen.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              paddingBottom: "32px",
            }}
          >
            <button
              onClick={reset}
              style={{
                background: "transparent",
                color: "#5F6368",
                border: "1px solid #DADCE0",
                borderRadius: "50px",
                padding: "10px 24px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Reset
            </button>
            <button
              onClick={controleer}
              disabled={gecontroleerd}
              style={{
                background: gecontroleerd ? "#A5D6A7" : "#2E7D32",
                color: "white",
                border: "none",
                borderRadius: "50px",
                padding: "10px 24px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: gecontroleerd ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "background 0.12s",
              }}
            >
              {gecontroleerd
                ? opgeslagen
                  ? "✓ Opgeslagen"
                  : "Opslaan..."
                : "Controleer alles"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
