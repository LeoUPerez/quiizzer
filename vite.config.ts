import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dominios que ngrok puede asignar al túnel. Vite bloquea por defecto
// cualquier Host distinto de localhost, por eso hay que listarlos.
const NGROK_HOSTS = [
  ".ngrok-free.app",
  ".ngrok-free.dev",
  ".ngrok.app",
  ".ngrok.dev",
  ".ngrok.io",
];

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: NGROK_HOSTS,
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: NGROK_HOSTS,
  },
});
