import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../../lib/supabase";

// ── Skill tree definitie (aanpasbaar) ──
const SKILL_TREE = [
  {
    id: "16227332-741f-4950-a57e-60f12f9612a0",
    naam: "Test Modules",
    categorie: "BKL",
    pad: "BKL",
    x: 200,
    y: 300,
    vereist: [],
  },
  {
    id: "9b53d00a-239b-4dcd-ad13-b5f087c8ff24",
    naam: "Test module 2",
    categorie: "BKL",
    pad: "BKL",
    x: 500,
    y: 300,
    vereist: ["16227332-741f-4950-a57e-60f12f9612a0"],
  },
  {
    id: "e57e47e0-7adf-4c3b-8d9a-4bd3f2537452",
    naam: "Handboek NMBRS",
    categorie: "NMBRS",
    pad: "NMBRS",
    x: 500,
    y: 150,
    vereist: [],
  },
];

const PAD_KLEUREN = {
  BKL: { primair: "#2E7D32", licht: "#E8F5E9" },
  NMBRS: { primair: "#1565C0", licht: "#E3F2FD" },
  Algemeen: { primair: "#6A1B9A", licht: "#F3E5F5" },
};

function getModuleStijl(module, voortgangMap, scoreMap, activeModuleIds) {
  const voortgang = voortgangMap[module.id];
  const score = scoreMap[module.id];
  const isActief = activeModuleIds.includes(module.id);
  const isAfgerond = voortgang >= 100;

  if (!isActief) {
    return {
      achtergrond: "white",
      rand: "#BDBDBD",
      randDikte: 2,
      tekstKleur: "#9E9E9E",
      opacity: 0.45,
      label: null,
      labelKleur: "#9E9E9E",
    };
  }

  if (isAfgerond && score !== null) {
    if (score < 50) {
      return {
        achtergrond: "white",
        rand: "#C62828",
        randDikte: 4,
        tekstKleur: "#1A1A1A",
        opacity: 1,
        label: `${score}%`,
        labelKleur: "#C62828",
      };
    } else if (score >= 80) {
      return {
        achtergrond: "white",
        rand: "#DAA520",
        randDikte: 4,
        tekstKleur: "#1A1A1A",
        opacity: 1,
        label: `${score}%`,
        labelKleur: "#DAA520",
      };
    } else if (score >= 65) {
      return {
        achtergrond: "white",
        rand: "#A8A8A8",
        randDikte: 4,
        tekstKleur: "#1A1A1A",
        opacity: 1,
        label: `${score}%`,
        labelKleur: "#A8A8A8",
      };
    } else {
      return {
        achtergrond: "white",
        rand: "#A0522D",
        randDikte: 4,
        tekstKleur: "#1A1A1A",
        opacity: 1,
        label: `${score}%`,
        labelKleur: "#A0522D",
      };
    }
  }

  // Actief maar nog niet afgerond
  return {
    achtergrond: "white",
    rand: "#2E7D32",
    randDikte: 2,
    tekstKleur: "#1A1A1A",
    opacity: 1,
    label: voortgang > 0 ? `${voortgang}%` : "Te doen",
    labelKleur: "#2E7D32",
  };
}

