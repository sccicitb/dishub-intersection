"use client"

import { v4 as uuidv4 } from "uuid";
import { useEffect, useState, useRef, useCallback } from "react";
import "leaflet/dist/leaflet.css";
// import "leaflet/dist/images/marker-shadow.png"; // Sometimes needed if loader issues
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";
import { FaMapMarkerAlt, FaAngleDown, FaRulerHorizontal } from "react-icons/fa";
import { maps, cameras } from '@/lib/apiService';
import { renderToStaticMarkup } from "react-dom/server";

// Link to correct Leaflet assets (Fix for Next.js)
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker for Intersections
const createCustomIcon = () => {
  const iconHtml = renderToStaticMarkup(
    <div style={{ color: "brown", fontSize: "35px", filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.5))" }}>
      <FaMapMarkerAlt />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: "custom-leaflet-icon",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
  });
};
const customMarkerIcon = createCustomIcon();


// === Map Controller Component (Handles FlyTo, FitBounds, Events) ===
const MapController = ({
  focusBuilding,
  bounds,
  rulerStatus,
  onMapClick
}) => {
  const map = useMap();

  // Reset/Fit Bounds
  useEffect(() => {
    if (bounds) {
      // Convert turf bbox [minX, minY, maxX, maxY] -> Leaflet Bounds [[lat1, lng1], [lat2, lng2]]
      const corner1 = [bounds[1], bounds[0]];
      const corner2 = [bounds[3], bounds[2]];
      map.fitBounds([corner1, corner2], { padding: [35, 35] });
    }
  }, [bounds, map]);

  // Fly to Location
  useEffect(() => {
    if (focusBuilding) {
       map.flyTo(
        [focusBuilding.latitude, focusBuilding.longitude], 
        18,
        { animate: true, duration: 0.8 }
      );
    }
  }, [focusBuilding, map]);

  // Click Event for Ruler
  useMapEvents({
    click (e) {
      if (rulerStatus && onMapClick) {
        onMapClick([e.latlng.lng, e.latlng.lat]);
      }
    }
  });

  return null;
}


