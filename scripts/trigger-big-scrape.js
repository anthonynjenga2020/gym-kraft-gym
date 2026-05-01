/**
 * trigger-big-scrape.js
 *
 * Fires the one-time East Africa gym scrape on Apify and hooks it up
 * to your Supabase webhook so results land in the leads table automatically.
 *
 * Usage:
 *   node trigger-big-scrape.js
 *
 * Prerequisites:
 *   npm install node-fetch dotenv   (or: npm install)
 *   Set APIFY_API_TOKEN in .env
 *   Set SUPABASE_WEBHOOK_URL in .env (your Edge Function URL)
 *   Set APIFY_WEBHOOK_SECRET in .env (same secret as in Supabase)
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fetch from "node-fetch";

const __dirname = dirname(fileURLToPath(import.meta.url));

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const WEBHOOK_URL = process.env.SUPABASE_WEBHOOK_URL ||
  "https://rilaoadkfifovxypjsbh.supabase.co/functions/v1/apify-webhook-receiver";
const WEBHOOK_SECRET = process.env.APIFY_WEBHOOK_SECRET || "";

if (!APIFY_TOKEN) {
  console.error("❌  Missing APIFY_API_TOKEN in .env");
  process.exit(1);
}

// Load the input config
const input = JSON.parse(
  readFileSync(join(__dirname, "apify-big-scrape-input.json"), "utf8")
);

const queryCount = input.searchStringsArray.length;
const estimatedResults = queryCount * input.maxCrawledPlacesPerSearch;

console.log(`\n🗺️  Jenga Systems — East Africa Gym Scrape`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`📋  Search queries:     ${queryCount}`);
console.log(`📍  Max per query:      ${input.maxCrawledPlacesPerSearch}`);
console.log(`📊  Estimated results:  up to ${estimatedResults.toLocaleString()}`);
console.log(`💾  Unique leads est.:  ~1,800 – 2,500`);
console.log(`💰  Estimated cost:     ~$0.05 – $0.10`);
console.log(`⏱️   Estimated runtime:  25 – 45 minutes\n`);

// Apify webhook config — fires when run succeeds and sends data to Supabase
const webhookConfig = [
  {
    eventTypes: ["ACTOR.RUN.SUCCEEDED"],
    requestUrl: WEBHOOK_URL,
    headersTemplate: WEBHOOK_SECRET
      ? `{"x-apify-webhook-secret": "${WEBHOOK_SECRET}"}`
      : "{}",
    payloadTemplate: JSON.stringify({
      eventType: "{{eventType}}",
      actorRunId: "{{actorRunId}}",
      actorId: "{{actorId}}",
      defaultDatasetId: "{{defaultDatasetId}}",
      resource: "{{resource}}"
    })
  }
];

async function triggerRun() {
  console.log("🚀  Triggering Apify run...");

  const url = new URL("https://api.apify.com/v2/acts/compass~google-maps-scraper/runs");
  url.searchParams.set("token", APIFY_TOKEN);
  url.searchParams.set("webhooks", Buffer.from(JSON.stringify(webhookConfig)).toString("base64"));

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`❌  Apify API error (${res.status}):`, err);
    process.exit(1);
  }

  const data = await res.json();
  const run = data.data;

  console.log(`\n✅  Run started successfully!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🆔  Run ID:       ${run.id}`);
  console.log(`📦  Dataset ID:   ${run.defaultDatasetId}`);
  console.log(`🔗  Monitor at:   https://console.apify.com/actors/runs/${run.id}`);
  console.log(`\n📡  Webhook configured → results will auto-land in Supabase leads table`);
  console.log(`\n⏳  Go grab a coffee. This takes ~30 minutes.`);
  console.log(`    When done, check your leads:\n`);
  console.log(`    https://supabase.com/dashboard/project/rilaoadkfifovxypjsbh/editor\n`);
  console.log(`    SQL: SELECT * FROM leads ORDER BY lead_score DESC LIMIT 50;\n`);
}

triggerRun().catch((err) => {
  console.error("❌  Unexpected error:", err);
  process.exit(1);
});
