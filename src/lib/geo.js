// lib/geo.js
// ─────────────────────────────────────────────────────────────────────────────
// Geographic data loader for the choropleth map.
//
// loadGeo() fetches world-110m.json, converts TopoJSON → GeoJSON, and adds
// an `iso3` property to every feature using the ISO 3166-1 numeric → alpha-3
// lookup table below.
//
// The world-110m.json stores feature IDs as numeric strings ("840" = USA).
// The TRIP dataset uses alpha-3 codes ("USA"). Without this lookup, the
// choropleth cannot join scores to map features.
//
// LEARNING NOTE — why two formats?
//   ISO 3166-1 numeric codes are compact and guaranteed stable.
//   Alpha-3 codes ("AFG", "USA") are human-readable. The map file uses
//   numerics to stay small; our dataset uses alpha-3 for legibility.
//   We bridge them here so the choropleth can join on iso3.
// ─────────────────────────────────────────────────────────────────────────────

import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

// ISO 3166-1 numeric code (as zero-padded string) → alpha-3 code.
// Covers all 177 features in world-110m.json.
// Features without an entry (N. Cyprus, Somaliland, Kosovo — no ISO code)
// will have iso3: null and render as the "no data" colour.
const NUM_TO_ISO3 = {
  "004": "AFG", "008": "ALB", "010": "ATA", "012": "DZA", "024": "AGO",
  "031": "AZE", "032": "ARG", "036": "AUS", "040": "AUT", "044": "BHS",
  "050": "BGD", "051": "ARM", "056": "BEL", "064": "BTN", "068": "BOL",
  "070": "BIH", "072": "BWA", "076": "BRA", "084": "BLZ", "090": "SLB",
  "096": "BRN", "100": "BGR", "104": "MMR", "108": "BDI", "112": "BLR",
  "116": "KHM", "120": "CMR", "124": "CAN", "140": "CAF", "144": "LKA",
  "148": "TCD", "152": "CHL", "156": "CHN", "158": "TWN", "170": "COL",
  "178": "COG", "180": "COD", "188": "CRI", "191": "HRV", "192": "CUB",
  "196": "CYP", "203": "CZE", "204": "BEN", "208": "DNK", "214": "DOM",
  "218": "ECU", "222": "SLV", "226": "GNQ", "231": "ETH", "232": "ERI",
  "233": "EST", "238": "FLK", "242": "FJI", "246": "FIN", "250": "FRA",
  "260": "ATF", "262": "DJI", "266": "GAB", "268": "GEO", "270": "GMB",
  "275": "PSE", "276": "DEU", "288": "GHA", "300": "GRC", "304": "GRL",
  "320": "GTM", "324": "GIN", "328": "GUY", "332": "HTI", "340": "HND",
  "348": "HUN", "352": "ISL", "356": "IND", "360": "IDN", "364": "IRN",
  "368": "IRQ", "372": "IRL", "376": "ISR", "380": "ITA", "384": "CIV",
  "388": "JAM", "392": "JPN", "398": "KAZ", "400": "JOR", "404": "KEN",
  "408": "PRK", "410": "KOR", "414": "KWT", "417": "KGZ", "418": "LAO",
  "422": "LBN", "426": "LSO", "428": "LVA", "430": "LBR", "434": "LBY",
  "440": "LTU", "442": "LUX", "450": "MDG", "454": "MWI", "458": "MYS",
  "466": "MLI", "478": "MRT", "484": "MEX", "496": "MNG", "498": "MDA",
  "499": "MNE", "504": "MAR", "508": "MOZ", "512": "OMN", "516": "NAM",
  "524": "NPL", "528": "NLD", "540": "NCL", "548": "VUT", "554": "NZL",
  "558": "NIC", "562": "NER", "566": "NGA", "578": "NOR", "586": "PAK",
  "591": "PAN", "598": "PNG", "600": "PRY", "604": "PER", "608": "PHL",
  "616": "POL", "620": "PRT", "624": "GNB", "626": "TLS", "630": "PRI",
  "634": "QAT", "642": "ROU", "643": "RUS", "646": "RWA", "682": "SAU",
  "686": "SEN", "688": "SRB", "694": "SLE", "703": "SVK", "704": "VNM",
  "705": "SVN", "706": "SOM", "710": "ZAF", "716": "ZWE", "724": "ESP",
  "728": "SSD", "729": "SDN", "732": "ESH", "740": "SUR", "748": "SWZ",
  "752": "SWE", "756": "CHE", "760": "SYR", "762": "TJK", "764": "THA",
  "768": "TGO", "780": "TTO", "784": "ARE", "788": "TUN", "792": "TUR",
  "795": "TKM", "800": "UGA", "804": "UKR", "807": "MKD", "818": "EGY",
  "826": "GBR", "834": "TZA", "840": "USA", "854": "BFA", "858": "URY",
  "860": "UZB", "862": "VEN", "887": "YEM", "894": "ZMB",
};

/**
 * Convert a TopoJSON object to GeoJSON and add iso3 to each feature.
 * Called with an already-fetched TopoJSON (loaded via FileAttachment in index.md).
 *
 * Returns { countries } where countries is a GeoJSON FeatureCollection.
 * Each feature's properties will have:
 *   - .iso3  — ISO 3166-1 alpha-3 code (e.g. "USA"), or null if unrecognised
 *
 * @param {object} topo — raw TopoJSON object
 * @returns {{ countries: GeoJSON.FeatureCollection }}
 */
export function parseGeo(topo) {
  const countries = feature(topo, topo.objects.countries);
  countries.features.forEach(f => {
    const numId = String(f.id ?? "").padStart(3, "0");
    f.properties.iso3 = NUM_TO_ISO3[numId] ?? null;
  });
  return { countries };
}
