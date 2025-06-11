"use client"
import { useEffect, useState, useRef, useCallback } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import Map, { NavigationControl, Marker, Source, Layer } from "@vis.gl/react-maplibre";
import * as turf from "@turf/turf";
import { FaMapMarkerAlt, FaAngleDown } from "react-icons/fa";
import ruangan from "@/data/ruangan.json";
import { useAuth } from "../context/authContext";
import { maps, cameras } from '@/lib/apiService';

const MapComponent = ({ title, onClick, sizeHeight, onClickSimpang }) => {
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
  const [camerasData, setCamerasData] = useState([]);

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

  // ruller
  const [measurePoints, setMeasurePoints] = useState([]);
  const [distanceLine, setDistanceLine] = useState(null);
  const [distanceLabel, setDistanceLabel] = useState(null);

  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const camerasRes = await cameras.getAll();
        const data = camerasRes.data.cameras || [];
        setCamerasData(data);
        const buildingsRes = await maps.getAllFull();
        const buildingsData = buildingsRes.data.buildings || [];
        const filtered = filterBuildingsByActiveCameras(buildingsData, data);
        setBuildings(filtered);
        setupMapData(filtered);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setBuildings([]);
        setCamerasData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    console.log(buildings)
  }, [buildings])

  // Helper function to filter buildings by active cameras
  const filterBuildingsByActiveCameras = (buildings, camerasData) => {
    const activeCameraIds = new Set();
    console.log(camerasData)

    camerasData.forEach(camera => {
      if (camera.status === 1) {
        activeCameraIds.add(Number(camera.id));
      }
    });

    console.log(activeCameraIds)
    return buildings
      .filter(building => {
        // Check if building has cameras
        if (!building.cameras || !Array.isArray(building.cameras)) {
          return false;
        }
        // Check if at least one camera is active
        return building.cameras.some(camera => activeCameraIds.has(camera.camera_id));
      })
      .map(building => ({
        ...building,
        cameras: building.cameras.filter(camera => activeCameraIds.has(camera.camera_id))
      }));
  };

  // Helper function to setup map bounds and categories
  const setupMapData = (buildings) => {
    if (buildings.length > 0) {
      // Calculate bounds
      const coordinates = buildings.map(b => [b.location.longitude, b.location.latitude]);
      const featureCollection = turf.featureCollection(coordinates.map(coord => turf.point(coord)));
      setBounds(turf.bbox(featureCollection));

      // Categorize buildings
      const grouped = buildings.reduce((acc, building) => {
        const category = building.category || "Lainnya";
        if (!acc[category]) acc[category] = [];
        acc[category].push(building);
        return acc;
      }, {});
      setCategorizedBuildings(grouped);
    }
  };

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
      console.log(building)
      onClickSimpang(building)
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
    // if (camera.filter((data) => data.socketEvent === "not_yet_assign" ? console.log(camera) :onClick?.({ camera }) ))
    // if (camera.socketEvent === "not_yet_assign" ? console.log(camera) : onClick?.({ camera }))
    onClick?.({ camera })
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

  useEffect(() => {
    console.log(buildings)
  }, [buildings])
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
        // onClick={(e) => {
        //   const { lng, lat } = e.lngLat;

        //   const newPoints = [...measurePoints, [lng, lat]];
        //   setMeasurePoints(newPoints);

        //   if (newPoints.length === 2) {
        //     const from = turf.point(newPoints[0]);
        //     const to = turf.point(newPoints[1]);
        //     const distance = turf.distance(from, to, { units: 'kilometers' });
        //     alert(`Jarak: ${distance.toFixed(2)} km`);
        //     // Simpan garis untuk nanti digambar
        //     const line = {
        //       type: "Feature",
        //       geometry: {
        //         type: "LineString",
        //         coordinates: newPoints,
        //       }
        //     };
        //     const midpoint = turf.midpoint(from, to);
        //     midpoint.properties = {
        //       distance: `${distance.toFixed(2)} km`,
        //     };
        //     setDistanceLine(line);
        //     setDistanceLabel(midpoint);
        //     // Reset agar bisa klik ulang nanti
        //     setTimeout(() => {
        //       setMeasurePoints([]);
        //     }, 1000);
        //   }
        // }}
        >
          <NavigationControl position="top-right" />

          {/* ruller
          {distanceLine && (
            <Source id="measure-line" type="geojson" data={distanceLine}>
              <Layer
                id="measure-line-layer"
                type="line"
                paint={{
                  "line-color": "#FF0000",
                  "line-width": 3
                }}
              />
            </Source>
          )}
          {distanceLabel && (
            <Source id="measure-label" type="geojson" data={distanceLabel}>
              <Layer
                id="measure-label-layer"
                type="symbol"
                layout={{
                  "text-field": ["get", "distance"],
                  "text-size": 14,
                  "text-offset": [0, 1.5],
                  "text-anchor": "top",
                }}
                paint={{
                  "text-color": "#000000",
                  "text-halo-color": "#ffffff",
                  "text-halo-width": 1.5,
                }}
              />
            </Source>
          )}

          {measurePoints.map(([lng, lat], index) => (
            <Marker key={index} longitude={lng} latitude={lat}>
              <div className="bg-red-500 w-3 h-3 rounded-full border border-white" />
            </Marker>
          ))} */}

          {/* Building Markers */}
          {
            buildings.map((building) => (
              <Marker
                key={building.id}
                longitude={building.location.longitude}
                latitude={building.location.latitude}
              >
                <div onClick={() => flyToLocation(building)} style={{ cursor: "pointer" }}>
                  <FaMapMarkerAlt size={35} color="brown" />
                </div>
              </Marker>
            ))
          }
        </Map>

        {/* Controls */}
        <div className="absolute top-3 left-3 w-[80%] text-xs flex flex-wrap gap-2">
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
            className="btn btn-sm text-xs rounded-xl shadow-xs capitalize"
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
            <h2 className="text-xs font-semibold mb-4">Pilih Kamera</h2>
            <div className="space-y-2">
              {cameraModal.cameras.map((camera) => (
                <button
                  key={camera.camera_id}
                  disabled={camera.socketEvent === "not_yet_assign"}
                  className={`w-full text-left rounded-xl btn btn-sm hover:bg-gray-100 ${camera.socketEvent === "not_yet_assign"
                      ? "border-orange-100 bg-orange-50"
                      : "border-green-300 bg-green-50"
                    }`}
                  onClick={() => handleCameraSelect(camera)}
                >
                  <div className="flex flex-col items-center">
                    <span>{camera.name || `Camera ${camera.camera_id}`}</span>
                    <small className={`${camera.socketEvent === "not_yet_assign"
                        ? "text-orange-300"
                        : "text-green-600"
                      }`}>
                      {camera.socketEvent === "not_yet_assign" ? "Video Stream" : "Live Stream + Model Detection"}
                    </small>
                  </div>
                </button>
              ))}
            </div>
            <button
              className="btn btn-sm mt-4 w-full btn-error rounded-xl"
              onClick={() => setCameraModal({ isOpen: false, cameras: [] })}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div >
  );
};

// Simplified Dropdown Components
const Dropdown = ({ isOpen, onToggle, label, children }) => (
  <div className="relative">
    <div
      className="rounded-xl text-xs w-fit shadow-xs bg-base-100/90 flex justify-end p-1 cursor-pointer"
      onClick={onToggle}
    >
      <button className="btn btn-xs btn-ghost text-xs bg-transparent border-none hover:shadow-none flex items-center gap-3 font-semibold">
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
    className={`btn btn-ghost text-xs btn-sm btn-block justify-start rounded-none ${bold ? "font-semibold" : "font-normal"}`}
  >
    {icon && <span className="mr-3">{icon}</span>}
    {label}
  </button>
);

export default MapComponent;