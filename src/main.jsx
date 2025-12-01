import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CarritoProvider } from "./context/CarritoContext";
import { AuthModalProvider } from "./context/AuthModalContext";
import { AuthProvider } from "./context/AuthContext";
import { MultiAccountProvider } from "./context/MultiAccountContext";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/bootstrap-custom.css";
import "./index.css";
import "rc-slider/assets/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <MultiAccountProvider>
          <CarritoProvider>
            <AuthModalProvider>
              <App />
            </AuthModalProvider>
          </CarritoProvider>
        </MultiAccountProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
