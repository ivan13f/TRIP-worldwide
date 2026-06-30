import { feature, mesh } from "topojson-client";

/**
 * Convert a TopoJSON world file into GeoJSON features.
 * Expects world-atlas style object: topo.objects.countries
 */

export function topoToFeatures(topo) {
  const countries = feature(topo, topo.objects.countries);
  const borders = mesh(topo, topo.objects.countries, (a, b) => a !== b);
  return { countries, borders };
}