function ModuleNode({ module, stijl, geselecteerd, onClick }) {
  const breedte = 160;
  const hoogte = 80;

  return (
    <g
      onClick={onClick}
      style={{ cursor: "pointer" }}
      transform={`translate(${module.x - breedte / 2}, ${module.y - hoogte / 2})`}
    >
      {/* Glans effect achtergrond */}
      <defs>
        <linearGradient
          id={`glans-${module.id}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </linearGradient>
        <filter id={`schaduw-${module.id}`}>
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Hoofdrechthoek */}
      <rect
        width={breedte}
        height={hoogte}
        rx="10"
        ry="10"
        fill={
          stijl.achtergrond.includes("gradient")
            ? "url(#glans-" + module.id + ")"
            : stijl.achtergrond
        }
        stroke={stijl.rand}
        strokeWidth={geselecteerd ? stijl.randDikte + 1 : stijl.randDikte}
        opacity={stijl.opacity}
        filter={`url(#schaduw-${module.id})`}
        style={{
          transition: "all 0.2s",
        }}
      />

      {/* Glans overlay voor metalen */}
      {stijl.achtergrond.includes("gradient") && (
        <rect
          width={breedte}
          height={hoogte}
          rx="10"
          ry="10"
          fill={stijl.achtergrond}
          stroke={stijl.rand}
          strokeWidth={geselecteerd ? 3 : 2}
          opacity={stijl.opacity}
        />
      )}

      {/* Naam */}
      <text
        x={breedte / 2}
        y={hoogte / 2 - 8}
        textAnchor="middle"
        fill={stijl.tekstKleur}
        fontSize="13"
        fontWeight="600"
        fontFamily="Inter, sans-serif"
        opacity={stijl.opacity}
      >
        {module.naam.length > 18
          ? module.naam.substring(0, 16) + "…"
          : module.naam}
      </text>

      {/* Categorie badge */}
      <rect
        x={breedte / 2 - 20}
        y={hoogte / 2 + 4}
        width={40}
        height={16}
        rx="8"
        fill={stijl.label ? stijl.labelKleur + "20" : "#F5F5F5"}
        opacity={stijl.opacity}
      />
      <text
        x={breedte / 2}
        y={hoogte / 2 + 15}
        textAnchor="middle"
        fill={stijl.labelKleur || "#9E9E9E"}
        fontSize="10"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
        opacity={stijl.opacity}
      >
        {stijl.label || module.categorie}
      </text>

      {/* Geselecteerd highlight */}
      {geselecteerd && (
        <rect
          width={breedte}
          height={hoogte}
          rx="10"
          ry="10"
          fill="none"
          stroke="#2E7D32"
          strokeWidth="3"
          strokeDasharray="4,2"
          opacity="0.5"
        />
      )}
    </g>
  );
}

function DetailPanel({ module, voortgang, score, actief, onSluit }) {
  const padKleur = PAD_KLEUREN[module.categorie] || PAD_KLEUREN.Algemeen;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "white",
        borderRadius: "12px",
        padding: "20px 24px",
        width: "360px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        border: `2px solid ${padKleur.primair}`,
        zIndex: 10,
      }}
      className="uitklap-animatie"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <div>
          <span
            style={{
              background: padKleur.licht,
              color: padKleur.primair,
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "50px",
              display: "inline-block",
              marginBottom: "6px",
            }}
          >
            {module.categorie}
          </span>
          <p style={{ fontSize: "1rem", fontWeight: 700, color: "#1A1A1A" }}>
            {module.naam}
          </p>
        </div>
        <button
          onClick={onSluit}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9E9E9E",
            fontSize: "1.2rem",
          }}
        >
          ✕
        </button>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}
      >
        <div
          style={{
            background: "#F5F5F5",
            borderRadius: "8px",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "#9E9E9E",
              marginBottom: "4px",
            }}
          >
            Voortgang
          </p>
          <p
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: actief ? padKleur.primair : "#9E9E9E",
            }}
          >
            {actief && voortgang !== undefined ? `${voortgang}%` : "—"}
          </p>
        </div>
        <div
          style={{
            background: "#F5F5F5",
            borderRadius: "8px",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "#9E9E9E",
              marginBottom: "4px",
            }}
          >
            Gem. score
          </p>
          <p
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color:
                actief && score !== null
                  ? score >= 70
                    ? "#2E7D32"
                    : "#C62828"
                  : "#9E9E9E",
            }}
          >
            {actief && score !== null && score !== undefined
              ? `${score}%`
              : "—"}
          </p>
        </div>
      </div>

      {!actief && (
        <p
          style={{
            fontSize: "0.82rem",
            color: "#9E9E9E",
            marginTop: "12px",
            fontStyle: "italic",
          }}
        >
          Deze module staat niet in jouw learning path.
        </p>
      )}
    </div>
  );
}

