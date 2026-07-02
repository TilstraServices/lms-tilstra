import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

export default function QuizBeheer({ quiz }) {
  const [vragen, setVragen] = useState([]);
  const [laden, setLaden] = useState(true);
  const [geselecteerdeVraag, setGeselecteerdeVraag] = useState(null);
  const [nieuweVraagLaden, setNieuweVraagLaden] = useState(false);

  useEffect(() => {
    async function haalVragenOp() {
      const { data, error } = await supabase
        .from("vragen")
        .select("*, antwoorden(*)")
        .eq("quiz_id", quiz.id)
        .order("volgorde");
      if (!error && data) setVragen(data);
      setLaden(false);
    }
    haalVragenOp();
  }, [quiz.id]);

  async function herlaadVragen() {
    const { data, error } = await supabase
      .from("vragen")
      .select("*, antwoorden(*)")
      .eq("quiz_id", quiz.id)
      .order("volgorde");
    if (!error && data) setVragen(data);
  }

  async function voegVraagToe() {
    setNieuweVraagLaden(true);
    const { data } = await supabase
      .from("vragen")
      .insert({
        vraag: "",
        type: "meerkeuze",
        quiz_id: quiz.id,
        volgorde: vragen.length,
        meerdere_correct: false,
      })
      .select()
      .single();

    if (data) {
      await supabase.from("antwoorden").insert([
        { vraag_id: data.id, tekst: "", is_correct: true, volgorde: 0 },
        { vraag_id: data.id, tekst: "", is_correct: false, volgorde: 1 },
        { vraag_id: data.id, tekst: "", is_correct: false, volgorde: 2 },
        { vraag_id: data.id, tekst: "", is_correct: false, volgorde: 3 },
      ]);
      await herlaadVragen();
      setGeselecteerdeVraag(data.id);
    }
    setNieuweVraagLaden(false);
  }

  async function verwijderVraag(id) {
    if (!window.confirm("Weet je zeker dat je deze vraag wilt verwijderen?"))
      return;
    await supabase.from("vragen").delete().eq("id", id);
    if (geselecteerdeVraag === id) setGeselecteerdeVraag(null);
    herlaadVragen();
  }

  if (laden)
    return (
      <p style={{ fontSize: "0.82rem", color: "var(--grijs-500)" }}>
        Vragen laden...
      </p>
    );

  const actieveVraag = vragen.find((v) => v.id === geselecteerdeVraag);

  return (
    <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
      {/* Linkerkant — vragenlijst */}
      <div style={{ width: "220px", flexShrink: 0 }}>
        <p
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--grijs-500)",
            marginBottom: "8px",
          }}
        >
          Vragen ({vragen.length})
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            marginBottom: "10px",
          }}
        >
          {vragen.map((vraag, index) => (
            <div
              key={vraag.id}
              onClick={() => setGeselecteerdeVraag(vraag.id)}
              style={{
                padding: "8px 10px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.82rem",
                background:
                  geselecteerdeVraag === vraag.id
                    ? "var(--groen-licht)"
                    : "var(--grijs-50)",
                color:
                  geselecteerdeVraag === vraag.id
                    ? "var(--groen-donker)"
                    : "var(--grijs-900)",
                border: "1px solid var(--grijs-200)",
                fontWeight: geselecteerdeVraag === vraag.id ? 600 : 400,
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => {
                if (geselecteerdeVraag !== vraag.id)
                  e.currentTarget.style.background = "var(--grijs-100)";
              }}
              onMouseLeave={(e) => {
                if (geselecteerdeVraag !== vraag.id)
                  e.currentTarget.style.background = "var(--grijs-50)";
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--grijs-400)",
                    flexShrink: 0,
                  }}
                >
                  V{index + 1}
                </span>
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {vraag.vraag || "Lege vraag"}
                </span>
              </div>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--grijs-500)",
                  marginTop: "2px",
                  display: "block",
                }}
              >
                {vraag.type === "meerkeuze" ? "Meerkeuze" : "Open vraag"}
              </span>
            </div>
          ))}
        </div>

        <button
          className="knop knop-secundair"
          style={{ fontSize: "0.78rem", padding: "6px 12px", width: "100%" }}
          onClick={voegVraagToe}
          disabled={nieuweVraagLaden}
        >
          {nieuweVraagLaden ? "Aanmaken..." : "+ Nieuwe vraag"}
        </button>
      </div>

      {/* Rechterkant — vraag bewerken */}
      <div style={{ flex: 1 }}>
        {!actieveVraag ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--grijs-500)",
              fontSize: "0.85rem",
            }}
          >
            Selecteer een vraag om te bewerken
          </div>
        ) : (
          <VraagBewerken
            key={actieveVraag.id}
            vraag={actieveVraag}
            onHerlaad={herlaadVragen}
            onVerwijder={() => verwijderVraag(actieveVraag.id)}
          />
        )}
      </div>
    </div>
  );
}

