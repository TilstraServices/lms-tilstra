import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

// ── Pad configuratie ──
const PAD_CONFIG = {
  stam: {
    label: "Algemeen",
    primair: "#5D4037",
    licht: "#EFEBE9",
    tekst: "#3E2723",
  },
  payroll: {
    label: "Payroll",
    primair: "#2E7D32",
    licht: "#E8F5E9",
    tekst: "#1B5E20",
  },
  finance: {
    label: "Finance",
    primair: "#C62828",
    licht: "#FFEBEE",
    tekst: "#B71C1C",
  },
  hr: { label: "HR", primair: "#6A1B9A", licht: "#F3E5F5", tekst: "#4A148C" },
  gedeeld: {
    label: "Gedeeld",
    primair: "#5D4037",
    licht: "#EFEBE9",
    tekst: "#3E2723",
  },
};

// ── Categorie kleuren (linker rand op module blokje) ──
const CATEGORIE_KLEUREN = {
  BKL: "#2E7D32",
  NMBRS: "#1565C0",
  Excel: "#1B5E20",
  Onboarding: "#E65100",
  Algemeen: "#5D4037",
};

function getModuleStatus(moduleId, voortgangMap, scoreMap, activeModuleIds) {
  const isActief = activeModuleIds.includes(moduleId);
  const voortgang = voortgangMap[moduleId] ?? 0;
  const score = scoreMap[moduleId] ?? null;
  const isAfgerond = voortgang >= 100;

  if (!isActief) return { type: "inactief" };
  if (!isAfgerond) return { type: "bezig", voortgang };
  if (score === null) return { type: "bezig", voortgang };
  if (score < 50) return { type: "gezakt", score };
  if (score >= 80) return { type: "goud", score };
  if (score >= 65) return { type: "zilver", score };
  return { type: "brons", score };
}

function getStatusStijl(status) {
  switch (status.type) {
    case "inactief":
      return {
        rand: "#BDBDBD",
        randDikte: 2,
        opacity: 0.4,
        labelKleur: "#9E9E9E",
        label: null,
      };
    case "bezig":
      return {
        rand: "#2E7D32",
        randDikte: 2,
        opacity: 1,
        labelKleur: "#2E7D32",
        label: status.voortgang > 0 ? `${status.voortgang}%` : "Te doen",
      };
    case "gezakt":
      return {
        rand: "#C62828",
        randDikte: 3,
        opacity: 1,
        labelKleur: "#C62828",
        label: `${status.score}%`,
        glans: "rood",
      };
    case "goud":
      return {
        rand: "#DAA520",
        randDikte: 3,
        opacity: 1,
        labelKleur: "#B8860B",
        label: `${status.score}%`,
        glans: "goud",
      };
    case "zilver":
      return {
        rand: "#9E9E9E",
        randDikte: 3,
        opacity: 1,
        labelKleur: "#757575",
        label: `${status.score}%`,
        glans: "zilver",
      };
    case "brons":
      return {
        rand: "#A0522D",
        randDikte: 3,
        opacity: 1,
        labelKleur: "#8B4513",
        label: `${status.score}%`,
        glans: "brons",
      };
    default:
      return {
        rand: "#2E7D32",
        randDikte: 2,
        opacity: 1,
        labelKleur: "#2E7D32",
        label: "Te doen",
      };
  }
}

const GLANS_GRADIENTEN = {
  goud: "linear-gradient(135deg, #FFF9E6 0%, #FFF3CD 30%, #FFE082 60%, #FFF8E1 100%)",
  zilver:
    "linear-gradient(135deg, #FAFAFA 0%, #F0F0F0 30%, #E0E0E0 60%, #FAFAFA 100%)",
  brons:
    "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 30%, #FFCC80 60%, #FFF3E0 100%)",
  rood: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 30%, #EF9A9A 60%, #FFEBEE 100%)",
};

