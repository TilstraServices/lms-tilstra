import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { MATRIX, RADAR_LABELS, RADAR_IDS } from "../../lib/matrix-data";
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";

Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

function GeschiedenisModal({ email, onSluit }) {
  const [snapshots, setSnapshots] = useState([]);
  const [laden, setLaden] = useState(true);
  const [actiefIndex, setActiefIndex] = useState(null);

  useEffect(() => {
    async function laadSnapshots() {
      const { data, error } = await supabase
        .from("snapshots")
        .select("id, opgeslagen_door, opgeslagen_op, scores")
        .eq("trainee_email", email)
        .order("opgeslagen_op", { ascending: false });

      setLaden(false);
      if (!error && data) setSnapshots(data);
    }

    laadSnapshots();
  }, [email]);

  function formatDatum(iso) {
    const d = new Date(iso);
    return (
      d.toLocaleDateString("nl-NL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " om " +
      d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
    );
  }

  return (
    <div style={stijlen.overlay} onClick={onSluit}>
      <div style={stijlen.modal} onClick={(e) => e.stopPropagation()}>
        <div style={stijlen.header}>
          <h2 style={stijlen.headerTitel}>📋 Geschiedenis</h2>
          <button style={stijlen.sluitKnop} onClick={onSluit}>
            ×
          </button>
        </div>

        <div style={stijlen.body}>
          {laden && <p style={{ color: "#9e9e9e" }}>Laden…</p>}

          {!laden && snapshots.length === 0 && (
            <div style={stijlen.geenSnapshots}>
              Nog geen geschiedenis beschikbaar.
              <br />
              Sla de matrix op om een snapshot te maken.
            </div>
          )}

          {!laden && snapshots.length > 0 && (
            <>
              <p style={stijlen.hint}>
                Klik op een moment om de matrix van dat moment te bekijken.
              </p>
              <div style={stijlen.snapshotLijst}>
                {snapshots.map((s, i) => (
                  <div
                    key={s.id}
                    style={{
                      ...stijlen.snapshotKaart,
                      ...(actiefIndex === i ? stijlen.snapshotKaartActief : {}),
                    }}
                    onClick={() => setActiefIndex(actiefIndex === i ? null : i)}
                  >
                    <div>
                      <div style={stijlen.snapshotDatum}>
                        📸 {formatDatum(s.opgeslagen_op)}
                      </div>
                      <div style={stijlen.snapshotDoor}>
                        Opgeslagen door: {s.opgeslagen_door}
                      </div>
                    </div>
                    <span style={{ color: "#2e7d32" }}>→</span>
                  </div>
                ))}
              </div>

              {actiefIndex !== null && (
                <SnapshotDetail snapshot={snapshots[actiefIndex]} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SnapshotDetail({ snapshot }) {
  const sc = snapshot.scores;

  return (
    <div style={stijlen.detail}>
      <h3 style={stijlen.detailTitel}>Ontwikkelprofiel</h3>
      <SnapshotRadar scores={sc} />
      <table style={stijlen.tabel}>
        <thead>
          <tr>
            <th style={stijlen.th}>Indicator</th>
            <th style={{ ...stijlen.th, textAlign: "center" }}>PTA</th>
            <th style={{ ...stijlen.th, textAlign: "center" }}>Evaluatie</th>
          </tr>
        </thead>
        <tbody>
          {MATRIX.map((blok) => (
            <>
              <tr key={blok.competentie}>
                <td colSpan={3} style={stijlen.competentieRij}>
                  {blok.competentie}
                </td>
              </tr>
              {blok.indicatoren.map((ind) => {
                const s = sc[ind.id] || {};
                return (
                  <tr key={ind.id} style={stijlen.rij}>
                    <td style={stijlen.indicatorTd}>{ind.naam}</td>
                    <td style={{ textAlign: "center", padding: "7px 12px" }}>
                      {s.pta ? (
                        <ScorePill waarde={s.pta} />
                      ) : (
                        <span style={stijlen.leeg}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center", padding: "7px 12px" }}>
                      {s.evaluatie ? (
                        <ScorePill waarde={s.evaluatie} />
                      ) : (
                        <span style={stijlen.leeg}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SnapshotRadar({ scores }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const ptaData = RADAR_IDS.map((id) => scores[id]?.pta || 0);
    const evalData = RADAR_IDS.map((id) => scores[id]?.evaluatie || 0);

    if (chartRef.current) {
      chartRef.current.data.datasets[0].data = ptaData;
      chartRef.current.data.datasets[1].data = evalData;
      chartRef.current.update();
      return;
    }

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "radar",
      data: {
        labels: RADAR_LABELS,
        datasets: [
          {
            label: "PTA",
            data: ptaData,
            borderColor: "#1565C0",
            backgroundColor: "rgba(21,101,192,0.15)",
            pointBackgroundColor: "#1565C0",
            pointRadius: 4,
            borderWidth: 2,
          },
          {
            label: "Evaluatie",
            data: evalData,
            borderColor: "#C62828",
            backgroundColor: "rgba(198,40,40,0.12)",
            pointBackgroundColor: "#C62828",
            pointRadius: 4,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0,
            max: 6,
            ticks: {
              stepSize: 1,
              font: { size: 10 },
              color: "#9E9E9E",
              backdropColor: "transparent",
            },
            pointLabels: { font: { size: 10 }, color: "#424242" },
            grid: { color: "#E0E0E0" },
            angleLines: { color: "#E0E0E0" },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [scores]);

  return (
    <div
      style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}
    >
      <canvas ref={canvasRef} width={560} height={440} />
    </div>
  );
}

function ScorePill({ waarde }) {
  const kleuren = {
    1: "#c8e6c9",
    2: "#81c784",
    3: "#4caf50",
    4: "#388e3c",
    5: "#2e7d32",
    6: "#1b5e20",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "26px",
        height: "26px",
        borderRadius: "50%",
        background: kleuren[waarde] || "#9e9e9e",
        color: waarde <= 2 ? "#1b5e20" : "#fff",
        fontWeight: "700",
        fontSize: "0.8rem",
      }}
    >
      {waarde}
    </span>
  );
}

const stijlen = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 1000,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "24px 16px",
    overflowY: "auto",
  },
  modal: {
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
    width: "100%",
    maxWidth: "860px",
    overflow: "hidden",
  },
  header: {
    background: "#2e7d32",
    color: "#fff",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitel: { fontSize: "1rem", fontWeight: "700", color: "#fff" },
  sluitKnop: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "1.4rem",
    cursor: "pointer",
  },
  body: { padding: "20px 24px" },
  geenSnapshots: {
    textAlign: "center",
    padding: "32px",
    color: "#9e9e9e",
    fontSize: "0.9rem",
  },
  hint: { fontSize: "0.82rem", color: "#9e9e9e", marginBottom: "12px" },
  snapshotLijst: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },
  snapshotKaart: {
    border: "2px solid #eee",
    borderRadius: "8px",
    padding: "12px 16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  snapshotKaartActief: { borderColor: "#2e7d32", background: "#e8f5e9" },
  snapshotDatum: { fontWeight: "600", fontSize: "0.9rem", color: "#212121" },
  snapshotDoor: { fontSize: "0.78rem", color: "#9e9e9e", marginTop: "2px" },
  detail: {
    borderTop: "1px solid #eee",
    paddingTop: "20px",
    marginTop: "20px",
  },
  detailTitel: {
    fontSize: "0.9rem",
    fontWeight: "700",
    color: "#1b5e20",
    marginBottom: "12px",
  },
  tabel: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "12px",
    fontSize: "0.82rem",
  },
  th: {
    padding: "7px 12px",
    background: "#fafafa",
    borderBottom: "2px solid #eee",
    fontSize: "0.7rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#9e9e9e",
    textAlign: "left",
  },
  competentieRij: {
    background: "#2e7d32",
    color: "#fff",
    fontWeight: "700",
    padding: "6px 12px",
  },
  rij: { borderBottom: "1px solid #eee" },
  indicatorTd: { padding: "7px 12px" },
  leeg: { color: "#e0e0e0", fontSize: "0.8rem" },
};

export default GeschiedenisModal;
