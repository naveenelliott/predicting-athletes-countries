import { createContext, useEffect, useState } from "react";
import Papa from "papaparse";

export const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    Papa.parse("/data.csv", {
      header: true,
      download: true,
      dynamicTyping: true,
      complete: (results) => {
        setData(results.data);
      },
    });
  }, []);

  return (
    <DataContext.Provider value={{ data }}>
      {children}
    </DataContext.Provider>
  );
}
