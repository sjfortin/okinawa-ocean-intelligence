import { dashboardSites, isDashboardSite } from "@/data/site-focus";
import { siteSeeds } from "@/data/site-seeds";
import type { Coordinates } from "@/domain/site";

const zoom = 14;
const tileSize = 256;
const worldSize = tileSize * 2 ** zoom;
const width = 760;
const height = 680;

function project({ latitude, longitude }: Coordinates) {
  return {
    x: (longitude + 180) / 360 * worldSize,
    y: (1 - Math.asinh(Math.tan(latitude * Math.PI / 180)) / Math.PI) / 2 * worldSize,
  };
}

const center = project({ latitude: 26.341, longitude: 127.748 });
const left = center.x - width / 2;
const top = center.y - height / 2;

const tiles: { x: number; y: number }[] = [];
for (let y = Math.floor(top / tileSize); y < (top + height) / tileSize; y++) {
  for (let x = Math.floor(left / tileSize); x < (left + width) / tileSize; x++) {
    tiles.push({ x, y });
  }
}

export function SitePickerMap() {
  return <section aria-label="Site map"><div className="coast-map" aria-label="Map of the Kadena and Chatan coast">
    <div className="map-tiles" aria-hidden="true">
      {tiles.map(({ x, y }) => <div key={`${x}/${y}`} className="map-tile" style={{
        backgroundImage: `url(https://cyberjapandata.gsi.go.jp/xyz/pale/${zoom}/${x}/${y}.png)`,
        left: `${(x * tileSize - left) / width * 100}%`,
        top: `${(y * tileSize - top) / height * 100}%`,
        width: `${tileSize / width * 100}%`,
        height: `${tileSize / height * 100}%`,
      }} />)}
    </div>
    <span className="map-north" aria-hidden="true">↑ N</span>
    {siteSeeds.map(({ slug, coordinates, forecastPoint }) => {
      if (!isDashboardSite(slug)) return null;
      const point = coordinates?.status === "verified" ? coordinates : forecastPoint;
      if (!point) return null;
      const { x, y } = project(point.value);
      return <button key={slug} className="map-pin" type="submit" name="site" value={slug} style={{
        left: `${(x - left) / width * 100}%`,
        top: `${(y - top) / height * 100}%`,
      }}>
        <span className="pin-dot" aria-hidden="true" />{dashboardSites[slug].name}
      </button>;
    })}
    </div>
    <div className="map-caption"><span>Approximate locations</span><a href="https://maps.gsi.go.jp/help/use.html" target="_blank" rel="noreferrer">GSI Japan · 地理院タイル</a></div>
  </section>;
}
