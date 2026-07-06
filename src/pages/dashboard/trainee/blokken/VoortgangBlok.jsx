import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { ParagraafIcoon, VraagIcoon } from "../../../../assets/icons.jsx";

const MODULE_KLEUREN = {
  BKL: { primair: "#2E7D32", licht: "#E8F5E9", label: "BKL" },
  NMBRS: { primair: "#1565C0", licht: "#E3F2FD", label: "NMBRS" },
};

// ── Paragraaf rij ──
function ParagraafRij({ paragraaf, scores }) {
  const pogingen = scores.filter(
    (s) => s.opgave?.paragraaf_id === paragraaf.id,
  );
  const heeftScores = pogingen.length > 0;
  const gemScore = heeftScores
    ? Math.round(pogingen.reduce((a, b) => a + b.score, 0) / pogingen.length)
    : null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "10px 20px 10px 48px",
        borderBottom: "1px solid var(--grijs-100)",
        background: "white",
      }}
    >
      <div
        style={{
          width: "3px",
          height: "24px",
          borderRadius: "2px",
          background: "var(--grijs-200)",
          flexShrink: 0,
        }}
      />
      <p style={{ fontSize: "0.82rem", color: "var(--grijs-700)", flex: 1 }}>
        {paragraaf.naam}
      </p>
      {heeftScores ? (
        <span
          style={{
            fontSize: "0.82rem",
            fontWeight: 600,
            color: gemScore >= 70 ? "#2E7D32" : "#C62828",
          }}
        >
          {gemScore}%
        </span>
      ) : (
        <span style={{ fontSize: "0.78rem", color: "var(--grijs-300)" }}>
          Niet gedaan
        </span>
      )}
    </div>
  );
}

