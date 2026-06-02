import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

export default function TraineeOverzichtBlok({ email }) {
  const [trainees, setTrainees] = useState([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    async function laadTrainees() {
      if (!email) return;

      // Haal gekoppelde trainees op via koppeling tabel
      const { data: koppelingen } = await supabase
        .from("koppeling")
        .select("trainee_email")
        .eq("leidinggevende_email", email);

      if (!koppelingen || koppelingen.length === 0) {
        setLaden(false);
        return;
      }

      const traineeEmails = koppelingen.map((k) => k.trainee_email);

      const { data: gebruikers } = await supabase
        .from("gebruikers")
        .select("naam, email")
        .in("email", traineeEmails);

      if (gebruikers) setTrainees(gebruikers);
      setLaden(false);
    }
    laadTrainees();
  }, [email]);

  if (laden)
    return (
      <div
        style={{
          padding: "20px",
          color: "var(--grijs-500)",
          fontSize: "0.85rem",
        }}
      >
        Trainees laden...
      </div>
    );

  return (
    <div className="kaart" style={{ padding: 0 }}>
      <div
        style={{
          padding: "18px 24px 14px",
          borderBottom: "1px solid var(--grijs-200)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--grijs-900)",
            }}
          >
            Mijn trainees
          </p>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--grijs-700)",
              marginTop: "2px",
            }}
          >
            {trainees.length} {trainees.length === 1 ? "trainee" : "trainees"}{" "}
            gekoppeld
          </p>
        </div>
      </div>

      {trainees.length === 0 ? (
        <div
          style={{
            padding: "24px",
            color: "var(--grijs-500)",
            fontSize: "0.85rem",
          }}
        >
          Geen trainees gekoppeld aan jouw account.
        </div>
      ) : (
        <table className="tabel">
          <thead>
            <tr>
              <th style={{ paddingLeft: "24px" }}>Naam</th>
              <th>E-mail</th>
            </tr>
          </thead>
          <tbody>
            {trainees.map((trainee) => (
              <tr key={trainee.email}>
                <td style={{ paddingLeft: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      className="avatar"
                      style={{
                        background: "var(--groen-licht)",
                        color: "var(--groen-donker)",
                      }}
                    >
                      {trainee.naam.substring(0, 2).toUpperCase()}
                    </div>
                    <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                      {trainee.naam}
                    </p>
                  </div>
                </td>
                <td style={{ fontSize: "0.85rem", color: "var(--grijs-700)" }}>
                  {trainee.email}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