const MapComponent = ({ title, onClick, sizeHeight, onClickSimpang, form = false, showAllOption = true }) => {
  // === State ===
  const [shouldRenderMap, setShouldRenderMap] = useState(false);
  const [theme, setTheme] = useState("light");

  // Data
  const [buildings, setBuildings] = useState([]);
  const [camerasData, setCamerasData] = useState([]);

  // Controlled Map State
  const [focusBuilding, setFocusBuilding] = useState(null);
  const [bounds, setBounds] = useState(null);

  // UI
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [cameraModal, setCameraModal] = useState({ isOpen: false, cameras: [] });

  // Ruler
  const [rulerStatus, setRulerStatus] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [lines, setLines] = useState([]);

  const didFetch = useRef(false);

  // === Styles (Open Sources) ===
  const mapStyles = {
    form_sa: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },
    light: {
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    dark: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },
    basic: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
  };

  // === Initialization ===
  useEffect(() => {
    setShouldRenderMap(true);
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, []);

  // Fetch Data
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const fetchData = async () => {
      try {
        const camerasRes = await cameras.getAll();
        const data = camerasRes.data.cameras || [];
        setCamerasData(data);

        const buildingsRes = await maps.getAllSimpang();
        const buildingsData = buildingsRes.data.simpang || [];

        const filtered = combineData(buildingsData, data);
        setBuildings(filtered);
        setupMapData(filtered);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  const combineData = (buildings, camerasData) => {
    return buildings
      .filter(b => b.latitude != null && b.longitude != null)
      .map(building => {
        const relatedCameras = camerasData.filter(camera => camera.ID_Simpang === building.id);
        return {
          ...building,
          latitude: parseFloat(building.latitude),
          longitude: parseFloat(building.longitude),
          cameras: relatedCameras || [],
        };
      });
  };

  const setupMapData = (buildings, initialFly = false) => {
    if (buildings.length > 0) {
      const coordinates = buildings.map(b => [b.longitude, b.latitude]);
      const featureCollection = turf.featureCollection(coordinates.map(coord => turf.point(coord)));

      if (!initialFly && !form) {
        setBounds(turf.bbox(featureCollection));
      }

      // Form mode specific behavior
      if (form && buildings[1]) {
        // Emulate original "flyToLocation(buildings[1], true)" which doesn't trigger onClickSimpang
        // But we need to set focus
        setFocusBuilding(buildings[1]);
        onClickSimpang && onClickSimpang(buildings[1]);
      }
    }
  };

  // Theme Observer
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.getAttribute("data-theme") || "light";
      if (newTheme !== theme) {
        setTheme(newTheme);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [theme]);


  // === Handlers ===
  const handleMarkerClick = (building) => {
    setFocusBuilding(building);
    
    // Always call onClickSimpang if provided
    if (onClickSimpang) {
        onClickSimpang(building);
    }

    if (!form) {
      // Open Modal if cameras exist
      if (Array.isArray(building.cameras) && building.cameras.length > 0) {
        setCameraModal({ isOpen: true, cameras: building.cameras });
      } else {
        // Only trigger onClick if no cameras are available
        onClick && onClick(building);
      }
    } else {
      // Check cameras for form mode too
      if (Array.isArray(building.cameras) && building.cameras.length > 0) {
        setCameraModal({ isOpen: true, cameras: building.cameras });
      }
    }
  };

  const handleCameraSelect = (camera) => {
    onClick && onClick({ camera });
    setCameraModal({ isOpen: false, cameras: [] });
  };

  const handleFitAll = () => {
    if (buildings.length > 0) {
      const coordinates = buildings.map(b => [b.longitude, b.latitude]);
      const featureCollection = turf.featureCollection(coordinates.map(coord => turf.point(coord)));
      setBounds(turf.bbox(featureCollection));
      setFocusBuilding(null); // Clear specific focus to allow fitting
      
      // Update parent component state for "semua"
      const allSimpangData = {
         id: "semua",
         Nama_Simpang: "Semua Simpang",
         simpang: "semua"
      };
      
      // If onClickSimpang prop is provided, call it
      if (onClickSimpang) {
          onClickSimpang(allSimpangData);
      }
    }
  };

  const handleMapClick = (coords) => {
    // coords is [lng, lat]
    const newPoints = [...measurePoints, coords];
    setMeasurePoints(newPoints);

    if (newPoints.length === 2) {
      const from = turf.point(newPoints[0]);
      const to = turf.point(newPoints[1]);
      const distance = turf.distance(from, to, { units: 'meters' });
      alert(`Jarak: ${distance.toFixed(2)} m`);

      const newLine = {
        id: uuidv4(),
        label: lines.length + 1,
        // Leaflet Polyline expects [lat, lng] arrays
        positions: [[newPoints[0][1], newPoints[0][0]], [newPoints[1][1], newPoints[1][0]]],
        distance: `${distance.toFixed(2)} m`
      };

      setLines([...lines, newLine]);
      setTimeout(() => setMeasurePoints([]), 300);
    }
  };

  // Loading State
  if (!shouldRenderMap) {
    return (
      <div style={{ width: "100%", height: sizeHeight || "50vh" }} className="flex items-center justify-center bg-gray-100">
        <span>Loading Map...</span>
      </div>
    );
  }

  const currentStyle = mapStyles.basic;

  return (
    <div className="relative">
      {title && <div className="p-5 text-xl font-semibold">{title}</div>}

      <div style={{ width: "100%", height: sizeHeight || "50vh" }} className="relative z-0">
        <MapContainer
          center={[-7.806961958513005, 110.36394885709416]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ width: "100%", height: "100%", zIndex: 1 }}
        >
          <TileLayer
            url={currentStyle.url}
            attribution={currentStyle.attribution}
          />

          <MapController
            focusBuilding={focusBuilding}
            bounds={bounds}
            rulerStatus={rulerStatus}
            onMapClick={handleMapClick}
          />

          {/* Buildings */}
          {buildings.map(b => (
            <Marker
              key={b.id}
              position={[b.latitude, b.longitude]} // Leaflet: [Lat, Lng]
              icon={customMarkerIcon}
              eventHandlers={{
                click: () => handleMarkerClick(b)
              }}
            />
          ))}

          {/* Ruler Temporary Points */}
          {measurePoints.map((pt, i) => (
            <Marker
              key={`pt-${i}`}
              position={[pt[1], pt[0]]}
              icon={L.divIcon({
                className: "bg-red-500 rounded-full w-3 h-3 block border-white border-2",
                html: "",
                iconSize: [12, 12]
              })}
            />
          ))}

          {/* Ruler Lines */}
          {lines.map((line) => (
            <Polyline
              key={line.id}
              positions={line.positions}
              color="red"
              weight={3}
            >
              <Popup>
                <div className="text-center font-bold">Garis {line.label}</div>
                <div className="text-center">{line.distance}</div>
              </Popup>
            </Polyline>
          ))}

        </MapContainer>

        {/* == Controls Layer (Must be outside MapContainer but inside relative div) == */}

        {/* Top Left Controls */}
        <div className="absolute top-3 left-15 z-[500] flex flex-wrap gap-2 w-[80%] pointer-events-none">
          <div className="pointer-events-auto flex gap-2">
            {/* Dropdown Location */}
            <Dropdown
              isOpen={isLocationDropdownOpen}
              onToggle={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              label="Pilih Lokasi"
            >
              {showAllOption && (
                <DropdownItem
                  label="Semua Simpang"
                  icon={<FaMapMarkerAlt />}
                  onClick={() => {
                    handleFitAll();
                    handleCameraSelect({ id: "semua", name: "Semua Kamera", socket_event: "all", simpang: "semua" });
                    if (onClick) {
                      onClick({ id: "semua", name: "Semua Kamera", socket_event: "all", simpang: "semua" }); 
                    }
                    setIsLocationDropdownOpen(false);
                  }}
                />
              )}
              {buildings.map((building) => (
                <DropdownItem
                  key={building.id}
                  label={building.Nama_Simpang}
                  icon={<FaMapMarkerAlt />}
                  onClick={() => {
                    handleMarkerClick(building);
                    setIsLocationDropdownOpen(false);
                  }}
                />
              ))}
            </Dropdown>
            <button
              className="btn btn-sm text-xs font-semibold rounded-xl shadow-xs capitalize bg-white border-2 border-stone-900/30"
              onClick={handleFitAll}
            >
              Reset View
            </button>

            <button
              className={`btn btn-sm text-xs rounded-xl shadow-xs capitalize ${rulerStatus ? "bg-[#232f61] text-white" : "bg-white text-[#232f61]"}`}
              onClick={() => {
                setRulerStatus(!rulerStatus);
                setMeasurePoints([]);
              }}
              title="Alat Ukur Jarak"
            >
              <FaRulerHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Delete Lines Buttons */}
        {lines.length > 0 && (
          <div className="absolute top-20 left-3 z-[500] flex flex-col gap-2 max-h-[200px] overflow-y-auto w-fit">
            {lines.map((line) => (
              <button
                key={line.id}
                className="btn btn-xs text-xs border-transparent bg-red-100/90 text-red-600 hover:bg-red-200 w-fit shadow-sm"
                onClick={() => {
                  setLines(prev => prev.filter(l => l.id !== line.id));
                }}
              >
                Hapus Garis {line.label}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Camera Selection Modal */}
      {cameraModal.isOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex justify-center items-center">
          <div className="bg-white rounded-xl p-5 shadow-lg w-80 max-w-full m-4">
            <h2 className="text-xs font-semibold mb-4 text-center">Pilih Kamera</h2>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto p-1">
              {cameraModal.cameras.map((camera) => (
                <button
                  key={camera.id}
                  className={`w-full text-left rounded-xl btn btn-sm h-auto py-2 border ${camera.socket_event === "not_yet_assign"
                      ? "border-orange-100 bg-orange-50 hover:bg-orange-100"
                      : "border-green-300 bg-green-50 hover:bg-green-100"
                    }`}
                  onClick={() => handleCameraSelect(camera)}
                >
                  <div className="flex flex-col items-center w-full gap-1">
                    <span className="text-center font-medium leading-tight">{camera.name || `Camera ${camera.id}`}</span>
                  </div>
                </button>
              ))}
            </div>
            <button
              className="btn btn-sm mt-4 w-full btn-error rounded-xl text-white"
              onClick={() => setCameraModal({ isOpen: false, cameras: [] })}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Simplified Dropdown Components
const Dropdown = ({ isOpen, onToggle, label, children }) => (
  <div className="relative">
    <div
        className="rounded-md text-xs w-fit shadow-xs bg-white flex justify-end p-1 cursor-pointer border-2 border-stone-900/30"
        onClick={onToggle}
    >
      <button className="btn btn-xs border-none btn-ghost text-xs bg-transparent flex items-center gap-3 font-semibold text-gray-700">
        {label}
        <FaAngleDown className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""} text-neutral-600`} />
      </button>
    </div>
    {isOpen && (
      <div className="absolute left-0 top-10 mt-2 w-64 rounded-xl shadow-md bg-white z-[600] max-h-[300px] overflow-y-auto border border-gray-100">
        <div className="py-2">{children}</div>
      </div>
    )}
  </div>
);

const DropdownItem = ({ label, icon, onClick, bold }) => (
  <button
    onClick={onClick}
    className={`btn btn-ghost text-xs btn-sm btn-block justify-start rounded-none h-auto py-2 ${bold ? "font-bold text-gray-800" : "font-normal text-gray-600"}`}
  >
    {icon && <span className="mr-3 text-gray-400">{icon}</span>}
    <span className="truncate text-left">{label}</span>
  </button>
);

export default MapComponent;
