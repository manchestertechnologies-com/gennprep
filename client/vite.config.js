import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Any request starting with /api is passed to the backend on port 5000.
    // This means the frontend can just call "/api/..." with no extra setup.
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});