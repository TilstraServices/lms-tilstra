import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import QuizBeheer from "./QuizBeheer";

const IcoModule = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 256 256"
  >
    <path d="M224,48H32A16,16,0,0,0,16,64V88a16,16,0,0,0,16,16v88a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM208,192H48V104H208ZM224,88H32V64H224V88ZM96,136a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,136Z" />
  </svg>
);
const IcoHoofdstuk = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 256 256"
  >
    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" />
  </svg>
);
const IcoParagraaf = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 256 256"
  >
    <path d="M120,176V64h16V176a8,8,0,0,1-16,0Zm-16-96H72a48,48,0,0,0,0,96h32a8,8,0,0,0,0-16H72a32,32,0,0,1,0-64h32a8,8,0,0,0,0-16Z" />
  </svg>
);
const IcoQuiz = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 256 256"
  >
    <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM208,208H48V48H208ZM96,136a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,136Zm0-32a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,104Zm0,64a8,8,0,0,1,8-8h24a8,8,0,0,1,0,16H104A8,8,0,0,1,96,168Z" />
  </svg>
);
const IcoOpgave = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 256 256"
  >
    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-38.34-61.66a8,8,0,0,1,0,11.32l-24,24a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L120,164.69V120a8,8,0,0,1,16,0v44.69l10.34-10.35A8,8,0,0,1,161.66,154.34Z" />
  </svg>
);

