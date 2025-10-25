import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // base: "/expression-compiler",
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
