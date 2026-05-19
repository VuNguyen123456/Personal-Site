import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { loadSiteAudioMuted } from "./siteAudioMute";
import "./styles.css";
import "./eeveelution-dividers.css";

loadSiteAudioMuted();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
