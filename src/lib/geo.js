// lib/geo.js
// ─────────────────────────────────────────────────────────────────────────────
// Geographic data loader for the choropleth map.
//
// loadGeo() fetches world-110m.json at runtime (via fetch, not FileAttachment —
// FileAttachment is reserved for index.md per architecture rules).
// Returns { countries: GeoJSON FeatureCollection } ready for d3.geoPath().
//
// The world-110m.json file lives at src/data/geo/world-110m.json and is served
// at /data/geo/world-110m.json by Observable Framework's static file handling.
// ─────────────────────────────────────────────────────────────────────────────

import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

/**
 * Fetch the world TopoJSON and convert it to GeoJSON.
 * Returns { countries } where countries is a GeoJSON FeatureCollection.
 *
 * Each feature in countries.features has:
 *   - .properties.iso3  — ISO 3166-1 alpha-3 code
 *   - .properties.name  — country name
 *
 * @returns {Promise<{ countries: GeoJSON.FeatureCollection }>}
 */
export async function loadGeo() {
  const topo = await fetch("./data/geo/world-110m.json").then(r => r.json());
  const countries = feature(topo, topo.objects.countries);
  return { countries };
}
