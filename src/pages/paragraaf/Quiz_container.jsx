import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

// ── Meerkeuze vraag component ──
function MeerkeuzVraag({
  vraag,
  antwoorden,
  onChange,
  gecontroleerd,
  onToonAntwoord,
}) {
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

  const [toonAntwoord, setToonAntwoord] = useState(false);

  function getStatus(antwoord) {
    if (!gecontroleerd)
      return geselecteerd.includes(antwoord.id) ? "selected" : "idle";
    const isGeselecteerd = geselecteerd.includes(antwoord.id);
    if (toonAntwoord) {
      if (antwoord.is_correct && isGeselecteerd) return "correct";
      if (antwoord.is_correct && !isGeselecteerd) return "gemist";
      if (!antwoord.is_correct && isGeselecteerd) return "fout";
      return "idle";
    }
    // Zonder toonAntwoord: alleen geselecteerde markeren als fout/correct
    if (isGeselecteerd) {
      return antwoord.is_correct ? "correct" : "fout";
    }
    return "idle";
  }

  const letters = ["A", "B", "C", "D", "E", "F"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {antwoorden
        .sort((a, b) => a.volgorde - b.volgorde)
        .map((antwoord, index) => {
          const status = getStatus(antwoord);
          return (
            <div
              key={antwoord.id}
              onClick={() => selecteer(antwoord.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 18px",
                borderRadius: "12px",
                cursor: gecontroleerd ? "default" : "pointer",
                transition: "all 0.12s",
                userSelect: "none",
                background:
                  status === "correct"
                    ? "#E8F5E9"
                    : status === "gemist"
                      ? "#F1F8E9"
                      : status === "fout"
                        ? "#FFEBEE"
                        : status === "selected"
                          ? "#E8F5E9"
                          : "#F8F9FA",
                border: "none",
                boxShadow: "none",
                outline: "1px solid transparent",
              }}
            >
              {/* Letter indicator */}
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  minWidth: "28px",
                  borderRadius: "50%",
                  background:
                    status === "correct" || status === "selected"
                      ? "#2E7D32"
                      : status === "fout"
                        ? "#C62828"
                        : status === "gemist"
                          ? "#A5D6A7"
                          : "#E0E0E0",
                  color: status === "idle" ? "#757575" : "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  flexShrink: 0,
                  transition: "all 0.12s",
                }}
              >
                {status === "correct" || status === "selected" ? (
                  <svg width="12" height="12" viewBox="0 0 10 10" fill="white">
                    <path
                      d="M1.5 5L4 7.5L8.5 2.5"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                ) : status === "fout" ? (
                  <svg width="12" height="12" viewBox="0 0 10 10" fill="white">
                    <path
                      d="M2 2L8 8M8 2L2 8"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  letters[index] || index + 1
                )}
              </div>
              <span
                style={{
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color:
                    status === "correct"
                      ? "#2E7D32"
                      : status === "fout"
                        ? "#C62828"
                        : status === "gemist"
                          ? "#388E3C"
                          : status === "selected"
                            ? "#2E7D32"
                            : "#1A1A1A",
                  fontWeight: 500,
                  flex: 1,
                }}
              >
                {antwoord.tekst}
              </span>
              {status === "gemist" && (
                <span
                  style={{ fontSize: "12px", color: "#2E7D32", flexShrink: 0 }}
                >
                  ✓ correct
                </span>
              )}
            </div>
          );
        })}
      {/* Feedback na controleren */}
      {gecontroleerd &&
        (() => {
          const alleCorrect =
            vraag.antwoorden
              .filter((a) => a.is_correct)
              .every((a) => geselecteerd.includes(a.id)) &&
            geselecteerd.every(
              (id) => vraag.antwoorden.find((a) => a.id === id)?.is_correct,
            );
          return (
            <div
              style={{
                marginTop: "10px",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: alleCorrect ? "#E8F5E9" : "#FFEBEE",
                color: alleCorrect ? "#2E7D32" : "#C62828",
                border: `1px solid ${alleCorrect ? "#A5D6A7" : "#EF9A9A"}`,
              }}
            >
              <span>{alleCorrect ? "✓" : "✕"}</span>
              <span>
                {alleCorrect
                  ? "Correct!"
                  : "Niet correct. Probeer opnieuw of toon het antwoord."}
              </span>
              {!alleCorrect && !toonAntwoord && (
                <button
                  onClick={() => {
                    onToonAntwoord(() => setToonAntwoord(true));
                  }}
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
          );
        })()}
      {/* Onderbouwing */}
      {toonAntwoord && vraag.onderbouwing && (
        <div
          style={{
            marginTop: "8px",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "#F5F5F5",
            border: "1px solid #E0E0E0",
            fontSize: "13px",
            color: "#5F6368",
            lineHeight: 1.6,
          }}
        >
          <span
            style={{ fontWeight: 600, display: "block", marginBottom: "4px" }}
          >
            Onderbouwing:
          </span>
          <span>{vraag.onderbouwing}</span>
        </div>
      )}
    </div>
  );
}

