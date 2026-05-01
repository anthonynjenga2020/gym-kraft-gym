/**
 * import-leads.js
 *
 * Reads a leads-export.json file downloaded from Apify,
 * qualifies + scores each lead, and upserts into Supabase leads table.
 *
 * Usage:
 *   node import-leads.js
 *   node import-leads.js leads-export.json   (custom filename)
 *
 * Prerequisites:
 *   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FILE = process.argv[2] || "leads-export.json";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

// ─── Scoring ────────────────────────────────────────────────────────────────

function scoreWebsite(url) {
  if (!url || url.trim() === "") return { has_website: false, penalty: 0 };

  const lower = url.toLowerCase();
  const weakSites = ["linktr.ee", "linktree", "bio.site", "carrd.co", "wix.com", "wordpress.com"];

  if (lower.includes("facebook.com") || lower.includes("instagram.com")) {
    return { has_website: false, penalty: 0 };
  }
  if (weakSites.some((s) => lower.includes(s))) {
    return { has_website: true, penalty: 3 };
  }
  return { has_website: true, penalty: 7 };
}

function scoreLead(website_url) {
  const { has_website, penalty } = scoreWebsite(website_url);
  return { has_website, lead_score: Math.max(0, 10 - penalty) };
}

// ─── Neighborhood extraction ────────────────────────────────────────────────

const KNOWN_HOODS = [
  "Westlands","Karen","Kilimani","Lavington","Parklands","Upperhill","Kasarani",
  "Ruaka","Thika Road","South C","South B","Embakasi","Langata","Gigiri","Runda",
  "Muthaiga","Hurlingham","Kileleshwa","Eastleigh","Buruburu","Donholm","Rongai",
  "Syokimau","Kitengela","CBD","Pipeline","Umoja",
  "Kololo","Nakasero","Ntinda","Bukoto","Kisaasi","Munyonyo","Bugolobi","Muyenga",
  "Masaki","Oyster Bay","Mikocheni","Upanga","Kariakoo","Kinondoni",
  "Kiyovu","Kimihurura","Nyarutarama","Gacuriro","Kacyiru","Remera",
];

function extractNeighborhood(address) {
  if (!address) return null;
  const lower = address.toLowerCase();
  for (const hood of KNOWN_HOODS) {
    if (lower.includes(hood.toLowerCase())) return hood;
  }
  return null;
}

// ─── Country detection from address ─────────────────────────────────────────

function detectCountry(address = "", searchString = "") {
  const text = (address + " " + searchString).toLowerCase();
  if (text.includes("uganda") || text.includes("kampala") || text.includes("entebbe") || text.includes("jinja")) return "Uganda";
  if (text.includes("tanzania") || text.includes("dar es salaam") || text.includes("arusha") || text.includes("zanzibar") || text.includes("moshi")) return "Tanzania";
  if (text.includes("rwanda") || text.includes("kigali") || text.includes("butare") || text.includes("musanze")) return "Rwanda";
  return "Kenya";
}

// ─── Parse Apify Google Maps result ─────────────────────────────────────────

function parseItem(item) {
  const gym_name = (item.title || item.name || "").trim();
  if (!gym_name) return null;

  // Filter — only keep fitness-related
  const nameLower = gym_name.toLowerCase();
  const cat = (item.categoryName || "").toLowerCase();
  const gymKeywords = ["gym","fitness","crossfit","yoga","pilates","health club","sport","training","boxing","mma","martial","wellness"];
  const isGym = gymKeywords.some((k) => nameLower.includes(k) || cat.includes(k));
  if (!isGym && !cat.includes("gym") && !cat.includes("fitness")) return null;

  const website_url = item.website || null;
  const address = item.address || item.street || null;
  const { has_website, lead_score } = scoreLead(website_url);

  return {
    gym_name,
    phone: item.phone || item.phoneUnformatted || null,
    address,
    neighborhood: item.neighborhood || extractNeighborhood(address),
    maps_url: item.url || item.placeUrl || null,
    rating: item.totalScore ?? item.rating ?? null,
    review_count: item.reviewsCount ?? item.reviewCount ?? null,
    website_url,
    has_website,
    lead_score,
    scrape_source: "google_maps",
    apify_run_id: item.searchString ? `manual-${Date.now()}` : "manual-import",
    status: lead_score >= 7 ? "qualified" : lead_score >= 4 ? "scraped" : "skip",
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n📂  Jenga Systems — Lead Importer`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  let raw;
  try {
    raw = JSON.parse(readFileSync(FILE, "utf8"));
  } catch {
    console.error(`❌  Could not read "${FILE}". Make sure it's in the scripts/ folder.`);
    process.exit(1);
  }

  console.log(`📋  Raw items from Apify:  ${raw.length}`);

  const leads = raw.map(parseItem).filter(Boolean);
  const skipped = raw.length - leads.length;

  console.log(`✅  Gym-related leads:     ${leads.length}`);
  console.log(`⏭️   Skipped (not gyms):    ${skipped}`);

  // Score breakdown
  const hot    = leads.filter(l => l.lead_score >= 7).length;
  const warm   = leads.filter(l => l.lead_score >= 4 && l.lead_score < 7).length;
  const cold   = leads.filter(l => l.lead_score < 4).length;
  const withPhone = leads.filter(l => l.phone).length;

  console.log(`\n📊  Score breakdown:`);
  console.log(`    🔥  Hot  (8-10, no website):  ${hot}`);
  console.log(`    🌡️   Warm (5-7, weak site):    ${warm}`);
  console.log(`    ❄️   Cold (0-4, has real site): ${cold}`);
  console.log(`    📞  Has phone number:          ${withPhone}/${leads.length}`);

  // Plain insert in batches of 100 — no conflict handling needed on first import
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const BATCH = 100;
  let inserted = 0;
  let errors = 0;

  console.log(`\n⬆️   Uploading to Supabase in batches of ${BATCH}...`);

  for (let i = 0; i < leads.length; i += BATCH) {
    const batch = leads.slice(i, i + BATCH);

    const { data, error } = await supabase
      .from("leads")
      .insert(batch)
      .select("id");

    if (error) {
      console.error(`  ⚠️  Batch ${Math.floor(i/BATCH)+1} error:`, error.message);
      errors += batch.length;
    } else {
      inserted += data?.length ?? 0;
      process.stdout.write(`  Batch ${Math.floor(i/BATCH)+1}/${Math.ceil(leads.length/BATCH)}: ${data?.length ?? 0} inserted\n`);
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅  Done!`);
  console.log(`    Inserted:  ${inserted} leads`);
  console.log(`    Errors:    ${errors}`);
  console.log(`\n🔗  View your hot leads in Supabase:`);
  console.log(`    https://supabase.com/dashboard/project/rilaoadkfifovxypjsbh/editor`);
  console.log(`\n    SQL: SELECT gym_name, phone, neighborhood, lead_score FROM hot_leads LIMIT 50;\n`);
}

run().catch(console.error);
