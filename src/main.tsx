import { StrictMode } from "react";

import { createRoot } from "react-dom/client";
import "./index.css";
// import { BrowserRouter } from "react-router";
import { HashRouter } from "react-router";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
