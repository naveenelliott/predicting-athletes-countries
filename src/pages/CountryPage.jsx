import { useParams } from "react-router-dom";
import { useContext } from "react";
import { DataContext } from "../context/DataContext";

function CountryPage() {
  const { countryCode } = useParams();
  const { data } = useContext(DataContext);

  const countryData = data.filter(
    (d) => d.country_code === countryCode
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>Country: {countryCode}</h1>

      {countryData.length === 0 ? (
        <p>No data available</p>
      ) : (
        <ul>
          {countryData.map((row, i) => (
            <li key={i}>
              {row.country_name}: {row.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CountryPage;
