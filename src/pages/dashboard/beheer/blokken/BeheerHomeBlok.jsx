import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../lib/supabase";

function NotitieRij({
  notitie,
  isPrio,
  onToggleAfgevinkt,
  onTogglePrio,
  onBewerken,
  onVerwijder,
}) {
  const [hover, setHover] = useState(false);
  const [bewerken, setBewerken] = useState(false);
  const [tekst, setTekst] = useState(notitie.titel);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bewerken && inputRef.current) inputRef.current.focus();
  }, [bewerken]);

  async function opslaan() {
    if (tekst.trim()) await onBewerken(notitie.id, tekst.trim());
    setBewerken(false);
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 12px",
        borderBottom: "1px solid var(--grijs-200)",
        background: "white",
        borderLeft: isPrio ? "4px solid #F9A825" : "4px solid transparent",
        transition: "background 0.15s",
        cursor: "pointer",
      }}
    >
      {/* Checkbox */}
      <div
        onClick={() => onToggleAfgevinkt(notitie.id, notitie.afgevinkt)}
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "4px",
          flexShrink: 0,
          border: `2px solid ${notitie.afgevinkt ? "var(--groen)" : "var(--grijs-300)"}`,
          background: notitie.afgevinkt ? "var(--groen)" : "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
          cursor: "pointer",
        }}
      >
        {notitie.afgevinkt && (
          <svg width="10" height="10" viewBox="0 0 256 256" fill="white">
            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
          </svg>
        )}
      </div>

      {/* Tekst */}
      <div
        style={{ flex: 1, minWidth: 0, cursor: "text" }}
        onClick={() => !bewerken && setBewerken(true)}
      >
        {bewerken ? (
          <textarea
            ref={inputRef}
            value={tekst}
            onChange={(e) => setTekst(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                opslaan();
              }
              if (e.key === "Escape") {
                setTekst(notitie.titel);
                setBewerken(false);
              }
            }}
            onBlur={opslaan}
            onClick={(e) => e.stopPropagation()}
            rows={tekst.split("\n").length || 1}
            style={{
              width: "100%",
              fontSize: "0.88rem",
              border: "none",
              outline: "none",
              background: "transparent",
              color: "var(--grijs-900)",
              resize: "none",
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.5,
            }}
          />
        ) : (
          <p
            style={{
              fontSize: "0.88rem",
              color: "var(--grijs-900)",
              textDecoration: notitie.afgevinkt ? "line-through" : "none",
              fontWeight: isPrio ? 700 : 400,
              textAlign: "left",
              whiteSpace: "pre-wrap",
            }}
          >
            {notitie.titel}
          </p>
        )}
      </div>

      {/* Acties bij hover */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          opacity: hover ? 1 : 0,
          transition: "opacity 0.15s",
          flexShrink: 0,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePrio(notitie.id, isPrio);
          }}
          style={{
            background: isPrio ? "#FFF3E0" : "var(--grijs-100)",
            border: `1px solid ${isPrio ? "#F9A825" : "var(--grijs-300)"}`,
            borderRadius: "50px",
            cursor: "pointer",
            color: isPrio ? "#F9A825" : "var(--grijs-400)",
            padding: "2px 8px",
            fontSize: "0.68rem",
            fontWeight: 700,
          }}
        >
          De Prioriteit
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onVerwijder(notitie.id);
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--grijs-400)",
            padding: "2px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function LegereRij({ onToevoegen }) {
  const [actief, setActief] = useState(false);
  const [tekst, setTekst] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (actief && inputRef.current) inputRef.current.focus();
  }, [actief]);

  async function opslaan() {
    if (tekst.trim()) {
      await onToevoegen(tekst.trim());
      setTekst("");
    }
    setActief(false);
  }

  if (actief) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 12px",
          borderBottom: "1px solid var(--grijs-200)",
          background: "white",
        }}
      >
        <div
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "4px",
            border: "2px solid var(--grijs-300)",
            flexShrink: 0,
          }}
        />
        <textarea
          ref={inputRef}
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              opslaan();
            }
            if (e.key === "Escape") {
              setTekst("");
              setActief(false);
            }
          }}
          onBlur={opslaan}
          placeholder="Notitie toevoegen..."
          rows={tekst.split("\n").length || 1}
          style={{
            flex: 1,
            fontSize: "0.88rem",
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--grijs-900)",
            resize: "none",
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.5,
          }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => setActief(true)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 12px",
        borderBottom: "1px solid var(--grijs-200)",
        background: "white",
        cursor: "text",
      }}
    >
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "4px",
          border: "2px solid var(--grijs-200)",
          flexShrink: 0,
        }}
      />
      <p style={{ fontSize: "0.88rem", color: "var(--grijs-300)" }}>—</p>
    </div>
  );
}

