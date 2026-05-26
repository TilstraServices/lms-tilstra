import { useState, useEffect, useRef, forwardRef } from "react";
import { jsPDF } from "jspdf";
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

function exporteerPDF(snapshot, email, canvas) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const groen = [46, 125, 50];
  const grijs = [97, 97, 97];
  const paginaBreedte = 210;
  const marge = 16;
  let y = 20;

  doc.setFillColor(...groen);
  doc.rect(0, 0, paginaBreedte, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Competentiematrix – Junior Payroll Professional", marge, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Snapshot: ${formatDatum(snapshot.opgeslagen_op)}  |  Opgeslagen door: ${snapshot.opgeslagen_door}`,
    marge,
    20,
  );
  doc.text(`Trainee: ${email}`, marge, 25);
  y = 38;

  // Radar chart als afbeelding
  if (canvas) {
    const imgData = canvas.toDataURL("image/png");
    const radarH = 90;
    const radarW = 120;
    doc.addImage(
      imgData,
      "PNG",
      (paginaBreedte - radarW) / 2,
      y,
      radarW,
      radarH,
    );
    y += radarH + 8;

    // Legenda
    doc.setFontSize(8);
    doc.setTextColor(...grijs);
    doc.setFillColor(21, 101, 192);
    doc.rect(marge, y, 12, 2, "F");
    doc.text("PTA (trainee)", marge + 14, y + 1.5);
    doc.setFillColor(198, 40, 40);
    doc.rect(marge + 50, y, 12, 2, "F");
    doc.text("Evaluatie (begeleider)", marge + 64, y + 1.5);
    y += 8;
  }

  const sc = snapshot.scores;
  const scoreKleuren = {
    1: "#c8e6c9",
    2: "#81c784",
    3: "#4caf50",
    4: "#388e3c",
    5: "#2e7d32",
    6: "#1b5e20",
  };

  MATRIX.forEach((blok) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(...groen);
    doc.rect(marge, y, paginaBreedte - marge * 2, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(blok.competentie, marge + 3, y + 5);
    y += 9;

    doc.setFillColor(245, 245, 245);
    doc.rect(marge, y, paginaBreedte - marge * 2, 6, "F");
    doc.setTextColor(...grijs);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("INDICATOR", marge + 3, y + 4.2);
    doc.text("PTA", marge + 120, y + 4.2);
    doc.text("EVALUATIE", marge + 145, y + 4.2);
    y += 7;

    blok.indicatoren.forEach((ind, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      if (i % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(marge, y, paginaBreedte - marge * 2, 7, "F");
      }
      doc.setTextColor(33, 33, 33);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(ind.naam, marge + 3, y + 4.8);

      const s = sc[ind.id] || {};

      if (s.pta) {
        const kleur = scoreKleuren[s.pta];
        doc.setFillColor(
          parseInt(kleur.slice(1, 3), 16),
          parseInt(kleur.slice(3, 5), 16),
          parseInt(kleur.slice(5, 7), 16),
        );
        doc.circle(marge + 122, y + 3.5, 3, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(String(s.pta), marge + 120.8, y + 4.8);
      }
      if (s.evaluatie) {
        const kleur = scoreKleuren[s.evaluatie];
        doc.setFillColor(
          parseInt(kleur.slice(1, 3), 16),
          parseInt(kleur.slice(3, 5), 16),
          parseInt(kleur.slice(5, 7), 16),
        );
        doc.circle(marge + 148, y + 3.5, 3, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(String(s.evaluatie), marge + 146.8, y + 4.8);
      }
      doc.setDrawColor(230, 230, 230);
      doc.line(marge, y + 7, paginaBreedte - marge, y + 7);
      y += 7;
    });
    y += 4;
  });

  doc.setFontSize(7);
  doc.setTextColor(...grijs);
  doc.text(
    `Gegenereerd op ${new Date().toLocaleDateString("nl-NL")} | Tilstra Services`,
    marge,
    290,
  );

  const datum = new Date(snapshot.opgeslagen_op)
    .toLocaleDateString("nl-NL")
    .replace(/\//g, "-");
  doc.save(`Competentiematrix_${email}_${datum}.pdf`);
}

function GeschiedenisModal({ email, onSluit }) {
  const [snapshots, setSnapshots] = useState([]);
  const [laden, setLaden] = useState(true);
  const [actiefIndex, setActiefIndex] = useState(null);

  useEffect(() => {
    async function laadSnapshots() {
      const { data, error } = await supabase
        .from("snapshots")
        .select("id, opgeslagen_door, opgeslagen_op, scores, trainee_email")
        .eq("trainee_email", email)
        .order("opgeslagen_op", { ascending: false });

      setLaden(false);
      if (!error && data) setSnapshots(data);
    }

    laadSnapshots();
  }, [email]);

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
                <SnapshotDetail
                  snapshot={snapshots[actiefIndex]}
                  email={email}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SnapshotDetail({ snapshot, email }) {
  const sc = snapshot.scores;
  const radarRef = useRef(null);

  function handleExport() {
    exporteerPDF(snapshot, email, radarRef.current);
  }

  return (
    <div style={stijlen.detail}>
      <h3 style={stijlen.detailTitel}>Ontwikkelprofiel</h3>
      <SnapshotRadar scores={sc} ref={radarRef} />
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

      <div style={stijlen.exportBalk}>
        <button style={stijlen.btnPrimair} onClick={handleExport}>
          ⬇ Exporteer PDF
        </button>
      </div>
    </div>
  );
}

const SnapshotRadar = forwardRef(function SnapshotRadar({ scores }, ref) {
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
      <canvas
        ref={(el) => {
          canvasRef.current = el;
          if (ref) ref.current = el;
        }}
        width={560}
        height={440}
      />
    </div>
  );
});

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
  exportBalk: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    padding: "16px 0 0",
    borderTop: "1px solid #eee",
    marginTop: "16px",
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
};

export default GeschiedenisModal;
