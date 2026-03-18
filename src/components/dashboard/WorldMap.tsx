import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
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

// Helper to map GA4 country names to standard Map names if needed
const countryNameMap: Record<string, string> = {
  "United States": "United States of America",
  "United Kingdom": "United Kingdom",
};

export default function WorldMap({ data }: Props) {
  const [position, setPosition] = useState({ coordinates: [0, 15] as [number, number], zoom: 1 });

  const handleZoomIn = () => {
    if (position.zoom >= 8) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleMoveEnd = (newPosition: { coordinates: [number, number]; zoom: number }) => {
    setPosition(newPosition);
  };
  // Find max views to scale the heat map colors
  const maxViews = useMemo(() => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(d => d.views));
  }, [data]);

  // Create a greenish color scale with better contrast
  const colorScale = scaleLinear<string>()
    .domain([0, maxViews])
    .range(["#EBEBFF", "#8B20BB"]); // Soft purple to vibrant purple

  // Quick lookup dictionary for faster rendering
  const dataLookup = useMemo(() => {
    const lookup: Record<string, number> = {};
    data.forEach((d) => {
      const mappedName = countryNameMap[d.country] || d.country;
      lookup[mappedName.toLowerCase()] = d.views;
    });
    return lookup;
  }, [data]);

  return (
    <div className="w-full h-full flex flex-col relative group/map">
      {/* Zoom Controls - Top Right */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg bg-white/40 dark:bg-background/80 backdrop-blur-md border border-white/40 dark:border-border/50 text-foreground hover:bg-primary/20 hover:border-primary/50 transition-all shadow-lg"
          title="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg bg-white/40 dark:bg-background/80 backdrop-blur-md border border-white/40 dark:border-border/50 text-foreground hover:bg-primary/20 hover:border-primary/50 transition-all shadow-lg"
          title="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 w-full min-h-0 relative">
        <ComposableMap
          projectionConfig={{
            scale: 200,
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
          >
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
                    fill={hasData ? colorScale(views) : "#F8FAFC"} // Lighter grey for inactive countries
                    stroke="#cbd5e1" // Softer border color for the lighter background
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: hasData ? "#4F46E5" : "#F1F5F9", outline: "none" }, 
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
          {data.map((d) => {
             // Let's create an array of specific coordinates for major countries since auto-centroid can sometimes flip bounds on world maps
             const countryCoords: Record<string, [number, number]> = {
               "Sri Lanka": [80.7718, 7.8731],
               "United Kingdom": [-3.4359, 55.3781],
               "United States of America": [-95.7129, 37.0902],
               "United States": [-95.7129, 37.0902],
               "Australia": [133.7751, -25.2744],
               "Canada": [-106.3468, 56.1304],
               "United Arab Emirates": [53.8478, 23.4241],
               "Saudi Arabia": [45.0792, 23.8859],
               "Qatar": [51.1839, 25.3548],
               "Italy": [12.5674, 41.8719],
               "India": [78.9629, 20.5937],
               "Maldives": [73.2207, 3.2028],
               "Oman": [55.9233, 21.5126],
               "Kuwait": [47.4818, 29.3117]
             };
             
             const coords = countryCoords[d.country] || countryCoords[countryNameMap[d.country] || ""];
             if (!coords || d.views <= 0) return null;

             return (
               <Marker key={d.country} coordinates={coords}>
                 <text
                   textAnchor="middle"
                   y={-5}
                   style={{ 
                     fontFamily: "system-ui, sans-serif", 
                     fill: "#ffffff",
                     fontSize: "12px",
                     fontWeight: "bold",
                     textShadow: "0px 1px 3px rgba(0,0,0,0.8), 0px 0px 2px rgba(0,0,0,0.8)"
                   }}
                 >
                   {d.views}
                 </text>
               </Marker>
             );
          })}
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
}
