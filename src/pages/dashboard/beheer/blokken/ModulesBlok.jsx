import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../../lib/supabase";

function DrieStippenMenu({ onBewerken, onVerwijderen }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleKlikBuiten(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleKlikBuiten);
    return () => document.removeEventListener("mousedown", handleKlikBuiten);
  }, []);

  return (
    <div
      ref={ref}
      style={{ position: "relative" }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "6px",
          borderRadius: "50%",
          color: "var(--grijs-900)",
          display: "flex",
          alignItems: "center",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--grijs-200)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 256 256"
        >
          <path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM128,72a12,12,0,1,0-12-12A12,12,0,0,0,128,72Zm0,112a12,12,0,1,0,12,12A12,12,0,0,0,128,184Z" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            background: "white",
            border: "1px solid var(--grijs-200)",
            borderRadius: "8px",
            boxShadow: "var(--schaduw)",
            zIndex: 100,
            minWidth: "140px",
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => {
              onBewerken();
              setOpen(false);
            }}
            style={{
              width: "100%",
              padding: "10px 16px",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "0.85rem",
              fontFamily: "Inter, sans-serif",
              color: "var(--grijs-900)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--grijs-50)")
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
              <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z" />
            </svg>
            Bewerken
          </button>
          <button
            onClick={() => {
              onVerwijderen();
              setOpen(false);
            }}
            style={{
              width: "100%",
              padding: "10px 16px",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "0.85rem",
              fontFamily: "Inter, sans-serif",
              color: "var(--rood)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
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
            Verwijderen
          </button>
        </div>
      )}
    </div>
  );
}

export default function ModulesBlok() {
  const [modules, setModules] = useState([]);
  const [laden, setLaden] = useState(true);
  const [nieuwModuleNaam, setNieuwModuleNaam] = useState("");
  const [nieuwModuleBeschrijving, setNieuwModuleBeschrijving] = useState("");
  const [toonNieuwModuleFormulier, setToonNieuwModuleFormulier] =
    useState(false);
  const [opengeklapt, setOpengeklapt] = useState({});
  const [bewerkModule, setBewerkModule] = useState(null);
  const [bewerkNaam, setBewerkNaam] = useState("");
  const [bewerkBeschrijving, setBewerkBeschrijving] = useState("");

  useEffect(() => {
    haalModulesOp();
  }, []);
  async function slaModuleOp() {
    if (!bewerkNaam.trim()) return;
    await supabase
      .from("modules")
      .update({ naam: bewerkNaam, beschrijving: bewerkBeschrijving })
      .eq("id", bewerkModule);
    setBewerkModule(null);
    haalModulesOp();
  }

  async function haalModulesOp() {
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .order("volgorde");

    if (!error && data) setModules(data);
    setLaden(false);
  }

  async function voegModuleToe() {
    if (!nieuwModuleNaam.trim()) return;

    const { error } = await supabase.from("modules").insert({
      naam: nieuwModuleNaam,
      beschrijving: nieuwModuleBeschrijving,
      volgorde: modules.length,
    });

    if (!error) {
      setNieuwModuleNaam("");
      setNieuwModuleBeschrijving("");
      setToonNieuwModuleFormulier(false);
      haalModulesOp();
    }
  }

  async function verwijderModule(id) {
    if (!window.confirm("Weet je zeker dat je deze module wilt verwijderen?"))
      return;
    await supabase.from("modules").delete().eq("id", id);
    haalModulesOp();
  }

  function toggleOpengeklapt(id) {
    setOpengeklapt((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (laden) return <p>Modules laden...</p>;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--grijs-900)",
            }}
          >
            Modules
          </p>
          <p
            style={{
              fontSize: "0.83rem",
              color: "var(--grijs-700)",
              marginTop: "2px",
            }}
          >
            {modules.length} modules
          </p>
        </div>
        <button
          className="knop knop-primair"
          onClick={() => setToonNieuwModuleFormulier(!toonNieuwModuleFormulier)}
        >
          + Nieuwe module
        </button>
      </div>

      {/* Nieuw module formulier */}
      {toonNieuwModuleFormulier && (
        <div className="kaart kaart-accent" style={{ marginBottom: "16px" }}>
          <p style={{ fontWeight: 600, marginBottom: "12px" }}>Nieuwe module</p>
          <input
            type="text"
            placeholder="Naam van de module"
            value={nieuwModuleNaam}
            onChange={(e) => setNieuwModuleNaam(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid var(--grijs-200)",
              marginBottom: "10px",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.85rem",
            }}
          />
          <input
            type="text"
            placeholder="Beschrijving (optioneel)"
            value={nieuwModuleBeschrijving}
            onChange={(e) => setNieuwModuleBeschrijving(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid var(--grijs-200)",
              marginBottom: "16px",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.85rem",
            }}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="knop knop-primair" onClick={voegModuleToe}>
              Opslaan
            </button>
            <button
              className="knop knop-ghost"
              onClick={() => setToonNieuwModuleFormulier(false)}
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Modules lijst */}
      {modules.length === 0 ? (
        <div className="kaart">
          <p style={{ color: "var(--grijs-500)", fontSize: "0.85rem" }}>
            Nog geen modules aangemaakt.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {modules.map((module) => (
            <div key={module.id} className="kaart" style={{ padding: "0" }}>
              {bewerkModule === module.id ? (
                <div
                  style={{ padding: "16px 20px" }}
                  className="uitklap-animatie"
                >
                  <p style={{ fontWeight: 600, marginBottom: "12px" }}>
                    Module bewerken
                  </p>
                  <input
                    type="text"
                    value={bewerkNaam}
                    onChange={(e) => setBewerkNaam(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--grijs-200)",
                      marginBottom: "10px",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.85rem",
                    }}
                  />
                  <input
                    type="text"
                    value={bewerkBeschrijving}
                    onChange={(e) => setBewerkBeschrijving(e.target.value)}
                    placeholder="Beschrijving (optioneel)"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--grijs-200)",
                      marginBottom: "16px",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.85rem",
                    }}
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="knop knop-primair" onClick={slaModuleOp}>
                      Opslaan
                    </button>
                    <button
                      className="knop knop-ghost"
                      onClick={() => setBewerkModule(null)}
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
                    padding: "14px 20px",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleOpengeklapt(module.id)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{ fontSize: "0.75rem", color: "var(--grijs-400)" }}
                    >
                      {opengeklapt[module.id] ? "▼" : "▶"}
                    </span>
                    <div>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: "0.92rem",
                          textAlign: "left",
                        }}
                      >
                        {module.naam}
                      </p>
                      {module.beschrijving && (
                        <p
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--grijs-500)",
                            marginTop: "2px",
                            textAlign: "left",
                          }}
                        >
                          {module.beschrijving}
                        </p>
                      )}
                    </div>
                  </div>
                  <DrieStippenMenu
                    onBewerken={() => {
                      setBewerkModule(module.id);
                      setBewerkNaam(module.naam);
                      setBewerkBeschrijving(module.beschrijving || "");
                    }}
                    onVerwijderen={() => verwijderModule(module.id)}
                  />
                </div>
              )}

              {!bewerkModule && opengeklapt[module.id] && (
                <div
                  style={{
                    borderTop: "1px solid var(--grijs-200)",
                    padding: "16px 20px",
                  }}
                >
                  <p style={{ fontSize: "0.82rem", color: "var(--grijs-500)" }}>
                    Hoofdstukken komen hier
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
