// Sentry must be initialised before React mounts so that any synchronous
// init-time error from App / routes is captured.
import "./lib/sentry";

import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import "./app/i18n";

createRoot(document.getElementById("root")!).render(<App />);