function BoomItem({
  icoon,
  naam,
  niveau,
  actief,
  onClick,
  kinderen,
  accentKleur,
  isOpen,
  onToggle,
}) {
  const inspringing = niveau * 20;
  return (
    <div>
      <div
        onClick={() => {
          onToggle && onToggle();
          onClick && onClick();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 10px",
          paddingLeft: `${inspringing + 10}px`,
          cursor: "pointer",
          borderRadius: "6px",
          background: actief ? "var(--groen-licht)" : "none",
          color: actief ? "var(--groen-donker)" : "var(--grijs-900)",
          fontSize: "0.85rem",
          fontWeight: actief ? 600 : 400,
          transition: "background 0.1s",
          userSelect: "none",
        }}
        onMouseEnter={(e) => {
          if (!actief) e.currentTarget.style.background = "var(--grijs-100)";
        }}
        onMouseLeave={(e) => {
          if (!actief) e.currentTarget.style.background = "none";
        }}
      >
        {kinderen ? (
          <span
            style={{
              fontSize: "0.6rem",
              color: "var(--grijs-400)",
              width: "10px",
            }}
          >
            {isOpen ? "▼" : "▶"}
          </span>
        ) : (
          <span style={{ width: "10px" }} />
        )}
        <span
          style={{
            color: accentKleur || "var(--grijs-500)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {icoon}
        </span>
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {naam}
        </span>
      </div>
      {isOpen && kinderen && <div>{kinderen}</div>}
    </div>
  );
}

function Paneel({ geselecteerd, onHerlaad, data, onSelecteer }) {
  const [bewerkModus, setBewerkModus] = useState(false);
  const [naam, setNaam] = useState(geselecteerd?.naam || "");
  const [beschrijving, setBeschrijving] = useState(
    geselecteerd?.beschrijving || "",
  );
  const [iframeUrl, setIframeUrl] = useState(geselecteerd?.iframe_url || "");

  async function slaOp() {
    if (!naam.trim()) return;
    const updates = { naam };
    if (geselecteerd.type === "module") updates.beschrijving = beschrijving;
    if (geselecteerd.type === "opgave") updates.iframe_url = iframeUrl;
    await supabase
      .from(geselecteerd.tabel)
      .update(updates)
      .eq("id", geselecteerd.id);
    setBewerkModus(false);
    onHerlaad();
  }

  async function verwijder() {
    if (
      !window.confirm(
        `Weet je zeker dat je "${geselecteerd.naam}" wilt verwijderen?`,
      )
    )
      return;
    await supabase.from(geselecteerd.tabel).delete().eq("id", geselecteerd.id);
    onHerlaad();
  }

  if (!geselecteerd) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "var(--grijs-500)",
          fontSize: "0.85rem",
        }}
      >
        Selecteer een item om te bewerken
      </div>
    );
  }

  const kinderen =
    {
      module: data.hoofdstukken.filter((h) => h.module_id === geselecteerd.id),
      hoofdstuk: [
        ...data.paragrafen.filter((p) => p.hoofdstuk_id === geselecteerd.id),
        ...data.quizen.filter((q) => q.hoofdstuk_id === geselecteerd.id),
      ],
      paragraaf: data.opgaves.filter((o) => o.paragraaf_id === geselecteerd.id),
      quiz: [],
      opgave: [],
    }[geselecteerd.type] || [];

  const kindLabels = {
    module: { type: "hoofdstuk", tabel: "hoofdstukken" },
    hoofdstuk: { type: "paragraaf", tabel: "paragrafen" },
    paragraaf: { type: "opgave", tabel: "opgaves" },
  };
  const kindInfo = kindLabels[geselecteerd.type];

  return (
    <div style={{ padding: "20px" }} className="uitklap-animatie">
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          marginBottom: "20px",
        }}
      >
        {geselecteerd.type !== "module" && (
          <button
            onClick={() => {
              let ouder = null;
              if (geselecteerd.type === "hoofdstuk") {
                ouder = data.modules.find(
                  (m) => m.id === geselecteerd.module_id,
                );
                if (ouder)
                  ouder = { ...ouder, type: "module", tabel: "modules" };
              } else if (
                geselecteerd.type === "paragraaf" ||
                geselecteerd.type === "quiz"
              ) {
                ouder = data.hoofdstukken.find(
                  (h) => h.id === geselecteerd.hoofdstuk_id,
                );
                if (ouder)
                  ouder = {
                    ...ouder,
                    type: "hoofdstuk",
                    tabel: "hoofdstukken",
                  };
              } else if (geselecteerd.type === "opgave") {
                ouder = data.paragrafen.find(
                  (p) => p.id === geselecteerd.paragraaf_id,
                );
                if (ouder)
                  ouder = { ...ouder, type: "paragraaf", tabel: "paragrafen" };
              }
              if (ouder) onSelecteer(ouder);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "50%",
              color: "var(--grijs-500)",
              display: "flex",
              alignItems: "center",
              marginRight: "8px",
              marginTop: "2px",
              transition: "background 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--grijs-200)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M152,72H128V32a8,8,0,0,0-13.66-5.66l-96,96a8,8,0,0,0,0,11.32l96,96A8,8,0,0,0,128,224V184h24a8,8,0,0,0,8-8V80A8,8,0,0,0,152,72Zm-8,96H120a8,8,0,0,0-8,8v28.69L35.31,128,112,51.31V80a8,8,0,0,0,8,8h24Zm80-88v96a8,8,0,0,1-16,0V80a8,8,0,0,1,16,0Zm-32,0v96a8,8,0,0,1-16,0V80a8,8,0,0,1,16,0Z" />
            </svg>
          </button>
        )}
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
            {geselecteerd.type}
          </p>
          <p
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--grijs-900)",
            }}
          >
            {geselecteerd.naam}
          </p>
        </div>
        <div style={{ display: "flex", gap: "4px", marginLeft: "auto" }}>
          <button
            onClick={() => setBewerkModus(!bewerkModus)}
            style={{
              background: bewerkModus ? "var(--groen-licht)" : "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "50%",
              color: bewerkModus ? "var(--groen-donker)" : "var(--grijs-500)",
              display: "flex",
              alignItems: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!bewerkModus)
                e.currentTarget.style.background = "var(--grijs-200)";
            }}
            onMouseLeave={(e) => {
              if (!bewerkModus) e.currentTarget.style.background = "none";
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z" />
            </svg>
          </button>
          <button
            onClick={verwijder}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "50%",
              color: "var(--rood)",
              display: "flex",
              alignItems: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--rood-licht)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
            </svg>
          </button>
        </div>
      </div>

      {bewerkModus && (
        <div
          className="uitklap-animatie"
          style={{
            background: "var(--grijs-50)",
            border: "1px solid var(--grijs-200)",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <label
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "var(--grijs-700)",
              display: "block",
              marginBottom: "6px",
            }}
          >
            Naam
          </label>
          <input
            type="text"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid var(--grijs-200)",
              marginBottom: "12px",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.85rem",
            }}
          />
          {geselecteerd.type === "module" && (
            <>
              <label
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--grijs-700)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Beschrijving
              </label>
              <input
                type="text"
                value={beschrijving}
                onChange={(e) => setBeschrijving(e.target.value)}
                placeholder="Optioneel"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--grijs-200)",
                  marginBottom: "12px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.85rem",
                }}
              />
            </>
          )}
          {geselecteerd.type === "opgave" && (
            <>
              <label
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--grijs-700)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                iframe URL
              </label>
              <input
                type="text"
                value={iframeUrl}
                onChange={(e) => setIframeUrl(e.target.value)}
                placeholder="https://tilstraservices.github.io/..."
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--grijs-200)",
                  marginBottom: "12px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.85rem",
                }}
              />
            </>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="knop knop-primair"
              style={{ fontSize: "0.82rem" }}
              onClick={slaOp}
            >
              Opslaan
            </button>
            <button
              className="knop knop-ghost"
              style={{ fontSize: "0.82rem" }}
              onClick={() => setBewerkModus(false)}
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--grijs-200)",
          marginBottom: "16px",
        }}
      />

      {geselecteerd.type === "quiz" && (
        <>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid var(--grijs-200)",
              marginBottom: "16px",
            }}
          />
          <QuizBeheer quiz={geselecteerd} onHerlaad={onHerlaad} />
        </>
      )}

      {kindInfo && (
        <>
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--grijs-500)",
              marginBottom: "10px",
            }}
          >
            {geselecteerd.type === "hoofdstuk"
              ? "Paragrafen & Quiz"
              : kindInfo.type + "en"}
          </p>
          {kinderen.length === 0 ? (
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--grijs-500)",
                marginBottom: "12px",
              }}
            >
              Nog geen items.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                marginBottom: "12px",
              }}
            >
              {kinderen.map((kind) => {
                const isQuiz = data.quizen.find((q) => q.id === kind.id);
                const icoon = isQuiz ? (
                  <IcoQuiz />
                ) : kindInfo.type === "hoofdstuk" ? (
                  <IcoHoofdstuk />
                ) : kindInfo.type === "paragraaf" ? (
                  <IcoParagraaf />
                ) : (
                  <IcoOpgave />
                );
                const type = isQuiz ? "quiz" : kindInfo.type;
                const tabel = isQuiz ? "quizen" : kindInfo.tabel;
                return (
                  <div
                    key={kind.id}
                    onClick={() => onSelecteer({ ...kind, type, tabel })}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--grijs-200)",
                      cursor: "pointer",
                      background: "var(--grijs-50)",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--groen-licht)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "var(--grijs-50)")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{ color: "var(--grijs-500)", display: "flex" }}
                      >
                        {icoon}
                      </span>
                      <span style={{ fontSize: "0.85rem" }}>{kind.naam}</span>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                      style={{ color: "var(--grijs-400)", marginLeft: "auto" }}
                    >
                      <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                    </svg>
                  </div>
                );
              })}
            </div>
          )}
          <NieuwItemFormulier
            geselecteerd={geselecteerd}
            onHerlaad={onHerlaad}
          />
        </>
      )}
    </div>
  );
}

