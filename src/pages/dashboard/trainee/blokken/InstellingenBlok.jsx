import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

export default function InstellingenBlok({ email }) {
  const [gebruiker, setGebruiker] = useState(null);
  const [leidinggevende, setLeidinggevende] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [bio, setBio] = useState("");
  const [laden, setLaden] = useState(true);
  const [bewerkModus, setBewerkModus] = useState(false);
  const [bewerkNaam, setBewerkNaam] = useState("");
  const [bewerkEmail, setBewerkEmail] = useState("");
  const [bewerkBio, setBewerkBio] = useState("");
  const [opslaan, setOpslaan] = useState(false);

  useEffect(() => {
    async function laadData() {
      if (!email) return;
      setLaden(true);

      const [gebruikerRes, koppelingRes, lpRes] = await Promise.all([
        supabase
          .from("gebruikers")
          .select("naam, email, aangemaakt_op, bio")
          .eq("email", email)
          .single(),
        supabase
          .from("koppeling")
          .select("leidinggevende_email")
          .eq("trainee_email", email)
          .single(),
        supabase
          .from("learning_path")
          .select("pad")
          .eq("trainee_email", email)
          .eq("actief", true)
          .limit(1)
          .single(),
      ]);

      if (gebruikerRes.data) {
        setGebruiker(gebruikerRes.data);
        setBio(gebruikerRes.data.bio || "");
      }

      if (koppelingRes.data) {
        // Haal naam van leidinggevende op
        const { data: lgData } = await supabase
          .from("gebruikers")
          .select("naam")
          .eq("email", koppelingRes.data.leidinggevende_email)
          .single();
        setLeidinggevende(
          lgData?.naam || koppelingRes.data.leidinggevende_email,
        );
      }

      if (lpRes.data) {
        const padLabels = {
          payroll: "Payroll",
          finance: "Finance",
          hr: "HR",
          stam: "Algemeen",
        };
        setLearningPath(padLabels[lpRes.data.pad] || lpRes.data.pad);
      }

      setLaden(false);
    }
    laadData();
  }, [email]);

  async function slaProfielOp() {
    setOpslaan(true);
    await supabase
      .from("gebruikers")
      .update({ naam: bewerkNaam, email: bewerkEmail, bio: bewerkBio })
      .eq("email", email);
    setGebruiker((prev) => ({
      ...prev,
      naam: bewerkNaam,
      email: bewerkEmail,
      bio: bewerkBio,
    }));
    setBio(bewerkBio);
    setBewerkModus(false);
    setOpslaan(false);
  }

  // Avatar initialen
  const initialen = gebruiker?.naam
    ? gebruiker.naam
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const aangemaaktop = gebruiker?.aangemaakt_op
    ? new Date(gebruiker.aangemaakt_op).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

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
    <div style={{ padding: "28px 32px", maxWidth: "860px", textAlign: "left" }}>
      <div style={{ marginBottom: "24px" }}>
        <p
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--grijs-900)",
          }}
        >
          Instellingen
        </p>
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--grijs-500)",
            marginTop: "2px",
          }}
        >
          Jouw profielinformatie — bewerken met de knop onderaan de pagina
        </p>
      </div>

      {/* Bovenste sectie: naam/email/aangemaakt + avatar naast elkaar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 240px",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Veld label="Naam">
            {bewerkModus ? (
              <input
                value={bewerkNaam}
                onChange={(e) => setBewerkNaam(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--grijs-300)",
                  fontSize: "0.88rem",
                  fontFamily: "Inter, sans-serif",
                }}
              />
            ) : (
              <WaardeVak>{gebruiker?.naam || "—"}</WaardeVak>
            )}
          </Veld>
          <Veld label="Email">
            {bewerkModus ? (
              <input
                value={bewerkEmail}
                onChange={(e) => setBewerkEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--grijs-300)",
                  fontSize: "0.88rem",
                  fontFamily: "Inter, sans-serif",
                }}
              />
            ) : (
              <WaardeVak>{gebruiker?.email || "—"}</WaardeVak>
            )}
          </Veld>
          <Veld label="Account aangemaakt">
            <WaardeVak>{aangemaaktop}</WaardeVak>
          </Veld>
        </div>

        {/* Avatar */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            background: "rgba(46,125,50,0.06)",
            border: "1px solid rgba(46,125,50,0.12)",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--grijs-500)",
            }}
          >
            Avatar
          </p>
          <div
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2E7D32, #66BB6A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3rem",
              fontWeight: 800,
              color: "white",
              boxShadow: "0 4px 16px rgba(46,125,50,0.25)",
              letterSpacing: "0.05em",
            }}
          >
            {initialen}
          </div>
          <p
            style={{
              fontSize: "0.72rem",
              color: "#BDBDBD",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            Aanpasbaar binnenkort
          </p>
        </div>
      </div>

      {/* Onderste sectie: volle breedte */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <Veld label="Learning Path">
          <WaardeVak>{learningPath || "—"}</WaardeVak>
        </Veld>
        <Veld label="Bio">
          {bewerkModus ? (
            <textarea
              value={bewerkBio}
              onChange={(e) => setBewerkBio(e.target.value)}
              placeholder="Schrijf iets over jezelf..."
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid var(--grijs-300)",
                fontSize: "0.85rem",
                fontFamily: "Inter, sans-serif",
                resize: "vertical",
                lineHeight: 1.6,
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                minHeight: "100px",
                background: "#F9F9F9",
                border: "1px solid #EEEEEE",
                borderRadius: "8px",
                padding: "12px 14px",
                fontSize: "0.85rem",
                color: bio ? "var(--grijs-900)" : "#BDBDBD",
                lineHeight: 1.6,
              }}
            >
              {bio || "Nog geen bio ingesteld"}
            </div>
          )}
        </Veld>
        <Veld label="Leidinggevende">
          <WaardeVak>{leidinggevende || "—"}</WaardeVak>
        </Veld>
      </div>
      {/* Edit knop */}
      <div
        style={{
          marginTop: "32px",
          paddingTop: "20px",
          borderTop: "1px solid #EEEEEE",
        }}
      >
        {bewerkModus ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={slaProfielOp}
              disabled={opslaan}
              className="knop knop-primair"
              style={{ fontSize: "0.82rem" }}
            >
              {opslaan ? "Opslaan..." : "Opslaan"}
            </button>
            <button
              onClick={() => setBewerkModus(false)}
              className="knop knop-ghost"
              style={{ fontSize: "0.82rem" }}
            >
              Annuleren
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setBewerkNaam(gebruiker?.naam || "");
              setBewerkEmail(gebruiker?.email || "");
              setBewerkBio(gebruiker?.bio || "");
              setBewerkModus(true);
            }}
            className="knop knop-ghost"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.82rem",
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 256 256"
              fill="currentColor"
            >
              <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z" />
            </svg>
            Profiel bewerken
          </button>
        )}
      </div>
    </div>
  );
}

function Veld({ label, children }) {
  return (
    <div>
      <p
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--grijs-500)",
          marginBottom: "6px",
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function WaardeVak({ children }) {
  return (
    <div
      style={{
        background: "#F9F9F9",
        border: "1px solid #EEEEEE",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "0.88rem",
        color: "var(--grijs-900)",
        fontWeight: 500,
        minHeight: "40px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
}