function ModuleBlokje({ module, padConfig, stijl, geselecteerd, onClick }) {
  const categorieKleur = CATEGORIE_KLEUREN[module.categorie] || "#9E9E9E";
  const achtergrond = stijl.glans ? GLANS_GRADIENTEN[stijl.glans] : "white";

  return (
    <div
      onClick={onClick}
      title={module.naam}
      style={{
        position: "relative",
        width: "140px",
        minWidth: "140px",
        height: "72px",
        borderRadius: "10px",
        background: achtergrond,
        opacity: stijl.opacity,
        cursor: "pointer",
        boxShadow: geselecteerd
          ? `0 0 0 3px ${padConfig.primair}, 0 4px 16px rgba(0,0,0,0.15)`
          : "0 2px 8px rgba(0,0,0,0.10)",
        transition: "box-shadow 0.15s, transform 0.15s",
        transform: geselecteerd ? "translateY(-2px)" : "none",
        overflow: "hidden",
        flexShrink: 0,
        borderLeft: `4px solid ${categorieKleur}`,
        borderRight: `4px solid ${padConfig.primair}`,
        borderTop: `2px solid ${stijl.rand}`,
        borderBottom: `2px solid ${stijl.rand}`,
      }}
    >
      {stijl.glans && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "40%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)",
            borderRadius: "10px 10px 0 0",
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          padding: "8px 10px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            fontSize: "0.78rem",
            fontWeight: 700,
            color: stijl.opacity < 1 ? "#9E9E9E" : "#1A1A1A",
            lineHeight: 1.3,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {module.naam}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.62rem",
              fontWeight: 700,
              color: categorieKleur,
              background: categorieKleur + "18",
              padding: "1px 6px",
              borderRadius: "50px",
            }}
          >
            {module.categorie}
          </span>
          {stijl.label && (
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                color: stijl.labelKleur,
              }}
            >
              {stijl.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PijlVerbinding({ gelockt }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        width: "32px",
      }}
    >
      <svg width="32" height="16" viewBox="0 0 32 16">
        <line
          x1="0"
          y1="8"
          x2="24"
          y2="8"
          stroke={gelockt ? "#BDBDBD" : "#9E9E9E"}
          strokeWidth="2"
          strokeDasharray={gelockt ? "4,3" : "none"}
        />
        <polygon
          points="24,4 32,8 24,12"
          fill={gelockt ? "#BDBDBD" : "#9E9E9E"}
        />
      </svg>
    </div>
  );
}

