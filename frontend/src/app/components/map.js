"use client"
import { useEffect, useState, useRef, useCallback } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import Map, { NavigationControl, Marker } from "@vis.gl/react-maplibre";
import * as turf from "@turf/turf";
import { FaMapMarkerAlt, FaAngleDown } from "react-icons/fa";
import ruangan from "@/data/ruangan.json";
import { useAuth } from "../context/authContext";
import { maps } from '@/lib/apiService';

const MapComponent = ({ title, onClick, sizeHeight }) => {
  const { setLoading } = useAuth();
  const mapRef = useRef(null);

  // Map States
  const [mapReady, setMapReady] = useState(false);
  const [theme, setTheme] = useState("light");
  const [bounds, setBounds] = useState(null);
  
  // Data States  
  const [buildings, setBuildings] = useState([]);
  const [categorizedBuildings, setCategorizedBuildings] = useState({});
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  
  // UI States
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [cameraModal, setCameraModal] = useState({ isOpen: false, cameras: [] });

  // Map Configuration
  const center = { longitude: 110.36394885709416, latitude: -7.806961958513005 };
  const mapStyles = {
    light: `https://api.maptiler.com/maps/364bea8a-6a0f-47b3-b224-8f0371623426/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`,
    dark: `https://api.maptiler.com/maps/2826b85b-753a-402d-afae-e1f982e73d6d/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`,
  };

  // Initialize theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme") || "light";
      setTheme(savedTheme);
    }
  }, []);

  // Fetch buildings data
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await maps.getAllFull();
        const buildingsData = res.data.buildings || [];
        setBuildings(buildingsData);
        
        // Calculate bounds
        if (buildingsData.length > 0) {
          const coordinates = buildingsData.map(b => [b.location.longitude, b.location.latitude]);
          const featureCollection = turf.featureCollection(coordinates.map(coord => turf.point(coord)));
          setBounds(turf.bbox(featureCollection));
        }
        
        // Categorize buildings
        const grouped = buildingsData.reduce((acc, building) => {
          const category = building.category || "Lainnya";
          if (!acc[category]) acc[category] = [];
          acc[category].push(building);
          return acc;
        }, {});
        setCategorizedBuildings(grouped);
        
      } catch (err) {
        console.error("Failed to fetch buildings:", err);
        setBuildings([]);
      }
    };
    fetchBuildings();
  }, []);

  // Watch theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.getAttribute("data-theme") || "light";
      if (newTheme !== theme) {
        setTheme(newTheme);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, [theme]);

  // Map event handlers
  const handleMapLoad = useCallback((event) => {
    if (event?.target) {
      mapRef.current = event.target;
      setTimeout(() => setMapReady(true), 200);
    }
  }, []);

  // Fit bounds to all buildings
  const fitBoundsToAll = useCallback(() => {
    if (!mapRef.current || !bounds || !mapReady) return;
    
    try {
      mapRef.current.fitBounds(
        [[bounds[0], bounds[1]], [bounds[2], bounds[3]]],
        { padding: 20, maxZoom: 20 }
      );
      setSelectedBuilding(null);
    } catch (error) {
      console.error("Error fitting bounds:", error);
    }
  }, [bounds, mapReady]);

  // Fit bounds when map is ready
  useEffect(() => {
    if (mapReady && bounds) {
      setTimeout(fitBoundsToAll, 300);
    }
  }, [mapReady, bounds, fitBoundsToAll]);

  // Fly to specific location
  const flyToLocation = useCallback((building) => {
    if (!mapRef.current || !mapReady) return;

    try {
      mapRef.current.flyTo({
        center: [building.location.longitude, building.location.latitude],
        zoom: 16,
        essential: true,
      });

      // Handle cameras
      if (Array.isArray(building.cameras) && building.cameras.length > 0) {
        setCameraModal({ isOpen: true, cameras: building.cameras });
      } else {
        onClick?.(building);
      }

      setSelectedBuilding(building);
    } catch (error) {
      console.error("Error flying to location:", error);
    }
  }, [mapReady, onClick]);

  // Fly to category
  const flyToCategory = useCallback((categoryBuildings) => {
    if (!mapRef.current || !categoryBuildings?.length || !mapReady) return;

    try {
      if (categoryBuildings.length === 1) {
        flyToLocation(categoryBuildings[0]);
      } else {
        const coordinates = categoryBuildings.map(b => [b.location.longitude, b.location.latitude]);
        const featureCollection = turf.featureCollection(coordinates.map(coord => turf.point(coord)));
        const bbox = turf.bbox(featureCollection);
        
        mapRef.current.fitBounds(
          [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
          { padding: 100, essential: true }
        );
        setSelectedBuilding(null);
      }
    } catch (error) {
      console.error("Error flying to category:", error);
    }
  }, [mapReady, flyToLocation]);

  // Handle camera selection
  const handleCameraSelect = (camera) => {
    onClick?.({ camera });
    setCameraModal({ isOpen: false, cameras: [] });
  };

  // Show loading if not ready
  if (!mapStyles[theme]) {
    return (
      <div style={{ width: "100%", height: sizeHeight || "50vh" }} 
           className="flex items-center justify-center bg-gray-100">
        Loading Map...
      </div>
    );
  }

  return (
    <div>
      {title && <div className="p-5 text-xl font-semibold">{title}</div>}
      
      <div style={{ width: "100%", height: sizeHeight || "50vh" }} className="relative">
        {/* Map */}
        <Map
          ref={mapRef}
          mapStyle={mapStyles[theme]}
          initialViewState={{
            longitude: center.longitude,
            latitude: center.latitude,
            zoom: 7,
          }}
          onLoad={handleMapLoad}
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="top-right" />
          
          {/* Building Markers */}
          {buildings.map((building) => (
            <Marker
              key={building.id}
              longitude={building.location.longitude}
              latitude={building.location.latitude}
            >
              <div onClick={() => flyToLocation(building)} style={{ cursor: "pointer" }}>
                <FaMapMarkerAlt size={35} color="brown" />
              </div>
            </Marker>
          ))}
        </Map>

        {/* Controls */}
        <div className="absolute top-3 left-3 w-[80%] text-sm flex flex-wrap gap-2">
          {/* Buildings Dropdown */}
          <Dropdown
            isOpen={isLocationDropdownOpen}
            onToggle={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            label="Pilih Lokasi"
          >
            {buildings.map((building) => (
              <DropdownItem
                key={building.id}
                label={building.name}
                icon={<FaMapMarkerAlt />}
                onClick={() => {
                  flyToLocation(building);
                  setIsLocationDropdownOpen(false);
                }}
              />
            ))}
          </Dropdown>

          {/* Categories Dropdown */}
          <Dropdown
            isOpen={isCategoryDropdownOpen}
            onToggle={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            label="Pilih Kategori"
          >
            {Object.entries(categorizedBuildings).map(([category, categoryBuildings]) => (
              <DropdownItem
                key={category}
                label={category}
                onClick={() => {
                  flyToCategory(categoryBuildings);
                  setIsCategoryDropdownOpen(false);
                }}
                bold
              />
            ))}
          </Dropdown>

          {/* Reset Button */}
          <button
            className="btn btn-md rounded-xl shadow-xs capitalize"
            onClick={fitBoundsToAll}
            disabled={!mapReady}
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Camera Selection Modal */}
      {cameraModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
          <div className="bg-white rounded-xl p-5 shadow-lg w-80 max-w-full">
            <h2 className="text-lg font-semibold mb-4">Pilih Kamera</h2>
            <div className="space-y-2">
              {cameraModal.cameras.map((camera) => (
                <button
                  key={camera.id}
                  className="w-full text-left rounded-xl btn btn-md hover:bg-gray-100"
                  onClick={() => handleCameraSelect(camera)}
                >
                  {camera.name || `Camera ${camera.id}`}
                </button>
              ))}
            </div>
            <button
              className="btn btn-md mt-4 w-full btn-error rounded-xl"
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
      className="rounded-xl text-md w-fit shadow-xs bg-base-100/90 flex justify-end p-1 cursor-pointer"
      onClick={onToggle}
    >
      <button className="btn btn-sm btn-ghost text-sm bg-transparent border-none hover:shadow-none flex items-center gap-3 font-semibold">
        {label}
        <FaAngleDown className={`${isOpen ? "rotate-180" : ""} text-neutral-600`} />
      </button>
    </div>
    {isOpen && (
      <div className="absolute left-0 top-12 mt-2 w-64 rounded-xl shadow-xs bg-base-100/90 z-10">
        <div className="py-2">{children}</div>
      </div>
    )}
  </div>
);

const DropdownItem = ({ label, icon, onClick, bold }) => (
  <button
    onClick={onClick}
    className={`btn btn-ghost btn-block justify-start rounded-none ${bold ? "font-bold" : "font-normal"}`}
  >
    {icon && <span className="mr-3">{icon}</span>}
    {label}
  </button>
);

export default MapComponent;