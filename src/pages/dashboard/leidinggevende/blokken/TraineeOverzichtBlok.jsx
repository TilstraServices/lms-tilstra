import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  { niveau: 4, label: "Tevreden", kleur: "#a9bbab", achtergrond: "#E8F5E9" },
  {
    niveau: 5,
    label: "Zeer Tevreden",
    kleur: "#00b30c",
    achtergrond: "#E8F5E9",
  },
];

const CATEGORIE_KLEUREN = {
  BKL: "#2E7D32",
  NMBRS: "#1565C0",
  Excel: "#1B5E20",
  Onboarding: "#E65100",
  Algemeen: "#5D4037",
};

const SMILEY_PADEN = [
  "M92,152a12,12,0,1,1,12-12A12,12,0,0,1,92,152Zm72-24a12,12,0,1,0,12,12A12,12,0,0,0,164,128Zm68,0A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128ZM171.56,81.34,128,110.39l-43.56-29a8,8,0,1,0-8.88,13.32l48,32a8,8,0,0,0,8.88,0l48-32a8,8,0,0,0-8.88-13.32Zm-15.13,96C148,171.73,139.94,168,128,168s-20,3.73-28.43,9.34a8,8,0,0,0,8.86,13.32C114.93,186.34,120,184,128,184s13.07,2.34,19.57,6.66a8,8,0,1,0,8.86-13.32Z",
  "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM80,108a12,12,0,1,1,12,12A12,12,0,0,1,80,108Zm72,0a12,12,0,1,1,12,12A12,12,0,0,1,152,108Zm32,60a8,8,0,0,1-8,8c-10,0-15.06-6.74-18.4-11.2-3-4-3.92-4.8-5.6-4.8s-2.57.76-5.6,4.8C143.06,169.26,138,176,128,176s-15.06-6.74-18.4-11.2c-3-4-3.92-4.8-5.6-4.8s-2.57.76-5.6,4.8C95.06,169.26,90,176,80,176a8,8,0,0,1,0-16c1.68,0,2.57-.76,5.6-4.8C88.94,150.74,94,144,104,144s15.06,6.74,18.4,11.2c3,4,3.92,4.8,5.6,4.8s2.57-.76,5.6-4.8c3.34-4.46,8.4-11.2,18.4-11.2s15.06,6.74,18.4,11.2c3,4,3.92,4.8,5.6,4.8A8,8,0,0,1,184,168Z",
  "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48-56a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,160ZM80,108a12,12,0,1,1,12,12A12,12,0,0,1,80,108Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,176,108Z",
  "M176,140a12,12,0,1,1-12-12A12,12,0,0,1,176,140ZM128,92a12,12,0,1,0-12,12A12,12,0,0,0,128,92Zm73-38A104,104,0,0,0,50.48,197.33,8,8,0,1,0,62.4,186.66a88,88,0,1,1,131.19,0,8,8,0,0,0,11.93,10.67A104,104,0,0,0,201,54ZM152,168H136c-21.74,0-48-17.84-48-40a41.33,41.33,0,0,1,.55-6.68,8,8,0,1,0-15.78-2.64A56.9,56.9,0,0,0,72,128c0,14.88,7.46,29.13,21,40.15C105.4,178.22,121.07,184,136,184h16a8,8,0,0,1,0,16H96a24,24,0,0,0,0,48,8,8,0,0,0,0-16,8,8,0,0,1,0-16h56a24,24,0,0,0,0-48Z",
  "M174.92,156c-10.29,17.79-27.39,28-46.92,28s-36.63-10.2-46.93-28a8,8,0,1,1,13.86-8c7.46,12.91,19.2,20,33.07,20s25.61-7.1,33.08-20a8,8,0,1,1,13.84,8ZM232,128a104.35,104.35,0,0,1-4.56,30.56,8,8,0,0,1-2,3.31l-63.57,63.57a7.9,7.9,0,0,1-3.3,2A104,104,0,1,1,232,128Zm-16,0a87.89,87.89,0,1,0-64,84.69L212.69,152A88.05,88.05,0,0,0,216,128ZM92,120a12,12,0,1,0-12-12A12,12,0,0,0,92,120Zm72-24a12,12,0,1,0,12,12A12,12,0,0,0,164,96Z",
];

function Smiley({ niveau, size = 24, kleur = "currentColor" }) {
  if (!niveau || niveau < 1 || niveau > 5) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      style={{ fill: kleur, flexShrink: 0 }}
    >
      <path d={SMILEY_PADEN[niveau - 1]} />
    </svg>
  );
}

