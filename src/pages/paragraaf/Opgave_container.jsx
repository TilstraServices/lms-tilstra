import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";

function LazyIframe({ opgave }) {
  const ref = useRef(null);
  const [zichtbaar, setZichtbaar] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setZichtbaar(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: "100px" }}>
      {zichtbaar ? (
        <iframe
          className="opgave-iframe"
          src={`/lms-tilstra/opgaves/${opgave.type}.html?id=${opgave.id}`}
          style={{ width: "100%", border: "none", display: "block" }}
          scrolling="no"
          onLoad={(e) => {
            try {
              const height = e.target.contentDocument.body.scrollHeight;
              e.target.style.height = height + 32 + "px";
            } catch {
              e.target.style.height = "300px";
            }
          }}
        />
      ) : (
        <div
          style={{
            height: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9E9E9E",
            fontSize: "0.82rem",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Laden...
        </div>
      )}
    </div>
  );
}

export default function OpgaveContainer() {
  const [opgaves, setOpgaves] = useState([]);
  const [laden, setLaden] = useState(true);
  const [paragraafNaam, setParagraafNaam] = useState("");
  const [moduleId, setModuleId] = useState(null);
  const [scores, setScores] = useState({});
  const [gecontroleerd, setGecontroleerd] = useState(false);
  const [opgeslagen, setOpgeslagen] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const paragraafId = params.get("id");
  const email = localStorage.getItem("email");

  useEffect(() => {
    if (!email) {
      const huidigeUrl = window.location.href;
      window.location.href = `/lms-tilstra/?redirect=${encodeURIComponent(huidigeUrl)}`;
    }
  }, [email]);

  useEffect(() => {
    async function laadData() {
      if (!paragraafId) {
        setLaden(false);
        return;
      }

      const { data: paragraaf } = await supabase
        .from("paragrafen")
        .select("naam, hoofdstuk_id")
        .eq("id", paragraafId)
        .single();

      if (paragraaf) {
        setParagraafNaam(paragraaf.naam);
        const { data: hoofdstuk } = await supabase
          .from("hoofdstukken")
          .select("module_id")
          .eq("id", paragraaf.hoofdstuk_id)
          .single();
        if (hoofdstuk) setModuleId(hoofdstuk.module_id);
      }

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

  async function berekeningVoortgang() {
    const { data: hoofdstukken } = await supabase
      .from("hoofdstukken")
      .select("id")
      .eq("module_id", moduleId);

    if (!hoofdstukken || hoofdstukken.length === 0) return;
    const hoofdstukIds = hoofdstukken.map((h) => h.id);

    const [{ data: alleParagrafen }, { data: alleQuizzen }] = await Promise.all(
      [
        supabase
          .from("paragrafen")
          .select("id")
          .in("hoofdstuk_id", hoofdstukIds),
        supabase.from("quizen").select("id").in("hoofdstuk_id", hoofdstukIds),
      ],
    );

    const totaal = (alleParagrafen?.length || 0) + (alleQuizzen?.length || 0);
    if (totaal === 0) return;

    let voltooidParagrafen = 0;
    let gemScore = null;

    if (alleParagrafen && alleParagrafen.length > 0) {
      const paragraafIds = alleParagrafen.map((p) => p.id);
      const { data: alleOpgaves } = await supabase
        .from("opgaves")
        .select("id, paragraaf_id")
        .in("paragraaf_id", paragraafIds);

      const { data: alleTraineeScores } = await supabase
        .from("scores")
        .select("opgave_id, score, poging_nummer, opgaves(paragraaf_id)")
        .eq("trainee_email", email)
        .in("opgave_id", alleOpgaves?.map((o) => o.id) || [])
        .order("poging_nummer", { ascending: false });

      const laasteScoresMap = {};
      (alleTraineeScores || []).forEach((s) => {
        if (!laasteScoresMap[s.opgave_id]) laasteScoresMap[s.opgave_id] = s;
      });
      const traineeScores = Object.values(laasteScoresMap);

      const gescoordeParagrafen = new Set();
      traineeScores.forEach((s) => {
        if (s.opgaves?.paragraaf_id)
          gescoordeParagrafen.add(s.opgaves.paragraaf_id);
      });
      voltooidParagrafen = gescoordeParagrafen.size;

      if (traineeScores.length > 0) {
        gemScore = Math.round(
          traineeScores.reduce((a, b) => a + b.score, 0) / traineeScores.length,
        );
      }
    }

    let voltooidQuizzen = 0;
    if (alleQuizzen && alleQuizzen.length > 0) {
      const quizIds = alleQuizzen.map((q) => q.id);
      const { data: quizScores } = await supabase
        .from("quiz_scores")
        .select("quiz_id")
        .eq("trainee_email", email)
        .in("quiz_id", quizIds);

      if (quizScores) {
        const voltooideQuizIds = new Set(quizScores.map((s) => s.quiz_id));
        voltooidQuizzen = voltooideQuizIds.size;
      }
    }

    const voortgang = Math.round(
      ((voltooidParagrafen + voltooidQuizzen) / totaal) * 100,
    );

    const { data: bestaand } = await supabase
      .from("module_voortgang")
      .select("id")
      .eq("trainee_email", email)
      .eq("module_id", moduleId)
      .limit(1);

    if (bestaand && bestaand.length > 0) {
      await supabase
        .from("module_voortgang")
        .update({ voortgang, gem_score: gemScore })
        .eq("id", bestaand[0].id);
    } else {
      await supabase.from("module_voortgang").insert({
        trainee_email: email,
        module_id: moduleId,
        voortgang,
        gem_score: gemScore,
      });
    }
  }

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
      const opgaveIds = opgaves.map((o) => o.id);
      const { data: bestaandePogingen } = await supabase
        .from("scores")
        .select("opgave_id, poging_nummer")
        .eq("trainee_email", email)
        .in("opgave_id", opgaveIds)
        .order("poging_nummer", { ascending: false });

      const pogingMap = {};
      (bestaandePogingen || []).forEach((p) => {
        if (!pogingMap[p.opgave_id]) pogingMap[p.opgave_id] = p.poging_nummer;
      });

      const nieuweScores = opgaves
        .filter((o) => scores[o.id] !== undefined)
        .map((o) => ({
          trainee_email: email,
          opgave_id: o.id,
          score: scores[o.id],
          poging_nummer: (pogingMap[o.id] || 0) + 1,
        }));

      if (nieuweScores.length > 0) {
        await supabase.from("scores").insert(nieuweScores);
      }

      console.log("moduleId:", moduleId);
      console.log("scores:", scores);
      console.log("opgaves lengte:", opgaves.length);
      if (moduleId) {
        console.log("berekeningVoortgang wordt aangeroepen");
        await berekeningVoortgang();
      } else {
        console.log("moduleId is null, voortgang wordt niet berekend");
      }
      setOpgeslagen(true);
    }

    slaOp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gecontroleerd, scores, opgaves, opgeslagen, email, moduleId]);

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
            <LazyIframe opgave={opgave} />
          </div>
        ))}

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
              Reset
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
