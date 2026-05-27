import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import Competentiematrix from "../../../competentiematrix/Competentiematrix";

export default function MatrixBlok({ email }) {
  const [trainees, setTrainees] = useState([]);
  const [gekozenTrainee, setGekozenTrainee] = useState(null);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    async function haalTraineesOp() {
      const { data, error } = await supabase
        .from("koppeling")
        .select("trainee_email, trainee_naam")
        .eq("leidinggevende_email", email);

      if (!error && data) {
        setTrainees(data);
      }
      setLaden(false);
    }

    haalTraineesOp();
  }, [email]);

  if (laden) {
    return <p>Trainees laden...</p>;
  }

  if (trainees.length === 0) {
    return (
      <div className="kaart">
        <p>Er zijn geen trainees aan jouw account gekoppeld.</p>
      </div>
    );
  }

  if (gekozenTrainee) {
    return (
      <div className="matrix-animatie">
        <button
          className="knop knop-ghost"
          style={{ marginBottom: "20px" }}
          onClick={() => setGekozenTrainee(null)}
        >
          ← Terug naar overzicht
        </button>
        <Competentiematrix
          rol="leidinggevende"
          emailProp={gekozenTrainee.trainee_email}
          toonUitloggen={false}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="kaart" style={{ marginBottom: "16px" }}>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--grijs-700)",
            marginBottom: "16px",
          }}
        >
          Kies een trainee om de matrix te bekijken:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {trainees.map((trainee) => (
            <button
              key={trainee.trainee_email}
              className="knop knop-secundair"
              style={{ justifyContent: "flex-start", borderRadius: "8px" }}
              onClick={() => setGekozenTrainee(trainee)}
            >
              <div
                className="avatar"
                style={{
                  background: "var(--groen-licht)",
                  color: "var(--groen-donker)",
                  marginRight: "10px",
                }}
              >
                {trainee.trainee_naam
                  ? trainee.trainee_naam.substring(0, 2).toUpperCase()
                  : trainee.trainee_email.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                  {trainee.trainee_naam || trainee.trainee_email}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--grijs-500)" }}>
                  {trainee.trainee_email}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
