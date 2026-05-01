// ============================================================
// NAIROBI NEIGHBORHOODS — Search queries for gym lead scraping
// Ordered roughly by market opportunity (upscale areas first,
// more likely to have gyms that can afford a website).
// ============================================================

export const NEIGHBORHOODS = [
  // Tier 1 — High income, many gyms, best leads
  { name: 'Westlands',      query: 'gyms fitness centers in Westlands Nairobi' },
  { name: 'Karen',          query: 'gyms fitness centers in Karen Nairobi' },
  { name: 'Kilimani',       query: 'gyms fitness studios in Kilimani Nairobi' },
  { name: 'Lavington',      query: 'gyms fitness centers in Lavington Nairobi' },
  { name: 'Upperhill',      query: 'gyms fitness centers in Upperhill Nairobi' },
  { name: 'Parklands',      query: 'gyms fitness centers in Parklands Nairobi' },
  { name: 'Gigiri',         query: 'gyms fitness centers in Gigiri Nairobi' },
  { name: 'Runda',          query: 'gyms fitness centers in Runda Nairobi' },
  { name: 'Muthaiga',       query: 'gyms fitness centers in Muthaiga Nairobi' },

  // Tier 2 — Middle income, growing fitness market
  { name: 'Nairobi CBD',    query: 'gyms fitness centers in Nairobi CBD' },
  { name: 'South B',        query: 'gyms fitness centers in South B Nairobi' },
  { name: 'South C',        query: 'gyms fitness centers in South C Nairobi' },
  { name: 'Langata',        query: 'gyms fitness centers in Langata Nairobi' },
  { name: 'Hurlingham',     query: 'gyms fitness centers in Hurlingham Nairobi' },
  { name: 'Kileleshwa',     query: 'gyms fitness studios in Kileleshwa Nairobi' },
  { name: 'Ruaka',          query: 'gyms fitness centers in Ruaka Nairobi' },
  { name: 'Kasarani',       query: 'gyms fitness centers in Kasarani Nairobi' },
  { name: 'Roysambu',       query: 'gyms fitness centers in Roysambu Nairobi' },
  { name: 'Thika Road',     query: 'gyms fitness centers along Thika Road Nairobi' },
  { name: 'Ngong Road',     query: 'gyms fitness centers along Ngong Road Nairobi' },

  // Tier 3 — Emerging, price-sensitive but volume opportunity
  { name: 'Eastleigh',      query: 'gyms fitness centers in Eastleigh Nairobi' },
  { name: 'Umoja',          query: 'gyms fitness centers in Umoja Nairobi' },
  { name: 'Buruburu',       query: 'gyms fitness centers in Buruburu Nairobi' },
  { name: 'Donholm',        query: 'gyms fitness centers in Donholm Nairobi' },
  { name: 'Pipeline',       query: 'gyms fitness centers in Pipeline Nairobi' },
  { name: 'Embakasi',       query: 'gyms fitness centers in Embakasi Nairobi' },
  { name: 'Zimmerman',      query: 'gyms fitness centers in Zimmerman Nairobi' },
  { name: 'Kahawa',         query: 'gyms fitness centers in Kahawa Nairobi' },
  { name: 'Kikuyu',         query: 'gyms fitness centers in Kikuyu Kiambu' },
  { name: 'Ruiru',          query: 'gyms fitness centers in Ruiru Kiambu' },

  // Bonus — specific gym types that often skip websites
  { name: 'Boxing Gyms',    query: 'boxing gyms martial arts in Nairobi' },
  { name: 'CrossFit Nairobi', query: 'crossfit bootcamp training in Nairobi' },
  { name: 'Yoga Studios',   query: 'yoga pilates studios in Nairobi' },
]

// Quick subset for testing — just run these 5 first
export const TIER_1 = NEIGHBORHOODS.slice(0, 9)

// Full run — all neighborhoods
export const ALL = NEIGHBORHOODS
