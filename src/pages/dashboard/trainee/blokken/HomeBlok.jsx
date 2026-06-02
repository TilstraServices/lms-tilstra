import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

// Tevredenheid niveaus
const NIVEAUS = [
  {
    niveau: 1,
    label: "Zeer Ontevreden",
    kleur: "#C62828",
    achtergrond: "#FFEBEE",
  },
  { niveau: 2, label: "Ontevreden", kleur: "#F9A825", achtergrond: "#FFF3E0" },
  { niveau: 3, label: "Neutraal", kleur: "#959699", achtergrond: "#FFFDE7" },
  { niveau: 4, label: "Tevreden", kleur: "#a9bbab", achtergrond: "#E8F5E9" },
  {
    niveau: 5,
    label: "Zeer Tevreden",
    kleur: "#00b30c",
    achtergrond: "#E8F5E9",
  },
];

const SMILEY_PADEN = [
  "M92,152a12,12,0,1,1,12-12A12,12,0,0,1,92,152Zm72-24a12,12,0,1,0,12,12A12,12,0,0,0,164,128Zm68,0A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128ZM171.56,81.34,128,110.39l-43.56-29a8,8,0,1,0-8.88,13.32l48,32a8,8,0,0,0,8.88,0l48-32a8,8,0,0,0-8.88-13.32Zm-15.13,96C148,171.73,139.94,168,128,168s-20,3.73-28.43,9.34a8,8,0,0,0,8.86,13.32C114.93,186.34,120,184,128,184s13.07,2.34,19.57,6.66a8,8,0,1,0,8.86-13.32Z",
  "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm32-60a8,8,0,0,1-8,8c-10,0-15.06-6.74-18.4-11.2-3-4-3.92-4.8-5.6-4.8s-2.57.76-5.6,4.8C95.06,169.26,90,176,80,176a8,8,0,0,1,0-16c1.68,0,2.57-.76,5.6-4.8C88.94,150.74,94,144,104,144s15.06,6.74,18.4,11.2c3,4,3.92,4.8,5.6,4.8s2.57-.76,5.6-4.8c3.34-4.46,8.4-11.2,18.4-11.2s15.06,6.74,18.4,11.2c3,4,3.92,4.8,5.6,4.8A8,8,0,0,1,160,156ZM80,108a12,12,0,1,1,12,12A12,12,0,0,1,80,108Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,176,108Z",
  "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48-56a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,160ZM80,108a12,12,0,1,1,12,12A12,12,0,0,1,80,108Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,176,108Z",
  "M176,140a12,12,0,1,1-12-12A12,12,0,0,1,176,140ZM128,92a12,12,0,1,0-12,12A12,12,0,0,0,128,92Zm73-38A104,104,0,0,0,50.48,197.33,8,8,0,1,0,62.4,186.66a88,88,0,1,1,131.19,0,8,8,0,0,0,11.93,10.67A104,104,0,0,0,201,54ZM152,168H136c-21.74,0-48-17.84-48-40a41.33,41.33,0,0,1,.55-6.68,8,8,0,1,0-15.78-2.64A56.9,56.9,0,0,0,72,128c0,14.88,7.46,29.13,21,40.15C105.4,178.22,121.07,184,136,184h16a8,8,0,0,1,0,16H96a24,24,0,0,0,0,48,8,8,0,0,0,0-16,8,8,0,0,1,0-16h56a24,24,0,0,0,0-48Z",
  "M174.92,156c-10.29,17.79-27.39,28-46.92,28s-36.63-10.2-46.93-28a8,8,0,1,1,13.86-8c7.46,12.91,19.2,20,33.07,20s25.61-7.1,33.08-20a8,8,0,1,1,13.84,8ZM232,128a104.35,104.35,0,0,1-4.56,30.56,8,8,0,0,1-2,3.31l-63.57,63.57a7.9,7.9,0,0,1-3.3,2A104,104,0,1,1,232,128Zm-16,0a87.89,87.89,0,1,0-64,84.69L212.69,152A88.05,88.05,0,0,0,216,128ZM92,120a12,12,0,1,0-12-12A12,12,0,0,0,92,120Zm72-24a12,12,0,1,0,12,12A12,12,0,0,0,164,96Z",
];

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
  const [toonWijzigen, setToonWijzigen] = useState(false);
  const [nieuwNiveau, setNieuwNiveau] = useState(null);
  const [nieuweReden, setNieuweReden] = useState("");
  const [nieuwBericht, setNieuwBericht] = useState("");
  const [heeftVandaagBevestigd, setHeeftVandaagBevestigd] = useState(false);
  const [laden, setLaden] = useState(true);
  const [opgeslagen, setOpgeslagen] = useState(false);

  useEffect(() => {
    if (email) laadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  async function laadData() {
    setLaden(true);

    // Laad laatste evaluatie
    const { data: evalRows } = await supabase
      .from("evaluatie")
      .select("*")
      .eq("trainee_email", email)
      .order("aangemaakt_op", { ascending: false })
      .limit(1);

    const evalData = evalRows && evalRows.length > 0 ? evalRows[0] : null;

    if (evalData) {
      setEvaluatie(evalData);

      // Laad aantal bevestigingen voor deze evaluatie
      const { count } = await supabase
        .from("evaluatie_bevestiging")
        .select("*", { count: "exact", head: true })
        .eq("evaluatie_id", evalData.id);
      setAantalBevestigingen(count || 0);

      // Check of vandaag al bevestigd
      const vandaag = new Date().toISOString().split("T")[0];
      const { data: vandaagData } = await supabase
        .from("evaluatie_bevestiging")
        .select("id")
        .eq("evaluatie_id", evalData.id)
        .eq("trainee_email", email)
        .gte("aangemaakt_op", vandaag + "T00:00:00")
        .limit(1);
      setHeeftVandaagBevestigd(vandaagData && vandaagData.length > 0);
    }

    // Laad huidige module (laatste module_voortgang of eerste module)
    const { data: voortgangData } = await supabase
      .from("module_voortgang")
      .select("*, modules(naam)")
      .eq("trainee_email", email)
      .order("afgerond_op", { ascending: false })
      .limit(1);

    if (!voortgangData || voortgangData.length === 0) {
      // Geen voortgang — laad eerste module
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
        setHuidigModule({ naam: eersteModule.naam, voortgang: 0 });
    } else {
      setHuidigModule(voortgangData[0]);
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

    setToonWijzigen(false);
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
      <div className="kaart" style={{ borderLeft: "5px solid var(--groen)" }}>
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
          Welkom terug
        </p>
        <p
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "var(--groen-donker)",
          }}
        >
          {naam || email}
        </p>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        {/* Tevredenheidsblok */}
        <div className="kaart" style={{ padding: 0 }}>
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
              Mijn tevredenheid
            </p>
            <button
              onClick={() => setToonWijzigen(!toonWijzigen)}
              className="knop knop-ghost"
              style={{ fontSize: "0.78rem", padding: "4px 12px" }}
            >
              {toonWijzigen ? "Annuleren" : "Wijzigen"}
            </button>
          </div>

          <div style={{ padding: "20px 24px" }}>
            {!toonWijzigen ? (
              evaluatie ? (
                <div>
                  {/* Niveau indicator */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 16px",
                      borderRadius: "10px",
                      background: huidigNiveau?.achtergrond,
                      marginBottom: "12px",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>
                      <Smiley
                        niveau={evaluatie.niveau}
                        size={28}
                        kleur={huidigNiveau?.kleur}
                      />
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: huidigNiveau?.kleur,
                        fontSize: "0.95rem",
                      }}
                    >
                      {huidigNiveau?.label}
                    </span>
                  </div>

                  {/* Reden */}
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--grijs-700)",
                      marginBottom: "12px",
                      fontStyle: "italic",
                    }}
                  >
                    "{evaluatie.reden}"
                  </p>

                  {/* Thumbs-up */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <button
                      onClick={bevestig}
                      disabled={heeftVandaagBevestigd}
                      style={{
                        background: heeftVandaagBevestigd
                          ? "var(--grijs-200)"
                          : "var(--groen-licht)",
                        border: "none",
                        borderRadius: "50px",
                        padding: "6px 14px",
                        cursor: heeftVandaagBevestigd ? "default" : "pointer",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: heeftVandaagBevestigd
                          ? "var(--grijs-500)"
                          : "var(--groen-donker)",
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      👍{" "}
                      {heeftVandaagBevestigd
                        ? "Bevestigd vandaag"
                        : "Nog steeds zo"}
                    </button>
                    <span
                      style={{ fontSize: "0.82rem", color: "var(--grijs-500)" }}
                    >
                      {aantalBevestigingen}× bevestigd
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--grijs-500)",
                      marginBottom: "12px",
                    }}
                  >
                    Je hebt nog geen tevredenheidsniveau ingesteld.
                  </p>
                  <button
                    onClick={() => setToonWijzigen(true)}
                    className="knop knop-primair"
                    style={{ fontSize: "0.82rem" }}
                  >
                    Instellen
                  </button>
                </div>
              )
            ) : (
              // Wijzigen formulier
              <div>
                <p
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--grijs-700)",
                    marginBottom: "10px",
                  }}
                >
                  Kies een niveau
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "14px",
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
                        borderRadius: "8px",
                        padding: "8px 12px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        fontFamily: "Inter, sans-serif",
                        transition: "all 0.12s",
                      }}
                    >
                      <span style={{ fontSize: "1.3rem" }}>
                        <Smiley
                          niveau={n.niveau}
                          size={24}
                          kleur={
                            nieuwNiveau === n.niveau
                              ? n.kleur
                              : "var(--grijs-500)"
                          }
                        />
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
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
                    marginBottom: "12px",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.85rem",
                    resize: "vertical",
                    minHeight: "70px",
                  }}
                />

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
                  <span style={{ fontWeight: 400, color: "var(--grijs-500)" }}>
                    (optioneel)
                  </span>
                </label>
                <textarea
                  value={nieuwBericht}
                  onChange={(e) => setNieuwBericht(e.target.value)}
                  placeholder="Wil je iets kwijt aan je leidinggevende?"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--grijs-200)",
                    marginBottom: "14px",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.85rem",
                    resize: "vertical",
                    minHeight: "70px",
                  }}
                />

                <button
                  onClick={slaEvaluatieOp}
                  disabled={!nieuwNiveau || !nieuweReden.trim()}
                  className="knop knop-primair"
                  style={{ fontSize: "0.82rem" }}
                >
                  Opslaan
                </button>

                {opgeslagen && (
                  <span
                    style={{
                      marginLeft: "10px",
                      fontSize: "0.82rem",
                      color: "var(--groen)",
                    }}
                  >
                    ✓ Opgeslagen
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Voortgangsblok huidige module */}
        <div className="kaart" style={{ padding: 0 }}>
          <div
            style={{
              padding: "18px 24px 14px",
              borderBottom: "1px solid var(--grijs-200)",
            }}
          >
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--grijs-900)",
              }}
            >
              Huidige module
            </p>
          </div>
          <div style={{ padding: "20px 24px" }}>
            {huidigModule ? (
              <div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--grijs-900)",
                    marginBottom: "12px",
                  }}
                >
                  {huidigModule.naam || huidigModule.modules?.naam}
                </p>
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
                  Voortgang
                </p>
                <div className="vb-wrap" style={{ marginBottom: "8px" }}>
                  <div
                    className="vb"
                    style={{ width: `${huidigModule.voortgang || 0}%` }}
                  />
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--grijs-700)" }}>
                  {huidigModule.voortgang || 0}% voltooid
                </p>
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
