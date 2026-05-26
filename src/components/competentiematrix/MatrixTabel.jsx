import { MATRIX } from "../../lib/matrix-data";

function MatrixTabel({ scores, onScoreWijzig, rol, eigenMatrixModus }) {
  const ptaDisabled = rol === "leidinggevende" && !eigenMatrixModus;
  const evalDisabled = rol === "trainee" || eigenMatrixModus;

  return (
    <div>
      {MATRIX.map((blok) => (
        <div key={blok.competentie} style={stijlen.blok}>
          <div style={stijlen.blokHeader}>{blok.competentie}</div>
          <table style={stijlen.tabel}>
            <thead>
              <tr style={stijlen.theadRij}>
                <th style={stijlen.th}>Indicator</th>
                <th style={{ ...stijlen.th, textAlign: "center" }}>
                  PTA <span style={stijlen.subLabel}>(trainee)</span>
                </th>
                <th style={{ ...stijlen.th, textAlign: "center" }}>
                  Evaluatie <span style={stijlen.subLabel}>(begeleider)</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {blok.indicatoren.map((ind) => (
                <tr key={ind.id} style={stijlen.rij}>
                  <td style={stijlen.indicatorTd}>{ind.naam}</td>
                  <td style={stijlen.scoreTd}>
                    <ScoreSelector
                      indicatorId={ind.id}
                      kolom="pta"
                      waarde={scores[ind.id]?.pta}
                      disabled={ptaDisabled}
                      onWijzig={onScoreWijzig}
                    />
                  </td>
                  <td style={stijlen.scoreTd}>
                    <ScoreSelector
                      indicatorId={ind.id}
                      kolom="evaluatie"
                      waarde={scores[ind.id]?.evaluatie}
                      disabled={evalDisabled}
                      onWijzig={onScoreWijzig}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function ScoreSelector({ indicatorId, kolom, waarde, disabled, onWijzig }) {
  return (
    <div style={stijlen.scoreSelector}>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <button
          key={n}
          disabled={disabled}
          onClick={() => !disabled && onWijzig(indicatorId, kolom, n)}
          style={{
            ...stijlen.scoreKnop,
            ...(waarde === n ? scoreKleurActief(n) : {}),
            ...(disabled ? stijlen.scoreKnopDisabled : {}),
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function scoreKleurActief(n) {
  const kleuren = {
    1: { background: "#c8e6c9", borderColor: "#c8e6c9", color: "#1b5e20" },
    2: { background: "#81c784", borderColor: "#81c784", color: "#1b5e20" },
    3: { background: "#4caf50", borderColor: "#4caf50", color: "#fff" },
    4: { background: "#388e3c", borderColor: "#388e3c", color: "#fff" },
    5: { background: "#2e7d32", borderColor: "#2e7d32", color: "#fff" },
    6: { background: "#1b5e20", borderColor: "#1b5e20", color: "#fff" },
  };
  return kleuren[n] || {};
}

const stijlen = {
  blok: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "10px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    maxWidth: "900px",
    margin: "0 auto 16px",
    overflow: "hidden",
  },
  blokHeader: {
    background: "#2e7d32",
    color: "#fff",
    padding: "12px 20px",
    fontSize: "0.9rem",
    fontWeight: "700",
  },
  tabel: { width: "100%", borderCollapse: "collapse" },
  theadRij: { background: "#fafafa", borderBottom: "2px solid #eee" },
  th: {
    padding: "10px 16px",
    fontSize: "0.72rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#9e9e9e",
    textAlign: "left",
  },
  subLabel: { fontWeight: "400", textTransform: "none" },
  rij: { borderBottom: "1px solid #eee" },
  indicatorTd: { padding: "10px 16px", fontSize: "0.875rem", color: "#616161" },
  scoreTd: { padding: "10px 16px", textAlign: "center" },
  scoreSelector: { display: "flex", justifyContent: "center", gap: "4px" },
  scoreKnop: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border: "2px solid #e0e0e0",
    background: "#fff",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#9e9e9e",
    cursor: "pointer",
  },
  scoreKnopDisabled: { cursor: "default", opacity: "0.6" },
};

export default MatrixTabel;
