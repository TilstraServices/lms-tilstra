import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../../lib/supabase";
import QuizBeheer from "./QuizBeheer";
import OpgaveBeheer from "./OpgaveBeheer";

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
    <path d="M208,24H72A32,32,0,0,0,40,56V224a8,8,0,0,0,8,8H192a8,8,0,0,0,0-16H56a16,16,0,0,1,16-16H208a8,8,0,0,0,8-8V32A8,8,0,0,0,208,24Zm-8,160H72a31.82,31.82,0,0,0-16,4.29V56A16,16,0,0,1,72,40H200Z" />
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
    <path d="M208,40H96a64,64,0,0,0,0,128h40v40a8,8,0,0,0,16,0V56h24V208a8,8,0,0,0,16,0V56h16a8,8,0,0,0,0-16ZM136,152H96a48,48,0,0,1,0-96h40Z" />
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
    <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
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
            onClick={(e) => {
              e.stopPropagation();
              onToggle && onToggle();
            }}
            style={{
              fontSize: "0.6rem",
              color: "var(--grijs-400)",
              width: "10px",
              cursor: "pointer",
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

function SleepLijst({
  kinderen,
  geselecteerd,
  onSelecteer,
  onHerlaad,
  data,
  kindInfo,
}) {
  async function verschuif(index, richting) {
    const nieuweVolgorde = [...kinderen];
    const doelIndex = index + richting;
    if (doelIndex < 0 || doelIndex >= nieuweVolgorde.length) return;
    [nieuweVolgorde[index], nieuweVolgorde[doelIndex]] = [
      nieuweVolgorde[doelIndex],
      nieuweVolgorde[index],
    ];
    for (let i = 0; i < nieuweVolgorde.length; i++) {
      await supabase
        .from(kindInfo.tabel)
        .update({ volgorde: i })
        .eq("id", nieuweVolgorde[i].id);
    }
    onHerlaad();
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        marginBottom: "12px",
      }}
    >
      {kinderen.map((kind, index) => {
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
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid var(--grijs-200)",
              background: "var(--grijs-50)",
              gap: "6px",
            }}
          >
            {/* Pijltjes — alleen bij paragraaf want dan zijn het opgaves */}
            {geselecteerd.type === "paragraaf" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    verschuif(index, -1);
                  }}
                  disabled={index === 0}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: index === 0 ? "default" : "pointer",
                    padding: "1px 3px",
                    borderRadius: "3px",
                    color:
                      index === 0 ? "var(--grijs-300)" : "var(--grijs-500)",
                    fontSize: "0.6rem",
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => {
                    if (index !== 0)
                      e.currentTarget.style.background = "var(--grijs-200)";
                  }}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  ▲
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    verschuif(index, 1);
                  }}
                  disabled={index === kinderen.length - 1}
                  style={{
                    background: "none",
                    border: "none",
                    cursor:
                      index === kinderen.length - 1 ? "default" : "pointer",
                    padding: "1px 3px",
                    borderRadius: "3px",
                    color:
                      index === kinderen.length - 1
                        ? "var(--grijs-300)"
                        : "var(--grijs-500)",
                    fontSize: "0.6rem",
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => {
                    if (index !== kinderen.length - 1)
                      e.currentTarget.style.background = "var(--grijs-200)";
                  }}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  ▼
                </button>
              </div>
            )}

            {/* Klikbaar gedeelte */}
            <div
              onClick={() =>
                onSelecteer({ ...kind, type, tabel, sjabloon: kind.type })
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flex: 1,
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--groen)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}
            >
              <span style={{ color: "var(--grijs-500)", display: "flex" }}>
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
              style={{ color: "var(--grijs-400)", flexShrink: 0 }}
            >
              <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
            </svg>
          </div>
        );
      })}
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
  const [opgaveType, setOpgaveType] = useState(
    geselecteerd?.sjabloon || geselecteerd?.type || "",
  );
  const [toonLinkPopup, setToonLinkPopup] = useState(false);

  async function slaOp() {
    if (!naam.trim()) return;
    const updates = { naam };
    if (geselecteerd.type === "module") updates.beschrijving = beschrijving;
    if (geselecteerd.type === "opgave") {
      updates.iframe_url = iframeUrl;
      updates.type = opgaveType;
    }
    await supabase
      .from(geselecteerd.tabel)
      .update(updates)
      .eq("id", geselecteerd.id);
    setBewerkModus(false);
    onHerlaad(geselecteerd.tabel, { ...geselecteerd, ...updates });
  }

  async function verwijder() {
    if (
      !window.confirm(
        `Weet je zeker dat je "${geselecteerd.naam}" wilt verwijderen?`,
      )
    )
      return;
    await supabase.from(geselecteerd.tabel).delete().eq("id", geselecteerd.id);
    onHerlaad(geselecteerd.tabel);
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
              marginBottom: geselecteerd.type === "opgave" ? "8px" : "0",
            }}
          >
            {geselecteerd.naam}
          </p>
          {geselecteerd.type === "opgave" && geselecteerd.sjabloon && (
            <span
              style={{
                display: "inline-block",
                fontSize: "0.72rem",
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: "100px",
                background: "var(--groen-licht)",
                color: "var(--groen-donker)",
                textTransform: "capitalize",
              }}
            >
              {geselecteerd.sjabloon.replace("-", " ")}
            </span>
          )}
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
                Type
              </label>
              <select
                value={opgaveType}
                onChange={(e) => {
                  setOpgaveType(e.target.value);
                }}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--grijs-200)",
                  marginBottom: "12px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.85rem",
                  background: "white",
                }}
              >
                <option value="">Kies een type...</option>
                <option value="meerkeuze">Meerkeuze</option>
                <option value="invulvraag">Invulvraag</option>
                <option value="drag-drop">Drag & Drop</option>
                <option value="open-vraag">Open vraag</option>
                <option value="koppelvraag">Koppelvraag</option>
              </select>
              <label
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--grijs-700)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                iframe URL{" "}
                <span style={{ fontWeight: 400, color: "var(--grijs-500)" }}>
                  (optioneel — voor externe opgaves)
                </span>
              </label>
              <input
                type="text"
                value={iframeUrl}
                onChange={(e) => {
                  setIframeUrl(e.target.value);
                }}
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

      {geselecteerd.type === "opgave" && (
        <OpgaveBeheer
          opgave={geselecteerd}
          onHerlaad={() => onHerlaad("opgaves")}
        />
      )}

      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--grijs-200)",
          marginBottom: "16px",
        }}
      />

      {geselecteerd.type === "quiz" && (
        <QuizBeheer quiz={geselecteerd} onHerlaad={() => onHerlaad("quizen")} />
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
            <SleepLijst
              kinderen={kinderen}
              geselecteerd={geselecteerd}
              onSelecteer={onSelecteer}
              onHerlaad={() => onHerlaad(kindInfo.tabel)}
              data={data}
              kindInfo={kindInfo}
            />
          )}

          <NieuwItemFormulier
            geselecteerd={geselecteerd}
            onHerlaad={() => {
              const tabelMap = {
                module: "hoofdstukken",
                hoofdstuk: "paragrafen",
                paragraaf: "opgaves",
              };
              onHerlaad(tabelMap[geselecteerd.type] || geselecteerd.tabel);
            }}
          />
          {geselecteerd.type === "paragraaf" && (
            <div
              style={{
                marginTop: "16px",
                position: "relative",
                display: "inline-block",
              }}
            >
              <button
                onClick={() => setToonLinkPopup(!toonLinkPopup)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  padding: "7px 14px",
                  borderRadius: "50px",
                  border: "1px solid var(--grijs-200)",
                  background: "white",
                  cursor: "pointer",
                  color: "var(--grijs-700)",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M137.54,186.36a8,8,0,0,1,0,11.31l-9.94,10A56,56,0,0,1,48.38,128.4L72.5,104.28A56,56,0,0,1,149.31,102a8,8,0,1,1-10.64,11.96,40,40,0,0,0-54.85,1.32L59.7,139.4a40,40,0,1,0,56.58,56.58l9.94-9.94A8,8,0,0,1,137.54,186.36Zm70.08-138a56.08,56.08,0,0,0-79.22,0l-9.94,9.95a8,8,0,0,0,11.32,11.31l9.94-9.94a40,40,0,0,1,56.58,56.58L172.18,140.4A40,40,0,0,1,117.33,141.72a8,8,0,1,0-10.64,11.96,56,56,0,0,0,76.81-1.32l24.12-24.12A56.08,56.08,0,0,0,207.62,48.38Z" />
                </svg>
                Paragraaf link
              </button>

              {toonLinkPopup && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    background: "white",
                    border: "1px solid var(--grijs-200)",
                    borderRadius: "10px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    padding: "14px",
                    zIndex: 50,
                    width: "360px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "var(--grijs-500)",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Paragraaf link
                  </p>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      readOnly
                      value={`https://tilstraservices.github.io/lms-tilstra/paragraaf?id=${geselecteerd.id}`}
                      style={{
                        flex: 1,
                        padding: "7px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--grijs-200)",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.78rem",
                        color: "var(--grijs-700)",
                        background: "var(--grijs-50)",
                      }}
                      onClick={(e) => e.target.select()}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `https://tilstraservices.github.io/lms-tilstra/paragraaf?id=${geselecteerd.id}`,
                        );
                        setToonLinkPopup(false);
                      }}
                      className="knop knop-primair"
                      style={{ fontSize: "0.78rem", padding: "7px 12px" }}
                    >
                      Kopieer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NieuwItemFormulier({ geselecteerd, onHerlaad }) {
  const [naam, setNaam] = useState("");
  const [type, setType] = useState("");
  const [toonFormulier, setToonFormulier] = useState(false);

  const kindTypes = {
    module: { label: "hoofdstuk", tabel: "hoofdstukken", veld: "module_id" },
    hoofdstuk: { label: "paragraaf of quiz", opties: ["paragraaf", "quiz"] },
    paragraaf: { label: "opgave", tabel: "opgaves", veld: "paragraaf_id" },
  };
  const kind = kindTypes[geselecteerd.type];
  if (!kind) return null;

  const leegeInhoud = {
    meerkeuze: {
      vraag: "",
      opties: [
        { tekst: "", correct: true },
        { tekst: "", correct: false },
        { tekst: "", correct: false },
        { tekst: "", correct: false },
      ],
    },
    invulvraag: { vraag: "", tekst: "", antwoorden: [""] },
    "drag-drop": { vraag: "", tekst: "", antwoorden: [""], woordenbank: [""] },
    "open-vraag": { vraag: "", modelantwoorden: [""] },
  };

  async function voegToe(opgaveType) {
    if (!naam.trim()) return;
    if (geselecteerd.type === "paragraaf" && !type) return;

    let tabel = kind.tabel;
    let veld = kind.veld;
    if (geselecteerd.type === "hoofdstuk") {
      tabel = opgaveType === "quiz" ? "quizen" : "paragrafen";
      veld = "hoofdstuk_id";
    }

    const { data: bestaande } = await supabase
      .from(tabel)
      .select("volgorde")
      .eq(veld, geselecteerd.id)
      .order("volgorde", { ascending: false })
      .limit(1);

    const volgorde =
      bestaande && bestaande.length > 0 ? bestaande[0].volgorde + 1 : 0;
    const nieuwItem = { naam, [veld]: geselecteerd.id, volgorde };

    // Voeg type en lege inhoud toe voor opgaves
    if (geselecteerd.type === "paragraaf") {
      nieuwItem.type = type;
      nieuwItem.inhoud = leegeInhoud[type] || {};
    }

    await supabase.from(tabel).insert(nieuwItem);
    setNaam("");
    setType("");
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
        <div
          className="uitklap-animatie"
          style={{
            background: "var(--groen-licht)",
            border: "1px solid var(--groen)",
            borderRadius: "10px",
            padding: "14px",
          }}
        >
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--groen-donker)",
              marginBottom: "10px",
            }}
          >
            Nieuw {kind.label}
          </p>
          <input
            type="text"
            placeholder="Naam van de opgave"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid var(--groen)",
              marginBottom: "8px",
              fontFamily: "Inter, sans-serif",
              fontSize: "0.85rem",
              background: "white",
            }}
          />

          {geselecteerd.type === "paragraaf" && (
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid var(--groen)",
                marginBottom: "10px",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.85rem",
                background: "white",
              }}
            >
              <option value="">Kies een type...</option>
              <option value="meerkeuze">Meerkeuze</option>
              <option value="invulvraag">Invulvraag</option>
              <option value="drag-drop">Drag & Drop</option>
              <option value="open-vraag">Open vraag</option>
            </select>
          )}

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
                disabled={geselecteerd.type === "paragraaf" && !type}
              >
                Opslaan
              </button>
            )}
            <button
              className="knop knop-ghost"
              style={{ fontSize: "0.82rem" }}
              onClick={() => {
                setToonFormulier(false);
                setType("");
                setNaam("");
              }}
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

  const geladen = useRef(false);

  useEffect(() => {
    if (geladen.current) return;
    geladen.current = true;

    Promise.all([
      supabase.from("modules").select("*").order("volgorde"),
      supabase.from("hoofdstukken").select("*").order("volgorde"),
      supabase.from("paragrafen").select("*").order("volgorde"),
      supabase.from("quizen").select("*").order("volgorde"),
      supabase.from("opgaves").select("*").order("volgorde"),
    ]).then(([modules, hoofdstukken, paragrafen, quizen, opgaves]) => {
      setData({
        modules: modules.data || [],
        hoofdstukken: hoofdstukken.data || [],
        paragrafen: paragrafen.data || [],
        quizen: quizen.data || [],
        opgaves: opgaves.data || [],
      });
      setLaden(false);
    });
  }, []);

  async function herlaadTabel(tabel) {
    const { data: nieuw } = await supabase
      .from(tabel)
      .select("*")
      .order("volgorde");
    setData((prev) => ({ ...prev, [tabel]: nieuw || [] }));
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
                                                  sjabloon: opgave.type,
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
            onHerlaad={() => herlaadTabel("modules")}
            onAnnuleren={() => setGeselecteerd(null)}
          />
        ) : (
          <Paneel
            key={geselecteerd?.id}
            geselecteerd={geselecteerd}
            onHerlaad={(tabel, bijgewerktItem) => {
              herlaadTabel(tabel);
              if (bijgewerktItem) setGeselecteerd(bijgewerktItem);
            }}
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
