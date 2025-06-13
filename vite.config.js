
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  server: {
    historyApiFallback: true, // يسمح بتحميل الروابط بشكل صحيح
  },
});
