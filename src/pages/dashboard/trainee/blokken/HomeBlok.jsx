import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

const NIVEAUS = [
  {
    niveau: 1,
    label: "Zeer Ontevreden",
    kleur: "#C62828",
    achtergrond: "#FFEBEE",
  },
  { niveau: 2, label: "Nerveus", kleur: "#F9A825", achtergrond: "#FFF3E0" },
  { niveau: 3, label: "Neutraal", kleur: "#959699", achtergrond: "#FFFDE7" },
  { niveau: 4, label: "Tevreden?", kleur: "#a9bbab", achtergrond: "#E8F5E9" },
  {
    niveau: 5,
    label: "Zeer Tevreden",
    kleur: "#00b30c",
    achtergrond: "#E8F5E9",
  },
];

const SMILEY_PADEN = [
  "M92,152a12,12,0,1,1,12-12A12,12,0,0,1,92,152Zm72-24a12,12,0,1,0,12,12A12,12,0,0,0,164,128Zm68,0A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128ZM171.56,81.34,128,110.39l-43.56-29a8,8,0,1,0-8.88,13.32l48,32a8,8,0,0,0,8.88,0l48-32a8,8,0,0,0-8.88-13.32Zm-15.13,96C148,171.73,139.94,168,128,168s-20,3.73-28.43,9.34a8,8,0,0,0,8.86,13.32C114.93,186.34,120,184,128,184s13.07,2.34,19.57,6.66a8,8,0,1,0,8.86-13.32Z",
  "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM80,108a12,12,0,1,1,12,12A12,12,0,0,1,80,108Zm72,0a12,12,0,1,1,12,12A12,12,0,0,1,152,108Zm32,60a8,8,0,0,1-8,8c-10,0-15.06-6.74-18.4-11.2-3-4-3.92-4.8-5.6-4.8s-2.57.76-5.6,4.8C143.06,169.26,138,176,128,176s-15.06-6.74-18.4-11.2c-3-4-3.92-4.8-5.6-4.8s-2.57.76-5.6,4.8C95.06,169.26,90,176,80,176a8,8,0,0,1,0-16c1.68,0,2.57-.76,5.6-4.8C88.94,150.74,94,144,104,144s15.06,6.74,18.4,11.2c3,4,3.92,4.8,5.6,4.8s2.57-.76,5.6-4.8c3.34-4.46,8.4-11.2,18.4-11.2s15.06,6.74,18.4,11.2c3,4,3.92,4.8,5.6,4.8A8,8,0,0,1,184,168Z",
  "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48-56a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,160ZM80,108a12,12,0,1,1,12,12A12,12,0,0,1,80,108Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,176,108Z",
  "M176,140a12,12,0,1,1-12-12A12,12,0,0,1,176,140ZM128,92a12,12,0,1,0-12,12A12,12,0,0,0,128,92Zm73-38A104,104,0,0,0,50.48,197.33,8,8,0,1,0,62.4,186.66a88,88,0,1,1,131.19,0,8,8,0,0,0,11.93,10.67A104,104,0,0,0,201,54ZM152,168H136c-21.74,0-48-17.84-48-40a41.33,41.33,0,0,1,.55-6.68,8,8,0,1,0-15.78-2.64A56.9,56.9,0,0,0,72,128c0,14.88,7.46,29.13,21,40.15C105.4,178.22,121.07,184,136,184h16a8,8,0,0,1,0,16H96a24,24,0,0,0,0,48,8,8,0,0,0,0-16,8,8,0,0,1,0-16h56a24,24,0,0,0,0-48Z",
  "M174.92,156c-10.29,17.79-27.39,28-46.92,28s-36.63-10.2-46.93-28a8,8,0,1,1,13.86-8c7.46,12.91,19.2,20,33.07,20s25.61-7.1,33.08-20a8,8,0,1,1,13.84,8ZM232,128a104.35,104.35,0,0,1-4.56,30.56,8,8,0,0,1-2,3.31l-63.57,63.57a7.9,7.9,0,0,1-3.3,2A104,104,0,1,1,232,128Zm-16,0a87.89,87.89,0,1,0-64,84.69L212.69,152A88.05,88.05,0,0,0,216,128ZM92,120a12,12,0,1,0-12-12A12,12,0,0,0,92,120Zm72-24a12,12,0,1,0,12,12A12,12,0,0,0,164,96Z",
];