export default function LearningPathBlok({ email }) {
  const [voortgangMap, setVoortgangMap] = useState({});
  const [scoreMap, setScoreMap] = useState({});
  const [activeModuleIds, setActiveModuleIds] = useState([]);
  const [geselecteerd, setGeselecteerd] = useState(null);
  const [laden, setLaden] = useState(true);
  const containerRef = useRef(null);

  async function laadData() {
    setLaden(true);

    // Laad learning path
    const { data: lp } = await supabase
      .from("learning_path")
      .select("module_id")
      .eq("trainee_email", email)
      .eq("actief", true);
    setActiveModuleIds(lp ? lp.map((l) => l.module_id) : []);

    // Laad voortgang + score in één query
    const moduleIds = SKILL_TREE.map((m) => m.id);
    const { data: voortgangData } = await supabase
      .from("module_voortgang")
      .select("module_id, voortgang, gem_score")
      .eq("trainee_email", email)
      .in("module_id", moduleIds);

    const vMap = {};
    const sMap = {};
    if (voortgangData) {
      voortgangData.forEach((v) => {
        vMap[v.module_id] = v.voortgang;
        sMap[v.module_id] = v.gem_score;
      });
    }
    setVoortgangMap(vMap);
    setScoreMap(sMap);
    setLaden(false);
  }

  useEffect(() => {
    async function laadEnStart() {
      if (email) await laadData();
    }
    laadEnStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // Bereken canvas grootte
  const maxX = Math.max(...SKILL_TREE.map((m) => m.x)) + 150;
  const maxY = Math.max(...SKILL_TREE.map((m) => m.y)) + 120;
  const canvasBreed = Math.max(maxX, 800);
  const canvasHoog = Math.max(maxY, 500);

  const geselecteerdeModule = SKILL_TREE.find((m) => m.id === geselecteerd);

  if (laden)
    return (
      <div
        style={{
          color: "var(--grijs-500)",
          fontSize: "0.85rem",
          padding: "20px",
        }}
      >
        Laden...
      </div>
    );

  return (
    <div style={{ position: "relative" }}>
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <p
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--grijs-900)",
          }}
        >
          Learning Path
        </p>
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--grijs-500)",
            marginTop: "2px",
          }}
        >
          Klik op een module voor meer informatie
        </p>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          overflowX: "auto",
          background: "white",
          borderRadius: "var(--radius)",
          border: "1px solid var(--grijs-200)",
          boxShadow: "var(--schaduw)",
          position: "relative",
        }}
      >
        <svg
          width={canvasBreed}
          height={canvasHoog}
          style={{ display: "block" }}
        >
          {/* Verbindingslijnen */}
          {SKILL_TREE.map((module) =>
            module.vereist.map((vereistId) => {
              const van = SKILL_TREE.find((m) => m.id === vereistId);
              if (!van) return null;
              return (
                <line
                  key={`${vereistId}-${module.id}`}
                  x1={van.x + 80}
                  y1={van.y}
                  x2={module.x - 80}
                  y2={module.y}
                  stroke="#DADCE0"
                  strokeWidth="2"
                  strokeDasharray="8,4"
                />
              );
            }),
          )}

          {/* Pad labels */}
          <text
            x="20"
            y="160"
            fill="#1565C0"
            fontSize="11"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
            opacity="0.6"
            style={{ textTransform: "uppercase" }}
          >
            NMBRS
          </text>
          <text
            x="20"
            y="310"
            fill="#2E7D32"
            fontSize="11"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
            opacity="0.6"
          >
            BKL
          </text>

          {/* Module nodes */}
          {SKILL_TREE.map((module) => {
            const stijl = getModuleStijl(
              module,
              voortgangMap,
              scoreMap,
              activeModuleIds,
            );
            return (
              <ModuleNode
                key={module.id}
                module={module}
                stijl={stijl}
                geselecteerd={geselecteerd === module.id}
                onClick={() =>
                  setGeselecteerd(geselecteerd === module.id ? null : module.id)
                }
              />
            );
          })}
        </svg>

        {/* Detail panel */}
        {geselecteerdeModule && (
          <DetailPanel
            module={geselecteerdeModule}
            voortgang={voortgangMap[geselecteerdeModule.id]}
            score={scoreMap[geselecteerdeModule.id]}
            actief={activeModuleIds.includes(geselecteerdeModule.id)}
            onSluit={() => setGeselecteerd(null)}
          />
        )}
      </div>

      {/* Legenda */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginTop: "12px",
          flexWrap: "wrap",
        }}
      >
        {[
          { kleur: "#2E7D32", label: "Te doen / Bezig" },
          { kleur: "#DAA520", label: "Goud (≥80%)" },
          { kleur: "#A8A8A8", label: "Zilver (65-80%)" },
          { kleur: "#A0522D", label: "Brons (50-65%)" },
          { kleur: "#C62828", label: "Niet gehaald (<50%)" },
          { kleur: "#9E9E9E", label: "Niet in jouw pad" },
        ].map((item) => (
          <div
            key={item.label}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "3px",
                background: item.kleur,
              }}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--grijs-700)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
