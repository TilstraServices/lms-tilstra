import { useEffect, useRef } from "react";
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { RADAR_LABELS, RADAR_IDS } from "../../lib/matrix-data";

Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

function RadarChart({ scores }) {
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
            label: "PTA (trainee)",
            data: ptaData,
            borderColor: "#1565C0",
            backgroundColor: "rgba(21,101,192,0.15)",
            pointBackgroundColor: "#1565C0",
            pointRadius: 4,
            borderWidth: 2,
          },
          {
            label: "Evaluatie (begeleider)",
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
            pointLabels: {
              font: { size: 10 },
              color: "#424242",
            },
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
    <div style={stijlen.kaart}>
      <h2 style={stijlen.titel}>Ontwikkelprofiel Young Professional</h2>
      <div style={stijlen.canvasWrap}>
        <canvas ref={canvasRef} width={620} height={500} />
      </div>
      <div style={stijlen.legenda}>
        <div style={stijlen.legendaItem}>
          <div style={{ ...stijlen.legendaDot, background: "#1565C0" }} />
          PTA (trainee)
        </div>
        <div style={stijlen.legendaItem}>
          <div style={{ ...stijlen.legendaDot, background: "#C62828" }} />
          Evaluatie (begeleider)
        </div>
      </div>
    </div>
  );
}

const stijlen = {
  kaart: {
    background: "#fff",
    border: "1px solid #eee",
    borderLeft: "5px solid #2e7d32",
    borderRadius: "10px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    maxWidth: "900px",
    margin: "0 auto 20px",
    padding: "20px 24px",
  },
  titel: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#1b5e20",
    marginBottom: "16px",
    textAlign: "center",
  },
  canvasWrap: { display: "flex", justifyContent: "center" },
  legenda: {
    display: "flex",
    justifyContent: "center",
    gap: "24px",
    marginTop: "14px",
  },
  legendaItem: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "0.8rem",
    color: "#616161",
  },
  legendaDot: { width: "28px", height: "3px", borderRadius: "2px" },
};

export default RadarChart;
