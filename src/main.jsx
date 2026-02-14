/**
 * Application Entry Point
 *
 * This file bootstraps the React application:
 * - Mounts the App component to the DOM
 * - Wraps the app in StrictMode for development checks
 * - Imports global CSS styles
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Global styles including background gradients
import App from "./App.jsx";

// Create root and render the application
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
