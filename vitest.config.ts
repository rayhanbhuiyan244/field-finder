import { defineConfig } from "vitest/config";
import path from "node:path";

// Deliberately separate from vite.config.ts, which is generated/managed by
// @lovable.dev/vite-tanstack-config and explicitly warns against manual
// plugin additions. Vitest picks up this file automatically and never
// touches that one.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: false,
    include: ["src/**/*.test.ts"],
  },
});