function VraagBewerken({ vraag, onHerlaad, onVerwijder }) {
  const [vraagtekst, setVraagtekst] = useState(vraag.vraag || "");
  const [antwoorden, setAntwoorden] = useState(vraag.antwoorden || []);
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [meerdereMogelijk, setMeerdereMogelijk] = useState(
    vraag.meerdere_correct || false,
  );

  async function slaVraagOp() {
    await supabase
      .from("vragen")
      .update({ vraag: vraagtekst, meerdere_correct: meerdereMogelijk })
      .eq("id", vraag.id);

    for (const antwoord of antwoorden) {
      await supabase
        .from("antwoorden")
        .update({ tekst: antwoord.tekst, is_correct: antwoord.is_correct })
        .eq("id", antwoord.id);
    }

    setOpgeslagen(true);
    onHerlaad();
  }

  function updateAntwoord(id, veld, waarde) {
    setAntwoorden((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [veld]: waarde } : a)),
    );
    setOpgeslagen(false);
  }

  function toggleCorrect(id) {
    if (meerdereMogelijk) {
      // Meerdere correct mogelijk — toggle individueel
      setAntwoorden((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, is_correct: !a.is_correct } : a,
        ),
      );
    } else {
      // Slechts één correct — zet alle andere op false
      setAntwoorden((prev) =>
        prev.map((a) => ({ ...a, is_correct: a.id === id })),
      );
    }
    setOpgeslagen(false);
  }
  async function voegAntwoordToe() {
    const { data } = await supabase
      .from("antwoorden")
      .insert({
        vraag_id: vraag.id,
        tekst: "",
        is_correct: false,
        volgorde: antwoorden.length,
      })
      .select()
      .single();
    if (data) setAntwoorden((prev) => [...prev, data]);
  }

  async function verwijderAntwoord(id) {
    if (antwoorden.length <= 2) return;
    await supabase.from("antwoorden").delete().eq("id", id);
    setAntwoorden((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={async () => {
              if (vraag.type === "meerkeuze") return;
              await supabase
                .from("vragen")
                .update({ type: "meerkeuze" })
                .eq("id", vraag.id);
              await supabase
                .from("antwoorden")
                .delete()
                .eq("vraag_id", vraag.id);
              await supabase.from("antwoorden").insert([
                {
                  vraag_id: vraag.id,
                  tekst: "",
                  is_correct: true,
                  volgorde: 0,
                },
                {
                  vraag_id: vraag.id,
                  tekst: "",
                  is_correct: false,
                  volgorde: 1,
                },
                {
                  vraag_id: vraag.id,
                  tekst: "",
                  is_correct: false,
                  volgorde: 2,
                },
                {
                  vraag_id: vraag.id,
                  tekst: "",
                  is_correct: false,
                  volgorde: 3,
                },
              ]);
              onHerlaad();
            }}
            style={{
              padding: "4px 12px",
              borderRadius: "50px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              border: "none",
              background:
                vraag.type === "meerkeuze"
                  ? "var(--groen)"
                  : "var(--grijs-200)",
              color: vraag.type === "meerkeuze" ? "white" : "var(--grijs-700)",
            }}
          >
            Meerkeuze
          </button>
          <button
            onClick={async () => {
              if (vraag.type === "open") return;
              await supabase
                .from("vragen")
                .update({ type: "open" })
                .eq("id", vraag.id);
              await supabase
                .from("antwoorden")
                .delete()
                .eq("vraag_id", vraag.id);
              await supabase.from("antwoorden").insert({
                vraag_id: vraag.id,
                tekst: "",
                is_correct: true,
                volgorde: 0,
              });
              onHerlaad();
            }}
            style={{
              padding: "4px 12px",
              borderRadius: "50px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              border: "none",
              background:
                vraag.type === "open" ? "var(--groen)" : "var(--grijs-200)",
              color: vraag.type === "open" ? "white" : "var(--grijs-700)",
            }}
          >
            Open
          </button>
        </div>
        <button
          onClick={onVerwijder}
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
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
          </svg>
        </button>
      </div>

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
        value={vraagtekst}
        onChange={(e) => {
          setVraagtekst(e.target.value);
          setOpgeslagen(false);
        }}
        style={{
          width: "100%",
          padding: "9px 12px",
          borderRadius: "8px",
          border: "1px solid var(--grijs-200)",
          marginBottom: "16px",
          fontFamily: "Inter, sans-serif",
          fontSize: "0.85rem",
          resize: "vertical",
          minHeight: "70px",
        }}
      />

      {vraag.type === "meerkeuze" && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <label
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--grijs-700)",
              }}
            >
              Antwoorden
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--grijs-500)" }}>
                Meerdere correct
              </span>
              <button
                onClick={() => {
                  setMeerdereMogelijk(!meerdereMogelijk);
                  setOpgeslagen(false);
                }}
                style={{
                  width: "36px",
                  height: "20px",
                  borderRadius: "50px",
                  border: "none",
                  cursor: "pointer",
                  background: meerdereMogelijk
                    ? "var(--groen)"
                    : "var(--grijs-300)",
                  position: "relative",
                  transition: "background 0.2s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: "white",
                    transition: "left 0.2s",
                    left: meerdereMogelijk ? "18px" : "2px",
                  }}
                />
              </button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginBottom: "10px",
            }}
          >
            {antwoorden
              .sort((a, b) => a.volgorde - b.volgorde)
              .map((antwoord) => (
                <div
                  key={antwoord.id}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <button
                    onClick={() => toggleCorrect(antwoord.id)}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: `2px solid ${antwoord.is_correct ? "var(--groen)" : "var(--grijs-300)"}`,
                      background: antwoord.is_correct
                        ? "var(--groen)"
                        : "white",
                      cursor: "pointer",
                      flexShrink: 0,
                      transition: "all 0.15s",
                    }}
                  />
                  <input
                    type="text"
                    value={antwoord.tekst}
                    onChange={(e) =>
                      updateAntwoord(antwoord.id, "tekst", e.target.value)
                    }
                    placeholder={`Antwoord ${antwoord.volgorde + 1}`}
                    style={{
                      flex: 1,
                      padding: "7px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--grijs-200)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.82rem",
                    }}
                  />
                  {antwoorden.length > 2 && (
                    <button
                      onClick={() => verwijderAntwoord(antwoord.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: "50%",
                        color: "var(--rood)",
                        display: "flex",
                        alignItems: "center",
                        flexShrink: 0,
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
            onClick={voegAntwoordToe}
          >
            + Antwoord toevoegen
          </button>
        </>
      )}

      {vraag.type === "open" && (
        <>
          <label
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "var(--grijs-700)",
              display: "block",
              marginBottom: "6px",
            }}
          >
            Modelantwoord{" "}
            <span style={{ fontWeight: 400, color: "var(--grijs-500)" }}>
              (wordt later door AI gebruikt)
            </span>
          </label>
          <textarea
            value={antwoorden[0]?.tekst || ""}
            onChange={(e) =>
              updateAntwoord(antwoorden[0]?.id, "tekst", e.target.value)
            }
            placeholder="Beschrijf het verwachte antwoord..."
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid var(--grijs-200)",
              marginBottom: "16px",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.85rem",
              resize: "vertical",
              minHeight: "80px",
            }}
          />
        </>
      )}

      <button
        className="knop knop-primair"
        style={{ fontSize: "0.82rem" }}
        onClick={slaVraagOp}
      >
        {opgeslagen ? "✓ Opgeslagen" : "Opslaan"}
      </button>
    </div>
  );
}
