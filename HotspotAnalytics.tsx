import React, { useMemo, useState, useEffect, useRef } from "react";
import type { Apartment } from "./types";
import { MapPin, Flame, Filter } from "lucide-react";
import { DISTRICT_CENTERS } from "./constants";

type HotspotAnalyticsPageProps = {
  apartments: Apartment[];
};

type Stat = {
  district: string;
  count: number;
  avgPrice: number;
  lat: number;
  lng: number;
};

type Mode = "all" | "most-expensive" | "cheapest";

const DEFAULT_CENTER: [number, number] = [48.137154, 11.576124];
const DEFAULT_ZOOM = 12;
// HIER: nicht zu nah ranzoomen
const FOCUS_ZOOM = 13;

const HotspotAnalyticsPage: React.FC<HotspotAnalyticsPageProps> = ({
  apartments,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [mode, setMode] = useState<Mode>("all");

  // --- MAP-REFS ---
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const circlesLayerRef = useRef<any | null>(null);

  // --- Statistiken pro Stadtteil ---
  const stats: Stat[] = useMemo(() => {
    const byDistrict = new Map<
      string,
      { count: number; sumPrice: number; latSum: number; lngSum: number }
    >();

    apartments.forEach((apt) => {
      const d = apt.district || "Unbekannt";
      const current = byDistrict.get(d) ?? {
        count: 0,
        sumPrice: 0,
        latSum: 0,
        lngSum: 0,
      };
      current.count += 1;
      current.sumPrice += apt.price;
      current.latSum += apt.lat;
      current.lngSum += apt.lng;
      byDistrict.set(d, current);
    });

    return Array.from(byDistrict.entries())
      .map(([district, value]) => {
        const centerFromConstants = DISTRICT_CENTERS[district];
        const lat =
          centerFromConstants?.lat ?? value.latSum / Math.max(value.count, 1);
        const lng =
          centerFromConstants?.lng ?? value.lngSum / Math.max(value.count, 1);

        return {
          district,
          count: value.count,
          avgPrice: Math.round(value.sumPrice / value.count),
          lat,
          lng,
        };
      })
      .sort((a, b) => b.count - a.count); // viele Angebote zuerst
  }, [apartments]);

  const maxCount = stats[0]?.count ?? 1;
  const maxPrice = stats.reduce(
    (max, s) => (s.avgPrice > max ? s.avgPrice : max),
    0
  );
  const minPrice = stats.reduce(
    (min, s) => (s.avgPrice < min ? s.avgPrice : min),
    stats[0]?.avgPrice ?? 0
  );

  // --- Filter-Modus: alle / teuerster / günstigster ---
  const filteredStats = useMemo(() => {
    if (mode === "most-expensive") {
      return stats.filter((s) => s.avgPrice === maxPrice);
    }
    if (mode === "cheapest") {
      return stats.filter((s) => s.avgPrice === minPrice);
    }
    return stats;
  }, [mode, stats, maxPrice, minPrice]);

  // wenn Modus "teuerster" / "günstigster": automatisch ersten passenden Stadtteil wählen
  useEffect(() => {
    if (mode === "all") return;
    if (filteredStats.length > 0) {
      setSelectedDistrict(filteredStats[0].district);
    }
  }, [mode, filteredStats]);

  // --- Leaflet-Map initialisieren ---
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      // Scroll-Wheel bleibt an, kannst du bei Bedarf auf false setzen
      scrollWheelZoom: true,
    });

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
      }
    ).addTo(mapRef.current);

    // einmalig Größe korrigieren
    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 200);
  }, []);

  // --- Kreise / "Heatmap"-Layer zeichnen ---
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    // alten Layer löschen
    if (circlesLayerRef.current) {
      circlesLayerRef.current.remove();
    }

    const layerGroup = L.layerGroup();

    stats.forEach((s) => {
      const isSelected = s.district === selectedDistrict;

      // Farbe nach Preis (billig = grün, teuer = rot)
      const normalized =
        maxPrice === minPrice
          ? 0.5
          : (s.avgPrice - minPrice) / (maxPrice - minPrice);
      const red = Math.round(255 * normalized);
      const green = Math.round(200 * (1 - normalized) + 55);

      const circle = L.circle([s.lat, s.lng], {
        radius: isSelected ? 1500 : 1000, // Meter
        color: `rgba(${red}, ${green}, 120, 0.9)`,
        weight: isSelected ? 3 : 1,
        fillColor: `rgba(${red}, ${green}, 120, 0.3)`,
        fillOpacity: isSelected ? 0.45 : 0.25,
      });

      circle.addTo(layerGroup);
    });

    layerGroup.addTo(mapRef.current);
    circlesLayerRef.current = layerGroup;
  }, [stats, selectedDistrict, maxPrice, minPrice]);

  // --- Auf Stadtteil springen, aber NICHT zu nah zoomen ---
  useEffect(() => {
    if (!selectedDistrict || !mapRef.current) return;

    const stat = stats.find((s) => s.district === selectedDistrict);
    if (!stat) return;

    mapRef.current.flyTo([stat.lat, stat.lng], FOCUS_ZOOM, {
      duration: 1.0,
    });
  }, [selectedDistrict, stats]);

  // Wenn kein Stadtteil ausgewählt: auf München gesamt
  useEffect(() => {
    if (selectedDistrict) return;
    if (!mapRef.current) return;
    mapRef.current.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.0 });
  }, [selectedDistrict]);

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-950 text-gray-50 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Flame className="text-emerald-500" />
          Miet-Hotspots in München
        </h1>
        <p className="text-gray-400 mb-6">
          Hier siehst du, in welchen Stadtteilen gerade viele Angebote liegen
          und wie hoch dort die durchschnittliche Kaltmiete ist.
        </p>

        {/* Layout: links Liste, rechts Karte mit fester Höhe */}
        <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-start">
          {/* LINKER TEIL – Filter + Karten */}
          <div>
            {/* Filterzeile */}
            <div className="mb-4 flex flex-wrap gap-3 items-center">
              <span className="flex items-center gap-2 text-sm text-gray-400">
                <Filter size={16} />
                Stadtteil filtern:
              </span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm"
              >
                <option value="">Alle Stadtteile</option>
                {stats.map((s) => (
                  <option key={s.district} value={s.district}>
                    {s.district}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 ml-auto text-xs">
                <button
                  onClick={() => setMode("all")}
                  className={`px-3 py-1 rounded-full border ${
                    mode === "all"
                      ? "bg-emerald-600 border-emerald-500 text-white"
                      : "border-gray-700 text-gray-300"
                  }`}
                >
                  Alle
                </button>
                <button
                  onClick={() => setMode("most-expensive")}
                  className={`px-3 py-1 rounded-full border ${
                    mode === "most-expensive"
                      ? "bg-emerald-600 border-emerald-500 text-white"
                      : "border-gray-700 text-gray-300"
                  }`}
                >
                  Teuerster
                </button>
                <button
                  onClick={() => setMode("cheapest")}
                  className={`px-3 py-1 rounded-full border ${
                    mode === "cheapest"
                      ? "bg-emerald-600 border-emerald-500 text-white"
                      : "border-gray-700 text-gray-300"
                  }`}
                >
                  Günstigster
                </button>
              </div>
            </div>

            {/* Karten-Liste */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredStats.map((s) => {
                const isSelected = s.district === selectedDistrict;
                return (
                  <button
                    key={s.district}
                    onClick={() =>
                      setSelectedDistrict(
                        isSelected ? "" : s.district
                      )
                    }
                    className={`text-left rounded-xl border px-4 py-3 shadow-sm transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/5"
                        : "border-gray-800 bg-gray-900/60 hover:border-emerald-500/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <MapPin
                          size={18}
                          className="text-emerald-400"
                        />
                        <span className="font-semibold text-sm">
                          {s.district}
                        </span>
                      </div>
                      <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300">
                        {s.count} Angebote
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Ø Kaltmiete:{" "}
                      <span className="font-semibold text-gray-100">
                        {s.avgPrice} €
                      </span>
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${Math.min(
                            100,
                            (s.count / maxCount) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </button>
                );
              })}

              {filteredStats.length === 0 && (
                <div className="col-span-full text-sm text-gray-500">
                  Keine Daten für diesen Filter.
                </div>
              )}
            </div>
          </div>

          {/* RECHTER TEIL – MAP mit fester Höhe, damit sie NICHT mitspringt */}
          <div className="w-full">
            <div className="w-full h-[640px] rounded-xl overflow-hidden border border-gray-800 bg-gray-900">
              <div
                ref={mapContainerRef}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotspotAnalyticsPage;
