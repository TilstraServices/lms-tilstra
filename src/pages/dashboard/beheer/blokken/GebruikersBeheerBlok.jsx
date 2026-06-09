import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

const ROL_OPTIES = ["trainee", "leidinggevende", "beheerder"];
const PAD_OPTIES = ["payroll", "finance", "hr"];
const PAD_LABELS = { payroll: "Payroll", finance: "Finance", hr: "HR" };

function GebruikerRij({ gebruiker, onOpslaan, onVerwijder, kanVerwijderen }) {
  const [bewerken, setBewerken] = useState(false);
  const [naam, setNaam] = useState(gebruiker.naam);
  const [email, setEmail] = useState(gebruiker.email);
  const [rol, setRol] = useState(gebruiker.rol);

  async function opslaan() {
    await onOpslaan(gebruiker.email, { naam, email, rol });
    setBewerken(false);
  }

  const initialen = gebruiker.naam
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (bewerken) {
    return (
      <tr style={{ background: "#FFFDE7" }}>
        <td style={{ paddingLeft: "24px" }}>
          <input
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            style={{
              fontSize: "0.85rem",
              border: "1px solid var(--grijs-300)",
              borderRadius: "6px",
              padding: "4px 8px",
              width: "160px",
            }}
          />
        </td>
        <td>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              fontSize: "0.85rem",
              border: "1px solid var(--grijs-300)",
              borderRadius: "6px",
              padding: "4px 8px",
              width: "200px",
            }}
          />
        </td>
        <td>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            style={{
              fontSize: "0.85rem",
              border: "1px solid var(--grijs-300)",
              borderRadius: "6px",
              padding: "4px 8px",
            }}
          >
            {ROL_OPTIES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </td>
        <td style={{ fontSize: "0.82rem", color: "var(--grijs-500)" }}>
          {new Date(gebruiker.aangemaakt_op).toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </td>
        <td>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={opslaan}
              className="knop knop-primair"
              style={{ fontSize: "0.75rem", padding: "4px 12px" }}
            >
              Opslaan
            </button>
            <button
              onClick={() => setBewerken(false)}
              className="knop knop-ghost"
              style={{ fontSize: "0.75rem", padding: "4px 12px" }}
            >
              Annuleren
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
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
      <td style={{ fontSize: "0.82rem", color: "var(--grijs-500)" }}>
        {new Date(gebruiker.aangemaakt_op).toLocaleDateString("nl-NL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </td>
      <td>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setBewerken(true)}
            className="knop knop-ghost"
            style={{ padding: "4px 8px" }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 256 256"
              fill="currentColor"
            >
              <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z" />
            </svg>
          </button>
          {kanVerwijderen && (
            <button
              onClick={() => onVerwijder(gebruiker.email)}
              className="knop knop-gevaar"
              style={{ padding: "4px 8px" }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 256 256"
                fill="currentColor"
              >
                <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
              </svg>
            </button>
          )}
        </div>
      </td>
    </tr>
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
  const [bewerken, setBewerken] = useState(false);
  const [traineeEmail, setTraineeEmail] = useState(koppeling.trainee_email);
  const [lgEmail, setLgEmail] = useState(koppeling.leidinggevende_email);

  async function opslaan() {
    await onOpslaan(koppeling, {
      trainee_email: traineeEmail,
      leidinggevende_email: lgEmail,
    });
    setBewerken(false);
  }

  if (bewerken) {
    return (
      <tr style={{ background: "#FFFDE7" }}>
        <td style={{ paddingLeft: "24px" }}>
          <select
            value={traineeEmail}
            onChange={(e) => setTraineeEmail(e.target.value)}
            style={{
              fontSize: "0.85rem",
              border: "1px solid var(--grijs-300)",
              borderRadius: "6px",
              padding: "4px 8px",
            }}
          >
            {trainees.map((t) => (
              <option key={t.email} value={t.email}>
                {t.naam}
              </option>
            ))}
          </select>
        </td>
        <td>
          <select
            value={lgEmail}
            onChange={(e) => setLgEmail(e.target.value)}
            style={{
              fontSize: "0.85rem",
              border: "1px solid var(--grijs-300)",
              borderRadius: "6px",
              padding: "4px 8px",
            }}
          >
            {leidinggevenden.map((l) => (
              <option key={l.email} value={l.email}>
                {l.naam}
              </option>
            ))}
          </select>
        </td>
        <td>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={opslaan}
              className="knop knop-primair"
              style={{ fontSize: "0.75rem", padding: "4px 12px" }}
            >
              Opslaan
            </button>
            <button
              onClick={() => setBewerken(false)}
              className="knop knop-ghost"
              style={{ fontSize: "0.75rem", padding: "4px 12px" }}
            >
              Annuleren
            </button>
          </div>
        </td>
      </tr>
    );
  }

  const traineeNaam =
    trainees.find((t) => t.email === koppeling.trainee_email)?.naam ||
    koppeling.trainee_email;
  const lgNaam =
    leidinggevenden.find((l) => l.email === koppeling.leidinggevende_email)
      ?.naam || koppeling.leidinggevende_email;

  return (
    <tr>
      <td style={{ paddingLeft: "24px", textAlign: "center" }}>
        <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>{traineeNaam}</p>
        <p style={{ fontSize: "0.72rem", color: "var(--grijs-500)" }}>
          {koppeling.trainee_email}
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
      <td>
        <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>{lgNaam}</p>
        <p style={{ fontSize: "0.72rem", color: "var(--grijs-500)" }}>
          {koppeling.leidinggevende_email}
        </p>
      </td>
      <td>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setBewerken(true)}
            className="knop knop-ghost"
            style={{ padding: "4px 8px" }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 256 256"
              fill="currentColor"
            >
              <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z" />
            </svg>
          </button>
          <button
            onClick={() => onVerwijder(koppeling)}
            className="knop knop-gevaar"
            style={{ padding: "4px 8px" }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 256 256"
              fill="currentColor"
            >
              <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
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
        .select("naam, email, rol, aangemaakt_op")
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
    toonMelding("Gebruiker verwijderd.");
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
    toonMelding("Gebruiker bijgewerkt.");
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
    toonMelding("Koppeling bijgewerkt.");
    laadData();
  }

  async function koppelingVerwijder(koppeling) {
    await supabase
      .from("koppeling")
      .delete()
      .eq("trainee_email", koppeling.trainee_email)
      .eq("leidinggevende_email", koppeling.leidinggevende_email);
    toonMelding("Koppeling verwijderd.");
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
      {/* Melding */}
      {melding && (
        <div
          style={{
            background: melding.type === "success" ? "#E8F5E9" : "#FFEBEE",
            border: `1px solid ${melding.type === "success" ? "#A5D6A7" : "#EF9A9A"}`,
            color: melding.type === "success" ? "#1B5E20" : "#C62828",
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
                <th>Aangemaakt op</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {gebruikers.map((g) => (
                <GebruikerRij
                  key={g.email}
                  gebruiker={g}
                  onOpslaan={gebruikerOpslaan}
                  onVerwijder={gebruikerVerwijder}
                  kanVerwijderen={true}
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
                  Trainee
                </th>
                <th style={{ width: "120px" }}></th>
                <th style={{ textAlign: "center" }}>Leidinggevende</th>
                <th></th>
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
