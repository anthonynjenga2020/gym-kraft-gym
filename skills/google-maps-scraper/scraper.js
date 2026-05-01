// ============================================================
// Google Places API (New) — Gym Scraper
//
// Uses the Places API v1 Text Search endpoint.
// One call per neighborhood, returns up to 20 results.
// Costs ~$0.032 per search call (negligible).
//
// Required env var: GOOGLE_PLACES_API_KEY
// Get one at: console.cloud.google.com → APIs → Places API (New)
// ============================================================

const PLACES_API = 'https://places.googleapis.com/v1/places:searchText'

// Fields we want from the API — only pay for what we request
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.rating',
  'places.userRatingCount',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.businessStatus',
  'places.types',
].join(',')

/**
 * Search Google Maps for gyms matching a query.
 * Returns an array of raw Place objects from the API.
 *
 * @param {string} query - e.g. "gyms in Westlands Nairobi"
 * @param {string} apiKey
 * @returns {Promise<Place[]>}
 */
export async function searchGyms(query, apiKey) {
  const res = await fetch(PLACES_API, {
    method: 'POST',
    headers: {
      'Content-Type':    'application/json',
      'X-Goog-Api-Key':  apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery:      query,
      maxResultCount: 20,
      languageCode:   'en',
      // Bias results toward Nairobi
      locationBias: {
        circle: {
          center: { latitude: -1.2921, longitude: 36.8219 },
          radius: 40000, // 40km radius around Nairobi CBD
        },
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Places API error for "${query}": ${err}`)
  }

  const data = await res.json()
  return data.places ?? []
}

/**
 * Convert a raw Places API result into our lead schema.
 *
 * @param {object} place - Raw Places API place object
 * @param {string} neighborhood - The neighborhood name we searched
 * @returns {object} Lead record ready for Supabase
 */
export function normalizeLead(place, neighborhood) {
  const name    = place.displayName?.text ?? 'Unknown'
  const phone   = place.internationalPhoneNumber ?? place.nationalPhoneNumber ?? null
  const address = place.formattedAddress ?? null
  const website = place.websiteUri ?? null
  const rating  = place.rating ?? null
  const reviews = place.userRatingCount ?? 0
  const mapsUrl = place.googleMapsUri ?? null

  return {
    gym_name:     name,
    phone:        phone,
    address:      address,
    neighborhood: neighborhood,
    maps_url:     mapsUrl,
    rating:       rating ? parseFloat(rating.toFixed(1)) : null,
    review_count: reviews,
    website_url:  website,
    has_website:  Boolean(website),
    scrape_source: 'google_maps',
    status:        'scraped',
    lead_score:    0, // Will be set by scorer.js
  }
}
