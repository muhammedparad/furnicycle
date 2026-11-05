/** OpenStreetMap embed around a point. No API key, no tracking script. */
export function OsmMap({ lat, lng, label, className }: { lat: number; lng: number; label: string; className?: string }) {
  const d = 0.035;
  const bbox = [lng - d, lat - d * 0.7, lng + d, lat + d * 0.7].map((n) => n.toFixed(5)).join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(5)},${lng.toFixed(5)}`;
  return (
    <div className={className}>
      <iframe title={`Map of ${label}`} src={src} className="h-72 w-full rounded-lg border-0 bg-[#fbefe0]" loading="lazy" />
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`}
        target="_blank"
        rel="noreferrer"
        className="link-quiet mt-2 inline-block text-small text-accent"
      >
        Open larger map
      </a>
    </div>
  );
}
