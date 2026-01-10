import { useParams } from "react-router-dom";
import { useContext, useMemo } from "react";
import { DataContext } from "../context/DataContext";

function CountryPage() {
  const { countryName } = useParams();
  const decodedCountry = decodeURIComponent(countryName);

  console.log("RAW route param:", countryName);
  console.log("DECODED route param:", decodeURIComponent(countryName));

  const { countryStats } = useContext(DataContext);

  // Players for this country (already deduped)
  const players = countryStats[decodedCountry] ?? [];

  // Derived summary stats (computed from rows)
  const summary = useMemo(() => {
    if (players.length === 0) return null;

    const count = players.length;
    const correct = players.reduce(
      (s, d) => s + Number(d.pred_correct),
      0
    );
    const avgProb =
      players.reduce((s, d) => s + d.pred_prob_correct, 0) /
      count;

    return {
      count,
      accuracy: correct / count,
      avgProb,
    };
  }, [players]);

  return (
    <div style={{ padding: 20 }}>
      <h1>{decodedCountry}</h1>

      {summary ? (
        <div style={{ marginBottom: 16 }}>
          <p>
            <strong>Players:</strong> {summary.count}
          </p>
          <p>
            <strong>Accuracy:</strong>{" "}
            {(summary.accuracy * 100).toFixed(1)}%
          </p>
          <p>
            <strong>Avg Probability:</strong>{" "}
            {summary.avgProb.toFixed(2)}
          </p>
        </div>
      ) : (
        <p>No data available</p>
      )}

      {players.length === 0 ? (
        <p>No players available</p>
      ) : (
        <ul>
          {players.map((row) => (
            <li key={row.player_id}>
              <strong>{row.player_fullname}</strong> —{" "}
              Prob: {row.pred_prob_correct.toFixed(2)}{" "}
              {row.pred_correct === 1 ? "✅" : "❌"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CountryPage;
