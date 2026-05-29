import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import ParagraafBlok from "./ParagraafBlok";

export default function HoofdstukkenBlok({ moduleId }) {
  const [hoofdstukken, setHoofdstukken] = useState([]);
  const [laden, setLaden] = useState(true);
  const [nieuwNaam, setNieuwNaam] = useState("");
  const [toonFormulier, setToonFormulier] = useState(false);
  const [bewerkHoofdstuk, setBewerkHoofdstuk] = useState(null);
  const [bewerkNaam, setBewerkNaam] = useState("");
  const [opengeklapt, setOpengeklapt] = useState({});

  useEffect(() => {
    async function haalHoofdstukkenOp() {
      const { data, error } = await supabase
        .from("hoofdstukken")
        .select("*")
        .eq("module_id", moduleId)
        .order("volgorde");
      if (!error && data) setHoofdstukken(data);
      setLaden(false);
    }
    haalHoofdstukkenOp();
  }, [moduleId]);

  async function herlaadHoofdstukken() {
    const { data, error } = await supabase
      .from("hoofdstukken")
      .select("*")
      .eq("module_id", moduleId)
      .order("volgorde");
    if (!error && data) setHoofdstukken(data);
  }

  async function voegHoofdstukToe() {
    if (!nieuwNaam.trim()) return;
    await supabase.from("hoofdstukken").insert({
      naam: nieuwNaam,
      module_id: moduleId,
      volgorde: hoofdstukken.length,
    });
    setNieuwNaam("");
    setToonFormulier(false);
    herlaadHoofdstukken();
  }

  async function slaHoofdstukOp() {
    if (!bewerkNaam.trim()) return;
    await supabase
      .from("hoofdstukken")
      .update({ naam: bewerkNaam })
      .eq("id", bewerkHoofdstuk);
    setBewerkHoofdstuk(null);
    herlaadHoofdstukken();
  }

  async function verwijderHoofdstuk(id) {
    if (!window.confirm("Weet je zeker dat je dit hoofdstuk wilt verwijderen?"))
      return;
    await supabase.from("hoofdstukken").delete().eq("id", id);
    herlaadHoofdstukken();
  }

  function toggleOpengeklapt(id) {
    setOpengeklapt((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (laden)
    return (
      <p style={{ fontSize: "0.82rem", color: "var(--grijs-500)" }}>
        Hoofdstukken laden...
      </p>
    );

  return (
    <div>
      {hoofdstukken.length === 0 && !toonFormulier ? (
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--grijs-500)",
            marginBottom: "12px",
          }}
        >
          Nog geen hoofdstukken.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          {hoofdstukken.map((hoofdstuk) => (
            <div
              key={hoofdstuk.id}
              style={{
                background: "var(--grijs-50)",
                border: "1px solid var(--grijs-200)",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              {bewerkHoofdstuk === hoofdstuk.id ? (
                <div
                  style={{ padding: "12px 16px" }}
                  className="uitklap-animatie"
                >
                  <input
                    type="text"
                    value={bewerkNaam}
                    onChange={(e) => setBewerkNaam(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--grijs-200)",
                      marginBottom: "10px",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.85rem",
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="knop knop-primair"
                      style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                      onClick={slaHoofdstukOp}
                    >
                      Opslaan
                    </button>
                    <button
                      className="knop knop-ghost"
                      style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                      onClick={() => setBewerkHoofdstuk(null)}
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleOpengeklapt(hoofdstuk.id)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{ fontSize: "0.7rem", color: "var(--grijs-400)" }}
                    >
                      {opengeklapt[hoofdstuk.id] ? "▼" : "▶"}
                    </span>
                    <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                      {hoofdstuk.naam}
                    </p>
                  </div>
                  <div
                    style={{ display: "flex", gap: "4px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setBewerkHoofdstuk(hoofdstuk.id);
                        setBewerkNaam(hoofdstuk.naam);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "6px",
                        borderRadius: "50%",
                        color: "var(--grijs-500)",
                        display: "flex",
                        alignItems: "center",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--grijs-200)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "none")
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => verwijderHoofdstuk(hoofdstuk.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "6px",
                        borderRadius: "50%",
                        color: "var(--rood)",
                        display: "flex",
                        alignItems: "center",
                        transition: "background 0.15s",
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
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {opengeklapt[hoofdstuk.id] && (
                <div
                  style={{
                    borderTop: "1px solid var(--grijs-200)",
                    padding: "12px 16px",
                    background: "white",
                  }}
                >
                  <ParagraafBlok hoofdstukId={hoofdstuk.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {toonFormulier && (
        <div
          style={{
            background: "var(--grijs-50)",
            border: "1px solid var(--grijs-200)",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "12px",
          }}
          className="uitklap-animatie"
        >
          <input
            type="text"
            placeholder="Naam van het hoofdstuk"
            value={nieuwNaam}
            onChange={(e) => setNieuwNaam(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") voegHoofdstukToe();
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid var(--grijs-200)",
              marginBottom: "10px",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.85rem",
            }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="knop knop-primair"
              style={{ padding: "6px 14px", fontSize: "0.78rem" }}
              onClick={voegHoofdstukToe}
            >
              Opslaan
            </button>
            <button
              className="knop knop-ghost"
              style={{ padding: "6px 14px", fontSize: "0.78rem" }}
              onClick={() => setToonFormulier(false)}
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      <button
        className="knop knop-secundair"
        style={{ fontSize: "0.78rem", padding: "6px 14px" }}
        onClick={() => setToonFormulier(true)}
      >
        + Hoofdstuk toevoegen
      </button>
    </div>
  );
}