const MODULE_KLEUREN = {
  BKL: { primair: "#2E7D32", licht: "#E8F5E9", label: "BKL" },
  NMBRS: { primair: "#1565C0", licht: "#E3F2FD", label: "NMBRS" },
};

function Smiley({ niveau, size = 32, kleur = "currentColor" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      style={{ color: kleur, fill: kleur, flexShrink: 0 }}
    >
      <path d={SMILEY_PADEN[niveau - 1]} />
    </svg>
  );
}

export default function HomeBlok({ email, naam }) {
  const [evaluatie, setEvaluatie] = useState(null);
  const [aantalBevestigingen, setAantalBevestigingen] = useState(0);
  const [huidigModule, setHuidigModule] = useState(null);
  const [moduleScore, setModuleScore] = useState(null);
  const [toonDropdown, setToonDropdown] = useState(false);
  const [nieuwNiveau, setNieuwNiveau] = useState(null);
  const [nieuweReden, setNieuweReden] = useState("");
  const [nieuwBericht, setNieuwBericht] = useState("");
  const [heeftVandaagBevestigd, setHeeftVandaagBevestigd] = useState(false);
  const [laden, setLaden] = useState(true);
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [hoverBevestig, setHoverBevestig] = useState(false);

  useEffect(() => {
    if (email) laadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  async function laadData() {
    setLaden(true);

    // Evaluatie
    const { data: evalRows } = await supabase
      .from("evaluatie")
      .select("*")
      .eq("trainee_email", email)
      .order("aangemaakt_op", { ascending: false })
      .limit(1);
    const evalData = evalRows && evalRows.length > 0 ? evalRows[0] : null;

    if (evalData) {
      setEvaluatie(evalData);
      const vandaag = new Date().toISOString().split("T")[0];
      const [{ count }, { data: vandaagData }] = await Promise.all([
        supabase
          .from("evaluatie_bevestiging")
          .select("*", { count: "exact", head: true })
          .eq("evaluatie_id", evalData.id),
        supabase
          .from("evaluatie_bevestiging")
          .select("id")
          .eq("evaluatie_id", evalData.id)
          .eq("trainee_email", email)
          .gte("aangemaakt_op", vandaag + "T00:00:00")
          .limit(1),
      ]);
      setAantalBevestigingen(count || 0);
      setHeeftVandaagBevestigd(vandaagData && vandaagData.length > 0);
    }

    // Module
    const { data: voortgangData } = await supabase
      .from("module_voortgang")
      .select("*, modules(naam, categorie)")
      .eq("trainee_email", email)
      .order("voortgang", { ascending: false })
      .limit(1);

    if (!voortgangData || voortgangData.length === 0) {
      const { data: eersteModuleRows } = await supabase
        .from("modules")
        .select("*")
        .order("volgorde")
        .limit(1);
      const eersteModule =
        eersteModuleRows && eersteModuleRows.length > 0
          ? eersteModuleRows[0]
          : null;
      if (eersteModule)
        setHuidigModule({
          naam: eersteModule.naam,
          categorie: eersteModule.categorie,
          voortgang: 0,
        });
    } else {
      setHuidigModule(voortgangData[0]);

      // Gem. score voor deze module
      const moduleId = voortgangData[0].module_id;
      const { data: scoreData } = await supabase
        .from("scores")
        .select(
          "opgave_id, score, poging_nummer, opgaves(paragraaf_id, paragrafen(hoofdstuk_id, hoofdstukken(module_id)))",
        )
        .eq("trainee_email", email)
        .order("poging_nummer", { ascending: false });

      if (scoreData && scoreData.length > 0) {
        const laasteScoresMap = {};
        scoreData.forEach((s) => {
          if (!laasteScoresMap[s.opgave_id]) laasteScoresMap[s.opgave_id] = s;
        });
        const moduleScores = Object.values(laasteScoresMap).filter(
          (s) => s.opgaves?.paragrafen?.hoofdstukken?.module_id === moduleId,
        );
        if (moduleScores.length > 0) {
          const gem = Math.round(
            moduleScores.reduce((a, b) => a + b.score, 0) / moduleScores.length,
          );
          setModuleScore(gem);
        }
      }
    }

    setLaden(false);
  }

  async function slaEvaluatieOp() {
    if (!nieuwNiveau || !nieuweReden.trim()) return;
    await supabase.from("evaluatie").insert({
      trainee_email: email,
      niveau: nieuwNiveau,
      reden: nieuweReden,
      bericht: nieuwBericht || null,
    });
    setToonDropdown(false);
    setNieuwNiveau(null);
    setNieuweReden("");
    setNieuwBericht("");
    setOpgeslagen(true);
    setTimeout(() => setOpgeslagen(false), 3000);
    laadData();
  }

  async function bevestig() {
    if (heeftVandaagBevestigd || !evaluatie) return;
    await supabase.from("evaluatie_bevestiging").insert({
      evaluatie_id: evaluatie.id,
      trainee_email: email,
    });
    setHeeftVandaagBevestigd(true);
    setAantalBevestigingen((prev) => prev + 1);
  }

  const huidigNiveau = NIVEAUS.find((n) => n.niveau === evaluatie?.niveau);
  const moduleCat =
    MODULE_KLEUREN[
      huidigModule?.categorie || huidigModule?.modules?.categorie
    ] || MODULE_KLEUREN.BKL;
  const initialen = naam
    ? naam.substring(0, 2).toUpperCase()
    : email
      ? email.substring(0, 2).toUpperCase()
      : "??";

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
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Welkomstblok */}
      <div
        style={{
          background: "var(--groen-licht)",
          border: "2px dashed var(--groen)",
          borderRadius: "var(--radius)",
          padding: "20px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--groen-donker)",
            marginBottom: "2px",
          }}
        >
          Welkom terug
        </p>
        <p
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "var(--groen-donker)",
            marginBottom: "12px",
          }}
        >
          {naam || email}
        </p>
        <div
          className="zwevend"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            fill="var(--groen)"
            viewBox="0 0 256 256"
          >
            <path d="M112,116a12,12,0,1,1-12-12A12,12,0,0,1,112,116Zm44-12a12,12,0,1,0,12,12A12,12,0,0,0,156,104Zm68,16v96a8,8,0,0,1-13.07,6.19l-24.26-19.85L162.4,222.19a8,8,0,0,1-10.13,0L128,202.34l-24.27,19.85a8,8,0,0,1-10.13,0L69.33,202.34,45.07,222.19A8,8,0,0,1,32,216V120a96,96,0,0,1,192,0Zm-16,0a80,80,0,0,0-160,0v79.12l16.27-13.31a8,8,0,0,1,10.13,0l24.27,19.85,24.26-19.85a8,8,0,0,1,10.14,0l24.26,19.85,24.27-19.85a8,8,0,0,1,10.13,0L208,199.12Z" />
          </svg>
        </div>
      </div>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        {/* Avatar + tevredenheidsblok */}
        <div className="kaart" style={{ padding: 0, position: "relative" }}>
          <div style={{ padding: "20px 24px" }}>
            {evaluatie ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  alignItems: "center",
                }}
              >
                {/* Avatar */}
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: "96px",
                      height: "96px",
                      borderRadius: "50%",
                      background: huidigNiveau?.achtergrond,
                      border: `3px solid ${huidigNiveau?.kleur}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      color: "var(--groen-donker)",
                    }}
                  >
                    {initialen}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      background: "white",
                      borderRadius: "50%",
                      padding: "3px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                    }}
                  >
                    <Smiley
                      niveau={evaluatie.niveau}
                      size={26}
                      kleur={huidigNiveau?.kleur}
                    />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "var(--grijs-900)",
                  }}
                >
                  {naam || email}
                </p>
                <div
                  style={{
                    background: "var(--groen-licht)",
                    border: "1px solid var(--groen)",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    width: "100%",
                  }}
                >
                  {/* Status + thumbs-up op één rij */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <Smiley
                      niveau={evaluatie.niveau}
                      size={20}
                      kleur={huidigNiveau?.kleur}
                    />
                    <p
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: huidigNiveau?.kleur,
                        flex: 1,
                      }}
                    >
                      {huidigNiveau?.label}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <button
                        onClick={bevestig}
                        disabled={heeftVandaagBevestigd}
                        onMouseEnter={() =>
                          !heeftVandaagBevestigd && setHoverBevestig(true)
                        }
                        onMouseLeave={() => setHoverBevestig(false)}
                        style={{
                          width: "32px",
                          height: "32px",
                          background: heeftVandaagBevestigd
                            ? "#FFEBEE"
                            : hoverBevestig
                              ? "#FFEBEE"
                              : "white",
                          border: `1px solid ${heeftVandaagBevestigd ? "#C62828" : hoverBevestig ? "#C62828" : "var(--groen)"}`,
                          borderRadius: "6px",
                          cursor: heeftVandaagBevestigd ? "default" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1rem",
                          transition: "background 0.15s, border 0.15s",
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 256 256"
                          fill="#C62828"
                        >
                          <path d="M183.89,153.34a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68ZM216,144a88,88,0,0,1-176,0c0-27.92,11-56.47,32.66-84.85a8,8,0,0,1,11.93-.89l24.12,23.41,22-60.41a8,8,0,0,1,12.63-3.41C165.21,36,216,84.55,216,144Zm-16,0c0-46.09-35.79-85.92-58.21-106.33L119.52,98.74a8,8,0,0,1-13.09,3L80.06,76.16C64.09,99.21,56,122,56,144a72,72,0,0,0,144,0Z" />
                        </svg>
                      </button>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--grijs-500)",
                          marginTop: "2px",
                        }}
                      >
                        {aantalBevestigingen}
                      </span>
                    </div>
                  </div>
                  <hr
                    style={{
                      border: "none",
                      borderTop: "1px solid var(--groen)",
                      margin: "8px 0",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--groen-donker)",
                      fontStyle: "italic",
                    }}
                  >
                    "{evaluatie.reden}"
                  </p>
                </div>

                {/* Nieuwe evaluatie knop */}
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-start",
                  }}
                >
                  <button
                    onClick={() => setToonDropdown(!toonDropdown)}
                    style={{
                      background: "var(--grijs-100)",
                      border: "1px solid var(--grijs-200)",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--grijs-700)",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    + Nieuwe evaluatie
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "96px",
                    height: "96px",
                    borderRadius: "50%",
                    background: "var(--grijs-200)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "var(--grijs-700)",
                  }}
                >
                  {initialen}
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--grijs-500)",
                    textAlign: "center",
                  }}
                >
                  Nog geen tevredenheidsniveau ingesteld.
                </p>
                <button
                  onClick={() => setToonDropdown(true)}
                  className="knop knop-primair"
                  style={{ fontSize: "0.82rem" }}
                >
                  Instellen
                </button>
              </div>
            )}
          </div>

          {/* Dropdown voor wijzigen — spreidt zich uit over het gehele dashboard */}
          {toonDropdown && (
            <div
              className="uitklap-animatie"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "calc(200% + 16px)", // spans beide kolommen
                background: "white",
                border: "1px solid var(--grijs-200)",
                borderRadius: "var(--radius)",
                boxShadow: "var(--schaduw)",
                padding: "24px",
                zIndex: 50,
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "var(--grijs-900)",
                  }}
                >
                  Tevredenheidsniveau aanpassen
                </p>
                <button
                  onClick={() => {
                    setToonDropdown(false);
                    setNieuwNiveau(null);
                    setNieuweReden("");
                    setNieuwBericht("");
                  }}
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

              {/* Niveau knoppen */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                {NIVEAUS.map((n) => (
                  <button
                    key={n.niveau}
                    onClick={() => setNieuwNiveau(n.niveau)}
                    style={{
                      background:
                        nieuwNiveau === n.niveau
                          ? n.achtergrond
                          : "var(--grijs-100)",
                      border: `2px solid ${nieuwNiveau === n.niveau ? n.kleur : "var(--grijs-200)"}`,
                      borderRadius: "10px",
                      padding: "12px 16px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      fontFamily: "Inter, sans-serif",
                      transition: "all 0.12s",
                      minWidth: "90px",
                    }}
                  >
                    <Smiley
                      niveau={n.niveau}
                      size={28}
                      kleur={
                        nieuwNiveau === n.niveau ? n.kleur : "var(--grijs-400)"
                      }
                    />
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color:
                          nieuwNiveau === n.niveau
                            ? n.kleur
                            : "var(--grijs-500)",
                      }}
                    >
                      {n.label}
                    </span>
                  </button>
                ))}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--grijs-700)",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Reden <span style={{ color: "var(--rood)" }}>*</span>
                  </label>
                  <textarea
                    value={nieuweReden}
                    onChange={(e) => setNieuweReden(e.target.value)}
                    placeholder="Waarom kies je dit niveau?"
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--grijs-200)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.85rem",
                      resize: "vertical",
                      minHeight: "80px",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--grijs-700)",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Bericht aan leidinggevende{" "}
                    <span
                      style={{ fontWeight: 400, color: "var(--grijs-500)" }}
                    >
                      (optioneel)
                    </span>
                  </label>
                  <textarea
                    value={nieuwBericht}
                    onChange={(e) => setNieuwBericht(e.target.value)}
                    placeholder="Wil je iets kwijt?"
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--grijs-200)",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.85rem",
                      resize: "vertical",
                      minHeight: "80px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <button
                  onClick={slaEvaluatieOp}
                  disabled={!nieuwNiveau || !nieuweReden.trim()}
                  className="knop knop-primair"
                  style={{ fontSize: "0.85rem" }}
                >
                  Opslaan
                </button>
                <button
                  onClick={() => {
                    setToonDropdown(false);
                    setNieuwNiveau(null);
                    setNieuweReden("");
                    setNieuwBericht("");
                  }}
                  className="knop knop-ghost"
                  style={{ fontSize: "0.85rem" }}
                >
                  Annuleren
                </button>
                {opgeslagen && (
                  <span style={{ fontSize: "0.82rem", color: "var(--groen)" }}>
                    ✓ Opgeslagen
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Module blok */}
        <div
          className="kaart"
          style={{ padding: 0, borderLeft: `5px solid ${moduleCat.primair}` }}
        >
          <div
            style={{
              padding: "18px 24px 14px",
              borderBottom: "1px solid var(--grijs-200)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--grijs-900)",
              }}
            >
              Actieve module
            </p>
            {huidigModule && (
              <span
                style={{
                  background: moduleCat.licht,
                  color: moduleCat.primair,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: "50px",
                }}
              >
                {moduleCat.label}
              </span>
            )}
          </div>

          <div style={{ padding: "20px 24px" }}>
            {huidigModule ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {/* Naam */}
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "var(--grijs-900)",
                  }}
                >
                  {huidigModule.naam || huidigModule.modules?.naam}
                </p>

                {/* Stats grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
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
                        marginBottom: "4px",
                      }}
                    >
                      Voortgang
                    </p>
                    <div className="vb-wrap" style={{ marginBottom: "4px" }}>
                      <div
                        className="vb"
                        style={{
                          width: `${huidigModule.voortgang || 0}%`,
                          background: moduleCat.primair,
                        }}
                      />
                    </div>
                    <p
                      style={{ fontSize: "0.82rem", color: "var(--grijs-700)" }}
                    >
                      {huidigModule.voortgang || 0}%
                    </p>
                  </div>
                  <div>
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
                        fontSize: "1.3rem",
                        fontWeight: 700,
                        color:
                          moduleScore !== null
                            ? moduleScore >= 70
                              ? "var(--groen)"
                              : "var(--rood)"
                            : "var(--grijs-500)",
                      }}
                    >
                      {moduleScore !== null ? `${moduleScore}%` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "0.85rem", color: "var(--grijs-500)" }}>
                Nog geen module gestart.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