function PadRij({
  modules,
  padConfig,
  voortgangMap,
  scoreMap,
  activeModuleIds,
  geselecteerd,
  onSelect,
}) {
  if (modules.length === 0) return null;

  return (
    <div
      style={{
        background: padConfig.licht,
        padding: "16px 20px",
        borderTop: `1px solid ${padConfig.primair}30`,
        borderBottom: `1px solid ${padConfig.primair}30`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: padConfig.primair,
          }}
        />
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: padConfig.tekst,
          }}
        >
          {padConfig.label}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0",
          overflowX: "auto",
          paddingBottom: "4px",
        }}
      >
        {modules.map((module, index) => {
          const status = getModuleStatus(
            module.id,
            voortgangMap,
            scoreMap,
            activeModuleIds,
          );
          const stijl = getStatusStijl(status);
          const vorigeAfgerond =
            index === 0 ||
            (() => {
              const vorigeStatus = getModuleStatus(
                modules[index - 1].id,
                voortgangMap,
                scoreMap,
                activeModuleIds,
              );
              return (
                vorigeStatus.type === "goud" ||
                vorigeStatus.type === "zilver" ||
                vorigeStatus.type === "brons"
              );
            })();

          return (
            <div
              key={module.id}
              style={{ display: "flex", alignItems: "center" }}
            >
              {index > 0 && <PijlVerbinding gelockt={!vorigeAfgerond} />}
              <ModuleBlokje
                module={module}
                padConfig={padConfig}
                stijl={stijl}
                geselecteerd={geselecteerd === module.id}
                onClick={() =>
                  onSelect(module.id === geselecteerd ? null : module.id)
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailPanel({
  moduleId,
  skillTree,
  voortgangMap,
  scoreMap,
  activeModuleIds,
  onSluit,
}) {
  let module = null;
  let padKey = null;
  for (const [key, modules] of Object.entries(skillTree)) {
    const gevonden = modules.find((m) => m.id === moduleId);
    if (gevonden) {
      module = gevonden;
      padKey = key;
      break;
    }
  }
  if (!module) return null;

  const padConfig = PAD_CONFIG[padKey] || PAD_CONFIG.stam;
  const categorieKleur = CATEGORIE_KLEUREN[module.categorie] || "#9E9E9E";
  const voortgang = voortgangMap[moduleId] ?? 0;
  const score = scoreMap[moduleId] ?? null;
  const actief = activeModuleIds.includes(moduleId);

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px 24px",
        border: `2px solid ${padConfig.primair}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        marginTop: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "14px",
        }}
      >
        <div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
            <span
              style={{
                background: categorieKleur + "18",
                color: categorieKleur,
                fontSize: "0.68rem",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "50px",
              }}
            >
              {module.categorie}
            </span>
            <span
              style={{
                background: padConfig.licht,
                color: padConfig.primair,
                fontSize: "0.68rem",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "50px",
              }}
            >
              {padConfig.label}
            </span>
          </div>
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
            fontSize: "1.1rem",
            padding: "0",
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
              fontSize: "0.68rem",
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
              color: actief ? padConfig.primair : "#9E9E9E",
            }}
          >
            {actief ? `${voortgang}%` : "—"}
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
              fontSize: "0.68rem",
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
            {actief && score !== null ? `${score}%` : "—"}
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

const PAD_VOLGORDE = ["stam", "payroll", "finance", "hr"];

export default function LearningPathBlok({ email }) {
  const [skillTree, setSkillTree] = useState({
    stam: [],
    payroll: [],
    finance: [],
    hr: [],
  });
  const [voortgangMap, setVoortgangMap] = useState({});
  const [scoreMap, setScoreMap] = useState({});
  const [activeModuleIds, setActiveModuleIds] = useState([]);

  const [geselecteerd, setGeselecteerd] = useState(null);
  const [laden, setLaden] = useState(true);
  const [indexOpen, setIndexOpen] = useState(false);

  useEffect(() => {
    async function laadData() {
      if (!email) return;
      setLaden(true);

      // 3 queries parallel
      const [modulesRes, lpRes, voortgangRes] = await Promise.all([
        supabase.from("modules").select("id, naam, categorie, pad, volgorde"),
        supabase
          .from("learning_path")
          .select("module_id, volgorde")
          .eq("trainee_email", email)
          .eq("actief", true),
        supabase
          .from("module_voortgang")
          .select("module_id, voortgang, gem_score")
          .eq("trainee_email", email),
      ]);

      // Persoonlijke volgorde map: module_id -> volgorde
      const persVolgorde = {};
      if (lpRes.data) {
        lpRes.data.forEach((l) => {
          if (l.volgorde !== null) persVolgorde[l.module_id] = l.volgorde;
        });
      }

      setActiveModuleIds(lpRes.data ? lpRes.data.map((l) => l.module_id) : []);

      // Groepeer modules per pad, sorteer op persoonlijke volgorde → standaard volgorde
      const boom = { stam: [], payroll: [], finance: [], hr: [] };
      if (modulesRes.data) {
        modulesRes.data.forEach((m) => {
          const pad = m.pad || "stam";
          if (boom[pad]) boom[pad].push(m);
        });
        // Sorteer elke rij
        Object.keys(boom).forEach((pad) => {
          boom[pad].sort((a, b) => {
            const va = persVolgorde[a.id] ?? a.volgorde ?? 999;
            const vb = persVolgorde[b.id] ?? b.volgorde ?? 999;
            return va - vb;
          });
        });
      }
      setSkillTree(boom);

      // Voortgang en scores
      const vMap = {};
      const sMap = {};
      if (voortgangRes.data) {
        voortgangRes.data.forEach((v) => {
          vMap[v.module_id] = v.voortgang;
          sMap[v.module_id] = v.gem_score;
        });
      }
      setVoortgangMap(vMap);
      setScoreMap(sMap);
      setLaden(false);
    }
    laadData();
  }, [email]);

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
    <div style={{ padding: "24px 28px" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
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

      {/* Rijen */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {PAD_VOLGORDE.map((pad, index) => {
          const modules = skillTree[pad] || [];
          if (modules.length === 0) return null;
          const config = PAD_CONFIG[pad];

          return (
            <div key={pad}>
              {index === 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                    marginTop: "4px",
                  }}
                >
                  <div
                    style={{ flex: 1, height: "1px", background: "#E0E0E0" }}
                  />
                </div>
              )}
              <div style={{ marginLeft: pad === "stam" ? "0" : "32px" }}>
                <PadRij
                  modules={modules}
                  padConfig={config}
                  voortgangMap={voortgangMap}
                  scoreMap={scoreMap}
                  activeModuleIds={activeModuleIds}
                  geselecteerd={geselecteerd}
                  onSelect={setGeselecteerd}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {geselecteerd && (
        <DetailPanel
          moduleId={geselecteerd}
          skillTree={skillTree}
          voortgangMap={voortgangMap}
          scoreMap={scoreMap}
          activeModuleIds={activeModuleIds}
          onSluit={() => setGeselecteerd(null)}
        />
      )}

      {/* Index knop + popup */}
      <div
        style={{
          marginTop: "16px",
          position: "relative",
          display: "inline-block",
          float: "left",
        }}
      >
        <button
          onClick={() => setIndexOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "#F0F0F0",
            border: "none",
            borderRadius: "6px",
            padding: "5px 10px",
            cursor: "pointer",
            color: "#9E9E9E",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 256 256" fill="#9E9E9E">
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a16,16,0,1,1,16,16A16,16,0,0,1,112,84Z" />
          </svg>
          Index
        </button>
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "0",
            background: "white",
            border: "1px solid #E0E0E0",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            padding: indexOpen ? "10px 14px" : "0 14px",
            overflow: "hidden",
            maxHeight: indexOpen ? "300px" : "0px",
            opacity: indexOpen ? 1 : 0,
            transition:
              "max-height 0.25s ease, opacity 0.2s ease, padding 0.25s ease",
            pointerEvents: indexOpen ? "auto" : "none",
            minWidth: "180px",
            zIndex: 20,
          }}
        >
          {[
            { kleur: "#2E7D32", label: "Te doen / Bezig" },
            { kleur: "#DAA520", label: "Goud (≥80%)" },
            { kleur: "#9E9E9E", label: "Zilver (65-80%)" },
            { kleur: "#A0522D", label: "Brons (50-65%)" },
            { kleur: "#C62828", label: "Niet gehaald (<50%)" },
            { kleur: "#BDBDBD", label: "Niet in jouw pad" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "5px 0",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  background: item.kleur,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--grijs-700)",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