// ── Open vraag component ──
function OpenVraag({ vraag, onChange, gecontroleerd, onToonAntwoord }) {
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
              onClick={() => {
                onToonAntwoord(() => setToonAntwoord(true));
              }}
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
  const [antwoordGezienInSessie, setAntwoordGezienInSessie] = useState(
    () =>
      sessionStorage.getItem(
        `quiz_gezien_${new URLSearchParams(window.location.search).get("id")}`,
      ) === "true",
  );
  const [toonWaarschuwing, setToonWaarschuwing] = useState(false);
  const [waarschuwingNietMeerTonen, setWaarschuwingNietMeerTonen] =
    useState(false);
  const [pendingCallback, setPendingCallback] = useState(null);

  const params = new URLSearchParams(window.location.search);
  const quizId = params.get("id");
  const email = localStorage.getItem("email");
  const rol = localStorage.getItem("rol");
  const isKlant = rol === "klant";

  useEffect(() => {
    if (!email) {
      const huidigeUrl = window.location.href;
      window.location.href = `/lms-tilstra/?redirect=${encodeURIComponent(huidigeUrl)}`;
    }
  }, [email]);

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
    setOpgeslagen(true);

    const gezienInStorage =
      sessionStorage.getItem(`quiz_gezien_${quizId}`) === "true";
    if (
      email &&
      scorePercentage !== null &&
      !antwoordGezienInSessie &&
      !gezienInStorage
    ) {
      slaScoreOp(scorePercentage);
    }
  }

  async function slaScoreOp(scoreWaarde) {
    const quizTabel = isKlant ? "klant_quiz_scores" : "quiz_scores";
    const emailVeld = isKlant ? "klant_email" : "trainee_email";

    const { data: pogingen } = await supabase
      .from(quizTabel)
      .select("poging_nummer")
      .eq(emailVeld, email)
      .eq("quiz_id", quizId)
      .order("poging_nummer", { ascending: false })
      .limit(1);

    const volgendPoging =
      pogingen && pogingen.length > 0 ? pogingen[0].poging_nummer + 1 : 1;

    await supabase.from(quizTabel).insert({
      [emailVeld]: email,
      quiz_id: quizId,
      score: scoreWaarde,
      poging_nummer: volgendPoging,
    });

    // Bereken voortgang
    await berekeningVoortgang();
  }

  async function berekeningVoortgang() {
    // Haal module_id op via quiz → hoofdstuk
    const { data: quizData } = await supabase
      .from("quizen")
      .select("hoofdstuk_id, hoofdstukken(module_id)")
      .eq("id", quizId)
      .single();

    if (!quizData) return;
    const moduleId = quizData.hoofdstukken?.module_id;
    if (!moduleId) return;

    // Haal alle hoofdstukken van de module op
    const { data: hoofdstukken } = await supabase
      .from("hoofdstukken")
      .select("id")
      .eq("module_id", moduleId);

    if (!hoofdstukken || hoofdstukken.length === 0) return;
    const hoofdstukIds = hoofdstukken.map((h) => h.id);

    // Paragrafen
    const [{ data: alleParagrafen }, { data: alleQuizzen }] = await Promise.all(
      [
        supabase
          .from("paragrafen")
          .select("id")
          .in("hoofdstuk_id", hoofdstukIds),
        supabase.from("quizen").select("id").in("hoofdstuk_id", hoofdstukIds),
      ],
    );

    const totaal = (alleParagrafen?.length || 0) + (alleQuizzen?.length || 0);
    if (totaal === 0) return;

    // Voltooide paragrafen
    let voltooidParagrafen = 0;
    let gemScore = null;
    if (alleParagrafen && alleParagrafen.length > 0) {
      const paragraafIds = alleParagrafen.map((p) => p.id);
      const { data: alleOpgaves } = await supabase
        .from("opgaves")
        .select("id, paragraaf_id")
        .in("paragraaf_id", paragraafIds);

      const { data: alleTraineeScores } = await supabase
        .from(isKlant ? "klant_scores" : "scores")
        .select("opgave_id, score, poging_nummer, opgaves(paragraaf_id)")
        .eq(isKlant ? "klant_email" : "trainee_email", email)
        .in("opgave_id", alleOpgaves?.map((o) => o.id) || [])
        .order("poging_nummer", { ascending: false });

      const laasteScoresMap = {};
      (alleTraineeScores || []).forEach((s) => {
        if (!laasteScoresMap[s.opgave_id]) laasteScoresMap[s.opgave_id] = s;
      });
      const traineeScores = Object.values(laasteScoresMap);

      const gescoordeParagrafen = new Set();
      traineeScores.forEach((s) => {
        if (s.opgaves?.paragraaf_id)
          gescoordeParagrafen.add(s.opgaves.paragraaf_id);
      });
      voltooidParagrafen = gescoordeParagrafen.size;

      if (traineeScores.length > 0) {
        gemScore = Math.round(
          traineeScores.reduce((a, b) => a + b.score, 0) / traineeScores.length,
        );
      }
    }

    // Voltooide quizzen
    let voltooidQuizzen = 0;
    if (alleQuizzen && alleQuizzen.length > 0) {
      const quizIds = alleQuizzen.map((q) => q.id);
      const { data: quizScores } = await supabase
        .from(isKlant ? "klant_quiz_scores" : "quiz_scores")
        .select("quiz_id")
        .eq(isKlant ? "klant_email" : "trainee_email", email)
        .in("quiz_id", quizIds);

      if (quizScores) {
        const voltooideQuizIds = new Set(quizScores.map((s) => s.quiz_id));
        voltooidQuizzen = voltooideQuizIds.size;
      }
    }

    const voortgang = Math.round(
      ((voltooidParagrafen + voltooidQuizzen) / totaal) * 100,
    );

    // Upsert module_voortgang
    const tabel = isKlant ? "klant_voortgang" : "module_voortgang";
    const emailVeld = isKlant ? "klant_email" : "trainee_email";

    const { data: bestaand } = await supabase
      .from(tabel)
      .select("id")
      .eq(emailVeld, email)
      .eq("module_id", moduleId)
      .limit(1);

    if (bestaand && bestaand.length > 0) {
      const { error: updateError } = await supabase
        .from(tabel)
        .update({ voortgang, gem_score: gemScore })
        .eq("id", bestaand[0].id);
      if (updateError) console.error("Voortgang update mislukt:", updateError);
    } else {
      const { error: insertError } = await supabase.from(tabel).insert({
        [emailVeld]: email,
        module_id: moduleId,
        voortgang,
        gem_score: gemScore,
      });
      if (insertError) console.error("Voortgang insert mislukt:", insertError);
    }
  } // ← sluit berekeningVoortgang

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
      {/* Waarschuwing popup */}
      {toonWaarschuwing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "28px",
              width: "420px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 256 256" fill="#E65100">
                <path d="M236.8,188.09,149.35,36.22a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z" />
              </svg>
              <p
                style={{ fontWeight: 700, fontSize: "1rem", color: "#1A1A1A" }}
              >
                Let op!
              </p>
            </div>
            <p
              style={{
                fontSize: "0.88rem",
                color: "#5F6368",
                lineHeight: 1.6,
                marginBottom: "16px",
              }}
            >
              Als je het antwoord van een <strong>meerkeuze vraag</strong>{" "}
              bekijkt telt de hele quiz niet meer mee voor je score in deze
              sessie. Je kunt de quiz later opnieuw proberen.
              <br />
              <br />
              Open vragen kun je altijd inzien — die tellen niet mee in de
              score.
            </p>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.82rem",
                color: "#5F6368",
                marginBottom: "20px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={waarschuwingNietMeerTonen}
                onChange={(e) => setWaarschuwingNietMeerTonen(e.target.checked)}
              />
              Ik heb dit begrepen, toon deze melding niet meer
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setToonWaarschuwing(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "50px",
                  border: "1px solid #DADCE0",
                  background: "white",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  color: "#5F6368",
                }}
              >
                Annuleren
              </button>
              <button
                onClick={() => {
                  setAntwoordGezienInSessie(true);
                  sessionStorage.setItem(`quiz_gezien_${quizId}`, "true");
                  setToonWaarschuwing(false);
                  if (pendingCallback) {
                    pendingCallback();
                    setPendingCallback(null);
                  }
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "50px",
                  border: "none",
                  background: "#E65100",
                  color: "white",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Toon toch
              </button>
            </div>
          </div>
        </div>
      )}

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
              color: "#2E7D32",
              marginBottom: "2px",
            }}
          >
            Quiz
          </p>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1A1A1A" }}>
            {quiz?.naam || "Quiz"}
          </p>
        </div>
        {/* Ingelogde gebruiker */}
        <div style={{ textAlign: "center" }}>
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
            Ingelogd als
          </p>
          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#1A1A1A",
            }}
          >
            {email || "—"}
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
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#1A1A1A",
              }}
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
              borderRadius: "16px",
              border: "none",
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
          >
            {/* Vraag header */}
            <div
              style={{
                padding: "24px 28px",
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
                  fontSize: "0.90rem",
                  fontWeight: 600,
                  color: "#1A1A1A",
                  flex: 1,
                  lineHeight: 1.6,
                }}
              >
                {vraag.vraag}
              </p>
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
                  onToonAntwoord={(callback) => {
                    if (waarschuwingNietMeerTonen) {
                      setAntwoordGezienInSessie(true);
                      sessionStorage.setItem(`quiz_gezien_${quizId}`, "true");
                      callback();
                    } else {
                      setToonWaarschuwing(true);
                      setPendingCallback(() => callback);
                    }
                  }}
                />
              ) : (
                <OpenVraag
                  key={resetTeller}
                  vraag={vraag}
                  onChange={(tekst) => updateAntwoord(vraag.id, tekst)}
                  gecontroleerd={gecontroleerd}
                  onToonAntwoord={(callback) => {
                    callback();
                  }}
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