function getNiveau(n) {
  return NIVEAUS.find((o) => o.niveau === n) || NIVEAUS[2];
}

function StatBlok({ icoon, label, waarde, kleur, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        border: "1px solid var(--grijs-200)",
        borderRadius: "10px",
        padding: "16px 20px",
        boxShadow: "var(--schaduw)",
        flex: 1,
        cursor: onClick ? "pointer" : "default",
        borderTop: `3px solid ${kleur || "var(--groen)"}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <span style={{ color: kleur || "var(--groen)" }}>{icoon}</span>
        <p
          style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--grijs-500)",
          }}
        >
          {label}
        </p>
      </div>
      <p
        style={{
          fontSize: "1.6rem",
          fontWeight: 700,
          color: kleur || "var(--groen-donker)",
        }}
      >
        {waarde}
      </p>
    </div>
  );
}

function EvaluatieModal({ trainee, onSluit, onGelezen }) {
  const [uitgeklapt, setUitgeklapt] = useState(null);

  useEffect(() => {
    async function markeerGelezen() {
      await supabase
        .from("evaluatie")
        .update({ gelezen: true })
        .eq("trainee_email", trainee.email)
        .eq("gelezen", false);
      onGelezen(trainee.email);
    }
    markeerGelezen();
  }, [trainee.email, onGelezen]);

  const evaluatie = trainee.evaluatie;
  const geschiedenis = trainee.evaluatieGeschiedenis || [];
  const niveauOptie = getNiveau(evaluatie?.niveau);

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
          maxHeight: "80vh",
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
          <p style={{ fontWeight: 700, fontSize: "1rem" }}>
            Evaluatie van {trainee.naam}
          </p>
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Smiley
              niveau={evaluatie?.niveau}
              size={32}
              kleur={niveauOptie.kleur}
            />
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: niveauOptie.kleur,
              }}
            >
              {niveauOptie.label}
            </span>
          </div>
          {trainee.bevestigingen > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="13" height="13" viewBox="0 0 256 256" fill="#C62828">
                <path d="M183.89,153.34a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68ZM216,144a88,88,0,0,1-176,0c0-27.92,11-56.47,32.66-84.85a8,8,0,0,1,11.93-.89l24.12,23.41,22-60.41a8,8,0,0,1,12.63-3.41C165.21,36,216,84.55,216,144Zm-16,0c0-46.09-35.79-85.92-58.21-106.33L119.52,98.74a8,8,0,0,1-13.09,3L80.06,76.16C64.09,99.21,56,122,56,144a72,72,0,0,0,144,0Z" />
              </svg>
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#C62828",
                }}
              >
                {trainee.bevestigingen}x bevestigd
              </span>
            </div>
          )}
        </div>
        {evaluatie?.reden && (
          <div
            style={{
              background: "var(--grijs-100)",
              borderRadius: "8px",
              padding: "12px 14px",
              marginBottom: "12px",
            }}
          >
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--grijs-500)",
                marginBottom: "4px",
                textTransform: "uppercase",
              }}
            >
              Reden
            </p>
            <p
              style={{
                fontSize: "0.88rem",
                color: "var(--grijs-700)",
                lineHeight: 1.6,
                textAlign: "left",
              }}
            >
              {evaluatie.reden}
            </p>
          </div>
        )}
        {evaluatie?.bericht && (
          <div
            style={{
              background: "#FFF3E0",
              borderRadius: "8px",
              padding: "12px 14px",
              marginBottom: "12px",
              border: "1px solid #FFE0B2",
            }}
          >
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#E65100",
                marginBottom: "4px",
                textTransform: "uppercase",
              }}
            >
              Privébericht
            </p>
            <p
              style={{
                fontSize: "0.88rem",
                color: "var(--grijs-700)",
                lineHeight: 1.6,
                textAlign: "left",
              }}
            >
              {evaluatie.bericht}
            </p>
          </div>
        )}
        {geschiedenis.length > 0 && (
          <div
            style={{
              marginTop: "16px",
              borderTop: "1px solid var(--grijs-200)",
              paddingTop: "16px",
            }}
          >
            <p
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--grijs-500)",
                marginBottom: "12px",
              }}
            >
              Tijdlijn
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {geschiedenis.map((e, index) => {
                const optie = getNiveau(e.niveau);
                const isUitgeklapt = uitgeklapt === index;
                return (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: optie.kleur,
                          marginTop: "4px",
                        }}
                      />
                      {index < geschiedenis.length - 1 && (
                        <div
                          style={{
                            width: "2px",
                            flex: 1,
                            background: "var(--grijs-200)",
                            marginTop: "4px",
                            minHeight: "20px",
                          }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <div
                          style={{
                            background: optie.achtergrond,
                            border: `1px solid ${optie.kleur}40`,
                            borderRadius: "6px",
                            padding: "2px",
                            display: "flex",
                          }}
                        >
                          <Smiley
                            niveau={e.niveau}
                            size={16}
                            kleur={optie.kleur}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            color: optie.kleur,
                          }}
                        >
                          {optie.label}
                        </span>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--grijs-500)",
                            marginLeft: "auto",
                          }}
                        >
                          {new Date(e.aangemaakt_op).toLocaleDateString(
                            "nl-NL",
                            { day: "numeric", month: "long", year: "numeric" },
                          )}
                        </span>
                      </div>
                      {e.reden && (
                        <div
                          onClick={() =>
                            setUitgeklapt(isUitgeklapt ? null : index)
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <p
                            style={{
                              fontSize: "0.82rem",
                              color: "var(--grijs-700)",
                              lineHeight: 1.5,
                              overflow: isUitgeklapt ? "visible" : "hidden",
                              whiteSpace: isUitgeklapt ? "normal" : "nowrap",
                              textOverflow: isUitgeklapt ? "unset" : "ellipsis",
                            }}
                          >
                            {e.reden}
                          </p>
                          {!isUitgeklapt && e.reden.length > 60 && (
                            <span
                              style={{
                                fontSize: "0.72rem",
                                color: "var(--groen)",
                                fontWeight: 600,
                              }}
                            >
                              Meer lezen
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {evaluatie?.aangemaakt_op && (
          <p
            style={{
              fontSize: "0.72rem",
              color: "var(--grijs-500)",
              marginTop: "8px",
            }}
          >
            {new Date(evaluatie.aangemaakt_op).toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>
    </div>
  );
}

function ActiviteitModal({ trainee, onSluit }) {
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
      onClick={onSluit}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          width: "400px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <p style={{ fontWeight: 700, fontSize: "1rem" }}>
            Laatste activiteit — {trainee.naam}
          </p>
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
        {trainee.activiteit ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{
                background: "var(--grijs-100)",
                borderRadius: "8px",
                padding: "12px 14px",
              }}
            >
              <p
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--grijs-500)",
                  marginBottom: "4px",
                }}
              >
                Hoofdstuk
              </p>
              <p
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "var(--grijs-900)",
                }}
              >
                {trainee.activiteit.hoofdstuk_naam}
              </p>
            </div>
            <div
              style={{
                background: "var(--grijs-100)",
                borderRadius: "8px",
                padding: "12px 14px",
              }}
            >
              <p
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--grijs-500)",
                  marginBottom: "4px",
                }}
              >
                Paragraaf
              </p>
              <p
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "var(--grijs-900)",
                }}
              >
                {trainee.activiteit.paragraaf_naam}
              </p>
            </div>
            <div
              style={{
                background: "var(--grijs-100)",
                borderRadius: "8px",
                padding: "12px 14px",
              }}
            >
              <p
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--grijs-500)",
                  marginBottom: "4px",
                }}
              >
                Datum
              </p>
              <p
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "var(--grijs-900)",
                }}
              >
                {new Date(trainee.activiteit.aangemaakt_op).toLocaleDateString(
                  "nl-NL",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </p>
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--grijs-500)", fontSize: "0.85rem" }}>
            Nog geen activiteit geregistreerd.
          </p>
        )}
      </div>
    </div>
  );
}

export default function TraineeOverzichtBlok({ email }) {
  const navigate = useNavigate();
  const [trainees, setTrainees] = useState([]);
  const [totaalAfgerond, setTotaalAfgerond] = useState(0);
  const [ongelezen, setOngelezen] = useState(0);
  const [laden, setLaden] = useState(true);
  const [geselecteerdeEvaluatie, setGeselecteerdeEvaluatie] = useState(null);
  const [geselecteerdeActiviteit, setGeselecteerdeActiviteit] = useState(null);

  useEffect(() => {
    async function laadData() {
      if (!email) return;
      setLaden(true);

      const { data: koppelingen } = await supabase
        .from("koppeling")
        .select("trainee_email")
        .eq("leidinggevende_email", email);

      if (!koppelingen || koppelingen.length === 0) {
        setLaden(false);
        return;
      }

      const traineeEmails = koppelingen.map((k) => k.trainee_email);

      const [
        gebruikersRes,
        voortgangRes,
        evaluatiesRes,
        bevestigingenRes,
        activiteitRes,
      ] = await Promise.all([
        supabase
          .from("gebruikers")
          .select("naam, email")
          .in("email", traineeEmails),
        supabase
          .from("module_voortgang")
          .select(
            "trainee_email, module_id, voortgang, gem_score, bijgewerkt_op",
          )
          .in("trainee_email", traineeEmails),
        supabase
          .from("evaluatie")
          .select(
            "id, trainee_email, niveau, reden, bericht, gelezen, aangemaakt_op",
          )
          .in("trainee_email", traineeEmails)
          .order("aangemaakt_op", { ascending: false }),
        supabase
          .from("evaluatie_bevestiging")
          .select("evaluatie_id")
          .in("trainee_email", traineeEmails),
        supabase.rpc("laatste_activiteit", { trainee_emails: traineeEmails }),
      ]);

      const moduleIds = [
        ...new Set((voortgangRes.data || []).map((v) => v.module_id)),
      ];
      const { data: modulesData } = await supabase
        .from("modules")
        .select("id, naam, categorie")
        .in("id", moduleIds);
      const moduleMap = {};
      (modulesData || []).forEach(
        (m) => (moduleMap[m.id] = { naam: m.naam, categorie: m.categorie }),
      );

      const voortgangPerTrainee = {};
      (voortgangRes.data || []).forEach((v) => {
        if (
          !voortgangPerTrainee[v.trainee_email] ||
          new Date(v.bijgewerkt_op) >
            new Date(voortgangPerTrainee[v.trainee_email].bijgewerkt_op)
        ) {
          voortgangPerTrainee[v.trainee_email] = {
            ...v,
            naam: moduleMap[v.module_id]?.naam || "Onbekend",
            categorie: moduleMap[v.module_id]?.categorie || null,
          };
        }
      });

      const evaluatiePerTrainee = {};
      (evaluatiesRes.data || []).forEach((e) => {
        if (!evaluatiePerTrainee[e.trainee_email]) {
          evaluatiePerTrainee[e.trainee_email] = [e];
        } else if (evaluatiePerTrainee[e.trainee_email].length < 3) {
          evaluatiePerTrainee[e.trainee_email].push(e);
        }
      });

      const bevestigingenPerEvaluatie = {};
      (bevestigingenRes.data || []).forEach((b) => {
        bevestigingenPerEvaluatie[b.evaluatie_id] =
          (bevestigingenPerEvaluatie[b.evaluatie_id] || 0) + 1;
      });

      const activiteitPerTrainee = {};
      (activiteitRes.data || []).forEach((a) => {
        activiteitPerTrainee[a.trainee_email] = a;
      });

      const afgerond = (voortgangRes.data || []).filter(
        (v) => v.voortgang >= 100,
      ).length;
      setTotaalAfgerond(afgerond);

      const ongelezen_count = (evaluatiesRes.data || []).filter(
        (e) => !e.gelezen,
      ).length;
      setOngelezen(ongelezen_count);

      const gecombineerd = (gebruikersRes.data || []).map((g) => ({
        naam: g.naam,
        email: g.email,
        actieveModule: voortgangPerTrainee[g.email] || null,
        evaluatie: evaluatiePerTrainee[g.email]?.[0] || null,
        evaluatieGeschiedenis: evaluatiePerTrainee[g.email] || [],
        bevestigingen:
          bevestigingenPerEvaluatie[evaluatiePerTrainee[g.email]?.[0]?.id] || 0,
        activiteit: activiteitPerTrainee[g.email] || null,
      }));

      setTrainees(gecombineerd);
      setLaden(false);
    }

    laadData();

    const kanaal = supabase
      .channel("leidinggevende-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "evaluatie" },
        () => laadData(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "evaluatie" },
        () => laadData(),
      )
      .subscribe();

    return () => supabase.removeChannel(kanaal);
  }, [email]);

  function markeerEvaluatieGelezen(traineeEmail) {
    setTrainees((prev) =>
      prev.map((t) =>
        t.email === traineeEmail && t.evaluatie
          ? { ...t, evaluatie: { ...t.evaluatie, gelezen: true } }
          : t,
      ),
    );
    setOngelezen((v) => Math.max(0, v - 1));
  }

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
      {/* Stat blokken */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "28px" }}>
        <StatBlok
          icoon={
            <svg
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.43a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.49A8,8,0,0,1,250.14,206.7Z" />
            </svg>
          }
          label="Trainees"
          waarde={trainees.length}
          kleur="var(--groen)"
        />
        <StatBlok
          icoon={
            <svg
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.63-16h45.26A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z" />
            </svg>
          }
          label="Ongelezen evaluaties"
          waarde={ongelezen}
          kleur={ongelezen > 0 ? "#C62828" : "var(--grijs-500)"}
        />
        <StatBlok
          icoon={
            <svg
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
            </svg>
          }
          label="Afgeronde modules"
          waarde={totaalAfgerond}
          kleur="var(--groen)"
        />
        <StatBlok
          icoon={
            <svg
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216ZM184,96a8,8,0,0,1-8,8H136v40a8,8,0,0,1-16,0V104H80a8,8,0,0,1,0-16h40V48a8,8,0,0,1,16,0V88h40A8,8,0,0,1,184,96Z" />
            </svg>
          }
          label="Beheerdashboard"
          waarde="→ Ga naar"
          kleur="#1565C0"
          onClick={() => navigate("/dashboard/beheer")}
        />
      </div>

      {trainees.length === 0 ? (
        <p style={{ color: "var(--grijs-500)", fontSize: "0.85rem" }}>
          Geen trainees gekoppeld.
        </p>
      ) : (
        <>
          {/* Module tabel */}
          <p
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--grijs-500)",
              marginBottom: "12px",
            }}
          >
            Mijn trainees
          </p>
          <div
            style={{
              background: "white",
              border: "1px solid var(--grijs-200)",
              borderRadius: "10px",
              boxShadow: "var(--schaduw)",
              overflow: "hidden",
              marginBottom: "28px",
            }}
          >
            <table className="tabel" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: "24px" }}>Naam</th>
                  <th>Actieve module</th>
                  <th>Voortgang</th>
                  <th>Gem. score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {trainees.map((trainee) => {
                  const m = trainee.actieveModule;
                  const isAfgerond = m?.voortgang >= 100;
                  const nietGestart = !m;
                  const initialen = trainee.naam
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <tr
                      key={trainee.email}
                      onClick={() => setGeselecteerdeActiviteit(trainee)}
                      style={{
                        borderLeft: `4px solid ${CATEGORIE_KLEUREN[m?.categorie] || "transparent"}`,
                        cursor: "pointer",
                        opacity: isAfgerond ? 0.45 : 1,
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
                      <td>
                        {m ? (
                          <span
                            style={{
                              background: "var(--blauw-licht)",
                              color: "var(--blauw)",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              padding: "3px 10px",
                              borderRadius: "50px",
                            }}
                          >
                            {m.naam}
                          </span>
                        ) : (
                          <span style={{ color: "var(--grijs-500)" }}>—</span>
                        )}
                      </td>
                      <td style={{ minWidth: "200px" }}>
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
                            }}
                          >
                            <div
                              style={{
                                width: `${m?.voortgang || 0}%`,
                                height: "100%",
                                background: isAfgerond
                                  ? "var(--groen)"
                                  : "var(--blauw)",
                                borderRadius: "50px",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              color: "var(--grijs-700)",
                              minWidth: "36px",
                              textAlign: "right",
                            }}
                          >
                            {m?.voortgang || 0}%
                          </span>
                        </div>
                      </td>
                      <td>
                        {m?.gem_score !== null && m?.gem_score !== undefined ? (
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "0.88rem",
                              color:
                                m.gem_score >= 70 ? "var(--groen)" : "#C62828",
                            }}
                          >
                            {m.gem_score}%
                          </span>
                        ) : (
                          <span style={{ color: "var(--grijs-500)" }}>—</span>
                        )}
                      </td>
                      <td>
                        {nietGestart ? (
                          <span className="badge badge-grijs">
                            <span className="dot dot-grijs" />
                            Niet gestart
                          </span>
                        ) : isAfgerond ? (
                          <span className="badge badge-groen">
                            <span className="dot dot-groen" />
                            Afgerond
                          </span>
                        ) : (
                          <span className="badge badge-oranje">
                            <span className="dot dot-oranje" />
                            Bezig
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Evaluatie tabel */}
          <p
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--grijs-500)",
              marginBottom: "12px",
            }}
          >
            Evaluaties
          </p>
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
                  <th>Tevredenheid</th>
                  <th>Reden</th>
                  <th>Privébericht</th>
                </tr>
              </thead>
              <tbody>
                {trainees.map((trainee) => {
                  const evaluatie = trainee.evaluatie;
                  const niveauOptie = evaluatie
                    ? getNiveau(evaluatie.niveau)
                    : null;
                  const initialen = trainee.naam
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const heeftBericht =
                    evaluatie?.bericht && evaluatie.bericht.trim() !== "";

                  return (
                    <tr
                      key={trainee.email}
                      onClick={() =>
                        evaluatie && setGeselecteerdeEvaluatie(trainee)
                      }
                      style={{ cursor: evaluatie ? "pointer" : "default" }}
                    >
                      <td style={{ paddingLeft: "24px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div style={{ position: "relative" }}>
                            <div
                              className="avatar"
                              style={{
                                background: "var(--groen-licht)",
                                color: "var(--groen-donker)",
                              }}
                            >
                              {initialen}
                            </div>
                            {evaluatie && !evaluatie.gelezen && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "-3px",
                                  right: "-3px",
                                  width: "9px",
                                  height: "9px",
                                  borderRadius: "50%",
                                  background: "#C62828",
                                  border: "2px solid white",
                                }}
                              />
                            )}
                          </div>
                          <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                            {trainee.naam}
                          </p>
                        </div>
                      </td>
                      <td>
                        {niveauOptie ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                background: niveauOptie.achtergrond,
                                border: `1px solid ${niveauOptie.kleur}40`,
                                borderRadius: "6px",
                                padding: "3px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Smiley
                                niveau={evaluatie.niveau}
                                size={20}
                                kleur={niveauOptie.kleur}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                color: niveauOptie.kleur,
                              }}
                            >
                              {niveauOptie.label}
                            </span>
                          </div>
                        ) : (
                          <span
                            style={{
                              color: "var(--grijs-500)",
                              fontSize: "0.85rem",
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td style={{ maxWidth: "280px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {evaluatie?.reden ? (
                            <p
                              style={{
                                fontSize: "0.85rem",
                                color: "var(--grijs-700)",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                flex: 1,
                              }}
                            >
                              {evaluatie.reden}
                            </p>
                          ) : (
                            <span
                              style={{
                                color: "var(--grijs-500)",
                                fontSize: "0.85rem",
                                flex: 1,
                              }}
                            >
                              —
                            </span>
                          )}
                          {trainee.bevestigingen > 0 && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                                flexShrink: 0,
                              }}
                            >
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 256 256"
                                fill="#C62828"
                              >
                                <path d="M183.89,153.34a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68ZM216,144a88,88,0,0,1-176,0c0-27.92,11-56.47,32.66-84.85a8,8,0,0,1,11.93-.89l24.12,23.41,22-60.41a8,8,0,0,1,12.63-3.41C165.21,36,216,84.55,216,144Zm-16,0c0-46.09-35.79-85.92-58.21-106.33L119.52,98.74a8,8,0,0,1-13.09,3L80.06,76.16C64.09,99.21,56,122,56,144a72,72,0,0,0,144,0Z" />
                              </svg>
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  color: "#C62828",
                                }}
                              >
                                {trainee.bevestigingen}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        {heeftBericht ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              background: "#FFF3E0",
                              color: "#E65100",
                              borderRadius: "50px",
                              padding: "3px 10px",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                            }}
                          >
                            <div
                              style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: "#E65100",
                              }}
                            />
                            Bericht
                          </span>
                        ) : (
                          <span
                            style={{
                              color: "var(--grijs-500)",
                              fontSize: "0.85rem",
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modals */}
      {geselecteerdeEvaluatie && (
        <EvaluatieModal
          trainee={geselecteerdeEvaluatie}
          onSluit={() => setGeselecteerdeEvaluatie(null)}
          onGelezen={markeerEvaluatieGelezen}
        />
      )}
      {geselecteerdeActiviteit && (
        <ActiviteitModal
          trainee={geselecteerdeActiviteit}
          onSluit={() => setGeselecteerdeActiviteit(null)}
        />
      )}
    </div>
  );
}
