import { useState } from "react";

const TYPES = {
  module: { kleur: "#1565C0", label: "Module" },
  training: { kleur: "#E65100", label: "Training" },
  evaluatie: { kleur: "#546E7A", label: "Evaluatie" },
  milestone: { kleur: "#DAA520", label: "Milestone" },
};

const NEP_HOOFDSTUKKEN = {
  module: [
    { naam: "Inleiding", pct: 100 },
    { naam: "Theorie & Grondbeginselen", pct: 80 },
    { naam: "Praktijkoefeningen", pct: 60 },
    { naam: "Toetsing", pct: 0 },
  ],
  training: [
    { naam: "Voorbereiding", pct: 100 },
    { naam: "Uitvoering", pct: 50 },
  ],
  evaluatie: [
    { naam: "Zelfreflectie", pct: 0 },
    { naam: "Gesprek leidinggevende", pct: 0 },
  ],
  milestone: [],
};

const SJABLONEN = {
  payroll: {
    kleur: "#2E7D32",
    items: [
      {
        type: "module",
        naam: "BKL Basis",
        cat: "BKL",
        score: 78,
        voortgang: 100,
      },
      {
        type: "training",
        naam: "Onboarding dag",
        cat: "Training",
        score: null,
        voortgang: 100,
      },
      {
        type: "module",
        naam: "BKL Gevorderd",
        cat: "BKL",
        score: 62,
        voortgang: 75,
      },
      {
        type: "evaluatie",
        naam: "Tussentijdse evaluatie",
        cat: "Evaluatie",
        score: null,
        voortgang: 0,
      },
      {
        type: "module",
        naam: "Arbeidsrecht",
        cat: "BKL",
        score: null,
        voortgang: 0,
      },
      {
        type: "module",
        naam: "NMBRS Basis",
        cat: "NMBRS",
        score: null,
        voortgang: 0,
      },
      {
        type: "evaluatie",
        naam: "Eindevaluatie",
        cat: "Evaluatie",
        score: null,
        voortgang: 0,
      },
      {
        type: "module",
        naam: "NMBRS Verloning",
        cat: "NMBRS",
        score: null,
        voortgang: 0,
      },
      {
        type: "milestone",
        naam: "Proeftijd voorbij",
        cat: "Milestone",
        score: null,
        voortgang: 0,
      },
    ],
  },
  finance: {
    kleur: "#C62828",
    items: [
      {
        type: "training",
        naam: "Onboarding dag",
        cat: "Training",
        score: null,
        voortgang: 100,
      },
      {
        type: "module",
        naam: "Finance Basis",
        cat: "Finance",
        score: 55,
        voortgang: 100,
      },
      {
        type: "module",
        naam: "BKL Basis",
        cat: "BKL",
        score: null,
        voortgang: 40,
      },
      {
        type: "evaluatie",
        naam: "Tussentijdse eval",
        cat: "Evaluatie",
        score: null,
        voortgang: 0,
      },
      {
        type: "module",
        naam: "NMBRS Basis",
        cat: "NMBRS",
        score: null,
        voortgang: 0,
      },
      {
        type: "milestone",
        naam: "Cert. behaald",
        cat: "Milestone",
        score: null,
        voortgang: 0,
      },
    ],
  },
  hr: {
    kleur: "#6A1B9A",
    items: [
      {
        type: "module",
        naam: "HR Beleid",
        cat: "HR",
        score: 91,
        voortgang: 100,
      },
      {
        type: "training",
        naam: "Klantgesprek",
        cat: "Training",
        score: null,
        voortgang: 100,
      },
      {
        type: "training",
        naam: "Excel verdieping",
        cat: "Training",
        score: null,
        voortgang: 60,
      },
      {
        type: "evaluatie",
        naam: "Tussentijdse eval",
        cat: "Evaluatie",
        score: null,
        voortgang: 0,
      },
      {
        type: "module",
        naam: "BKL Basis",
        cat: "BKL",
        score: null,
        voortgang: 0,
      },
      {
        type: "module",
        naam: "CAO Algemeen",
        cat: "BKL",
        score: null,
        voortgang: 0,
      },
      {
        type: "evaluatie",
        naam: "Eindevaluatie",
        cat: "Evaluatie",
        score: null,
        voortgang: 0,
      },
      {
        type: "milestone",
        naam: "Proeftijd voorbij",
        cat: "Milestone",
        score: null,
        voortgang: 0,
      },
    ],
  },
};

function getIndent(index) {
  const stapGrootte = 3;
  const cyclus = Math.floor(index / stapGrootte);
  const pos = index % stapGrootte;
  const gaatRechts = cyclus % 2 === 0;
  const niveau = gaatRechts ? pos : stapGrootte - 1 - pos;
  return niveau * 60;
}

