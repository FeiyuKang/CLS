/**
 * Convert latitude/longitude to 3D Cartesian coordinates on a sphere
 * @param lat Latitude in degrees (-90 to 90)
 * @param lon Longitude in degrees (-180 to 180)
 * @param radius Sphere radius (default: 1)
 * @returns [x, y, z] coordinates
 */
export function latLonToCartesian(
  lat: number,
  lon: number,
  radius: number = 1
): [number, number, number] {
  // Convert degrees to radians
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  // Calculate Cartesian coordinates
  // Note: In Three.js, Y is up, so we swap Y and Z from traditional spherical coordinates
  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lonRad);

  return [x, y, z];
}
