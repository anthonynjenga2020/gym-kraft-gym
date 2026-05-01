/**
 * Supabase Edge Function: apify-webhook-receiver
 *
 * Receives completed Apify actor run results and:
 * 1. Parses leads from Google Maps, Instagram, or Facebook
 * 2. Qualifies and scores each lead
 * 3. Upserts into the `leads` table (skips duplicates)
 *
 * Deploy: supabase functions deploy apify-webhook-receiver
 * Apify Webhook URL: https://<project-ref>.supabase.co/functions/v1/apify-webhook-receiver
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("APIFY_WEBHOOK_SECRET") ?? "";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ApifyWebhookPayload {
  eventType: string;     // "ACTOR.RUN.SUCCEEDED"
  actorRunId: string;
  actorId: string;
  defaultDatasetId: string;
  resource?: { defaultDatasetId?: string };
}

interface RawGoogleMapsLead {
  title?: string;
  name?: string;
  phone?: string;
  phoneUnformatted?: string;
  address?: string;
  neighborhood?: string;
  url?: string;
  totalScore?: number;
  reviewsCount?: number;
  website?: string;
  categoryName?: string;
}

interface RawInstagramLead {
  username?: string;
  biography?: string;
  followersCount?: number;
  externalUrl?: string;
  fullName?: string;
  inputUrl?: string;
}

interface RawFacebookLead {
  pageName?: string;
  name?: string;
  phone?: string;
  address?: string;
  website?: string;
  likes?: number;
  pageUrl?: string;
}

interface Lead {
  gym_name: string;
  phone?: string;
  address?: string;
  neighborhood?: string;
  maps_url?: string;
  rating?: number;
  review_count?: number;
  website_url?: string;
  has_website: boolean;
  lead_score: number;
  scrape_source: string;
  instagram_handle?: string;
  instagram_bio?: string;
  instagram_followers?: number;
  facebook_url?: string;
  facebook_likes?: number;
  apify_run_id: string;
  status: string;
}

// ─── Qualification Logic ──────────────────────────────────────────────────────

function scoreWebsite(url: string | undefined | null): { has_website: boolean; score_penalty: number } {
  if (!url || url.trim() === "") {
    return { has_website: false, score_penalty: 0 }; // no penalty — this is GOOD for us
  }

  const lower = url.toLowerCase();

  // Free page builders / link trees = weak presence, still a warm lead
  const weakSites = ["linktr.ee", "linktree", "bio.site", "carrd.co", "wix.com", "wordpress.com"];
  if (weakSites.some((s) => lower.includes(s))) {
    return { has_website: true, score_penalty: 3 }; // weak site, minor penalty
  }

  // Facebook/Instagram as "website" = no real site
  if (lower.includes("facebook.com") || lower.includes("instagram.com")) {
    return { has_website: false, score_penalty: 0 };
  }

  // Looks like a real domain = they have a website, bigger penalty
  return { has_website: true, score_penalty: 7 };
}

function scoreLead(website_url: string | undefined, source: string): { lead_score: number; has_website: boolean } {
  const { has_website, score_penalty } = scoreWebsite(website_url);
  const base = 10;
  const score = Math.max(0, base - score_penalty);
  return { lead_score: score, has_website };
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseGoogleMaps(items: RawGoogleMapsLead[], runId: string): Lead[] {
  return items
    .filter((item) => {
      const name = (item.title || item.name || "").toLowerCase();
      // Only keep gyms / fitness related results
      const keywords = ["gym", "fitness", "crossfit", "yoga", "pilates", "sports", "health club", "training"];
      return keywords.some((k) => name.includes(k)) || (item.categoryName?.toLowerCase().includes("gym"));
    })
    .map((item) => {
      const gym_name = item.title || item.name || "Unknown Gym";
      const website_url = item.website;
      const { lead_score, has_website } = scoreLead(website_url, "google_maps");

      // Extract neighborhood from address
      const address = item.address || "";
      const neighborhood = item.neighborhood || extractNeighborhood(address);

      return {
        gym_name,
        phone: item.phone || item.phoneUnformatted,
        address,
        neighborhood,
        maps_url: item.url,
        rating: item.totalScore,
        review_count: item.reviewsCount,
        website_url: website_url || undefined,
        has_website,
        lead_score,
        scrape_source: "google_maps",
        apify_run_id: runId,
        status: lead_score >= 7 ? "qualified" : lead_score >= 4 ? "scraped" : "skip",
      };
    });
}

function parseInstagram(items: RawInstagramLead[], runId: string): Lead[] {
  return items.map((item) => {
    const gym_name = item.fullName || item.username || "Unknown Gym";
    const website_url = item.externalUrl;
    const { lead_score, has_website } = scoreLead(website_url, "instagram");

    return {
      gym_name,
      address: undefined,
      neighborhood: undefined,
      website_url: website_url || undefined,
      has_website,
      lead_score,
      scrape_source: "instagram",
      instagram_handle: item.username,
      instagram_bio: item.biography,
      instagram_followers: item.followersCount,
      apify_run_id: runId,
      status: lead_score >= 7 ? "qualified" : lead_score >= 4 ? "scraped" : "skip",
    };
  });
}

function parseFacebook(items: RawFacebookLead[], runId: string): Lead[] {
  return items
    .filter((item) => item.pageName || item.name)
    .map((item) => {
      const gym_name = item.pageName || item.name || "Unknown Gym";
      const website_url = item.website;
      const { lead_score, has_website } = scoreLead(website_url, "facebook");

      return {
        gym_name,
        phone: item.phone,
        address: item.address,
        neighborhood: item.address ? extractNeighborhood(item.address) : undefined,
        website_url: website_url || undefined,
        has_website,
        lead_score,
        scrape_source: "facebook",
        facebook_url: item.pageUrl,
        facebook_likes: item.likes,
        apify_run_id: runId,
        status: lead_score >= 7 ? "qualified" : lead_score >= 4 ? "scraped" : "skip",
      };
    });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NAIROBI_HOODS = [
  "Westlands", "Karen", "Kilimani", "Lavington", "Parklands",
  "Upperhill", "Ngong Road", "Kileleshwa", "Kasarani", "Ruaka",
  "Thika Road", "CBD", "Hurlingham", "South C", "South B",
  "Embakasi", "Langata", "Gigiri", "Runda", "Muthaiga",
];

function extractNeighborhood(address: string): string | undefined {
  if (!address) return undefined;
  const lower = address.toLowerCase();
  for (const hood of NAIROBI_HOODS) {
    if (lower.includes(hood.toLowerCase())) return hood;
  }
  return undefined;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Validate secret header (set in Apify webhook config)
  if (WEBHOOK_SECRET) {
    const secret = req.headers.get("x-apify-webhook-secret");
    if (secret !== WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let payload: ApifyWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Only process successful runs
  if (payload.eventType !== "ACTOR.RUN.SUCCEEDED") {
    return new Response(JSON.stringify({ message: "Ignored — not a success event" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const datasetId = payload.defaultDatasetId || payload.resource?.defaultDatasetId;
  if (!datasetId) {
    return new Response("No dataset ID in payload", { status: 400 });
  }

  const runId = payload.actorRunId;
  const actorId = payload.actorId || "";

  // Fetch dataset items from Apify
  const apifyToken = Deno.env.get("APIFY_API_TOKEN");
  const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}&format=json&limit=200`;

  let rawItems: unknown[];
  try {
    const res = await fetch(datasetUrl);
    rawItems = await res.json();
    if (!Array.isArray(rawItems)) throw new Error("Dataset response is not an array");
  } catch (err) {
    console.error("Failed to fetch Apify dataset:", err);
    return new Response("Failed to fetch dataset", { status: 500 });
  }

  // Detect source from actor ID or items shape
  let leads: Lead[] = [];

  if (actorId.includes("google-maps") || actorId.includes("compass")) {
    leads = parseGoogleMaps(rawItems as RawGoogleMapsLead[], runId);
  } else if (actorId.includes("instagram")) {
    leads = parseInstagram(rawItems as RawInstagramLead[], runId);
  } else if (actorId.includes("facebook")) {
    leads = parseFacebook(rawItems as RawFacebookLead[], runId);
  } else {
    // Auto-detect by item shape
    const first = rawItems[0] as Record<string, unknown>;
    if (first?.username !== undefined) {
      leads = parseInstagram(rawItems as RawInstagramLead[], runId);
    } else if (first?.pageName !== undefined) {
      leads = parseFacebook(rawItems as RawFacebookLead[], runId);
    } else {
      leads = parseGoogleMaps(rawItems as RawGoogleMapsLead[], runId);
    }
  }

  if (leads.length === 0) {
    return new Response(JSON.stringify({ message: "No leads parsed", rawCount: rawItems.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Upsert into Supabase (skip exact duplicates)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // For Google Maps: deduplicate on gym_name + address
  // For Instagram: deduplicate on instagram_handle
  // We do two separate upserts
  const mapsLeads = leads.filter((l) => l.scrape_source === "google_maps");
  const socialLeads = leads.filter((l) => l.scrape_source !== "google_maps");

  let inserted = 0;
  let skipped = 0;

  if (mapsLeads.length > 0) {
    const { error, data } = await supabase
      .from("leads")
      .upsert(mapsLeads, {
        onConflict: "gym_name,address",
        ignoreDuplicates: true,
      })
      .select("id");

    if (error) console.error("Maps upsert error:", error);
    else inserted += data?.length ?? 0;
    skipped += mapsLeads.length - (data?.length ?? 0);
  }

  for (const lead of socialLeads) {
    // Instagram: upsert on instagram_handle
    if (lead.instagram_handle) {
      const { error, data } = await supabase
        .from("leads")
        .upsert(lead, { onConflict: "instagram_handle", ignoreDuplicates: true })
        .select("id");
      if (error) console.error("Instagram upsert error:", error);
      else inserted += data?.length ?? 0;
      skipped += 1 - (data?.length ?? 0);
    } else {
      // Facebook: no unique key, insert with duplicate name check
      const { data: existing } = await supabase
        .from("leads")
        .select("id")
        .eq("gym_name", lead.gym_name)
        .eq("scrape_source", "facebook")
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("leads").insert(lead);
        if (!error) inserted++;
        else console.error("Facebook insert error:", error);
      } else {
        skipped++;
      }
    }
  }

  console.log(`Run ${runId}: ${leads.length} parsed, ${inserted} inserted, ${skipped} skipped`);

  return new Response(
    JSON.stringify({
      success: true,
      run_id: runId,
      parsed: leads.length,
      inserted,
      skipped,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
