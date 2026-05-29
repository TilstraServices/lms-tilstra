import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

export default function ParagraafBlok({ hoofdstukId }) {
  const [paragrafen, setparagrafen] = useState([]);
  const [laden, setLaden] = useState(true);
  const [nieuwNaam, setNieuwNaam] = useState("");
  const [toonFormulier, setToonFormulier] = useState(false);
  const [bewerkParagraaf, setBewerkParagraaf] = useState(null);
  const [bewerkNaam, setBewerkNaam] = useState("");
  const [opengeklapt, setOpengeklapt] = useState({});

  useEffect(() => {
    async function haalParagrafenOp() {
      const { data, error } = await supabase
        .from("paragrafen")
        .select("*")
        .eq("hoofdstuk_id", hoofdstukId)
        .order("volgorde");
      if (!error && data) setparagrafen(data);
      setLaden(false);
    }
    haalParagrafenOp();
  }, [hoofdstukId]);

  async function herlaadParagrafen() {
    const { data, error } = await supabase
      .from("paragrafen")
      .select("*")
      .eq("hoofdstuk_id", hoofdstukId)
      .order("volgorde");
    if (!error && data) setparagrafen(data);
  }

  async function voegParagraafToe() {
    if (!nieuwNaam.trim()) return;
    await supabase.from("paragrafen").insert({
      naam: nieuwNaam,
      hoofdstuk_id: hoofdstukId,
      volgorde: paragrafen.length,
    });
    setNieuwNaam("");
    setToonFormulier(false);
    herlaadParagrafen();
  }

  async function slaParagraafOp() {
    if (!bewerkNaam.trim()) return;
    await supabase
      .from("paragrafen")
      .update({ naam: bewerkNaam })
      .eq("id", bewerkParagraaf);
    setBewerkParagraaf(null);
    herlaadParagrafen();
  }

  async function verwijderParagraaf(id) {
    if (
      !window.confirm("Weet je zeker dat je deze paragraaf wilt verwijderen?")
    )
      return;
    await supabase.from("paragrafen").delete().eq("id", id);
    herlaadParagrafen();
  }

  function toggleOpengeklapt(id) {
    setOpengeklapt((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (laden)
    return (
      <p style={{ fontSize: "0.82rem", color: "var(--grijs-500)" }}>
        Paragrafen laden...
      </p>
    );

  return (
    <div>
      {paragrafen.length === 0 && !toonFormulier ? (
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--grijs-500)",
            marginBottom: "12px",
          }}
        >
          Nog geen paragrafen.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginBottom: "12px",
          }}
        >
          {paragrafen.map((paragraaf) => (
            <div
              key={paragraaf.id}
              style={{
                background: "white",
                border: "1px solid var(--grijs-200)",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              {bewerkParagraaf === paragraaf.id ? (
                <div
                  style={{ padding: "10px 14px" }}
                  className="uitklap-animatie"
                >
                  <input
                    type="text"
                    value={bewerkNaam}
                    onChange={(e) => setBewerkNaam(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "7px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--grijs-200)",
                      marginBottom: "8px",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.82rem",
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="knop knop-primair"
                      style={{ padding: "5px 12px", fontSize: "0.75rem" }}
                      onClick={slaParagraafOp}
                    >
                      Opslaan
                    </button>
                    <button
                      className="knop knop-ghost"
                      style={{ padding: "5px 12px", fontSize: "0.75rem" }}
                      onClick={() => setBewerkParagraaf(null)}
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
                    padding: "8px 14px",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleOpengeklapt(paragraaf.id)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{ fontSize: "0.65rem", color: "var(--grijs-400)" }}
                    >
                      {opengeklapt[paragraaf.id] ? "▼" : "▶"}
                    </span>
                    <p style={{ fontSize: "0.82rem", fontWeight: 500 }}>
                      {paragraaf.naam}
                    </p>
                  </div>
                  <div
                    style={{ display: "flex", gap: "4px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setBewerkParagraaf(paragraaf.id);
                        setBewerkNaam(paragraaf.naam);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
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
                        width="14"
                        height="14"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => verwijderParagraaf(paragraaf.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
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
                        width="14"
                        height="14"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {opengeklapt[paragraaf.id] && (
                <div
                  style={{
                    borderTop: "1px solid var(--grijs-200)",
                    padding: "10px 14px",
                    background: "var(--grijs-50)",
                  }}
                >
                  <p style={{ fontSize: "0.78rem", color: "var(--grijs-500)" }}>
                    Opgaves komen hier
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {toonFormulier && (
        <div
          style={{
            background: "white",
            border: "1px solid var(--grijs-200)",
            borderRadius: "6px",
            padding: "10px 14px",
            marginBottom: "10px",
          }}
          className="uitklap-animatie"
        >
          <input
            type="text"
            placeholder="Naam van de paragraaf"
            value={nieuwNaam}
            onChange={(e) => setNieuwNaam(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") voegParagraafToe();
            }}
            style={{
              width: "100%",
              padding: "7px 10px",
              borderRadius: "6px",
              border: "1px solid var(--grijs-200)",
              marginBottom: "8px",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.82rem",
            }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="knop knop-primair"
              style={{ padding: "5px 12px", fontSize: "0.75rem" }}
              onClick={voegParagraafToe}
            >
              Opslaan
            </button>
            <button
              className="knop knop-ghost"
              style={{ padding: "5px 12px", fontSize: "0.75rem" }}
              onClick={() => setToonFormulier(false)}
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      <button
        className="knop knop-secundair"
        style={{ fontSize: "0.75rem", padding: "5px 12px" }}
        onClick={() => setToonFormulier(true)}
      >
        + Paragraaf toevoegen
      </button>
    </div>
  );
}