function Hexagoon({ el, isActief, padKleur, onClick }) {
  const typeInfo = TYPES[el.type] || TYPES.module;
  const isAfgerond = el.voortgang >= 100;
  const hexKleur = isAfgerond
    ? typeInfo.kleur
    : el.voortgang > 0
      ? typeInfo.kleur + "CC"
      : "#BDBDBD";

  return (
    <div onClick={onClick} style={{ cursor: "pointer" }}>
      <div
        style={{
          width: "84px",
          height: "96px",
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          background: hexKleur,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "filter 0.15s, transform 0.15s",
          transform: isActief ? "scale(1.08)" : "scale(1)",
          filter: "none",
          outline: isActief ? `3px solid ${padKleur}` : "none",
          outlineOffset: "4px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = "brightness(0.88)";
          e.currentTarget.style.transform = isActief
            ? "scale(1.08)"
            : "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "none";
          e.currentTarget.style.transform = isActief
            ? "scale(1.08)"
            : "scale(1)";
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            padding: "10px 6px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "0.6rem",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.25,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {el.naam}
          </p>
          <p
            style={{
              fontSize: "0.52rem",
              color: "rgba(255,255,255,0.75)",
              fontWeight: 500,
            }}
          >
            {el.cat}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ el, onSluit }) {
  if (!el) {
    return (
      <div
        style={{
          background: "#FAFAFA",
          borderRadius: "12px",
          border: "1.5px dashed #E0E0E0",
          padding: "40px 24px",
          textAlign: "center",
          color: "#BDBDBD",
          fontSize: "0.85rem",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 256 256"
          fill="#BDBDBD"
          style={{
            marginBottom: "10px",
            display: "block",
            margin: "0 auto 10px",
          }}
        >
          <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a16,16,0,1,1,16,16A16,16,0,0,1,112,84Z" />
        </svg>
        <p>Klik op een element om details te zien</p>
      </div>
    );
  }

  const typeInfo = TYPES[el.type] || TYPES.module;
  const hoofdstukken = NEP_HOOFDSTUKKEN[el.type] || [];
  const isAfgerond = el.voortgang >= 100;
  const statusKleur = isAfgerond
    ? "#2E7D32"
    : el.voortgang > 0
      ? "#E65100"
      : "#9E9E9E";
  const statusLabel = isAfgerond
    ? "Afgerond"
    : el.voortgang > 0
      ? "Bezig"
      : "Nog niet gestart";

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        border: "1px solid #EEEEEE",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "24px 28px 20px",
          borderBottom: "1px solid #F5F5F5",
          borderTop: `4px solid ${typeInfo.kleur}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: typeInfo.kleur,
            }}
          >
            {typeInfo.label}
          </span>
          <button
            onClick={onSluit}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#BDBDBD",
              fontSize: "1.2rem",
              padding: 0,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <p
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#212121",
            marginBottom: "8px",
          }}
        >
          {el.naam}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.72rem", color: "#9E9E9E" }}>
            {el.cat}
          </span>
          <span style={{ color: "#E0E0E0" }}>·</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "0.72rem",
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: "50px",
              background: statusKleur + "18",
              color: statusKleur,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: statusKleur,
                display: "inline-block",
              }}
            />
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1px",
          background: "#F5F5F5",
        }}
      >
        {[
          {
            label: "Voortgang",
            waarde: `${el.voortgang}%`,
            kleur: typeInfo.kleur,
          },
          {
            label: "Gem. score",
            waarde: el.score !== null ? `${el.score}%` : "—",
            kleur:
              el.score !== null
                ? el.score >= 70
                  ? "#2E7D32"
                  : "#C62828"
                : "#9E9E9E",
          },
          {
            label: "Hoofdstukken",
            waarde: hoofdstukken.length || "—",
            kleur: "#424242",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "white",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#9E9E9E",
                marginBottom: "8px",
              }}
            >
              {s.label}
            </p>
            <p style={{ fontSize: "1.4rem", fontWeight: 700, color: s.kleur }}>
              {s.waarde}
            </p>
          </div>
        ))}
      </div>

      {/* Hoofdstukken */}
      <div style={{ padding: "24px 28px" }}>
        {hoofdstukken.length > 0 ? (
          <>
            <p
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#9E9E9E",
                marginBottom: "12px",
              }}
            >
              Voortgang per hoofdstuk
            </p>
            {hoofdstukken.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 0",
                  borderBottom:
                    i < hoofdstukken.length - 1 ? "1px solid #F5F5F5" : "none",
                }}
              >
                <span
                  style={{
                    fontSize: "0.82rem",
                    color: "#424242",
                    flex: 1,
                    fontWeight: 500,
                  }}
                >
                  {h.naam}
                </span>
                <div
                  style={{
                    width: "80px",
                    background: "#EEEEEE",
                    borderRadius: "50px",
                    height: "5px",
                  }}
                >
                  <div
                    style={{
                      width: `${h.pct}%`,
                      height: "100%",
                      borderRadius: "50px",
                      background:
                        h.pct === 100
                          ? typeInfo.kleur
                          : h.pct > 0
                            ? typeInfo.kleur + "99"
                            : "#E0E0E0",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    width: "36px",
                    textAlign: "right",
                    color:
                      h.pct === 100
                        ? typeInfo.kleur
                        : h.pct > 0
                          ? "#9E9E9E"
                          : "#BDBDBD",
                  }}
                >
                  {h.pct > 0 ? `${h.pct}%` : "—"}
                </span>
              </div>
            ))}
          </>
        ) : (
          <p
            style={{
              fontSize: "0.82rem",
              color: "#9E9E9E",
              fontStyle: "italic",
            }}
          >
            Geen hoofdstukken voor dit type element.
          </p>
        )}
      </div>
    </div>
  );
}

export default function LPTestBlok({ onTerug }) {
  const [elementen, setElementen] = useState([]);
  const [padKleur, setPadKleur] = useState("#2E7D32");
  const [geselecteerd, setGeselecteerd] = useState(null);

  function laadSjabloon(val) {
    if (!val) {
      setElementen([]);
      setPadKleur("#2E7D32");
      setGeselecteerd(null);
      return;
    }
    const s = SJABLONEN[val];
    setPadKleur(s.kleur);
    setElementen(s.items.map((e, i) => ({ ...e, id: i })));
    setGeselecteerd(null);
  }

  function selecteer(id) {
    setGeselecteerd((prev) => (prev === id ? null : id));
  }

  const geselecteerdEl = elementen.find((e) => e.id === geselecteerd) || null;

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <p
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--grijs-900)",
          }}
        >
          Learning Path
          <span
            style={{
              marginLeft: "10px",
              fontSize: "0.72rem",
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: "50px",
              background: "#FFF3E0",
              color: "#E65100",
            }}
          >
            TEST MODUS
          </span>
        </p>
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--grijs-500)",
            marginTop: "2px",
          }}
        >
          Stel je learning path in met modules, trainingen en evaluaties
        </p>
      </div>

      {onTerug && (
        <button
          onClick={onTerug}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--grijs-500)",
            padding: 0,
            marginBottom: "16px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
          </svg>
          Terug naar Learning Path
        </button>
      )}

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <select
          onChange={(e) => laadSjabloon(e.target.value)}
          style={{
            fontSize: "0.82rem",
            padding: "6px 12px",
            borderRadius: "50px",
            border: "1px solid #EEEEEE",
            background: "white",
            color: "#212121",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <option value="">Kies een sjabloon...</option>
          <option value="payroll">Payroll</option>
          <option value="finance">Finance</option>
          <option value="hr">HR</option>
        </select>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "4px 12px",
            borderRadius: "50px",
            background: "#E8F5E9",
            color: "#2E7D32",
          }}
        >
          ✓ Goedgekeurd
        </span>
      </div>

      {/* Layout: tijdlijn links, detail rechts */}
      <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
        {/* Tijdlijn */}
        <div style={{ flexShrink: 0, width: "260px" }}>
          {elementen.length === 0 ? (
            <p style={{ fontSize: "0.82rem", color: "#BDBDBD" }}>
              Kies een sjabloon om te beginnen.
            </p>
          ) : (
            elementen.map((el, i) => {
              const indent = getIndent(i);
              const prevIndent = i > 0 ? getIndent(i - 1) : null;

              return (
                <div key={el.id}>
                  {i > 0 && (
                    <div
                      style={{
                        marginLeft: `${prevIndent + 40}px`,
                        width: "3px",
                        height: "18px",
                        background: padKleur + "30",
                        borderRadius: "2px",
                      }}
                    />
                  )}
                  <div style={{ marginLeft: `${indent}px` }}>
                    <Hexagoon
                      el={el}
                      isActief={geselecteerd === el.id}
                      padKleur={padKleur}
                      onClick={() => selecteer(el.id)}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, minWidth: 0, position: "sticky", top: "24px" }}>
          <DetailPanel
            el={geselecteerdEl}
            padKleur={padKleur}
            onSluit={() => setGeselecteerd(null)}
          />
        </div>
      </div>
    </div>
  );
}
