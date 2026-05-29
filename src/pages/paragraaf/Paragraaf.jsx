import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function Paragraaf() {
  const [opgaves, setOpgaves] = useState([]);
  const [laden, setLaden] = useState(true);
  const [paragraafNaam, setParagraafNaam] = useState("");
  const [scores, setScores] = useState({});
  const [gecontroleerd, setGecontroleerd] = useState(false);
  const [opgeslagen, setOpgeslagen] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const paragraafId = params.get("id");
  const email = localStorage.getItem("email");

  useEffect(() => {
    async function laadData() {
      if (!paragraafId) {
        setLaden(false);
        return;
      }

      const { data: paragraaf } = await supabase
        .from("paragrafen")
        .select("naam")
        .eq("id", paragraafId)
        .single();

      if (paragraaf) setParagraafNaam(paragraaf.naam);

      const { data: opgavesData } = await supabase
        .from("opgaves")
        .select("*")
        .eq("paragraaf_id", paragraafId)
        .order("volgorde");

      if (opgavesData) setOpgaves(opgavesData);
      setLaden(false);
    }
    laadData();
  }, [paragraafId]);

  // Luisteren naar postMessage van opgave iframes
  useEffect(() => {
    function handleMessage(event) {
      if (event.data.type === "opgave_score") {
        setScores((prev) => ({
          ...prev,
          [event.data.opgave_id]: event.data.score,
        }));
      }
      if (event.data.type === "opgave_reset") {
        setScores((prev) => {
          const nieuw = { ...prev };
          delete nieuw[event.data.opgave_id];
          return nieuw;
        });
        setGecontroleerd(false);
        setOpgeslagen(false);
      }
      if (event.data.type === "iframe_hoogte") {
        const iframes = document.querySelectorAll(".opgave-iframe");
        iframes.forEach((iframe) => {
          if (iframe.contentWindow === event.source) {
            iframe.style.height = event.data.hoogte + 32 + "px";
          }
        });
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function controleerAlles() {
    // Stuur controleer signaal naar alle iframes
    const iframes = document.querySelectorAll(".opgave-iframe");
    iframes.forEach((iframe) => {
      iframe.contentWindow.postMessage({ type: "controleer" }, "*");
    });
    setGecontroleerd(true);
  }

  function resetAlles() {
    const iframes = document.querySelectorAll(".opgave-iframe");
    iframes.forEach((iframe) => {
      iframe.contentWindow.postMessage({ type: "reset" }, "*");
    });
    setGecontroleerd(false);
    setOpgeslagen(false);
    setScores({});
  }

  // Sla scores automatisch op zodra alle opgaves gecontroleerd zijn
  useEffect(() => {
    if (
      !gecontroleerd ||
      Object.keys(scores).length !== opgaves.length ||
      opgaves.length === 0 ||
      opgeslagen ||
      !email
    )
      return;

    async function slaOp() {
      for (const opgave of opgaves) {
        const score = scores[opgave.id];
        if (score === undefined) continue;

        const { data: pogingen } = await supabase
          .from("scores")
          .select("poging_nummer")
          .eq("trainee_email", email)
          .eq("opgave_id", opgave.id)
          .order("poging_nummer", { ascending: false })
          .limit(1);

        const volgendPoging =
          pogingen && pogingen.length > 0 ? pogingen[0].poging_nummer + 1 : 1;

        await supabase.from("scores").insert({
          trainee_email: email,
          opgave_id: opgave.id,
          score: score,
          poging_nummer: volgendPoging,
        });
      }
      setOpgeslagen(true);
    }

    slaOp();
  }, [gecontroleerd, scores, opgaves, opgeslagen, email]);

  const gemiddeldeScore =
    opgaves.length > 0
      ? Math.round(
          Object.values(scores).reduce((a, b) => a + b, 0) / opgaves.length,
        )
      : null;

  if (laden)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "Inter, sans-serif",
          color: "#5F6368",
        }}
      >
        Opgaves laden...
      </div>
    );

  if (!paragraafId)
    return (
      <div
        style={{
          padding: "2rem",
          fontFamily: "Inter, sans-serif",
          color: "#C62828",
        }}
      >
        Geen paragraaf ID opgegeven.
      </div>
    );

  return (
    <div
      style={{
        background: "#F0F2F5",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #DADCE0",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#9E9E9E",
              marginBottom: "2px",
            }}
          >
            Paragraaf
          </p>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1A1A1A" }}>
            {paragraafNaam}
          </p>
        </div>
        {gecontroleerd && gemiddeldeScore !== null && (
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#9E9E9E",
                marginBottom: "2px",
              }}
            >
              Score
            </p>
            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: gemiddeldeScore >= 70 ? "#2E7D32" : "#C62828",
              }}
            >
              {gemiddeldeScore}%
            </p>
          </div>
        )}
      </div>

      {/* Opgaves */}
      <div
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {opgaves.map((opgave, index) => (
          <div
            key={opgave.id}
            style={{
              background: "white",
              borderRadius: "10px",
              border: "1px solid #DADCE0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid #DADCE0",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  background: "#2E7D32",
                  color: "white",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </span>
              <p
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#1A1A1A",
                }}
              >
                {opgave.naam}
              </p>
              {scores[opgave.id] !== undefined && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: scores[opgave.id] >= 70 ? "#2E7D32" : "#C62828",
                  }}
                >
                  {scores[opgave.id]}%
                </span>
              )}
            </div>
            <iframe
              className="opgave-iframe"
              src={`/lms-tilstra/opgaves/${opgave.type}.html?id=${opgave.id}`}
              style={{ width: "100%", border: "none", display: "block" }}
              scrolling="no"
              onLoad={(e) => {
                // Auto resize iframe hoogte
                try {
                  const height = e.target.contentDocument.body.scrollHeight;
                  e.target.style.height = height + 32 + "px";
                } catch {
                  e.target.style.height = "300px";
                }
              }}
            />
          </div>
        ))}

        {/* Controleer knop */}
        {opgaves.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              paddingBottom: "32px",
            }}
          >
            <button
              onClick={resetAlles}
              style={{
                background: "transparent",
                color: "#5F6368",
                border: "1px solid #DADCE0",
                borderRadius: "50px",
                padding: "10px 24px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Opnieuw
            </button>
            <button
              onClick={controleerAlles}
              disabled={gecontroleerd}
              style={{
                background: gecontroleerd ? "#A5D6A7" : "#2E7D32",
                color: "white",
                border: "none",
                borderRadius: "50px",
                padding: "10px 24px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: gecontroleerd ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {gecontroleerd
                ? opgeslagen
                  ? "✓ Opgeslagen"
                  : "Controleren..."
                : "Controleer alles"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
