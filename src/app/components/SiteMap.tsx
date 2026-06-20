import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Site } from "../lib/siteData";
import { STATUS_META } from "../lib/siteData";

type MapProps = {
  sites: Site[];
  selectedId?: string;
  onSelect: (id: string) => void;
  heatmap: boolean;
};

export function SiteMap({ sites, selectedId, onSelect, heatmap }: MapProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayer = useRef<L.LayerGroup | null>(null);
  const heatLayer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const map = L.map(container.current, {
      center: [36.35, 127.8],
      zoom: 7,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    markerLayer.current = L.layerGroup().addTo(map);
    heatLayer.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const resize = new ResizeObserver(() => map.invalidateSize());
    resize.observe(container.current);
    return () => {
      resize.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markers = markerLayer.current;
    const heats = heatLayer.current;
    if (!map || !markers || !heats) return;
    markers.clearLayers();
    heats.clearLayers();

    const bounds = L.latLngBounds([]);
    sites.forEach((site) => {
      const meta = STATUS_META[site.status];
      const selected = site.id === selectedId;
      const marker = L.circleMarker([site.lat, site.lng], {
        radius: selected ? 11 : 8,
        color: selected ? "#16284a" : "#ffffff",
        weight: selected ? 4 : 3,
        fillColor: meta.color,
        fillOpacity: 1,
        opacity: 1,
      });
      marker.bindTooltip(
        `<div style="font-family:Pretendard,Malgun Gothic,sans-serif;min-width:130px"><b>${site.name}</b><br><span style="color:${meta.color}">${meta.label}</span> · 출근 ${site.attendanceRate}%</div>`,
        { direction: "top", offset: [0, -8] },
      );
      marker.on("click", () => onSelect(site.id));
      marker.addTo(markers);
      bounds.extend([site.lat, site.lng]);

      if (heatmap && site.status !== "normal") {
        L.circle([site.lat, site.lng], {
          radius: site.status === "safety" ? 25000 : 16000,
          stroke: false,
          fillColor: meta.color,
          fillOpacity: site.status === "safety" ? 0.22 : 0.12,
          interactive: false,
        }).addTo(heats);
      }
    });

    const selectedSite = sites.find((site) => site.id === selectedId);
    if (selectedSite) map.flyTo([selectedSite.lat, selectedSite.lng], Math.max(map.getZoom(), 11), { duration: 0.55 });
    else if (bounds.isValid()) map.fitBounds(bounds, { padding: [35, 35], maxZoom: 9 });
  }, [sites, selectedId, onSelect, heatmap]);

  return (
    <div className="relative size-full">
      <div ref={container} className="size-full bg-[#e7ece7]" />
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-md bg-white/90 px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground shadow">
        실제 지도 · 별도 API 키 불필요
      </div>
    </div>
  );
}
