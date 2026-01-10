import { createContext, useEffect, useState, useMemo } from "react";
import Papa from "papaparse";

export const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState([]);

  // Load CSV once
  useEffect(() => {
    Papa.parse("/final_player_nationality_predictions.csv", {
      header: true,
      download: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
      },
    });
  }, []);

  

  // 1️⃣ DEDUPE FIRST (must come before anything uses it)
  const uniquePlayers = useMemo(() => {
    const bestRowByKey = new Map();

    data.forEach((row) => {
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
  }, [data]);

  // 2️⃣ GROUP BY COUNTRY (depends on uniquePlayers)
  const countryStats = useMemo(() => {
    const grouped = {};

    uniquePlayers.forEach((row) => {
      const country = row.predicted_country;

      if (!grouped[country]) {
        grouped[country] = [];
      }

      grouped[country].push(row);
    });

    return grouped;
  }, [uniquePlayers]);


  return (
    <DataContext.Provider
      value={{
        data,
        uniquePlayers,
        countryStats,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
