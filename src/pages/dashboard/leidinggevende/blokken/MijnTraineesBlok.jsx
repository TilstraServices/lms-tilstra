import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

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

// ── Hoofdstuk rij ──
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

        // Alleen laatste poging per opgave
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
        {actief && voortgang !== undefined ? (
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
        {actief && score !== null && score !== undefined ? (
          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: score >= 70 ? "#2E7D32" : "#C62828",
              width: "50px",
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            {score}%
          </p>
        ) : (
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--grijs-300)",
              width: "50px",
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            —
          </p>
        )}
        {actief ? (
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

      <div
        className={"uitklap-container" + (open ? "" : " ingeklapt")}
        style={{
          borderTop: open
            ? `3px solid ${actief ? cat.primair : "#BDBDBD"}`
            : "none",
        }}
      >
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
                Deze module staat niet in het learning path van deze trainee.
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
              {actief && voortgang !== undefined ? `${voortgang}%` : "—"}
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
              Gem. score
            </p>
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color:
                  actief && score !== null
                    ? score >= 70
                      ? "#2E7D32"
                      : "#C62828"
                    : "var(--grijs-300)",
              }}
            >
              {actief && score !== null && score !== undefined
                ? `${score}%`
                : "—"}
            </p>
          </div>
        </div>

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

// ── Trainee Detail View ──
function TraineeDetail({ trainee, onTerug }) {
  const [mijnModules, setMijnModules] = useState([]);
  const [alleModules, setAlleModules] = useState([]);
  const [voortgangMap, setVoortgangMap] = useState({});
  const [scoreMap, setScoreMap] = useState({});
  const [openMijnModule, setOpenMijnModule] = useState(null);
  const [openAlleModule, setOpenAlleModule] = useState(null);
  const [laden, setLaden] = useState(true);
  const [koppeling, setKoppeling] = useState(null);
  const [padLabel, setPadLabel] = useState(null);

  useEffect(() => {
    async function laadData() {
      setLaden(true);

      const { data: learningPath } = await supabase
        .from("learning_path")
        .select("module_id, volgorde")
        .eq("trainee_email", trainee.email)
        .eq("actief", true)
        .order("volgorde");
      const { data: koppelingData } = await supabase
        .from("koppeling")
        .select("gedetacheerd, gedetacheerd_sinds, gedetacheerd_tot")
        .eq("trainee_email", trainee.email)
        .single();
      setKoppeling(koppelingData);

      const padLabels = {
        payroll: "Payroll",
        finance: "Finance",
        hr: "HR",
        stam: "Algemeen",
      };
      const eersteModule = learningPath?.[0];
      if (eersteModule) {
        const { data: lpData } = await supabase
          .from("learning_path")
          .select("pad")
          .eq("trainee_email", trainee.email)
          .eq("actief", true)
          .limit(1)
          .single();
        setPadLabel(padLabels[lpData?.pad] || lpData?.pad || "—");
      }
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
          (a, b) =>
            activeModuleIds.indexOf(a.id) - activeModuleIds.indexOf(b.id),
        );
        setMijnModules(actief);
      }

      if (activeModuleIds.length > 0) {
        const { data: voortgangData } = await supabase
          .from("module_voortgang")
          .select("module_id, voortgang")
          .eq("trainee_email", trainee.email)
          .in("module_id", activeModuleIds);
        const vMap = {};
        if (voortgangData)
          voortgangData.forEach((v) => {
            vMap[v.module_id] = v.voortgang;
          });
        setVoortgangMap(vMap);

        const sMap = {};
        for (const moduleId of activeModuleIds) {
          const { data: hst } = await supabase
            .from("hoofdstukken")
            .select("id")
            .eq("module_id", moduleId);
          if (!hst || hst.length === 0) continue;
          const { data: par } = await supabase
            .from("paragrafen")
            .select("id")
            .in(
              "hoofdstuk_id",
              hst.map((h) => h.id),
            );
          if (!par || par.length === 0) continue;
          const { data: opg } = await supabase
            .from("opgaves")
            .select("id")
            .in(
              "paragraaf_id",
              par.map((p) => p.id),
            );
          if (!opg || opg.length === 0) continue;
          const { data: sc } = await supabase
            .from("scores")
            .select("opgave_id, score, poging_nummer")
            .eq("trainee_email", trainee.email)
            .in(
              "opgave_id",
              opg.map((o) => o.id),
            )
            .order("poging_nummer", { ascending: false });

          // Alleen de laatste poging per opgave
          const laasteScoresMap = {};
          (sc || []).forEach((s) => {
            if (!laasteScoresMap[s.opgave_id]) {
              laasteScoresMap[s.opgave_id] = s;
            }
          });
          const traineeScores = Object.values(laasteScoresMap);
          sMap[moduleId] =
            traineeScores.length > 0
              ? Math.round(
                  traineeScores.reduce((a, b) => a + b.score, 0) /
                    traineeScores.length,
                )
              : null;
        }
        setScoreMap(sMap);
      }

      setLaden(false);
    }
    laadData();
  }, [trainee.email]);

  const modulesPerCategorie = alleModules.reduce((acc, module) => {
    const cat = module.categorie || "Overig";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(module);
    return acc;
  }, {});

  const activeModuleIds = mijnModules.map((m) => m.id);

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

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* Header met terugknop */}
      <div
        style={{
          position: "sticky",
          top: -28,
          zIndex: 10,
          marginBottom: "24px",
          marginLeft: "-70px",
          marginRight: "-60px",
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid var(--grijs-200)",
            borderRadius: "10px 10px 0 0",
            borderBottom: "3px solid var(--groen)",
            boxShadow: "var(--schaduw)",
            padding: "60px 72px 72px",
            display: "flex",
            flexDirection: "column",
            gap: "44px",
          }}
        >
          {/* Terugknop */}
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
              width: "fit-content",
              marginLeft: "-48px",
              marginTop: "-36px",
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
            Terug naar overzicht
          </button>

          {/* Trainee info rij */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Avatar */}
            <div
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2E7D32, #66BB6A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.4rem",
                fontWeight: 800,
                color: "white",
                flexShrink: 0,
              }}
            >
              {trainee.naam
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>

            {/* Naam + email */}
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--grijs-900)",
                }}
              >
                {trainee.naam}
              </p>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--grijs-500)",
                  marginTop: "2px",
                }}
              >
                {trainee.email}
              </p>
            </div>

            {/* Learning path */}
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--grijs-500)",
                  marginBottom: "4px",
                }}
              >
                Learning path
              </p>
              <span
                style={{
                  background: "var(--groen-licht)",
                  color: "var(--groen-donker)",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  padding: "3px 12px",
                  borderRadius: "50px",
                }}
              >
                {padLabel || "—"}
              </span>
            </div>

            {/* Detachering toggle */}
            <div style={{ textAlign: "center", minWidth: "160px" }}>
              <p
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--grijs-500)",
                  marginBottom: "8px",
                }}
              >
                Detachering
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{ fontSize: "0.78rem", color: "var(--grijs-500)" }}
                >
                  Intern
                </span>
                <div
                  onClick={async () => {
                    const nieuw = !koppeling?.gedetacheerd;
                    await supabase
                      .from("koppeling")
                      .update({
                        gedetacheerd: nieuw,
                        gedetacheerd_sinds: nieuw
                          ? new Date().toISOString().split("T")[0]
                          : null,
                        gedetacheerd_tot: nieuw
                          ? koppeling?.gedetacheerd_tot
                          : null,
                      })
                      .eq("trainee_email", trainee.email);
                    setKoppeling((prev) => ({
                      ...prev,
                      gedetacheerd: nieuw,
                      gedetacheerd_sinds: nieuw
                        ? new Date().toISOString().split("T")[0]
                        : null,
                    }));
                  }}
                  style={{
                    width: "44px",
                    height: "24px",
                    borderRadius: "50px",
                    background: koppeling?.gedetacheerd
                      ? "#E65100"
                      : "var(--grijs-300)",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "3px",
                      left: koppeling?.gedetacheerd ? "23px" : "3px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "white",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                      transition: "left 0.2s",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "0.78rem",
                    color: koppeling?.gedetacheerd
                      ? "#E65100"
                      : "var(--grijs-500)",
                    fontWeight: koppeling?.gedetacheerd ? 700 : 400,
                  }}
                >
                  Gedetacheerd
                </span>
              </div>
              {koppeling?.gedetacheerd && (
                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--grijs-500)",
                        minWidth: "40px",
                        textAlign: "right",
                      }}
                    >
                      Sinds
                    </p>
                    <input
                      type="date"
                      value={koppeling?.gedetacheerd_sinds || ""}
                      onChange={async (e) => {
                        await supabase
                          .from("koppeling")
                          .update({ gedetacheerd_sinds: e.target.value })
                          .eq("trainee_email", trainee.email);
                        setKoppeling((prev) => ({
                          ...prev,
                          gedetacheerd_sinds: e.target.value,
                        }));
                      }}
                      style={{
                        fontSize: "0.78rem",
                        border: "1px solid var(--grijs-200)",
                        borderRadius: "6px",
                        padding: "3px 8px",
                        color: "var(--grijs-700)",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--grijs-500)",
                        minWidth: "40px",
                        textAlign: "right",
                      }}
                    >
                      Tot
                    </p>
                    <input
                      type="date"
                      value={koppeling?.gedetacheerd_tot || ""}
                      onChange={async (e) => {
                        await supabase
                          .from("koppeling")
                          .update({ gedetacheerd_tot: e.target.value })
                          .eq("trainee_email", trainee.email);
                        setKoppeling((prev) => ({
                          ...prev,
                          gedetacheerd_tot: e.target.value,
                        }));
                      }}
                      style={{
                        fontSize: "0.78rem",
                        border: "1px solid var(--grijs-200)",
                        borderRadius: "6px",
                        padding: "3px 8px",
                        color: "var(--grijs-700)",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          width: "100%",
        }}
      >
        {/* Mijn modules */}
        <div>
          <div style={{ marginBottom: "12px" }}>
            <p
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--grijs-900)",
              }}
            >
              Modules in learning path
            </p>
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--grijs-500)",
                marginTop: "2px",
              }}
            >
              Modules in het learning path van {trainee.naam}
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
                Geen modules in het learning path.
              </p>
            ) : (
              mijnModules.map((module) => (
                <ModuleRij
                  key={module.id}
                  module={module}
                  voortgang={voortgangMap[module.id]}
                  score={scoreMap[module.id]}
                  actief={true}
                  open={openMijnModule === module.id}
                  onToggle={() =>
                    setOpenMijnModule(
                      openMijnModule === module.id ? null : module.id,
                    )
                  }
                  email={trainee.email}
                />
              ))
            )}
          </div>
        </div>

        {/* Alle modules */}
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
                      actief={activeModuleIds.includes(module.id)}
                      open={openAlleModule === module.id}
                      onToggle={() =>
                        setOpenAlleModule(
                          openAlleModule === module.id ? null : module.id,
                        )
                      }
                      email={trainee.email}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Overzicht ──
