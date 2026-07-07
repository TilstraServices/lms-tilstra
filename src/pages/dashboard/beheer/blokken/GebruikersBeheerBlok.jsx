import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

const ROL_OPTIES = ["trainee", "leidinggevende", "beheerder"];
const PAD_OPTIES = ["payroll", "finance", "hr"];
const PAD_LABELS = { payroll: "Payroll", finance: "Finance", hr: "HR" };

function GebruikerRij({ gebruiker, onOpslaan, onVerwijder }) {
  const [toonPopup, setToonPopup] = useState(false);

  const initialen = gebruiker.naam
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <tr
        onClick={() => setToonPopup(true)}
        style={{ cursor: "pointer" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--grijs-50)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <td style={{ paddingLeft: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              className="avatar"
              style={{
                background: "var(--groen-licht)",
                color: "var(--groen-donker)",
              }}
            >
              {initialen}
            </div>
            <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>
              {gebruiker.naam}
            </p>
          </div>
        </td>
        <td style={{ fontSize: "0.85rem", color: "var(--grijs-700)" }}>
          {gebruiker.email}
        </td>
        <td>
          <span
            className={`badge ${gebruiker.rol === "trainee" ? "badge-groen" : gebruiker.rol === "leidinggevende" ? "badge-blauw" : "badge-oranje"}`}
          >
            {gebruiker.rol}
          </span>
        </td>
        <td>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "50px",
              background: gebruiker.auth_id ? "#E8F5E9" : "#FFEBEE",
              color: gebruiker.auth_id ? "#2E7D32" : "#C62828",
            }}
          >
            <span style={{ fontSize: "0.6rem" }}>
              {gebruiker.auth_id ? "●" : "○"}
            </span>
            {gebruiker.auth_id ? "Actief" : "Geen auth"}
          </span>
        </td>
        <td style={{ fontSize: "0.82rem", color: "var(--grijs-500)" }}>
          {new Date(gebruiker.aangemaakt_op).toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </td>
      </tr>

      {toonPopup && (
        <GebruikerPopup
          gebruiker={gebruiker}
          onOpslaan={async (data) => {
            await onOpslaan(gebruiker.email, data);
            setToonPopup(false);
          }}
          onVerwijder={async () => {
            await onVerwijder(gebruiker.email);
            setToonPopup(false);
          }}
          onSluit={() => setToonPopup(false)}
        />
      )}
    </>
  );
}

function GebruikerPopup({ gebruiker, onOpslaan, onVerwijder, onSluit }) {
  const [naam, setNaam] = useState(gebruiker.naam);
  const [email, setEmail] = useState(gebruiker.email);
  const [rol, setRol] = useState(gebruiker.rol);
  const [toonVerwijderBevestiging, setToonVerwijderBevestiging] =
    useState(false);
  const [laden, setLaden] = useState(false);

  async function opslaan() {
    setLaden(true);
    await onOpslaan({ naam, email, rol });
    setLaden(false);
  }

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
          padding: "28px",
          width: "420px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {toonVerwijderBevestiging ? (
          <>
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--grijs-900)",
                marginBottom: "8px",
              }}
            >
              Gebruiker verwijderen?
            </p>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--grijs-500)",
                marginBottom: "24px",
              }}
            >
              Weet je zeker dat je <strong>{gebruiker.naam}</strong> wilt
              verwijderen? Dit kan niet ongedaan worden gemaakt.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={onVerwijder}
                className="knop knop-gevaar"
                style={{ fontSize: "0.82rem" }}
              >
                Ja, verwijderen
              </button>
              <button
                onClick={() => setToonVerwijderBevestiging(false)}
                className="knop knop-ghost"
                style={{ fontSize: "0.82rem" }}
              >
                Annuleren
              </button>
            </div>
          </>
        ) : (
          <>
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--grijs-900)",
                marginBottom: "20px",
              }}
            >
              Gebruiker bewerken
            </p>

            <label
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--grijs-500)",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Naam
            </label>
            <input
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              style={{
                width: "100%",
                fontSize: "0.85rem",
                border: "1px solid var(--grijs-300)",
                borderRadius: "6px",
                padding: "7px 10px",
                marginBottom: "12px",
              }}
            />

            <label
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--grijs-500)",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                fontSize: "0.85rem",
                border: "1px solid var(--grijs-300)",
                borderRadius: "6px",
                padding: "7px 10px",
                marginBottom: "12px",
              }}
            />

            <label
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--grijs-500)",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Rol
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              style={{
                width: "100%",
                fontSize: "0.85rem",
                border: "1px solid var(--grijs-300)",
                borderRadius: "6px",
                padding: "7px 10px",
                marginBottom: "20px",
              }}
            >
              {ROL_OPTIES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "space-between",
              }}
            >
              <button
                onClick={() => setToonVerwijderBevestiging(true)}
                className="knop knop-gevaar"
                style={{ fontSize: "0.82rem" }}
              >
                Verwijderen
              </button>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={onSluit}
                  className="knop knop-ghost"
                  style={{ fontSize: "0.82rem" }}
                >
                  Annuleren
                </button>
                <button
                  onClick={opslaan}
                  disabled={laden}
                  className="knop knop-primair"
                  style={{ fontSize: "0.82rem" }}
                >
                  {laden ? "Opslaan..." : "Opslaan"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NieuweGebruikerFormulier({ leidinggevenden, onOpslaan, onAnnuleer }) {
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("trainee");
  const [pad, setPad] = useState("payroll");
  const [leidinggevendeEmail, setLeidinggevendeEmail] = useState(
    leidinggevenden[0]?.email || "",
  );
  const [laden, setLaden] = useState(false);
  const [fout, setFout] = useState(null);

  async function opslaan() {
    if (!naam || !email) {
      setFout("Naam en email zijn verplicht.");
      return;
    }

    const bevestigd = window.confirm(
      `⚠️ Vergeet niet om "${naam}" (${email}) ook handmatig aan te maken in Supabase Auth!\n\nKlik OK als je dit hebt gedaan of dit gaat doen.`,
    );
    if (!bevestigd) return;

    setLaden(true);
    setFout(null);
    await onOpslaan({ naam, email, rol, pad, leidinggevendeEmail });
    setLaden(false);
  }

  return (
    <div
      style={{
        background: "#F9F9F9",
        border: "1px solid var(--grijs-200)",
        borderRadius: "10px",
        padding: "20px 24px",
        marginBottom: "16px",
      }}
    >
      <p
        style={{
          fontSize: "0.88rem",
          fontWeight: 700,
          color: "var(--grijs-900)",
          marginBottom: "16px",
        }}
      >
        Nieuwe gebruiker
      </p>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
      >
        <div>
          <label
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "var(--grijs-500)",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Naam *
          </label>
          <input
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            placeholder="Voor- en achternaam"
            style={{
              width: "100%",
              fontSize: "0.85rem",
              border: "1px solid var(--grijs-300)",
              borderRadius: "6px",
              padding: "7px 10px",
            }}
          />
        </div>
        <div>
          <label
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "var(--grijs-500)",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Email *
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@tilstraservices.nl"
            style={{
              width: "100%",
              fontSize: "0.85rem",
              border: "1px solid var(--grijs-300)",
              borderRadius: "6px",
              padding: "7px 10px",
            }}
          />
        </div>
        <div>
          <label
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "var(--grijs-500)",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Rol *
          </label>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            style={{
              width: "100%",
              fontSize: "0.85rem",
              border: "1px solid var(--grijs-300)",
              borderRadius: "6px",
              padding: "7px 10px",
            }}
          >
            {ROL_OPTIES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        {rol === "trainee" && (
          <>
            <div>
              <label
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--grijs-500)",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Learning path
              </label>
              <select
                value={pad}
                onChange={(e) => setPad(e.target.value)}
                style={{
                  width: "100%",
                  fontSize: "0.85rem",
                  border: "1px solid var(--grijs-300)",
                  borderRadius: "6px",
                  padding: "7px 10px",
                }}
              >
                {PAD_OPTIES.map((p) => (
                  <option key={p} value={p}>
                    {PAD_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--grijs-500)",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Leidinggevende
              </label>
              <select
                value={leidinggevendeEmail}
                onChange={(e) => setLeidinggevendeEmail(e.target.value)}
                style={{
                  width: "100%",
                  fontSize: "0.85rem",
                  border: "1px solid var(--grijs-300)",
                  borderRadius: "6px",
                  padding: "7px 10px",
                }}
              >
                {leidinggevenden.map((l) => (
                  <option key={l.email} value={l.email}>
                    {l.naam}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
      {fout && (
        <p style={{ fontSize: "0.82rem", color: "#C62828", marginTop: "10px" }}>
          {fout}
        </p>
      )}
      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        <button
          onClick={opslaan}
          disabled={laden}
          className="knop knop-primair"
          style={{ fontSize: "0.82rem" }}
        >
          {laden ? "Opslaan..." : "Gebruiker aanmaken"}
        </button>
        <button
          onClick={onAnnuleer}
          className="knop knop-ghost"
          style={{ fontSize: "0.82rem" }}
        >
          Annuleren
        </button>
      </div>
    </div>
  );
}

function KoppelingRij({
  koppeling,
  trainees,
  leidinggevenden,
  onOpslaan,
  onVerwijder,
}) {
  const [toonPopup, setToonPopup] = useState(false);

  const traineeNaam =
    trainees.find((t) => t.email === koppeling.trainee_email)?.naam ||
    koppeling.trainee_email;
  const lgNaam =
    leidinggevenden.find((l) => l.email === koppeling.leidinggevende_email)
      ?.naam || koppeling.leidinggevende_email;

  return (
    <>
      <tr
        onClick={() => setToonPopup(true)}
        style={{ cursor: "pointer" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--grijs-50)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <td style={{ paddingLeft: "24px", textAlign: "center" }}>
          <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>{lgNaam}</p>
          <p style={{ fontSize: "0.72rem", color: "var(--grijs-500)" }}>
            {koppeling.leidinggevende_email}
          </p>
        </td>
        <td style={{ width: "120px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{ flex: 1, height: "1px", background: "var(--grijs-300)" }}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 256 256"
              fill="var(--grijs-400)"
            >
              <path d="M240,88.23a54.43,54.43,0,0,1-16,37L189.25,160a54.27,54.27,0,0,1-38.63,16h-.05A54.63,54.63,0,0,1,96,119.84a8,8,0,0,1,16,.45A38.62,38.62,0,0,0,150.58,160h0a38.39,38.39,0,0,0,27.31-11.31l34.75-34.75a38.63,38.63,0,0,0-54.63-54.63l-11,11A8,8,0,0,1,135.7,59l11-11A54.65,54.65,0,0,1,224,48,54.86,54.86,0,0,1,240,88.23ZM109,185.66l-11,11A38.41,38.41,0,0,1,70.6,208h0a38.63,38.63,0,0,1-27.29-65.94L78,107.31A38.63,38.63,0,0,1,144,135.71a8,8,0,0,0,16,.45A54.86,54.86,0,0,0,144,96a54.65,54.65,0,0,0-77.27,0L32,130.75A54.62,54.62,0,0,0,70.56,224h0a54.28,54.28,0,0,0,38.64-16l11-11A8,8,0,0,0,109,185.66Z" />
            </svg>
            <div
              style={{ flex: 1, height: "1px", background: "var(--grijs-300)" }}
            />
          </div>
        </td>
        <td style={{ textAlign: "center" }}>
          <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>{traineeNaam}</p>
          <p style={{ fontSize: "0.72rem", color: "var(--grijs-500)" }}>
            {koppeling.trainee_email}
          </p>
        </td>
      </tr>

      {toonPopup && (
        <KoppelingPopup
          koppeling={koppeling}
          trainees={trainees}
          leidinggevenden={leidinggevenden}
          onOpslaan={async (data) => {
            await onOpslaan(koppeling, data);
            setToonPopup(false);
          }}
          onVerwijder={async () => {
            await onVerwijder(koppeling);
            setToonPopup(false);
          }}
          onSluit={() => setToonPopup(false)}
        />
      )}
    </>
  );
}

function KoppelingPopup({
  koppeling,
  trainees,
  leidinggevenden,
  onOpslaan,
  onVerwijder,
  onSluit,
}) {
  const [traineeEmail, setTraineeEmail] = useState(koppeling.trainee_email);
  const [lgEmail, setLgEmail] = useState(koppeling.leidinggevende_email);
  const [toonVerwijderBevestiging, setToonVerwijderBevestiging] =
    useState(false);
  const [laden, setLaden] = useState(false);

  async function opslaan() {
    setLaden(true);
    await onOpslaan({
      trainee_email: traineeEmail,
      leidinggevende_email: lgEmail,
    });
    setLaden(false);
  }

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
          padding: "28px",
          width: "420px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {toonVerwijderBevestiging ? (
          <>
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--grijs-900)",
                marginBottom: "8px",
              }}
            >
              Koppeling verwijderen?
            </p>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--grijs-500)",
                marginBottom: "24px",
              }}
            >
              Weet je zeker dat je deze koppeling wilt verwijderen? Dit kan niet
              ongedaan worden gemaakt.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={onVerwijder}
                className="knop knop-gevaar"
                style={{ fontSize: "0.82rem" }}
              >
                Ja, verwijderen
              </button>
              <button
                onClick={() => setToonVerwijderBevestiging(false)}
                className="knop knop-ghost"
                style={{ fontSize: "0.82rem" }}
              >
                Annuleren
              </button>
            </div>
          </>
        ) : (
          <>
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--grijs-900)",
                marginBottom: "20px",
              }}
            >
              Koppeling bewerken
            </p>

            <label
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--grijs-500)",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Trainee
            </label>
            <select
              value={traineeEmail}
              onChange={(e) => setTraineeEmail(e.target.value)}
              style={{
                width: "100%",
                fontSize: "0.85rem",
                border: "1px solid var(--grijs-300)",
                borderRadius: "6px",
                padding: "7px 10px",
                marginBottom: "12px",
              }}
            >
              {trainees.map((t) => (
                <option key={t.email} value={t.email}>
                  {t.naam}
                </option>
              ))}
            </select>

            <label
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--grijs-500)",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Leidinggevende
            </label>
            <select
              value={lgEmail}
              onChange={(e) => setLgEmail(e.target.value)}
              style={{
                width: "100%",
                fontSize: "0.85rem",
                border: "1px solid var(--grijs-300)",
                borderRadius: "6px",
                padding: "7px 10px",
                marginBottom: "20px",
              }}
            >
              {leidinggevenden.map((l) => (
                <option key={l.email} value={l.email}>
                  {l.naam}
                </option>
              ))}
            </select>

            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "space-between",
              }}
            >
              <button
                onClick={() => setToonVerwijderBevestiging(true)}
                className="knop knop-gevaar"
                style={{ fontSize: "0.82rem" }}
              >
                Verwijderen
              </button>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={onSluit}
                  className="knop knop-ghost"
                  style={{ fontSize: "0.82rem" }}
                >
                  Annuleren
                </button>
                <button
                  onClick={opslaan}
                  disabled={laden}
                  className="knop knop-primair"
                  style={{ fontSize: "0.82rem" }}
                >
                  {laden ? "Opslaan..." : "Opslaan"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NieuweKoppelingFormulier({
  trainees,
  leidinggevenden,
  onOpslaan,
  onAnnuleer,
}) {
  const [traineeEmail, setTraineeEmail] = useState(trainees[0]?.email || "");
  const [lgEmail, setLgEmail] = useState(leidinggevenden[0]?.email || "");
  const [laden, setLaden] = useState(false);

  async function opslaan() {
    setLaden(true);
    await onOpslaan({
      trainee_email: traineeEmail,
      leidinggevende_email: lgEmail,
    });
    setLaden(false);
  }

  return (
    <div
      style={{
        background: "#F9F9F9",
        border: "1px solid var(--grijs-200)",
        borderRadius: "10px",
        padding: "20px 24px",
        marginBottom: "16px",
      }}
    >
      <p
        style={{
          fontSize: "0.88rem",
          fontWeight: 700,
          color: "var(--grijs-900)",
          marginBottom: "16px",
        }}
      >
        Nieuwe koppeling
      </p>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
      >
        <div>
          <label
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "var(--grijs-500)",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Trainee
          </label>
          <select
            value={traineeEmail}
            onChange={(e) => setTraineeEmail(e.target.value)}
            style={{
              width: "100%",
              fontSize: "0.85rem",
              border: "1px solid var(--grijs-300)",
              borderRadius: "6px",
              padding: "7px 10px",
            }}
          >
            {trainees.map((t) => (
              <option key={t.email} value={t.email}>
                {t.naam}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "var(--grijs-500)",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Leidinggevende
          </label>
          <select
            value={lgEmail}
            onChange={(e) => setLgEmail(e.target.value)}
            style={{
              width: "100%",
              fontSize: "0.85rem",
              border: "1px solid var(--grijs-300)",
              borderRadius: "6px",
              padding: "7px 10px",
            }}
          >
            {leidinggevenden.map((l) => (
              <option key={l.email} value={l.email}>
                {l.naam}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        <button
          onClick={opslaan}
          disabled={laden}
          className="knop knop-primair"
          style={{ fontSize: "0.82rem" }}
        >
          {laden ? "Opslaan..." : "Koppeling aanmaken"}
        </button>
        <button
          onClick={onAnnuleer}
          className="knop knop-ghost"
          style={{ fontSize: "0.82rem" }}
        >
          Annuleren
        </button>
      </div>
    </div>
  );
}

export default function GebruikersBeheerBlok() {
  const [gebruikers, setGebruikers] = useState([]);
  const [koppelingen, setKoppelingen] = useState([]);
  const [laden, setLaden] = useState(true);
  const [toonNieuwGebruiker, setToonNieuwGebruiker] = useState(false);
  const [toonNieuweKoppeling, setToonNieuweKoppeling] = useState(false);
  const [melding, setMelding] = useState(null);

  const trainees = gebruikers.filter((g) => g.rol === "trainee");
  const leidinggevenden = gebruikers.filter(
    (g) => g.rol === "leidinggevende" || g.rol === "beheerder",
  );

  useEffect(() => {
    laadData();
  }, []);

  async function laadData() {
    setLaden(true);
    const [gebruikersRes, koppelingenRes] = await Promise.all([
      supabase
        .from("gebruikers")
        .select("naam, email, rol, aangemaakt_op, auth_id")
        .order("aangemaakt_op", { ascending: false }),
      supabase.from("koppeling").select("trainee_email, leidinggevende_email"),
    ]);
    setGebruikers(gebruikersRes.data || []);
    setKoppelingen(koppelingenRes.data || []);
    setLaden(false);
  }

  function toonMelding(tekst, type = "success") {
    setMelding({ tekst, type });
    setTimeout(() => setMelding(null), 3000);
  }

  async function gebruikerVerwijder(email) {
    const { error } = await supabase
      .from("gebruikers")
      .delete()
      .eq("email", email);
    if (error) {
      toonMelding("Verwijderen mislukt.", "error");
      return;
    }
    setMelding({ tekst: "Gebruiker verwijderd.", type: "popup" });
    laadData();
  }

  async function gebruikerOpslaan(oudeEmail, data) {
    const { error } = await supabase
      .from("gebruikers")
      .update({ naam: data.naam, email: data.email, rol: data.rol })
      .eq("email", oudeEmail);
    if (error) {
      toonMelding("Opslaan mislukt.", "error");
      return;
    }
    setMelding({ tekst: "Gebruiker bijgewerkt.", type: "popup" });
    laadData();
  }

  async function nieuweGebruikerOpslaan(data) {
    const { error } = await supabase
      .from("gebruikers")
      .insert({ naam: data.naam, email: data.email, rol: data.rol });
    if (error) {
      toonMelding("Aanmaken mislukt. Email bestaat mogelijk al.", "error");
      return;
    }

    if (data.rol === "trainee") {
      await supabase.from("koppeling").insert({
        trainee_email: data.email,
        leidinggevende_email: data.leidinggevendeEmail,
      });
      await supabase.from("learning_path").insert({
        trainee_email: data.email,
        pad: data.pad,
        actief: true,
        volgorde: 1,
      });
    }

    toonMelding("Gebruiker aangemaakt.");
    setToonNieuwGebruiker(false);
    laadData();
  }

  async function koppelingOpslaan(oud, nieuw) {
    await supabase
      .from("koppeling")
      .update({ leidinggevende_email: nieuw.leidinggevende_email })
      .eq("trainee_email", oud.trainee_email)
      .eq("leidinggevende_email", oud.leidinggevende_email);
    setMelding({ tekst: "Koppeling bijgewerkt.", type: "popup" });
    laadData();
  }

  async function koppelingVerwijder(koppeling) {
    await supabase
      .from("koppeling")
      .delete()
      .eq("trainee_email", koppeling.trainee_email)
      .eq("leidinggevende_email", koppeling.leidinggevende_email);
    setMelding({ tekst: "Koppeling verwijderd.", type: "popup" });
    laadData();
  }

  async function nieuweKoppelingOpslaan(data) {
    const { error } = await supabase.from("koppeling").insert(data);
    if (error) {
      toonMelding("Koppeling aanmaken mislukt.", "error");
      return;
    }
    toonMelding("Koppeling aangemaakt.");
    setToonNieuweKoppeling(false);
    laadData();
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
      {/* Popup melding */}
      {melding?.type === "popup" && (
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
          onClick={() => setMelding(null)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "32px 40px",
              textAlign: "center",
              boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
              maxWidth: "340px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ fontSize: "2rem", marginBottom: "8px" }}>✓</p>
            <p
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#1b5e20",
                marginBottom: "4px",
              }}
            >
              Opgeslagen!
            </p>
            <p style={{ fontSize: "0.85rem", color: "#616161" }}>
              {melding.tekst}
            </p>
            <button
              onClick={() => setMelding(null)}
              style={{
                marginTop: "16px",
                padding: "8px 24px",
                borderRadius: "50px",
                background: "#2e7d32",
                color: "white",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Inline melding */}
      {melding && melding.type !== "popup" && (
        <div
          style={{
            background:
              melding.type === "success"
                ? "#E8F5E9"
                : melding.type === "waarschuwing"
                  ? "#FFF8E1"
                  : "#FFEBEE",
            border: `1px solid ${melding.type === "success" ? "#A5D6A7" : melding.type === "waarschuwing" ? "#FFD54F" : "#EF9A9A"}`,
            color:
              melding.type === "success"
                ? "#1B5E20"
                : melding.type === "waarschuwing"
                  ? "#E65100"
                  : "#C62828",
            borderRadius: "8px",
            padding: "10px 16px",
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: "16px",
          }}
        >
          {melding.tekst}
        </div>
      )}

      {/* Gebruikers sectie */}
      <div style={{ marginBottom: "36px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--grijs-900)",
              }}
            >
              Gebruikers
            </p>
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--grijs-500)",
                marginTop: "2px",
              }}
            >
              {gebruikers.length} gebruikers in het systeem
            </p>
          </div>
          <button
            onClick={() => setToonNieuwGebruiker(true)}
            className="knop knop-primair"
            style={{ fontSize: "0.82rem" }}
          >
            + Nieuwe gebruiker
          </button>
        </div>

        {toonNieuwGebruiker && (
          <NieuweGebruikerFormulier
            leidinggevenden={leidinggevenden}
            onOpslaan={nieuweGebruikerOpslaan}
            onAnnuleer={() => setToonNieuwGebruiker(false)}
          />
        )}

        {/* Trainees & Klanten */}
        <p
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--grijs-500)",
            marginBottom: "8px",
          }}
        >
          Trainees & Klanten
        </p>
        <div
          style={{
            background: "white",
            border: "1px solid var(--grijs-200)",
            borderRadius: "10px",
            boxShadow: "var(--schaduw)",
            overflow: "hidden",
            marginBottom: "24px",
          }}
        >
          <table className="tabel" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: "24px" }}>Naam</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Auth</th>
                <th>Aangemaakt op</th>
              </tr>
            </thead>
            <tbody>
              {gebruikers
                .filter((g) => g.rol === "trainee" || g.rol === "klant")
                .map((g) => (
                  <GebruikerRij
                    key={g.email}
                    gebruiker={g}
                    onOpslaan={gebruikerOpslaan}
                    onVerwijder={gebruikerVerwijder}
                  />
                ))}
            </tbody>
          </table>
        </div>

        {/* Leidinggevenden & Beheerders */}
        <p
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--grijs-500)",
            marginBottom: "8px",
          }}
        >
          Leidinggevenden & Beheerders
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
                <th>Email</th>
                <th>Rol</th>
                <th>Auth</th>
                <th>Aangemaakt op</th>
              </tr>
            </thead>
            <tbody>
              {gebruikers
                .filter(
                  (g) => g.rol === "leidinggevende" || g.rol === "beheerder",
                )
                .map((g) => (
                  <GebruikerRij
                    key={g.email}
                    gebruiker={g}
                    onOpslaan={gebruikerOpslaan}
                    onVerwijder={gebruikerVerwijder}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Koppelingen sectie */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--grijs-900)",
              }}
            >
              Koppelingen
            </p>
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--grijs-500)",
                marginTop: "2px",
              }}
            >
              Trainee — leidinggevende koppelingen
            </p>
          </div>
          <button
            onClick={() => setToonNieuweKoppeling(true)}
            className="knop knop-primair"
            style={{ fontSize: "0.82rem" }}
          >
            + Nieuwe koppeling
          </button>
        </div>

        {toonNieuweKoppeling && (
          <NieuweKoppelingFormulier
            trainees={trainees}
            leidinggevenden={leidinggevenden}
            onOpslaan={nieuweKoppelingOpslaan}
            onAnnuleer={() => setToonNieuweKoppeling(false)}
          />
        )}

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
                <th style={{ paddingLeft: "24px", textAlign: "center" }}>
                  Leidinggevende
                </th>
                <th style={{ width: "120px" }}></th>
                <th style={{ textAlign: "center" }}>Trainee</th>
              </tr>
            </thead>
            <tbody>
              {koppelingen.map((k, i) => (
                <KoppelingRij
                  key={i}
                  koppeling={k}
                  trainees={trainees}
                  leidinggevenden={leidinggevenden}
                  onOpslaan={koppelingOpslaan}
                  onVerwijder={koppelingVerwijder}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
