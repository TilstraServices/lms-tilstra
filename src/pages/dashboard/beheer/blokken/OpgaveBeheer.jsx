import { useState } from "react";
import { supabase } from "../../../../lib/supabase";

export default function OpgaveBeheer({ opgave, onHerlaad }) {
  const inhoud = opgave.inhoud || {};
  const [vraag, setVraag] = useState(inhoud.vraag || "");
  const [opties, setOpties] = useState(
    inhoud.opties || [
      { tekst: "", correct: true },
      { tekst: "", correct: false },
      { tekst: "", correct: false },
      { tekst: "", correct: false },
    ],
  );
  const [opgeslagen, setOpgeslagen] = useState(false);

  async function slaOp() {
    const nieuweInhoud = { vraag, opties };
    await supabase
      .from("opgaves")
      .update({ inhoud: nieuweInhoud })
      .eq("id", opgave.id);
    setOpgeslagen(true);
    onHerlaad();
  }

  function updateOptie(index, veld, waarde) {
    setOpties((prev) =>
      prev.map((o, i) => (i === index ? { ...o, [veld]: waarde } : o)),
    );
    setOpgeslagen(false);
  }

  function setCorrect(index) {
    setOpties((prev) => prev.map((o, i) => ({ ...o, correct: i === index })));
    setOpgeslagen(false);
  }

  function voegOptieToe() {
    setOpties((prev) => [...prev, { tekst: "", correct: false }]);
    setOpgeslagen(false);
  }

  function verwijderOptie(index) {
    if (opties.length <= 2) return;
    setOpties((prev) => prev.filter((_, i) => i !== index));
    setOpgeslagen(false);
  }

  if (opgave.sjabloon === "meerkeuze") {
    return (
      <div style={{ marginTop: "16px" }}>
        <hr
          style={{
            border: "none",
            borderTop: "1px solid var(--grijs-200)",
            marginBottom: "16px",
          }}
        />
        <p
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--grijs-500)",
            marginBottom: "12px",
          }}
        >
          Inhoud
        </p>

        <label
          style={{
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--grijs-700)",
            display: "block",
            marginBottom: "6px",
          }}
        >
          Vraag
        </label>
        <textarea
          value={vraag}
          onChange={(e) => {
            setVraag(e.target.value);
            setOpgeslagen(false);
          }}
          style={{
            width: "100%",
            padding: "9px 12px",
            borderRadius: "8px",
            border: "1px solid var(--grijs-200)",
            marginBottom: "14px",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.85rem",
            resize: "vertical",
            minHeight: "70px",
          }}
        />

        <label
          style={{
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--grijs-700)",
            display: "block",
            marginBottom: "8px",
          }}
        >
          Antwoorden{" "}
          <span style={{ fontWeight: 400, color: "var(--grijs-500)" }}>
            (klik op het rondje voor het juiste antwoord)
          </span>
        </label>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginBottom: "10px",
          }}
        >
          {opties.map((optie, index) => (
            <div
              key={index}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <button
                onClick={() => setCorrect(index)}
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  border: `2px solid ${optie.correct ? "var(--groen)" : "var(--grijs-300)"}`,
                  background: optie.correct ? "var(--groen)" : "white",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              />
              <input
                type="text"
                value={optie.tekst}
                onChange={(e) => updateOptie(index, "tekst", e.target.value)}
                placeholder={`Antwoord ${index + 1}`}
                style={{
                  flex: 1,
                  padding: "7px 10px",
                  borderRadius: "6px",
                  border: "1px solid var(--grijs-200)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.82rem",
                }}
              />
              {opties.length > 2 && (
                <button
                  onClick={() => verwijderOptie(index)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "50%",
                    color: "var(--rood)",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--rood-licht)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          className="knop knop-secundair"
          style={{
            fontSize: "0.78rem",
            padding: "5px 12px",
            marginBottom: "16px",
          }}
          onClick={voegOptieToe}
        >
          + Antwoord toevoegen
        </button>

        <br />

        <button
          className="knop knop-primair"
          style={{ fontSize: "0.82rem" }}
          onClick={slaOp}
        >
          {opgeslagen ? "✓ Opgeslagen" : "Opslaan"}
        </button>
      </div>
    );
  }

  if (opgave.sjabloon === "invulvraag") {
    return (
      <div style={{ marginTop: "16px" }}>
        <hr
          style={{
            border: "none",
            borderTop: "1px solid var(--grijs-200)",
            marginBottom: "16px",
          }}
        />
        <p
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--grijs-500)",
            marginBottom: "12px",
          }}
        >
          Inhoud
        </p>
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--grijs-500)",
            marginBottom: "12px",
          }}
        >
          Voor invulvragen komt hier binnenkort een editor. Voor nu kun je de
          inhoud direct in Supabase bewerken.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "16px" }}>
      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--grijs-200)",
          marginBottom: "16px",
        }}
      />
      <p style={{ fontSize: "0.82rem", color: "var(--grijs-500)" }}>
        Geen inhoud editor beschikbaar voor dit type.
      </p>
    </div>
  );
}
