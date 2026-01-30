// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AppWrapper } from "./components/common/PageMeta";
import { AuthProvider } from "@/context/AuthContext";
createRoot(document.getElementById("root")).render(<React.StrictMode>
    <AuthProvider>
      <AppWrapper>
        <App />
      </AppWrapper>
    </AuthProvider>
  </React.StrictMode>);
