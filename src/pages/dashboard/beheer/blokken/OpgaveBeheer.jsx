import { useState } from "react";
import { supabase } from "../../../../lib/supabase";

// Gedeelde stijlen
const labelStijl = {
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "var(--grijs-700)",
  display: "block",
  marginBottom: "6px",
};
const inputStijl = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: "8px",
  border: "1px solid var(--grijs-200)",
  marginBottom: "14px",
  fontFamily: "Inter, sans-serif",
  fontSize: "0.85rem",
};
const verwijderKnop = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "4px",
  borderRadius: "50%",
  color: "var(--rood)",
  display: "flex",
  alignItems: "center",
};
const VerwijderIcoon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    fill="currentColor"
    viewBox="0 0 256 256"
  >
    <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
  </svg>
);
const InhoudHeader = () => (
  <>
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
  </>
);

// ── Invulvraag editor ──
function InvulvraagEditor({ opgave, onHerlaad }) {
  const inhoud = opgave.inhoud || {};
  const [vraag, setVraag] = useState(inhoud.vraag || "");
  const [tekst, setTekst] = useState(inhoud.tekst || "");
  const [antwoorden, setAntwoorden] = useState(inhoud.antwoorden || [""]);
  const [opgeslagen, setOpgeslagen] = useState(false);

  const aantalGaten = (tekst.match(/\{\d+\}/g) || []).length;

  async function slaOp() {
    await supabase
      .from("opgaves")
      .update({ inhoud: { vraag, tekst, antwoorden } })
      .eq("id", opgave.id);
    setOpgeslagen(true);
    onHerlaad();
  }

  return (
    <div style={{ marginTop: "16px" }}>
      <InhoudHeader />
      <label style={labelStijl}>Vraag</label>
      <input
        type="text"
        value={vraag}
        onChange={(e) => {
          setVraag(e.target.value);
          setOpgeslagen(false);
        }}
        style={inputStijl}
      />

      <label style={labelStijl}>
        Tekst met gaten{" "}
        <span style={{ fontWeight: 400, color: "var(--grijs-500)" }}>
          (gebruik {"{0}"}, {"{1}"}... voor invulplekken)
        </span>
      </label>
      <textarea
        value={tekst}
        onChange={(e) => {
          setTekst(e.target.value);
          setOpgeslagen(false);
        }}
        style={{ ...inputStijl, resize: "vertical", minHeight: "100px" }}
      />

      <label style={{ ...labelStijl, marginBottom: "8px" }}>
        Antwoorden{" "}
        <span style={{ fontWeight: 400, color: "var(--grijs-500)" }}>
          ({aantalGaten} {aantalGaten === 1 ? "gat" : "gaten"} gevonden)
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
        {antwoorden.map((antwoord, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--grijs-500)",
                width: "20px",
                flexShrink: 0,
              }}
            >
              {"{" + index + "}"}
            </span>
            <input
              type="text"
              value={antwoord}
              onChange={(e) => {
                setAntwoorden((prev) =>
                  prev.map((a, i) => (i === index ? e.target.value : a)),
                );
                setOpgeslagen(false);
              }}
              placeholder={`Antwoord voor {${index}}`}
              style={{
                flex: 1,
                padding: "7px 10px",
                borderRadius: "6px",
                border: "1px solid var(--grijs-200)",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.82rem",
              }}
            />
            {antwoorden.length > 1 && (
              <button
                onClick={() => {
                  setAntwoorden((prev) => prev.filter((_, i) => i !== index));
                  setOpgeslagen(false);
                }}
                style={verwijderKnop}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--rood-licht)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <VerwijderIcoon />
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
        onClick={() => {
          setAntwoorden((prev) => [...prev, ""]);
          setOpgeslagen(false);
        }}
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

// ── Drag & Drop editor ──
function DragDropEditor({ opgave, onHerlaad }) {
  const inhoud = opgave.inhoud || {};
  const [vraag, setVraag] = useState(inhoud.vraag || "");
  const [tekst, setTekst] = useState(inhoud.tekst || "");
  const [antwoorden, setAntwoorden] = useState(inhoud.antwoorden || [""]);
  const [woordenbank, setWoordenbank] = useState(inhoud.woordenbank || [""]);
  const [opgeslagen, setOpgeslagen] = useState(false);

  const aantalGaten = (tekst.match(/\{\d+\}/g) || []).length;

  async function slaOp() {
    await supabase
      .from("opgaves")
      .update({ inhoud: { vraag, tekst, antwoorden, woordenbank } })
      .eq("id", opgave.id);
    setOpgeslagen(true);
    onHerlaad();
  }

  return (
    <div style={{ marginTop: "16px" }}>
      <InhoudHeader />
      <label style={labelStijl}>Vraag</label>
      <input
        type="text"
        value={vraag}
        onChange={(e) => {
          setVraag(e.target.value);
          setOpgeslagen(false);
        }}
        style={inputStijl}
      />

      <label style={labelStijl}>
        Tekst met gaten{" "}
        <span style={{ fontWeight: 400, color: "var(--grijs-500)" }}>
          (gebruik {"{0}"}, {"{1}"}... voor sleepplekken)
        </span>
      </label>
      <textarea
        value={tekst}
        onChange={(e) => {
          setTekst(e.target.value);
          setOpgeslagen(false);
        }}
        style={{ ...inputStijl, resize: "vertical", minHeight: "100px" }}
      />

      <label style={{ ...labelStijl, marginBottom: "8px" }}>
        Correcte antwoorden{" "}
        <span style={{ fontWeight: 400, color: "var(--grijs-500)" }}>
          ({aantalGaten} {aantalGaten === 1 ? "gat" : "gaten"} gevonden)
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
        {antwoorden.map((antwoord, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--grijs-500)",
                width: "20px",
                flexShrink: 0,
              }}
            >
              {"{" + index + "}"}
            </span>
            <input
              type="text"
              value={antwoord}
              onChange={(e) => {
                setAntwoorden((prev) =>
                  prev.map((a, i) => (i === index ? e.target.value : a)),
                );
                setOpgeslagen(false);
              }}
              placeholder={`Correct antwoord voor {${index}}`}
              style={{
                flex: 1,
                padding: "7px 10px",
                borderRadius: "6px",
                border: "1px solid var(--grijs-200)",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.82rem",
              }}
            />
            {antwoorden.length > 1 && (
              <button
                onClick={() => {
                  setAntwoorden((prev) => prev.filter((_, i) => i !== index));
                  setOpgeslagen(false);
                }}
                style={verwijderKnop}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--rood-licht)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <VerwijderIcoon />
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
        onClick={() => {
          setAntwoorden((prev) => [...prev, ""]);
          setOpgeslagen(false);
        }}
      >
        + Antwoord toevoegen
      </button>

      <label style={{ ...labelStijl, marginTop: "8px", marginBottom: "8px" }}>
        Woordenbank{" "}
        <span style={{ fontWeight: 400, color: "var(--grijs-500)" }}>
          (inclusief afleiders)
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
        {woordenbank.map((woord, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <input
              type="text"
              value={woord}
              onChange={(e) => {
                setWoordenbank((prev) =>
                  prev.map((w, i) => (i === index ? e.target.value : w)),
                );
                setOpgeslagen(false);
              }}
              placeholder={`Woord ${index + 1}`}
              style={{
                flex: 1,
                padding: "7px 10px",
                borderRadius: "6px",
                border: "1px solid var(--grijs-200)",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.82rem",
              }}
            />
            {woordenbank.length > 1 && (
              <button
                onClick={() => {
                  setWoordenbank((prev) => prev.filter((_, i) => i !== index));
                  setOpgeslagen(false);
                }}
                style={verwijderKnop}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--rood-licht)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <VerwijderIcoon />
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
        onClick={() => {
          setWoordenbank((prev) => [...prev, ""]);
          setOpgeslagen(false);
        }}
      >
        + Woord toevoegen
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

// ── Open vraag editor ──
function OpenVraagEditor({ opgave, onHerlaad }) {
  const inhoud = opgave.inhoud || {};
  const [vraag, setVraag] = useState(inhoud.vraag || "");
  const [modelantwoorden, setModelantwoorden] = useState(
    inhoud.modelantwoorden || [""],
  );
  const [opgeslagen, setOpgeslagen] = useState(false);

  async function slaOp() {
    await supabase
      .from("opgaves")
      .update({ inhoud: { vraag, modelantwoorden } })
      .eq("id", opgave.id);
    setOpgeslagen(true);
    onHerlaad();
  }

  return (
    <div style={{ marginTop: "16px" }}>
      <InhoudHeader />
      <label style={labelStijl}>Vraag</label>
      <input
        type="text"
        value={vraag}
        onChange={(e) => {
          setVraag(e.target.value);
          setOpgeslagen(false);
        }}
        style={inputStijl}
      />

      <label style={{ ...labelStijl, marginBottom: "8px" }}>
        Geaccepteerde antwoorden{" "}
        <span style={{ fontWeight: 400, color: "var(--grijs-500)" }}>
          (voeg variaties toe voor flexibele matching)
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
        {modelantwoorden.map((antwoord, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <input
              type="text"
              value={antwoord}
              onChange={(e) => {
                setModelantwoorden((prev) =>
                  prev.map((a, i) => (i === index ? e.target.value : a)),
                );
                setOpgeslagen(false);
              }}
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
            {modelantwoorden.length > 1 && (
              <button
                onClick={() => {
                  setModelantwoorden((prev) =>
                    prev.filter((_, i) => i !== index),
                  );
                  setOpgeslagen(false);
                }}
                style={verwijderKnop}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--rood-licht)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <VerwijderIcoon />
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
        onClick={() => {
          setModelantwoorden((prev) => [...prev, ""]);
          setOpgeslagen(false);
        }}
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

// ── Hoofdcomponent ──
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
    await supabase
      .from("opgaves")
      .update({ inhoud: { vraag, opties } })
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

  if (opgave.sjabloon === "meerkeuze") {
    return (
      <div style={{ marginTop: "16px" }}>
        <InhoudHeader />
        <label style={labelStijl}>Vraag</label>
        <textarea
          value={vraag}
          onChange={(e) => {
            setVraag(e.target.value);
            setOpgeslagen(false);
          }}
          style={{ ...inputStijl, resize: "vertical", minHeight: "70px" }}
        />

        <label style={{ ...labelStijl, marginBottom: "8px" }}>
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
                  onClick={() =>
                    setOpties((prev) => prev.filter((_, i) => i !== index))
                  }
                  style={verwijderKnop}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--rood-licht)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  <VerwijderIcoon />
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
          onClick={() =>
            setOpties((prev) => [...prev, { tekst: "", correct: false }])
          }
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

  if (opgave.sjabloon === "invulvraag")
    return <InvulvraagEditor opgave={opgave} onHerlaad={onHerlaad} />;
  if (opgave.sjabloon === "drag-drop")
    return <DragDropEditor opgave={opgave} onHerlaad={onHerlaad} />;
  if (opgave.sjabloon === "open-vraag")
    return <OpenVraagEditor opgave={opgave} onHerlaad={onHerlaad} />;

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
