import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://autolens.example/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the AutoLens decision cockpit", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>AutoLens AI/);
  assert.match(html, /AutoLens/);
  assert.match(html, /Know the right price before you buy/);
  assert.match(html, /Best comparable listings/);
  assert.match(html, /Your 3-step playbook/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/);
});

test("keeps valuation logic validated, explainable, and deployable", async () => {
  const [page, route, engine, packageJson, workflow, pagesConfig] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/valuation/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/market-engine.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8"),
    readFile(new URL("../vite.pages.config.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Sample market data/);
  assert.match(page, /licensed listing and vehicle-history providers/);
  assert.match(route, /valuationSchema\.safeParse/);
  assert.match(route, /scoreValuation/);
  assert.match(engine, /confidence/);
  assert.match(engine, /Reported history/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(packageJson, /build:pages/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(pagesConfig, /GITHUB_REPOSITORY/);
  await access(new URL("../public/og.png", import.meta.url));
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await access(projectRoot);
});
