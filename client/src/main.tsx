import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";

const isLauncher = !window.location.search.includes("launcher=false");
if (isLauncher) {
  const y = window.outerHeight / 2 + window.screenY - 900 / 2;
  const x = window.outerWidth / 2 + window.screenX - 1000 / 2;
  window.open(
    window.location.origin + "?launcher=false",
    "game",
    `height=900,width=1000,location=0,menubar=0,toolbar=0,left=${x},top=${y}`
  );
} else {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
