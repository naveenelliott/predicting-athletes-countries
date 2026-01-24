import { useParams } from "react-router-dom";
import PlayerLookupPanel from "../components/PlayerLookupPanel";

function PlayerPage() {
  const { playerId } = useParams();

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <PlayerLookupPanel initialPlayerId={playerId} />
    </div>
  );
}

export default PlayerPage;
