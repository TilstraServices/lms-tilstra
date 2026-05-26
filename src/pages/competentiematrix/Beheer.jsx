import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

function Beheer() {
  const navigate = useNavigate();
  const [gebruikers, setGebruikers] = useState([]);
  const [koppelingen, setKoppelingen] = useState([]);
  const [laden, setLaden] = useState(true);
  const [actieveTab, setActieveTab] = useState("gebruikers");
  const [feedback, setFeedback] = useState(null);

  // Nieuw gebruiker formulier
  const [nieuwNaam, setNieuwNaam] = useState("");
  const [nieuwEmail, setNieuwEmail] = useState("");
  const [nieuwRol, setNieuwRol] = useState("trainee");

  // Nieuwe koppeling formulier
  const [koppelLeidinggevende, setKoppelLeidinggevende] = useState("");
  const [koppelTrainee, setKoppelTrainee] = useState("");

  useEffect(() => {
    laadData();
  }, []);

  async function laadData() {
    setLaden(true);

    const [{ data: gData }, { data: kData }] = await Promise.all([
      supabase.from("gebruikers").select("email, naam, rol").order("naam"),
      supabase
        .from("koppeling")
        .select("leidinggevende_email, trainee_email, trainee_naam"),
    ]);

    setGebruikers(gData || []);
    setKoppelingen(kData || []);
    setLaden(false);
  }

  // ── Gebruiker toevoegen ──
  async function voegGebruikerToe() {
    setFeedback(null);
    if (!nieuwNaam || !nieuwEmail) {
      setFeedback({ type: "error", tekst: "Vul naam en e-mailadres in." });
      return;
    }

    const { error } = await supabase.from("gebruikers").insert({
      naam: nieuwNaam,
      email: nieuwEmail.toLowerCase(),
      rol: nieuwRol,
    });

    if (error) {
      setFeedback({
        type: "error",
        tekst: "Fout bij toevoegen. E-mailadres bestaat mogelijk al.",
      });
      return;
    }

    setFeedback({
      type: "success",
      tekst: `✓ ${nieuwNaam} toegevoegd als ${nieuwRol}.`,
    });
    setNieuwNaam("");
    setNieuwEmail("");
    setNieuwRol("trainee");
    laadData();
  }

  // ── Gebruiker verwijderen ──
  async function verwijderGebruiker(email) {
    if (!confirm(`Weet je zeker dat je ${email} wilt verwijderen?`)) return;

    const { error } = await supabase
      .from("gebruikers")
      .delete()
      .eq("email", email);

    if (error) {
      setFeedback({ type: "error", tekst: "Fout bij verwijderen." });
      return;
    }

    setFeedback({ type: "success", tekst: `✓ ${email} verwijderd.` });
    laadData();
  }

  // ── Koppeling toevoegen ──
  async function voegKoppelingToe() {
    setFeedback(null);
    if (!koppelLeidinggevende || !koppelTrainee) {
      setFeedback({
        type: "error",
        tekst: "Kies een leidinggevende en een trainee.",
      });
      return;
    }

    const trainee = gebruikers.find((g) => g.email === koppelTrainee);

    const { error } = await supabase.from("koppeling").insert({
      leidinggevende_email: koppelLeidinggevende,
      trainee_email: koppelTrainee,
      trainee_naam: trainee?.naam || koppelTrainee,
    });

    if (error) {
      setFeedback({
        type: "error",
        tekst: "Fout bij koppelen. Koppeling bestaat mogelijk al.",
      });
      return;
    }

    setFeedback({ type: "success", tekst: "✓ Koppeling toegevoegd." });
    setKoppelLeidinggevende("");
    setKoppelTrainee("");
    laadData();
  }

  // ── Koppeling verwijderen ──
  async function verwijderKoppeling(lgEmail, traineeEmail) {
    const { error } = await supabase
      .from("koppeling")
      .delete()
      .eq("leidinggevende_email", lgEmail)
      .eq("trainee_email", traineeEmail);

    if (error) {
      setFeedback({ type: "error", tekst: "Fout bij verwijderen koppeling." });
      return;
    }

    setFeedback({ type: "success", tekst: "✓ Koppeling verwijderd." });
    laadData();
  }

  const leidinggevenden = gebruikers.filter((g) => g.rol === "leidinggevende");
  const trainees = gebruikers.filter((g) => g.rol === "trainee");

  return (
    <div style={stijlen.pagina}>
      <div style={stijlen.headerKaart}>
        <h1 style={stijlen.headerTitel}>⚙️ Beheer</h1>
        <p style={stijlen.headerSubtitel}>Gebruikers en koppelingen beheren</p>
        <div style={stijlen.headerKaart}>
          <h1 style={stijlen.headerTitel}>⚙️ Beheer</h1>
          <p style={stijlen.headerSubtitel}>
            Gebruikers en koppelingen beheren
          </p>
          <button style={stijlen.btnTerug} onClick={() => navigate(-1)}>
            ← Terug
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={stijlen.tabs}>
        <button
          style={{
            ...stijlen.tab,
            ...(actieveTab === "gebruikers" ? stijlen.tabActief : {}),
          }}
          onClick={() => setActieveTab("gebruikers")}
        >
          👤 Gebruikers
        </button>
        <button
          style={{
            ...stijlen.tab,
            ...(actieveTab === "koppelingen" ? stijlen.tabActief : {}),
          }}
          onClick={() => setActieveTab("koppelingen")}
        >
          🔗 Koppelingen
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          style={{
            ...stijlen.feedback,
            ...(feedback.type === "success"
              ? stijlen.feedbackSuccess
              : stijlen.feedbackError),
          }}
        >
          {feedback.tekst}
        </div>
      )}

      {laden && <p style={stijlen.laden}>Laden…</p>}

      {/* Tab: Gebruikers */}
      {!laden && actieveTab === "gebruikers" && (
        <>
          {/* Nieuw gebruiker formulier */}
          <div style={stijlen.kaart}>
            <h2 style={stijlen.kaartTitel}>Nieuwe gebruiker toevoegen</h2>
            <div style={stijlen.formRij}>
              <div style={stijlen.formVeld}>
                <label style={stijlen.label}>Naam</label>
                <input
                  style={stijlen.input}
                  type="text"
                  placeholder="Volledige naam"
                  value={nieuwNaam}
                  onChange={(e) => setNieuwNaam(e.target.value)}
                />
              </div>
              <div style={stijlen.formVeld}>
                <label style={stijlen.label}>E-mailadres</label>
                <input
                  style={stijlen.input}
                  type="email"
                  placeholder="naam@bedrijf.nl"
                  value={nieuwEmail}
                  onChange={(e) => setNieuwEmail(e.target.value)}
                />
              </div>
              <div style={stijlen.formVeld}>
                <label style={stijlen.label}>Rol</label>
                <select
                  style={stijlen.input}
                  value={nieuwRol}
                  onChange={(e) => setNieuwRol(e.target.value)}
                >
                  <option value="trainee">Trainee</option>
                  <option value="leidinggevende">Leidinggevende</option>
                  <option value="beheerder">Beheerder</option>
                </select>
              </div>
            </div>
            <button style={stijlen.btnPrimair} onClick={voegGebruikerToe}>
              + Gebruiker toevoegen
            </button>
          </div>

          {/* Gebruikerslijst */}
          <div style={stijlen.kaart}>
            <h2 style={stijlen.kaartTitel}>
              Alle gebruikers ({gebruikers.length})
            </h2>
            {gebruikers.length === 0 && (
              <p style={stijlen.leegTekst}>Nog geen gebruikers toegevoegd.</p>
            )}
            <table style={stijlen.tabel}>
              {gebruikers.length > 0 && (
                <thead>
                  <tr style={stijlen.theadRij}>
                    <th style={stijlen.th}>Naam</th>
                    <th style={stijlen.th}>E-mailadres</th>
                    <th style={stijlen.th}>Rol</th>
                    <th style={stijlen.th}></th>
                  </tr>
                </thead>
              )}
              <tbody>
                {gebruikers.map((g) => (
                  <tr key={g.email} style={stijlen.rij}>
                    <td style={stijlen.td}>{g.naam}</td>
                    <td style={stijlen.td}>{g.email}</td>
                    <td style={stijlen.td}>
                      <span
                        style={{
                          ...stijlen.rolBadge,
                          ...(g.rol === "leidinggevende"
                            ? stijlen.rolBadgeLg
                            : {}),
                          ...(g.rol === "beheerder"
                            ? stijlen.rolBadgeBeheer
                            : {}),
                        }}
                      >
                        {g.rol}
                      </span>
                    </td>
                    <td style={stijlen.td}>
                      <button
                        style={stijlen.btnVerwijder}
                        onClick={() => verwijderGebruiker(g.email)}
                      >
                        Verwijder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tab: Koppelingen */}
      {!laden && actieveTab === "koppelingen" && (
        <>
          {/* Nieuwe koppeling formulier */}
          <div style={stijlen.kaart}>
            <h2 style={stijlen.kaartTitel}>Nieuwe koppeling toevoegen</h2>
            <div style={stijlen.formRij}>
              <div style={stijlen.formVeld}>
                <label style={stijlen.label}>Leidinggevende</label>
                <select
                  style={stijlen.input}
                  value={koppelLeidinggevende}
                  onChange={(e) => setKoppelLeidinggevende(e.target.value)}
                >
                  <option value="">Kies leidinggevende…</option>
                  {leidinggevenden.map((lg) => (
                    <option key={lg.email} value={lg.email}>
                      {lg.naam}
                    </option>
                  ))}
                </select>
              </div>
              <div style={stijlen.formVeld}>
                <label style={stijlen.label}>Trainee</label>
                <select
                  style={stijlen.input}
                  value={koppelTrainee}
                  onChange={(e) => setKoppelTrainee(e.target.value)}
                >
                  <option value="">Kies trainee…</option>
                  {trainees.map((t) => (
                    <option key={t.email} value={t.email}>
                      {t.naam}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button style={stijlen.btnPrimair} onClick={voegKoppelingToe}>
              + Koppeling toevoegen
            </button>
          </div>

          {/* Koppelingenlijst */}
          <div style={stijlen.kaart}>
            <h2 style={stijlen.kaartTitel}>
              Alle koppelingen ({koppelingen.length})
            </h2>
            {koppelingen.length === 0 && (
              <p style={stijlen.leegTekst}>Nog geen koppelingen toegevoegd.</p>
            )}
            <table style={stijlen.tabel}>
              {koppelingen.length > 0 && (
                <thead>
                  <tr style={stijlen.theadRij}>
                    <th style={stijlen.th}>Leidinggevende</th>
                    <th style={stijlen.th}>Trainee</th>
                    <th style={stijlen.th}></th>
                  </tr>
                </thead>
              )}
              <tbody>
                {koppelingen.map((k) => (
                  <tr
                    key={`${k.leidinggevende_email}-${k.trainee_email}`}
                    style={stijlen.rij}
                  >
                    <td style={stijlen.td}>{k.leidinggevende_email}</td>
                    <td style={stijlen.td}>
                      {k.trainee_naam || k.trainee_email}
                    </td>
                    <td style={stijlen.td}>
                      <button
                        style={stijlen.btnVerwijder}
                        onClick={() =>
                          verwijderKoppeling(
                            k.leidinggevende_email,
                            k.trainee_email,
                          )
                        }
                      >
                        Verwijder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const stijlen = {
  pagina: {
    padding: "24px 16px 48px",
    background: "#f5f5f5",
    minHeight: "100vh",
  },
  headerKaart: {
    background: "#fff",
    border: "1px solid #eee",
    borderLeft: "5px solid #2e7d32",
    borderRadius: "10px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    padding: "20px 24px",
    maxWidth: "900px",
    margin: "0 auto 20px",
  },
  headerTitel: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#1b5e20",
    marginBottom: "4px",
  },
  headerSubtitel: { fontSize: "0.85rem", color: "#616161" },
  tabs: {
    maxWidth: "900px",
    margin: "0 auto 20px",
    display: "flex",
    gap: "8px",
  },
  tab: {
    padding: "10px 24px",
    borderRadius: "50px",
    border: "2px solid #eee",
    background: "#fff",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
    color: "#616161",
  },
  tabActief: {
    background: "#2e7d32",
    borderColor: "#2e7d32",
    color: "#fff",
  },
  feedback: {
    maxWidth: "900px",
    margin: "0 auto 16px",
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  feedbackSuccess: {
    background: "#e8f5e9",
    border: "1px solid #a5d6a7",
    color: "#1b5e20",
  },
  feedbackError: {
    background: "#ffebee",
    border: "1px solid #ef9a9a",
    color: "#c62828",
  },
  laden: {
    textAlign: "center",
    color: "#9e9e9e",
    maxWidth: "900px",
    margin: "0 auto",
  },
  kaart: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "10px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    padding: "20px 24px",
    maxWidth: "900px",
    margin: "0 auto 16px",
  },
  kaartTitel: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#1b5e20",
    marginBottom: "16px",
  },
  formRij: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  formVeld: { flex: 1, minWidth: "200px" },
  label: {
    display: "block",
    fontSize: "0.72rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#9e9e9e",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    padding: "8px 10px",
    fontSize: "0.875rem",
    fontFamily: "inherit",
    color: "#212121",
    background: "#fafafa",
  },
  btnPrimair: {
    padding: "10px 24px",
    borderRadius: "50px",
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnTerug: {
    marginTop: "12px",
    padding: "6px 18px",
    borderRadius: "50px",
    background: "#eee",
    color: "#616161",
    border: "none",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  tabel: { width: "100%", borderCollapse: "collapse" },
  theadRij: { borderBottom: "2px solid #eee", background: "#fafafa" },
  th: {
    padding: "10px 16px",
    fontSize: "0.72rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#9e9e9e",
    textAlign: "left",
  },
  rij: { borderBottom: "1px solid #eee" },
  td: { padding: "12px 16px", fontSize: "0.875rem", color: "#212121" },
  rolBadge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "50px",
    fontSize: "0.75rem",
    fontWeight: "600",
    background: "#e8f5e9",
    color: "#2e7d32",
  },
  rolBadgeLg: { background: "#e3f2fd", color: "#1565c0" },
  rolBadgeBeheer: { background: "#fce4ec", color: "#c62828" },
  btnVerwijder: {
    padding: "4px 12px",
    borderRadius: "50px",
    background: "#ffebee",
    color: "#c62828",
    border: "none",
    fontSize: "0.78rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  leegTekst: { color: "#9e9e9e", fontSize: "0.875rem" },
};

export default Beheer;