function TraineeOverzicht({ email, onSelecteer }) {
  const [trainees, setTrainees] = useState([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    async function laadData() {
      if (!email) return;
      setLaden(true);

      const { data: koppelingen } = await supabase
        .from("koppeling")
        .select("trainee_email, gedetacheerd")
        .eq("leidinggevende_email", email);
      if (!koppelingen || koppelingen.length === 0) {
        setLaden(false);
        return;
      }

      const traineeEmails = koppelingen.map((k) => k.trainee_email);
      const detacheringMap = {};
      koppelingen.forEach(
        (k) => (detacheringMap[k.trainee_email] = k.gedetacheerd),
      );

      const [gebruikersRes, voortgangRes, lpRes] = await Promise.all([
        supabase
          .from("gebruikers")
          .select("naam, email, aangemaakt_op")
          .in("email", traineeEmails),
        supabase
          .from("module_voortgang")
          .select("trainee_email, voortgang")
          .in("trainee_email", traineeEmails),
        supabase
          .from("learning_path")
          .select("trainee_email")
          .eq("actief", true)
          .in("trainee_email", traineeEmails),
      ]);

      const modulesGehaaldPerTrainee = {};
      (voortgangRes.data || []).forEach((v) => {
        if (v.voortgang >= 100)
          modulesGehaaldPerTrainee[v.trainee_email] =
            (modulesGehaaldPerTrainee[v.trainee_email] || 0) + 1;
      });

      const modulesOpPadPerTrainee = {};
      (lpRes.data || []).forEach((l) => {
        modulesOpPadPerTrainee[l.trainee_email] =
          (modulesOpPadPerTrainee[l.trainee_email] || 0) + 1;
      });

      const gecombineerd = (gebruikersRes.data || []).map((g) => ({
        naam: g.naam,
        email: g.email,
        aangemaakt_op: g.aangemaakt_op,
        gedetacheerd: detacheringMap[g.email] || false,
        modulesGehaald: modulesGehaaldPerTrainee[g.email] || 0,
        modulesOpPad: modulesOpPadPerTrainee[g.email] || 0,
      }));

      setTrainees(gecombineerd);
      setLaden(false);
    }
    laadData();
  }, [email]);

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

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ marginBottom: "20px" }}>
        <p
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--grijs-900)",
          }}
        >
          Mijn Trainees
        </p>
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--grijs-500)",
            marginTop: "2px",
          }}
        >
          {trainees.length} {trainees.length === 1 ? "trainee" : "trainees"}{" "}
          gekoppeld — klik op een trainee voor details
        </p>
      </div>

      {trainees.length === 0 ? (
        <p style={{ color: "var(--grijs-500)", fontSize: "0.85rem" }}>
          Geen trainees gekoppeld.
        </p>
      ) : (
        <div
          style={{
            background: "white",
            border: "1px solid var(--grijs-200)",
            borderRadius: "10px",
            boxShadow: "var(--schaduw)",
            overflow: "hidden",
          }}
        >
          <table className="tabel" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: "24px" }}>Naam</th>
                <th>Gestart op</th>
                <th>Modules gehaald</th>
                <th>Op learning path</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trainees.map((trainee) => {
                const initialen = trainee.naam
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                const startdatum = new Date(
                  trainee.aangemaakt_op,
                ).toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
                const voortgangPct =
                  trainee.modulesOpPad > 0
                    ? Math.round(
                        (trainee.modulesGehaald / trainee.modulesOpPad) * 100,
                      )
                    : 0;

                return (
                  <tr
                    key={trainee.email}
                    onClick={() => onSelecteer(trainee)}
                    style={{
                      cursor: "pointer",
                      borderLeft: `4px solid ${trainee.gedetacheerd ? "#212121" : "var(--groen)"}`,
                    }}
                  >
                    <td style={{ paddingLeft: "24px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          className="avatar"
                          style={{
                            background: "var(--groen-licht)",
                            color: "var(--groen-donker)",
                          }}
                        >
                          {initialen}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                            {trainee.naam}
                          </p>
                          <p
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--grijs-500)",
                            }}
                          >
                            {trainee.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{ fontSize: "0.85rem", color: "var(--grijs-700)" }}
                    >
                      {startdatum}
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            background: "var(--grijs-200)",
                            borderRadius: "50px",
                            height: "6px",
                            minWidth: "80px",
                          }}
                        >
                          <div
                            style={{
                              width: `${voortgangPct}%`,
                              height: "100%",
                              background: "var(--groen)",
                              borderRadius: "50px",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: "var(--groen-donker)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {trainee.modulesGehaald} / {trainee.modulesOpPad}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "var(--grijs-700)",
                        }}
                      >
                        {trainee.modulesOpPad} modules
                      </span>
                    </td>
                    <td>
                      {trainee.gedetacheerd ? (
                        <span className="badge badge-oranje">
                          <span className="dot dot-oranje" />
                          Gedetacheerd
                        </span>
                      ) : (
                        <span className="badge badge-groen">
                          <span className="dot dot-groen" />
                          In dienst
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Hoofd export ──
export default function MijnTraineesBlok({ email }) {
  const [geselecteerdeTrainee, setGeselecteerdeTrainee] = useState(null);

  if (geselecteerdeTrainee) {
    return (
      <TraineeDetail
        trainee={geselecteerdeTrainee}
        onTerug={() => setGeselecteerdeTrainee(null)}
      />
    );
  }

  return (
    <TraineeOverzicht email={email} onSelecteer={setGeselecteerdeTrainee} />
  );
}
