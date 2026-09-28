import React from "react";
import ReactDOM from "react-dom/client";

import { ClerkProvider } from "@clerk/clerk-react";
import { HelmetProvider } from "react-helmet-async";

import App from "./App";
import { getClientEnv } from "./config/env";

import "./index.css";

const { clerkPublishableKey } = getClientEnv();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ClerkProvider>
  </React.StrictMode>
);
