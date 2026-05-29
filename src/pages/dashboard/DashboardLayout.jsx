import { useState } from "react";
import "./dashboard.css";

export default function DashboardLayout({
  navigatie,
  kinderen,
  naam,
  email,
  rol,
}) {
  const [ingeklapt, setIngeklapt] = useState(false);
  const [actief, setActief] = useState(navigatie[0]?.label);

  return (
    <div className={`layout ${ingeklapt ? "ingeklapt" : ""}`}>
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
                      className={`nav-item ${actief === item.label ? "actief" : ""}`}
                      onClick={() => setActief(item.label)}
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
            <div className="sidebar-gebruiker">
              <div
                className="avatar"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
              >
                {naam
                  ? naam.substring(0, 2).toUpperCase()
                  : email
                    ? email.substring(0, 2).toUpperCase()
                    : "??"}
              </div>
              <div className="gebruiker-info" style={{ overflow: "hidden" }}>
                <p
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#fff",
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
                    color: "rgba(255,255,255,0.6)",
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
      <main className="hoofd">
        <div className="topbar">
          <div>
            <p className="topbar-titel">{actief}</p>
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

        {navigatie.map((item) =>
          actief === item.label ? (
            <div key={item.label}>{item.blok}</div>
          ) : null,
        )}

        {kinderen}
      </main>
    </div>
  );
}
