import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { store } from "@/store/store";
import { Provider } from "react-redux";
import { SpeedInsights } from "@vercel/speed-insights/react"
createRoot(document.getElementById("root")!).render(
     <Provider store={store}>
      <App />
      <SpeedInsights />
    </Provider>
);