function GeschiedenisModal({ onSluit, onTerugzetten }) {
  const [verwijderd, setVerwijderd] = useState([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    async function laad() {
      const { data } = await supabase
        .from("notities_beheer")
        .select("*")
        .eq("verwijderd", true)
        .order("verwijderd_op", { ascending: false });
      setVerwijderd(data || []);
      setLaden(false);
    }
    laad();
  }, []);

  return (
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
          padding: "24px",
          width: "480px",
          maxHeight: "70vh",
          overflowY: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <p style={{ fontWeight: 700, fontSize: "1rem" }}>Geschiedenis</p>
          <button
            onClick={onSluit}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--grijs-500)",
              fontSize: "1.2rem",
            }}
          >
            ✕
          </button>
        </div>
        {laden ? (
          <p style={{ color: "var(--grijs-500)", fontSize: "0.85rem" }}>
            Laden...
          </p>
        ) : verwijderd.length === 0 ? (
          <p style={{ color: "var(--grijs-500)", fontSize: "0.85rem" }}>
            Geen verwijderde notities.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {verwijderd.map((n) => (
              <div
                key={n.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  background: "var(--grijs-100)",
                  borderRadius: "8px",
                }}
              >
                <p
                  style={{
                    flex: 1,
                    fontSize: "0.88rem",
                    color: "var(--grijs-700)",
                    textDecoration: "line-through",
                  }}
                >
                  {n.titel}
                </p>
                <button
                  onClick={() =>
                    onTerugzetten(n.id, () =>
                      setVerwijderd((prev) =>
                        prev.filter((x) => x.id !== n.id),
                      ),
                    )
                  }
                  className="knop knop-ghost"
                  style={{
                    fontSize: "0.75rem",
                    padding: "4px 10px",
                    flexShrink: 0,
                  }}
                >
                  Terugzetten
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BeheerHomeBlok({ email }) {
  const navigate = useNavigate();
  const [notities, setNotities] = useState([]);
  const [prioId, setPrioId] = useState(null);
  const [laden, setLaden] = useState(true);
  const [rol, setRol] = useState(null);
  const [geschiedenisOpen, setGeschiedenisOpen] = useState(false);

  useEffect(() => {
    async function laadData() {
      setLaden(true);

      const [notitiesRes] = await Promise.all([
        supabase
          .from("notities_beheer")
          .select("*")
          .eq("verwijderd", false)
          .order("aangemaakt_op", { ascending: true }),
        supabase
          .from("koppeling")
          .select("gedetacheerd")
          .eq("gedetacheerd", true),
      ]);

      const data = notitiesRes.data || [];
      setNotities(data);
      const prio = data.find((n) => n.is_prio);
      if (prio) setPrioId(prio.id);

      if (email) {
        const { haalRolOp } = await import("../../../../lib/auth");
        const gevondenRol = await haalRolOp(email);
        setRol(gevondenRol);
      }

      setLaden(false);
    }
    laadData();
  }, [email]);

  async function herlaad() {
    const { data } = await supabase
      .from("notities_beheer")
      .select("*")
      .eq("verwijderd", false)
      .order("aangemaakt_op", { ascending: true });
    setNotities(data || []);
    const prio = (data || []).find((n) => n.is_prio);
    setPrioId(prio?.id || null);
  }

  async function notitieToevoegen(titel) {
    await supabase
      .from("notities_beheer")
      .insert({ titel, is_prio: false, verwijderd: false });
    herlaad();
  }

  async function toggleAfgevinkt(id, wasAfgevinkt) {
    await supabase
      .from("notities_beheer")
      .update({ afgevinkt: !wasAfgevinkt })
      .eq("id", id);
    herlaad();
  }

  async function togglePrio(id, isPrio) {
    // Verwijder prio van alle andere
    await supabase
      .from("notities_beheer")
      .update({ is_prio: false })
      .eq("is_prio", true);
    if (!isPrio) {
      await supabase
        .from("notities_beheer")
        .update({ is_prio: true })
        .eq("id", id);
      setPrioId(id);
    } else {
      setPrioId(null);
    }
    herlaad();
  }

  async function notitieBewerken(id, titel) {
    // Optimistic update: direct lokaal bijwerken
    setNotities((prev) => prev.map((n) => (n.id === id ? { ...n, titel } : n)));
    await supabase.from("notities_beheer").update({ titel }).eq("id", id);
  }

  async function notitieVerwijderen(id) {
    await supabase
      .from("notities_beheer")
      .update({ verwijderd: true, verwijderd_op: new Date().toISOString() })
      .eq("id", id);
    herlaad();
  }

  async function notitieTermgzetten(id, onKlaar) {
    await supabase
      .from("notities_beheer")
      .update({ verwijderd: false, verwijderd_op: null, afgevinkt: false })
      .eq("id", id);
    onKlaar();
    herlaad();
  }

  // Verwijder afgevinkte notities bij laden (van vorige sessie)
  useEffect(() => {
    async function ruimOp() {
      await supabase
        .from("notities_beheer")
        .update({ verwijderd: true, verwijderd_op: new Date().toISOString() })
        .eq("afgevinkt", true)
        .eq("verwijderd", false);
    }
    ruimOp();
  }, []);

  if (laden)
    return (
      <div
        style={{
          padding: "20px",
          color: "var(--grijs-500)",
          fontSize: "0.85rem",
        }}
      >
        Laden...
      </div>
    );

  const LEGE_REGELS = Math.max(0, 5 - notities.length);

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* Terugknop leidinggevende */}
      {rol === "leidinggevende" && (
        <div
          style={{
            background: "var(--groen-licht)",
            border: "1px solid var(--groen)",
            borderRadius: "10px",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--groen-donker)",
              fontWeight: 500,
            }}
          >
            Je bekijkt het beheerdashboard als leidinggevende.
          </p>
          <button
            onClick={() => navigate("/dashboard/leidinggevende")}
            className="knop knop-primair"
            style={{ fontSize: "0.82rem", flexShrink: 0 }}
          >
            ← Terug naar mijn dashboard
          </button>
        </div>
      )}

      {/* Notities */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <p
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--grijs-900)",
            }}
          >
            Notities
          </p>
          <button
            onClick={() => setGeschiedenisOpen(true)}
            className="knop knop-ghost"
            style={{
              fontSize: "0.78rem",
              padding: "5px 12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 256 256"
              fill="currentColor"
            >
              <path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm-8-48A95.44,95.44,0,0,0,60.08,60.15C52.81,67.51,46.35,74.59,40,82V64a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H49c7.15-8.42,14.27-16.35,22.39-24.57a80,80,0,1,1,1.66,114.75,8,8,0,1,0-11,11.64A96,96,0,1,0,128,32Z" />
            </svg>
            Geschiedenis
          </button>
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid var(--grijs-200)",
            borderRadius: "10px",
            boxShadow: "var(--schaduw)",
            overflow: "hidden",
          }}
        >
          {notities.map((n) => (
            <NotitieRij
              key={n.id}
              notitie={n}
              isPrio={prioId === n.id}
              onToggleAfgevinkt={toggleAfgevinkt}
              onTogglePrio={togglePrio}
              onBewerken={notitieBewerken}
              onVerwijder={notitieVerwijderen}
            />
          ))}
          {[...Array(LEGE_REGELS)].map((_, i) => (
            <LegereRij key={`leeg-${i}`} onToevoegen={notitieToevoegen} />
          ))}
          <LegereRij onToevoegen={notitieToevoegen} />
        </div>
      </div>

      {/* Supabase link */}
      <a
        href="https://supabase.com/dashboard/project/jgycmakaugasithuszlc"
        target="_blank"
        rel="noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "24px",
          background: "white",
          border: "1px solid #00b37e40",
          borderLeft: "4px solid #00b37e",
          borderRadius: "10px",
          padding: "14px 20px",
          textDecoration: "none",
          boxShadow: "var(--schaduw)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#00b37e">
            <path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.203 12.424l-.001.001a.396.396 0 0 0 .315.635H11.6v8.959a.396.396 0 0 0 .716.233l9.081-12.261a.396.396 0 0 0-.035-.637z" />
          </svg>
          <div>
            <p
              style={{ fontSize: "0.88rem", fontWeight: 700, color: "#00b37e" }}
            >
              Supabase dashboard
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--grijs-500)",
                marginTop: "2px",
              }}
            >
              Dashboard in een nieuw tabblad
            </p>
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 256 256"
          fill="var(--grijs-400)"
        >
          <path d="M224,104a8,8,0,0,1-16,0V59.32l-82.34,82.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
        </svg>
      </a>

      {geschiedenisOpen && (
        <GeschiedenisModal
          onSluit={() => setGeschiedenisOpen(false)}
          onTerugzetten={notitieTermgzetten}
        />
      )}
    </div>
  );
}
