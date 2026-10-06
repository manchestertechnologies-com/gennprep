import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import WakeUpBanner from "./components/WakeUpBanner.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WakeUpBanner />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);