// ── Hoofdstuk rij (lazy load) ──
function HoofdstukRij({ hoofdstuk, email, cat }) {
  const [open, setOpen] = useState(false);
  const [paragrafen, setParagrafen] = useState([]);
  const [scores, setScores] = useState([]);
  const [geladen, setGeladen] = useState(false);
  const [laden, setLaden] = useState(false);

  async function laadHoofdstuk() {
    if (geladen) {
      setOpen(!open);
      return;
    }
    setLaden(true);
    setOpen(true);

    const { data: paragraafData } = await supabase
      .from("paragrafen")
      .select("id, naam, volgorde")
      .eq("hoofdstuk_id", hoofdstuk.id)
      .order("volgorde");

    if (paragraafData && paragraafData.length > 0) {
      setParagrafen(paragraafData);
      const { data: opgaveData } = await supabase
        .from("opgaves")
        .select("id, paragraaf_id")
        .in(
          "paragraaf_id",
          paragraafData.map((p) => p.id),
        );

      if (opgaveData && opgaveData.length > 0) {
        const { data: scoreData } = await supabase
          .from("scores")
          .select("opgave_id, score, poging_nummer")
          .eq("trainee_email", email)
          .in(
            "opgave_id",
            opgaveData.map((o) => o.id),
          )
          .order("poging_nummer", { ascending: false });

        const laasteScoresMap = {};
        (scoreData || []).forEach((s) => {
          if (!laasteScoresMap[s.opgave_id]) laasteScoresMap[s.opgave_id] = s;
        });
        setScores(
          Object.values(laasteScoresMap).map((s) => ({
            ...s,
            opgave: opgaveData.find((o) => o.id === s.opgave_id),
          })),
        );
      }
    }

    setGeladen(true);
    setLaden(false);
  }

  const hoofdstukScores = scores.filter((s) =>
    paragrafen.some((p) => p.id === s.opgave?.paragraaf_id),
  );
  const hoofdstukGem =
    hoofdstukScores.length > 0
      ? Math.round(
          hoofdstukScores.reduce((a, b) => a + b.score, 0) /
            hoofdstukScores.length,
        )
      : null;

  return (
    <div>
      <div
        onClick={laadHoofdstuk}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "11px 20px 11px 28px",
          cursor: "pointer",
          background: open ? "#F8F9FA" : "var(--grijs-50)",
          borderBottom: "1px solid var(--grijs-200)",
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = "#F0F2F5";
        }}
        onMouseLeave={(e) => {
          if (!open)
            e.currentTarget.style.background = open
              ? "#F8F9FA"
              : "var(--grijs-50)";
        }}
      >
        <div
          style={{
            width: "3px",
            height: "24px",
            borderRadius: "2px",
            background: cat.primair,
            opacity: 0.5,
            flexShrink: 0,
          }}
        />
        <p
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--grijs-700)",
            flex: 1,
          }}
        >
          {hoofdstuk.naam}
        </p>
        {laden ? (
          <span style={{ fontSize: "0.75rem", color: "var(--grijs-400)" }}>
            Laden...
          </span>
        ) : hoofdstukGem !== null ? (
          <span
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: hoofdstukGem >= 70 ? "#2E7D32" : "#C62828",
            }}
          >
            {hoofdstukGem}%
          </span>
        ) : geladen ? (
          <span style={{ fontSize: "0.78rem", color: "var(--grijs-300)" }}>
            Geen scores
          </span>
        ) : null}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          fill="var(--grijs-400)"
          viewBox="0 0 256 256"
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        >
          <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
        </svg>
      </div>

      {/* Paragrafen met animatie */}
      <div className={"uitklap-container" + (open ? "" : " ingeklapt")}>
        {paragrafen.length === 0 ? (
          <div
            style={{
              padding: "10px 20px 10px 48px",
              fontSize: "0.82rem",
              color: "var(--grijs-400)",
            }}
          >
            Geen paragrafen in dit hoofdstuk.
          </div>
        ) : (
          paragrafen.map((paragraaf) => (
            <ParagraafRij
              key={paragraaf.id}
              paragraaf={paragraaf}
              scores={scores}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Module rij ──
function ModuleRij({
  module,
  voortgang,
  score,
  quizScore,
  actief,
  open,
  onToggle,
  email,
}) {
  const cat = MODULE_KLEUREN[module.categorie] || MODULE_KLEUREN.BKL;
  const [hoofdstukken, setHoofdstukken] = useState([]);
  const [hoofdstukkenGeladen, setHoofdstukkenGeladen] = useState(false);

  useEffect(() => {
    if (open && !hoofdstukkenGeladen) {
      async function laadHoofdstukken() {
        const { data } = await supabase
          .from("hoofdstukken")
          .select("id, naam, volgorde")
          .eq("module_id", module.id)
          .order("volgorde");
        if (data) setHoofdstukken(data);
        setHoofdstukkenGeladen(true);
      }
      laadHoofdstukken();
    }
  }, [open, hoofdstukkenGeladen, module.id]);

  return (
    <div style={{ borderBottom: "1px solid var(--grijs-200)" }}>
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "14px 20px",
          cursor: "pointer",
          opacity: actief ? 1 : 0.5,
          background: open ? "var(--grijs-50)" : "white",
          transition: "background 0.12s",
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = "var(--grijs-50)";
        }}
        onMouseLeave={(e) => {
          if (!open)
            e.currentTarget.style.background = open
              ? "var(--grijs-50)"
              : "white";
        }}
      >
        <div
          style={{
            width: "4px",
            height: "36px",
            borderRadius: "2px",
            background: actief ? cat.primair : "#BDBDBD",
            flexShrink: 0,
          }}
        />
        <p
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: actief ? "var(--grijs-900)" : "var(--grijs-500)",
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {module.naam}
        </p>
        <span
          style={{
            background: actief ? cat.licht : "#F5F5F5",
            color: actief ? cat.primair : "#9E9E9E",
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "50px",
            flexShrink: 0,
          }}
        >
          {cat.label}
        </span>
        {voortgang !== undefined ? (
          <div style={{ width: "100px", flexShrink: 0 }}>
            <div
              style={{
                background: "#EEEEEE",
                borderRadius: "50px",
                height: "6px",
              }}
            >
              <div
                style={{
                  width: `${voortgang}%`,
                  height: "100%",
                  borderRadius: "50px",
                  background: cat.primair,
                }}
              />
            </div>
            <p
              style={{
                fontSize: "0.72rem",
                color: "var(--grijs-500)",
                marginTop: "2px",
                textAlign: "right",
              }}
            >
              {voortgang}%
            </p>
          </div>
        ) : (
          <div style={{ width: "100px", flexShrink: 0 }} />
        )}
        <div style={{ width: "110px", flexShrink: 0, textAlign: "right" }}>
          {score !== null && score !== undefined && (
            <p
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: score >= 70 ? "#2E7D32" : "#C62828",
              }}
            >
              <ParagraafIcoon size={12} /> {score}%
            </p>
          )}
          {quizScore !== null && quizScore !== undefined && (
            <p
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: quizScore >= 70 ? "#2E7D32" : "#C62828",
              }}
            >
              <VraagIcoon size={12} /> {quizScore}%
            </p>
          )}
          {actief &&
            score === null &&
            score === undefined &&
            quizScore === null &&
            quizScore === undefined && (
              <p style={{ fontSize: "0.85rem", color: "var(--grijs-300)" }}>
                —
              </p>
            )}
        </div>
        {voortgang !== undefined ? (
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "50px",
              background: voortgang >= 100 ? "#E8F5E9" : "#FFF3E0",
              color: voortgang >= 100 ? "#2E7D32" : "#E65100",
              width: "70px",
              textAlign: "center",
              flexShrink: 0,
            }}
          >
            {voortgang >= 100 ? "Afgerond" : "Bezig"}
          </span>
        ) : (
          <span style={{ width: "70px", flexShrink: 0 }} />
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="var(--grijs-400)"
          viewBox="0 0 256 256"
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        >
          <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
        </svg>
      </div>

      {/* Uitklap met animatie */}
      <div
        className={"uitklap-container" + (open ? "" : " ingeklapt")}
        style={{
          borderTop: open
            ? `3px solid ${actief ? cat.primair : "#BDBDBD"}`
            : "none",
        }}
      >
        {/* Synopsis + stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "20px",
            padding: "20px 24px",
            background: "var(--grijs-50)",
            borderBottom: "1px solid var(--grijs-200)",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--grijs-500)",
                marginBottom: "6px",
              }}
            >
              Synopsis
            </p>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--grijs-700)",
                lineHeight: 1.6,
              }}
            >
              {module.beschrijving || "Geen beschrijving beschikbaar."}
            </p>
            {!actief && (
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--grijs-400)",
                  marginTop: "8px",
                  fontStyle: "italic",
                }}
              >
                Deze module staat nog niet in jouw learning path.
              </p>
            )}
          </div>
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "12px",
              textAlign: "center",
              border: "1px solid var(--grijs-200)",
            }}
          >
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--grijs-500)",
                marginBottom: "4px",
              }}
            >
              Duur
            </p>
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--grijs-900)",
              }}
            >
              {module.duur || "—"}
            </p>
          </div>
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "12px",
              textAlign: "center",
              border: "1px solid var(--grijs-200)",
            }}
          >
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--grijs-500)",
                marginBottom: "4px",
              }}
            >
              Voortgang
            </p>
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: actief ? cat.primair : "var(--grijs-300)",
              }}
            >
              {voortgang !== undefined ? `${voortgang}%` : "—"}
            </p>
          </div>
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "12px",
              textAlign: "center",
              border: "1px solid var(--grijs-200)",
            }}
          >
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
              Gem. score
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <p style={{ fontSize: "0.82rem", color: "var(--grijs-500)" }}>
                <ParagraafIcoon size={13} />{" "}
                {score !== null && score !== undefined ? (
                  <strong
                    style={{ color: score >= 70 ? "#2E7D32" : "#C62828" }}
                  >
                    {score}%
                  </strong>
                ) : (
                  "—"
                )}
              </p>
              <p style={{ fontSize: "0.82rem", color: "var(--grijs-500)" }}>
                <VraagIcoon size={13} />{" "}
                {quizScore !== null && quizScore !== undefined ? (
                  <strong
                    style={{ color: quizScore >= 70 ? "#2E7D32" : "#C62828" }}
                  >
                    {quizScore}%
                  </strong>
                ) : (
                  "—"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Hoofdstukken */}
        {actief && (
          <div>
            <div
              style={{
                padding: "10px 20px",
                background: "var(--grijs-100)",
                borderBottom: "1px solid var(--grijs-200)",
              }}
            >
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--grijs-500)",
                }}
              >
                Hoofdstukken
              </p>
            </div>
            {!hoofdstukkenGeladen ? (
              <div
                style={{
                  padding: "12px 20px",
                  fontSize: "0.82rem",
                  color: "var(--grijs-400)",
                }}
              >
                Laden...
              </div>
            ) : hoofdstukken.length === 0 ? (
              <div
                style={{
                  padding: "12px 20px",
                  fontSize: "0.82rem",
                  color: "var(--grijs-400)",
                }}
              >
                Geen hoofdstukken gevonden.
              </div>
            ) : (
              hoofdstukken.map((hoofdstuk) => (
                <HoofdstukRij
                  key={hoofdstuk.id}
                  hoofdstuk={hoofdstuk}
                  email={email}
                  cat={cat}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Hoofd component ──
export default function VoortgangBlok({ email }) {
  const [mijnModules, setMijnModules] = useState([]);
  const [alleModules, setAlleModules] = useState([]);
  const [voortgangMap, setVoortgangMap] = useState({});
  const [scoreMap, setScoreMap] = useState({});
  const [quizScoreMap, setQuizScoreMap] = useState({});
  const [openMijnModule, setOpenMijnModule] = useState(null);
  const [openAlleModule, setOpenAlleModule] = useState(null);
  const [laden, setLaden] = useState(true);

  async function laadData() {
    setLaden(true);

    const { data: learningPath } = await supabase
      .from("learning_path")
      .select("module_id, volgorde")
      .eq("trainee_email", email)
      .eq("actief", true)
      .order("volgorde");

    const activeModuleIds = learningPath
      ? learningPath.map((lp) => lp.module_id)
      : [];

    const { data: modules } = await supabase
      .from("modules")
      .select("*")
      .order("categorie")
      .order("volgorde");

    if (modules) {
      setAlleModules(modules);
      const actief = modules.filter((m) => activeModuleIds.includes(m.id));
      actief.sort(
        (a, b) => activeModuleIds.indexOf(a.id) - activeModuleIds.indexOf(b.id),
      );
      setMijnModules(actief);
    }

    // Voortgang voor alle modules
    const { data: voortgangData } = await supabase
      .from("module_voortgang")
      .select("module_id, voortgang")
      .eq("trainee_email", email);

    const vMap = {};
    if (voortgangData)
      voortgangData.forEach((v) => {
        vMap[v.module_id] = v.voortgang;
      });
    setVoortgangMap(vMap);

    const { data: scoreData } = await supabase
      .from("scores")
      .select(
        "opgave_id, score, poging_nummer, opgaves(paragraaf_id, paragrafen(hoofdstuk_id, hoofdstukken(module_id)))",
      )
      .eq("trainee_email", email)
      .order("poging_nummer", { ascending: false });

    const laasteScoresMap = {};
    (scoreData || []).forEach((s) => {
      if (!laasteScoresMap[s.opgave_id]) laasteScoresMap[s.opgave_id] = s;
    });

    const sMap = {};
    Object.values(laasteScoresMap).forEach((s) => {
      const moduleId = s.opgaves?.paragrafen?.hoofdstukken?.module_id;
      if (!moduleId) return;
      if (!sMap[moduleId]) sMap[moduleId] = [];
      sMap[moduleId].push(s.score);
    });

    Object.keys(sMap).forEach((moduleId) => {
      const scores = sMap[moduleId];
      sMap[moduleId] = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length,
      );
    });

    setScoreMap(sMap);

    // Quiz scores per module
    const { data: quizScoreData } = await supabase
      .from("quiz_scores")
      .select(
        "quiz_id, score, poging_nummer, quizen(hoofdstuk_id, hoofdstukken(module_id))",
      )
      .eq("trainee_email", email)
      .order("poging_nummer", { ascending: false });

    const laasteQuizScoresMap = {};
    (quizScoreData || []).forEach((s) => {
      if (!laasteQuizScoresMap[s.quiz_id]) laasteQuizScoresMap[s.quiz_id] = s;
    });

    const qMap = {};
    Object.values(laasteQuizScoresMap).forEach((s) => {
      const moduleId = s.quizen?.hoofdstukken?.module_id;
      if (!moduleId) return;
      if (!qMap[moduleId]) qMap[moduleId] = [];
      qMap[moduleId].push(s.score);
    });

    Object.keys(qMap).forEach((moduleId) => {
      const scores = qMap[moduleId];
      qMap[moduleId] = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length,
      );
    });

    setQuizScoreMap(qMap);

    setLaden(false);
  }

  useEffect(() => {
    async function laadEnStart() {
      if (email) await laadData();
    }
    laadEnStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const modulesPerCategorie = alleModules.reduce((acc, module) => {
    const cat = module.categorie || "Overig";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(module);
    return acc;
  }, {});

  const activeModuleIds = mijnModules.map((m) => m.id);

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

  const tabelHeader = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "10px 20px",
        background: "var(--grijs-50)",
        borderBottom: "1px solid var(--grijs-200)",
      }}
    >
      <div style={{ width: "4px", flexShrink: 0 }} />
      <p
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--grijs-500)",
          flex: 1,
        }}
      >
        Module
      </p>
      <p
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--grijs-500)",
          width: "60px",
        }}
      >
        Type
      </p>
      <p
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--grijs-500)",
          width: "100px",
        }}
      >
        Voortgang
      </p>
      <p
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--grijs-500)",
          width: "50px",
          textAlign: "right",
        }}
      >
        Score
      </p>
      <p
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--grijs-500)",
          width: "70px",
          textAlign: "center",
        }}
      >
        Status
      </p>
      <div style={{ width: "16px", flexShrink: 0 }} />
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "28px",
        width: "100%",
      }}
    >
      <div>
        <div style={{ marginBottom: "12px" }}>
          <p
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--grijs-900)",
            }}
          >
            Mijn modules
          </p>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--grijs-500)",
              marginTop: "2px",
            }}
          >
            Modules in jouw learning path
          </p>
        </div>
        <div
          className="kaart"
          style={{ padding: 0, overflow: "visible", width: "100%" }}
        >
          {tabelHeader}
          {mijnModules.length === 0 ? (
            <p
              style={{
                padding: "20px",
                fontSize: "0.85rem",
                color: "var(--grijs-500)",
              }}
            >
              Nog geen modules in jouw learning path.
            </p>
          ) : (
            mijnModules.map((module) => (
              <ModuleRij
                key={module.id}
                module={module}
                voortgang={voortgangMap[module.id]}
                score={scoreMap[module.id]}
                quizScore={quizScoreMap[module.id]}
                actief={true}
                open={openMijnModule === module.id}
                onToggle={() =>
                  setOpenMijnModule(
                    openMijnModule === module.id ? null : module.id,
                  )
                }
                email={email}
              />
            ))
          )}
        </div>
      </div>

      <div>
        <div style={{ marginBottom: "12px" }}>
          <p
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--grijs-900)",
            }}
          >
            Alle modules
          </p>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--grijs-500)",
              marginTop: "2px",
            }}
          >
            Alle beschikbare Tilstra modules
          </p>
        </div>
        {Object.entries(modulesPerCategorie).map(([categorie, modules]) => {
          const cat = MODULE_KLEUREN[categorie] || MODULE_KLEUREN.BKL;
          return (
            <div key={categorie} style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "3px",
                    height: "16px",
                    background: cat.primair,
                    borderRadius: "2px",
                  }}
                />
                <p
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: cat.primair,
                  }}
                >
                  {categorie}
                </p>
              </div>
              <div
                className="kaart"
                style={{ padding: 0, overflow: "visible", width: "100%" }}
              >
                {tabelHeader}
                {modules.map((module) => (
                  <ModuleRij
                    key={module.id}
                    module={module}
                    voortgang={voortgangMap[module.id]}
                    score={scoreMap[module.id]}
                    quizScore={quizScoreMap[module.id]}
                    actief={
                      activeModuleIds.includes(module.id) ||
                      scoreMap[module.id] !== undefined ||
                      quizScoreMap[module.id] !== undefined ||
                      voortgangMap[module.id] !== undefined
                    }
                    open={openAlleModule === module.id}
                    onToggle={() =>
                      setOpenAlleModule(
                        openAlleModule === module.id ? null : module.id,
                      )
                    }
                    email={email}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