function NieuwItemFormulier({ geselecteerd, onHerlaad }) {
  const [naam, setNaam] = useState("");
  const [toonFormulier, setToonFormulier] = useState(false);

  const kindTypes = {
    module: { label: "hoofdstuk", tabel: "hoofdstukken", veld: "module_id" },
    hoofdstuk: { label: "paragraaf of quiz", opties: ["paragraaf", "quiz"] },
    paragraaf: { label: "opgave", tabel: "opgaves", veld: "paragraaf_id" },
  };
  const kind = kindTypes[geselecteerd.type];
  if (!kind) return null;

  async function voegToe(type) {
    if (!naam.trim()) return;
    let tabel = kind.tabel;
    let veld = kind.veld;
    if (geselecteerd.type === "hoofdstuk") {
      tabel = type === "quiz" ? "quizen" : "paragrafen";
      veld = "hoofdstuk_id";
    }
    await supabase
      .from(tabel)
      .insert({ naam, [veld]: geselecteerd.id, volgorde: 0 });
    setNaam("");
    setToonFormulier(false);
    onHerlaad();
  }

  return (
    <div>
      {!toonFormulier ? (
        <button
          className="knop knop-secundair"
          style={{ fontSize: "0.82rem" }}
          onClick={() => setToonFormulier(true)}
        >
          + Nieuw {kind.label}
        </button>
      ) : (
        <div className="uitklap-animatie">
          <input
            type="text"
            placeholder={`Naam van de ${kind.label}`}
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                voegToe(
                  geselecteerd.type === "hoofdstuk" ? "paragraaf" : kind.label,
                );
            }}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid var(--grijs-200)",
              marginBottom: "10px",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.85rem",
            }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            {geselecteerd.type === "hoofdstuk" ? (
              <>
                <button
                  className="knop knop-primair"
                  style={{ fontSize: "0.82rem" }}
                  onClick={() => voegToe("paragraaf")}
                >
                  + Paragraaf
                </button>
                <button
                  className="knop knop-secundair"
                  style={{ fontSize: "0.82rem" }}
                  onClick={() => voegToe("quiz")}
                >
                  + Quiz
                </button>
              </>
            ) : (
              <button
                className="knop knop-primair"
                style={{ fontSize: "0.82rem" }}
                onClick={() => voegToe()}
              >
                Opslaan
              </button>
            )}
            <button
              className="knop knop-ghost"
              style={{ fontSize: "0.82rem" }}
              onClick={() => setToonFormulier(false)}
            >
              Annuleren
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ModulesBoom() {
  const [data, setData] = useState({
    modules: [],
    hoofdstukken: [],
    paragrafen: [],
    quizen: [],
    opgaves: [],
  });
  const [geselecteerd, setGeselecteerd] = useState(null);
  const [laden, setLaden] = useState(true);
  const [openItems, setOpenItems] = useState({});

  useEffect(() => {
    laadAlles();
  }, []);

  async function laadAlles() {
    const [modules, hoofdstukken, paragrafen, quizen, opgaves] =
      await Promise.all([
        supabase.from("modules").select("*").order("volgorde"),
        supabase.from("hoofdstukken").select("*").order("volgorde"),
        supabase.from("paragrafen").select("*").order("volgorde"),
        supabase.from("quizen").select("*").order("volgorde"),
        supabase.from("opgaves").select("*").order("volgorde"),
      ]);
    setData({
      modules: modules.data || [],
      hoofdstukken: hoofdstukken.data || [],
      paragrafen: paragrafen.data || [],
      quizen: quizen.data || [],
      opgaves: opgaves.data || [],
    });
    setLaden(false);
  }

  function toggleOpen(id) {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function selecteer(item, ouders = []) {
    setGeselecteerd(item);
    // Open alle ouders automatisch
    const nieuweOpenItems = { ...openItems };
    ouders.forEach((id) => {
      nieuweOpenItems[id] = true;
    });
    // Open het item zelf ook als het kinderen heeft
    nieuweOpenItems[item.id] = true;
    setOpenItems(nieuweOpenItems);
  }

  if (laden) return <p>Laden...</p>;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "500px",
        border: "1px solid var(--grijs-200)",
        borderRadius: "10px",
        overflow: "hidden",
        background: "white",
      }}
    >
      {/* Linkerkant — boom */}
      <div
        style={{
          width: "280px",
          flexShrink: 0,
          borderRight: "1px solid var(--grijs-200)",
          overflowY: "auto",
          padding: "12px 8px",
        }}
      >
        <button
          className="knop knop-primair"
          style={{
            width: "100%",
            marginBottom: "12px",
            fontSize: "0.82rem",
            justifyContent: "center",
          }}
          onClick={() => selecteer({ type: "nieuw_module", tabel: "modules" })}
        >
          + Nieuwe module
        </button>

        {data.modules.length === 0 && (
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--grijs-500)",
              padding: "8px 10px",
            }}
          >
            Nog geen modules.
          </p>
        )}

        {data.modules.map((module) => (
          <BoomItem
            key={module.id}
            icoon={<IcoModule />}
            naam={module.naam}
            niveau={0}
            actief={geselecteerd?.id === module.id}
            accentKleur="var(--groen)"
            isOpen={!!openItems[module.id]}
            onToggle={() => toggleOpen(module.id)}
            onClick={() =>
              selecteer({ ...module, type: "module", tabel: "modules" })
            }
            kinderen={
              <>
                {data.hoofdstukken
                  .filter((h) => h.module_id === module.id)
                  .map((hoofdstuk) => (
                    <BoomItem
                      key={hoofdstuk.id}
                      icoon={<IcoHoofdstuk />}
                      naam={hoofdstuk.naam}
                      niveau={1}
                      actief={geselecteerd?.id === hoofdstuk.id}
                      accentKleur="var(--blauw)"
                      isOpen={!!openItems[hoofdstuk.id]}
                      onToggle={() => toggleOpen(hoofdstuk.id)}
                      onClick={() =>
                        selecteer(
                          {
                            ...hoofdstuk,
                            type: "hoofdstuk",
                            tabel: "hoofdstukken",
                          },
                          [module.id],
                        )
                      }
                      kinderen={
                        <>
                          {data.paragrafen
                            .filter((p) => p.hoofdstuk_id === hoofdstuk.id)
                            .map((paragraaf) => (
                              <BoomItem
                                key={paragraaf.id}
                                icoon={<IcoParagraaf />}
                                naam={paragraaf.naam}
                                niveau={2}
                                actief={geselecteerd?.id === paragraaf.id}
                                accentKleur="var(--grijs-500)"
                                isOpen={!!openItems[paragraaf.id]}
                                onToggle={() => toggleOpen(paragraaf.id)}
                                onClick={() =>
                                  selecteer(
                                    {
                                      ...paragraaf,
                                      type: "paragraaf",
                                      tabel: "paragrafen",
                                    },
                                    [module.id, hoofdstuk.id],
                                  )
                                }
                                kinderen={
                                  data.opgaves.filter(
                                    (o) => o.paragraaf_id === paragraaf.id,
                                  ).length > 0 ? (
                                    <>
                                      {data.opgaves
                                        .filter(
                                          (o) =>
                                            o.paragraaf_id === paragraaf.id,
                                        )
                                        .map((opgave) => (
                                          <BoomItem
                                            key={opgave.id}
                                            icoon={<IcoOpgave />}
                                            naam={opgave.naam}
                                            niveau={3}
                                            actief={
                                              geselecteerd?.id === opgave.id
                                            }
                                            accentKleur="var(--oranje)"
                                            isOpen={!!openItems[opgave.id]}
                                            onToggle={() =>
                                              toggleOpen(opgave.id)
                                            }
                                            onClick={() =>
                                              selecteer(
                                                {
                                                  ...opgave,
                                                  type: "opgave",
                                                  tabel: "opgaves",
                                                },
                                                [
                                                  module.id,
                                                  hoofdstuk.id,
                                                  paragraaf.id,
                                                ],
                                              )
                                            }
                                          />
                                        ))}
                                    </>
                                  ) : null
                                }
                              />
                            ))}
                          {data.quizen
                            .filter((q) => q.hoofdstuk_id === hoofdstuk.id)
                            .map((quiz) => (
                              <BoomItem
                                key={quiz.id}
                                icoon={<IcoQuiz />}
                                naam={quiz.naam}
                                niveau={2}
                                actief={geselecteerd?.id === quiz.id}
                                accentKleur="var(--mod-arbeidsrecht)"
                                isOpen={!!openItems[quiz.id]}
                                onToggle={() => toggleOpen(quiz.id)}
                                onClick={() =>
                                  selecteer(
                                    { ...quiz, type: "quiz", tabel: "quizen" },
                                    [module.id, hoofdstuk.id],
                                  )
                                }
                              />
                            ))}
                        </>
                      }
                    />
                  ))}
              </>
            }
          />
        ))}
      </div>

      {/* Rechterkant — paneel */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {geselecteerd?.type === "nieuw_module" ? (
          <NieuweModuleFormulier
            onHerlaad={laadAlles}
            onAnnuleren={() => setGeselecteerd(null)}
          />
        ) : (
          <Paneel
            key={geselecteerd?.id}
            geselecteerd={geselecteerd}
            onHerlaad={laadAlles}
            data={data}
            onSelecteer={(item) => {
              // Zoek ouders op basis van type
              const ouders = [];
              if (item.type === "hoofdstuk") {
                ouders.push(item.module_id);
              } else if (item.type === "paragraaf" || item.type === "quiz") {
                const hoofdstuk = data.hoofdstukken.find(
                  (h) => h.id === item.hoofdstuk_id,
                );
                if (hoofdstuk) {
                  ouders.push(hoofdstuk.module_id);
                  ouders.push(hoofdstuk.id);
                }
              } else if (item.type === "opgave") {
                const paragraaf = data.paragrafen.find(
                  (p) => p.id === item.paragraaf_id,
                );
                if (paragraaf) {
                  const hoofdstuk = data.hoofdstukken.find(
                    (h) => h.id === paragraaf.hoofdstuk_id,
                  );
                  if (hoofdstuk) {
                    ouders.push(hoofdstuk.module_id);
                    ouders.push(hoofdstuk.id);
                  }
                  ouders.push(paragraaf.id);
                }
              }
              selecteer(item, ouders);
            }}
          />
        )}
      </div>
    </div>
  );
}

