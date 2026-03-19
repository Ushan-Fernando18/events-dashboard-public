import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup, Graticule } from 'react-simple-maps';
import { scaleSqrt, scaleLinear } from 'd3-scale';
import { Plus, Minus } from 'lucide-react';
import { useState, useMemo } from 'react';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface Props {
  data: {
    country: string;
    views: number;
    percentage?: number;
  }[];
}

const countryNameMap: Record<string, string> = {
  "United States": "United States of America",
  "United Kingdom": "United Kingdom",
};

export default function WorldMap({ data }: Props) {
  const [position, setPosition] = useState({ coordinates: [20, 10] as [number, number], zoom: 1.2 });
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const handleZoomIn = () => {
    if (position.zoom >= 8) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 0.5) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.2 }));
  };

  const handleMoveEnd = (newPosition: { coordinates: [number, number]; zoom: number }) => {
    setPosition(newPosition);
  };

  const maxViews = useMemo(() => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(d => d.views));
  }, [data]);

  const radiusScale = useMemo(() => {
    return scaleSqrt()
      .domain([0, maxViews])
      .range([0, 22]); // Tightened for a more professional look
  }, [maxViews]);



  const dataLookup = useMemo(() => {
    const lookup: Record<string, number> = {};
    data.forEach((d) => {
      const mappedName = countryNameMap[d.country] || d.country;
      lookup[mappedName.toLowerCase()] = d.views;
    });
    return lookup;
  }, [data]);

  const countryCoords: Record<string, [number, number]> = {
    "Sri Lanka": [80.7718, 7.8731],
    "United Kingdom": [-3.4359, 54.3781],
    "United States of America": [-95.7129, 37.0902],
    "United States": [-95.7129, 37.0902],
    "Australia": [133.7751, -25.2744],
    "Canada": [-106.3468, 56.1304],
    "United Arab Emirates": [54.3739, 24.4539],
    "Saudi Arabia": [45.0792, 23.8859],
    "Qatar": [51.1839, 25.3548],
    "Italy": [12.5674, 41.8719],
    "India": [78.9629, 20.5937],
    "Maldives": [73.2207, 3.2028],
    "Oman": [55.9233, 21.5126],
    "Kuwait": [47.4818, 29.3117],
    "Singapore": [103.8198, 1.3521],
    "Germany": [10.4515, 51.1657],
    "France": [2.2137, 46.2276],
    "New Zealand": [174.886, -40.9006],
    "Bahrain": [50.586, 26.0667],
    "Netherlands": [5.2913, 52.1326],
    "Switzerland": [8.2275, 46.8182],
    "Japan": [138.2529, 36.2048],
    "South Korea": [127.7669, 35.9078],
    "Malaysia": [101.9758, 4.2105],
    "Bangladesh": [90.3563, 23.6850],
    "Pakistan": [69.3451, 30.3753]
  };

  return (
    <div className="w-full h-full flex flex-col relative group/map overflow-hidden">
      {/* Small Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 translate-x-1">
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-md bg-white/80 dark:bg-background/80 backdrop-blur-md border border-slate-200 text-slate-600 hover:bg-blue-50 transition-all shadow-md"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-md bg-white/80 dark:bg-background/80 backdrop-blur-md border border-slate-200 text-slate-600 hover:bg-blue-50 transition-all shadow-md"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 w-full min-h-0 relative">
        <ComposableMap
          projectionConfig={{
            scale: 180,
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
          >
            <Graticule stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoName = geo.properties.name.toLowerCase();
                const views = dataLookup[geoName];
                const hasData = views !== undefined && views > 0;
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={hasData ? "#FFFFFF" : "rgba(255,255,255,0.02)"} 
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "rgba(255,255,255,0.12)", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {data.slice(0, 15).map((d) => {
             const coords = countryCoords[d.country] || countryCoords[countryNameMap[d.country] || ""];
             if (!coords || d.views <= 0) return null;

             const radius = Math.max(8, radiusScale(d.views)); // Ensure minimum radius for text
             if (radius < 2) return null;
                          const isHovered = hoveredCountry === d.country;
              const scaleFactor = isHovered ? 1.2 : 1.0;
              const effectiveRadius = radius * scaleFactor;
              
              return (
                <Marker 
                  key={`bubble-${d.country}`} 
                  coordinates={coords}
                  onMouseEnter={() => setHoveredCountry(d.country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                >
                  {/* Minimal Subtle Glow with Pulse */}
                  <circle
                    r={effectiveRadius * 1.5}
                    fill="#1e40af"
                    fillOpacity={isHovered ? 0.4 : 0.25}
                    className="animate-pulse duration-[1500ms]"
                  />
                  {/* Main Bubble core */}
                  <circle
                    r={effectiveRadius}
                    fill={isHovered ? "#3b82f6" : "#2563EB"}
                    fillOpacity={0.9}
                    className="transition-all duration-300"
                  />
                  {/* Shine effect */}
                  <circle
                    r={effectiveRadius * 0.4}
                    cx={-effectiveRadius * 0.25}
                    cy={-effectiveRadius * 0.25}
                    fill="#FFFFFF"
                    fillOpacity={0.1}
                  />
                  
                 {effectiveRadius >= 8 && (
                    <text
                      textAnchor="middle"
                      y={effectiveRadius > 15 ? 6 : 4}
                      style={{ 
                        fontFamily: "Inter, sans-serif", 
                        fill: "#FFFFFF",
                        fontSize: `${Math.max(9, effectiveRadius / 2.2)}px`,
                        fontWeight: "900",
                        pointerEvents: "none",
                        textShadow: "0px 2px 4px rgba(0,0,0,0.5)"
                      }}
                    >
                      {d.views}
                    </text>
                 )}
                </Marker>
              );
           })}
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
}
