import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = repositoryName && !repositoryName.endsWith(".github.io") ? `/${repositoryName}/` : "/";

export default defineConfig({
  root: path.resolve(import.meta.dirname, "github-pages"),
  base,
  plugins: [react()],
  build: {
    outDir: path.resolve(import.meta.dirname, "dist-pages"),
    emptyOutDir: true,
  },
});
