import { useState, useEffect } from "react";
import "./dashboard.css";

export default function DashboardLayout({
  navigatie,
  kinderen,
  naam,
  email,
  rol,
  instellingenBlok,
  overrideBlok,
  onNavigeer,
}) {
  const [ingeklapt, setIngeklapt] = useState(false);
  const [actief, setActief] = useState(navigatie[0]?.label);
  const [toonInstellingen, setToonInstellingen] = useState(false);
  const actiefLabel = toonInstellingen ? "Instellingen" : actief;

  useEffect(() => {
    if (rol === "Beheerder") {
      document.body.classList.add("beheer-body");
    }
    return () => {
      document.body.classList.remove("beheer-body");
    };
  }, [rol]);

  return (
    <div
      className={`layout ${ingeklapt ? "ingeklapt" : ""}`}
      style={
        rol === "Beheerder"
          ? {
              "--grijs-50": "#F0F2F0",
              "--grijs-100": "#E8EBE8",
              "--grijs-200": "#D4DAD4",
              "--grijs-300": "#BDC6BD",
              "--grijs-500": "#7A8F7A",
              "--grijs-700": "#4A5E4A",
              "--grijs-900": "#1A2B1A",
              "--schaduw": "0 2px 12px rgba(0,0,0,0.1)",
              background: "#E8EBE8",
            }
          : {}
      }
    >
      {/* Sidebar */}
      <aside className={`sidebar ${ingeklapt ? "ingeklapt" : ""}`}>
        <div className="sidebar-inhoud">
          <div className="sidebar-logo">
            <p className="sidebar-logo-tekst">Tilstra LMS</p>
            <p className="sidebar-logo-sub">Traineeship portaal</p>
          </div>

          <nav className="sidebar-nav">
            {["Menu", "Beheer"].map((sectie) => {
              const items = navigatie.filter((item) => item.sectie === sectie);
              if (items.length === 0) return null;
              return (
                <div key={sectie}>
                  <p className="nav-label">{sectie}</p>
                  {items.map((item) => (
                    <button
                      key={item.label}
                      className={`nav-item ${!toonInstellingen && actief === item.label ? "actief" : ""}`}
                      onClick={() => {
                        setActief(item.label);
                        setToonInstellingen(false);
                        if (onNavigeer) onNavigeer();
                      }}
                    >
                      <span className="nav-icon">{item.icoon}</span>
                      <span className="nav-tekst">{item.label}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <div
              className="sidebar-gebruiker"
              onClick={() => {
                if (instellingenBlok) {
                  setToonInstellingen(!toonInstellingen);
                  if (onNavigeer) onNavigeer();
                }
              }}
              onMouseEnter={(e) => {
                if (!toonInstellingen)
                  e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              }}
              onMouseLeave={(e) => {
                if (!toonInstellingen)
                  e.currentTarget.style.background = "transparent";
              }}
              style={{
                cursor: instellingenBlok ? "pointer" : "default",
                background: toonInstellingen ? "#fff" : "transparent",
                color: toonInstellingen ? "var(--groen)" : "inherit",
                borderRadius: "12px",
              }}
            >
              <div
                className="avatar"
                style={{
                  color: toonInstellingen ? "var(--groen)" : "#fff",
                  border: toonInstellingen ? "2px solid var(--groen)" : "none",
                }}
              >
                {naam
                  ? naam
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : email
                    ? email.substring(0, 2).toUpperCase()
                    : "??"}
              </div>
              <div className="gebruiker-info" style={{ overflow: "hidden" }}>
                <p
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: toonInstellingen ? "var(--groen)" : "#fff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {naam || email}
                </p>
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: toonInstellingen
                      ? "rgba(46,125,50,0.7)"
                      : "rgba(255,255,255,0.6)",
                  }}
                >
                  {rol}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle knop — binnen aside, buiten sidebar-inhoud */}
        <button
          className="sidebar-toggle"
          aria-label={ingeklapt ? "Sidebar uitklappen" : "Sidebar inklappen"}
          onClick={() => setIngeklapt(!ingeklapt)}
        >
          {ingeklapt ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
            </svg>
          )}
        </button>
      </aside>

      {/* Hoofdinhoud */}
      <main
        className="hoofd"
        style={rol === "Beheerder" ? { background: "#E8EBE8" } : {}}
      >
        <div className="topbar">
          <div>
            <p className="topbar-titel">{actiefLabel}</p>
          </div>
          <button
            className="knop knop-ghost"
            style={{
              background: "var(--groen-licht)",
              color: "var(--groen-donker)",
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
            }}
            onClick={() => {
              localStorage.removeItem("email");
              localStorage.removeItem("naam");
              window.location.href = "/lms-tilstra/";
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z" />
            </svg>
            Uitloggen
          </button>
        </div>
        <div className="hoofd-inhoud">
          {overrideBlok ? (
            <div
              style={{ width: "100%", maxWidth: "1000px", margin: "0 auto" }}
            >
              {overrideBlok}
            </div>
          ) : toonInstellingen && instellingenBlok ? (
            <div
              style={{ width: "100%", maxWidth: "1000px", margin: "0 auto" }}
            >
              {instellingenBlok}
            </div>
          ) : (
            navigatie.map((item) =>
              actief === item.label ? (
                <div
                  key={item.label}
                  style={
                    item.volledigBreed
                      ? {
                          position: "fixed",
                          top: "72px",
                          left: ingeklapt ? "76px" : "240px",
                          right: 0,
                          bottom: 0,
                          zIndex: 5,
                          overflowY: "auto",
                          background: "var(--grijs-100)",
                          transition: "left 0.25s ease",
                        }
                      : { width: "100%", maxWidth: "1000px", margin: "0 auto" }
                  }
                >
                  {item.blok}
                </div>
              ) : null,
            )
          )}

          {kinderen}
        </div>
      </main>
    </div>
  );
}
