import { createContext, useEffect, useState, useMemo } from "react";
import Papa from "papaparse";

export const DataContext = createContext();

/* ---------------- COUNTRY REMAP ---------------- */
const COUNTRY_REMAP = {
  USA: "United States of America",
  "The Gambia": "Gambia",
  "IR Iran": "Iran",
  Türkiye: "Turkey",
  England: "United Kingdom",
  "Republic of Ireland": "Ireland",
  "Congo DR": "Dem. Rep. Congo",
  "Korea Republic": "South Korea",
  "Dominican Republic": "Dominican Rep.",
  Eswatini: "eSwatini",
  "Central African Republic": "Central African Rep.",
  "Bosnia and Herzegovina": "Bosnia and Herz.",
  "Kyrgyz Republic": "Kyrgyzstan",
  "Hong Kong, China": "China",
};

/* ---------------- NAME NORMALIZATION ---------------- */
const normalizeName = (name) =>
  name?.toLowerCase().replace(/\s+/g, " ").trim();

/* ================= DATA PROVIDER ================= */
export function DataProvider({ children }) {
  const [predictions, setPredictions] = useState([]);
  const [playerDetails, setPlayerDetails] = useState([]);

  /* ---------------- LOAD CSV FILES ---------------- */
  useEffect(() => {
    Papa.parse("/final_player_nationality_predictions.csv", {
      header: true,
      download: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPredictions(results.data);
      },
    });

    Papa.parse("/player_detailed_info.csv", {
      header: true,
      download: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPlayerDetails(results.data);
      },
    });
  }, []);

  /* ---------------- BUILD LOOKUP MAP ---------------- */
  const playerDetailsByKey = useMemo(() => {
    const map = new Map();

    playerDetails.forEach((row) => {
      if (!row.player_id || !row.player_fullname) return;

      const key = `${Number(row.player_id)}|${normalizeName(
        row.player_fullname
      )}`;

      map.set(key, row);
    });

    return map;
  }, [playerDetails]);

  /* ---------------- JOIN DATASETS ---------------- */
  const joinedData = useMemo(() => {
    return predictions.map((row) => {
      if (!row.player_id || !row.player_fullname) return row;

      const key = `${Number(row.player_id)}|${normalizeName(
        row.player_fullname
      )}`;

      const details = playerDetailsByKey.get(key);

      return {
        ...row,
        ...(details ?? {}),
      };
    });
  }, [predictions, playerDetailsByKey]);

  /* ---------------- DEDUPE (BEST PREDICTION) ---------------- */
  const uniquePlayers = useMemo(() => {
    const bestRowByKey = new Map();

    joinedData.forEach((row) => {
      const key = `${row.player_id}-${row.predicted_country_abbrv}`;
      const current = bestRowByKey.get(key);

      if (
        !current ||
        Number(row.pred_prob_correct) >
          Number(current.pred_prob_correct)
      ) {
        bestRowByKey.set(key, row);
      }
    });

    return Array.from(bestRowByKey.values());
  }, [joinedData]);

  /* ---------------- GROUP BY COUNTRY ---------------- */
  const countryStats = useMemo(() => {
    const grouped = {};

    uniquePlayers.forEach((row) => {
      const rawCountry = row.predicted_country;
      const country = COUNTRY_REMAP[rawCountry] ?? rawCountry;

      if (!grouped[country]) {
        grouped[country] = [];
      }

      grouped[country].push(row);
    });

    return grouped;
  }, [uniquePlayers]);

  /* ---------------- PROVIDER ---------------- */
  return (
    <DataContext.Provider
      value={{
        predictions,
        playerDetails,
        joinedData,
        uniquePlayers,
        countryStats,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
