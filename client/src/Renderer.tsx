import React from "react";

export type ItemTypes = "player" | "asteroid" | "laser" | "explosion";
export type GameItem = {
  id: string;
  type: ItemTypes;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
};

export type GameState = {
  items: GameItem[];
};
export const initialGameState: GameState = {
  items: [
    {
      type: "asteroid",
      id: "1",
      x: 200,
      y: 200,
      rotation: 0,
      width: 100,
      height: 100
    }
  ]
};

const Asteroid: React.FC<GameItem> = ({
  id,
  x,
  y,
  rotation,
  width,
  height
}) => {
  return (
    <div
      className="element"
      title={`${id}:${x.toFixed(2)}:${y.toFixed(2)}`}
      style={{
        bottom: y,
        left: x,
        width,
        height,
        textAlign: "center",
        // transform: `rotate(${rotation}deg)`,
        backgroundColor: "red",
        borderRadius: "50%"
      }}
    >
      ({x.toFixed(1)}:{y.toFixed(1)})
      <br />
      {id}
    </div>
  );
};
const Player: React.FC<GameItem> = ({ id, x, y, rotation, width, height }) => {
  return (
    <div
      className="element"
      title={`${id}:${x.toFixed(2)}:${y.toFixed(2)}`}
      style={{
        bottom: y,
        left: x,
        width,
        height,
        textAlign: "center",
        // transform: `rotate(${rotation}deg)`,
        backgroundColor: "blue",
        borderRadius: "50%"
      }}
    >
      ({x.toFixed(1)}:{y.toFixed(1)})
      <br />
      {id}
    </div>
  );
};
const Laser: React.FC<GameItem> = ({ id, x, y, rotation, width, height }) => {
  return (
    <div
      className="element"
      title={`${id}:${x.toFixed(2)}:${y.toFixed(2)}`}
      style={{
        bottom: y,
        left: x,
        width,
        height,
        textAlign: "center",
        // transform: `rotate(${rotation}deg)`,
        backgroundColor: "green",
        borderRadius: "50%"
      }}
    >
      ({x.toFixed(1)}:{y.toFixed(1)})
      <br />
      {id}
    </div>
  );
};

const Objects: Record<ItemTypes, React.FC<GameItem>> = {
  asteroid: Asteroid,
  player: Player,
  laser: Laser,
  explosion: () => <div>Explosion</div>
};

type RendererProps = {
  gameState: GameState;
};

const Renderer: React.FC<RendererProps> = ({ gameState }) => {
  return (
    <div className="renderer">
      {gameState.items.map((item) => {
        const Component = Objects[item.type];
        return <Component {...item} key={item.id} />;
      })}
    </div>
  );
};

export default Renderer;