function NieuweModuleFormulier({ onHerlaad, onAnnuleren }) {
  const [naam, setNaam] = useState("");
  const [beschrijving, setBeschrijving] = useState("");

  async function voegToe() {
    if (!naam.trim()) return;
    await supabase.from("modules").insert({ naam, beschrijving, volgorde: 0 });
    onHerlaad();
    onAnnuleren();
  }

  return (
    <div style={{ padding: "20px" }} className="uitklap-animatie">
      <p
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--grijs-500)",
          marginBottom: "16px",
        }}
      >
        Nieuwe module
      </p>
      <label
        style={{
          fontSize: "0.82rem",
          fontWeight: 600,
          color: "var(--grijs-700)",
          display: "block",
          marginBottom: "6px",
        }}
      >
        Naam
      </label>
      <input
        type="text"
        value={naam}
        onChange={(e) => setNaam(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") voegToe();
        }}
        style={{
          width: "100%",
          padding: "9px 12px",
          borderRadius: "8px",
          border: "1px solid var(--grijs-200)",
          marginBottom: "14px",
          fontFamily: "Inter, sans-serif",
          fontSize: "0.85rem",
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
        Beschrijving
      </label>
      <input
        type="text"
        value={beschrijving}
        onChange={(e) => setBeschrijving(e.target.value)}
        placeholder="Optioneel"
        style={{
          width: "100%",
          padding: "9px 12px",
          borderRadius: "8px",
          border: "1px solid var(--grijs-200)",
          marginBottom: "14px",
          fontFamily: "Inter, sans-serif",
          fontSize: "0.85rem",
        }}
      />
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          className="knop knop-primair"
          style={{ fontSize: "0.82rem" }}
          onClick={voegToe}
        >
          Aanmaken
        </button>
        <button
          className="knop knop-ghost"
          style={{ fontSize: "0.82rem" }}
          onClick={onAnnuleren}
        >
          Annuleren
        </button>
      </div>
    </div>
  );
}
