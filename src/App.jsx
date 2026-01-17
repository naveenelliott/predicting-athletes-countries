import { Routes, Route } from "react-router-dom";
import WorldMapPage from "./pages/WorldMapPage";
import CountryPage from "./pages/CountryPage";
import PlayerLookupPage from "./pages/PlayerLookupPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WorldMapPage />} />
      <Route path="/country/:countryName" element={<CountryPage />} />
      <Route path="/players" element={<PlayerLookupPage />} />
    </Routes>
  );
}

export default App;
