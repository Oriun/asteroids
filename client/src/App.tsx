import { useEffect, useRef, useState } from "react";
import { ask, register } from "./services/websocket";
import Renderer, { GameState, initialGameState } from "./Renderer";

function App() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const first = useRef(true);
  useEffect(() => {
    if (!first.current) return;
    first.current = false;
    (async () => {
      const id = await ask("id")();
      console.log({ id });
      await Promise.all([
        ask("game_started")().then((game_id) =>
          console.log("game_started", game_id)
        ),
        ask("new_game")({ players: [id] }).then(() =>
          console.log("new game created")
        )
      ]);
    })();
  }, []);
  useEffect(() => {
    ask("game_updated")().then((gameState) => {
      console.count("new update");
      setGameState(gameState as GameState);
    });
  }, [gameState]);
  return <Renderer gameState={gameState} />;
}

export default App;
