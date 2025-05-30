"use client";

// import maplibregl from "maplibre-gl";
import Map, { NavigationControl, Marker } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useState, useRef } from "react";
import * as turf from "@turf/turf";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaAngleDown } from "react-icons/fa6";
// import simpang from "@/data/DataSimpang.json";
import ruangan from "@/data/ruangan.json";
import { useAuth } from "../context/authContext";
import { maps } from '@/lib/apiService';

const MapComponent = ({ title, onClick, sizeHeight }) => {
  const [mapLib, setMapLib] = useState(null);
  const { setLoading } = useAuth();
  const mapRef = useRef(null);

  const [cameraOptions, setCameraOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false); // Add map loaded state

  const [theme, setTheme] = useState("light"); // Remove localStorage dependency initially
  const [keymap, setKeymap] = useState("");
  const [bounds, setBounds] = useState(null);
  const [lokasiSimpang, setLokasiSimpang] = useState([]);
  const [selectedSimpang, setSelectedSimpang] = useState(null);
  const [detail, setDetailLocation] = useState(false);
  const [simpangSelect, setSimpang] = useState(null);
  const [categorizedBuildings, setCategorizedBuildings] = useState({});
  const [currentFloor, setCurrentFloor] = useState(1);
  const [dataRoom, setDataRoom] = useState([]);
  const [buildingData, setBuildingData] = useState({ floors: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenItem2, setIsOpenItem2] = useState(false);

  const center = {
    longitude: 110.36394885709416,
    latitude: -7.806961958513005,
  };

  const mapStyles = {
    light: `https://api.maptiler.com/maps/364bea8a-6a0f-47b3-b224-8f0371623426/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`,
    dark: `https://api.maptiler.com/maps/2826b85b-753a-402d-afae-e1f982e73d6d/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`,
  };

  useEffect(() => {
    import("maplibre-gl").then((mod) => {
      setMapLib(mod.default); // atau `mod` jika default tidak tersedia
    });
  }, []);

  // Initialize theme after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme") || "light";
      setTheme(savedTheme);
      setKeymap(mapStyles[savedTheme]);
    }
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await maps.getAllFull();
        const detectedCameras = res.data.buildings;
        setLokasiSimpang(detectedCameras);
        console.log(detectedCameras)
      } catch (err) {
        console.error("Failed to fetch cameras:", err);
        setLokasiSimpang([]); // Set empty array on error
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    const initialBuildings = lokasiSimpang || [];

    if (initialBuildings.length > 0) {
      const coordinates = initialBuildings.map((g) => [
        g.location.longitude,
        g.location.latitude,
      ]);

      const featureCollection = turf.featureCollection(
        coordinates.map((coord) => turf.point(coord))
      );
      setBounds(turf.bbox(featureCollection));

      const grouped = initialBuildings.reduce((acc, building) => {
        const category = building.category || "Lainnya";
        if (!acc[category]) acc[category] = [];
        acc[category].push(building);
        return acc;
      }, {});
      setCategorizedBuildings(grouped);
    }
  }, [lokasiSimpang]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const observer = new MutationObserver(() => {
        const newTheme = document.documentElement.getAttribute("data-theme") || "light";
        setTheme(newTheme);
        if (mapLoaded) { // Only update keymap if map is loaded
          setKeymap(mapStyles[newTheme]);
        }
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });

      return () => observer.disconnect();
    }
  }, [mapLoaded]);

  useEffect(() => {
    const newBuilding =
      ruangan.find((b) => b.building === simpangSelect) || { floors: [] };
    setBuildingData(newBuilding);
    const firstFloor = newBuilding.floors?.[0] || { rooms: [] };
    setDataRoom(firstFloor.rooms || []);
    setCurrentFloor(1);
  }, [simpangSelect]);

  useEffect(() => {
    setSimpang("");
  }, [selectedSimpang]);

  const handleMapLoad = () => {
    setMapLoaded(true);
    setKeymap(mapStyles[theme]);
    // Fit bounds after map is fully loaded
    setTimeout(() => {
      fitBoundsTosimpang();
    }, 100);
  };

  const flyToLocation = (latitude, longitude, simpang) => {
    if (mapRef.current && mapLoaded) {
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: simpang ? 16 : 15,
        essential: true,
      });
      console.log(simpang);

      // Send to parent if only 1 camera
      if (Array.isArray(simpang?.cameras)) {
        const { cameras } = simpang;

        // if (cameras.length === 1) {
          setCameraOptions(cameras);
          setIsModalOpen(true);
        // } else if (cameras.length > 1) {
        //   onClick?.({ ...simpang, camera: cameras[0] });
        // }
      } else {
        onClick?.(simpang);
      }
    }


    if (simpang) {
      detailLocation(simpang);
    } else {
      setSelectedSimpang(null);
      setSimpang("");
    }
  };

  const flyToCategory = (categoryBuildings) => {
    if (!mapRef.current || !categoryBuildings?.length || !mapLoaded) return;

    if (categoryBuildings.length === 1) {
      const [building] = categoryBuildings;
      mapRef.current.flyTo({
        center: [building.location.longitude, building.location.latitude],
        zoom: 16,
        essential: true,
      });
      detailLocation(building);
    } else {
      const coordinates = categoryBuildings.map((b) => [
        b.location.longitude,
        b.location.latitude,
      ]);
      const featureCollection = turf.featureCollection(
        coordinates.map((coord) => turf.point(coord))
      );
      const bbox = turf.bbox(featureCollection);
      mapRef.current.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        { padding: 100, essential: true }
      );
      setSelectedSimpang(null);
      setSimpang("");
    }
  };

  const detailLocation = (simpang) => {
    setSelectedSimpang(simpang);
  };

  const fitBoundsTosimpang = () => {
    if (mapRef.current && bounds && mapLoaded) {
      mapRef.current.fitBounds(
        [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ],
        { padding: 20, maxZoom: 20 }
      );
    }
    setSelectedSimpang(null);
    setSimpang("");
  };

  const resetView = fitBoundsTosimpang;

  // Don't render map until we have a valid keymap
  if (!keymap) {
    return (
      <div>
        <div className="w-full">
          <div style={{ width: "100%", height: sizeHeight ? sizeHeight : "50vh" }} className="relative flex items-center justify-center bg-gray-100">
            <div>Loading Map...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-5 text-xl font-semibold">
        {title || null}
      </div>
      <div className="w-full">
        <div style={{ width: "100%", height: sizeHeight ? sizeHeight : "50vh" }} className="relative">
          {mapLib && keymap && (
            <Map
              ref={mapRef}
              mapLib={mapLib}
              mapStyle={keymap}
              initialViewState={{
                longitude: center.longitude,
                latitude: center.latitude,
                zoom: 7,
              }}
              onLoad={handleMapLoad}
            >
              <NavigationControl position="top-right" />

              {mapLoaded && lokasiSimpang?.map((simpang) => (
                <Marker
                  key={simpang.id}
                  longitude={simpang.location.longitude}
                  latitude={simpang.location.latitude}
                >
                  <div
                    onClick={() =>
                      flyToLocation(
                        simpang.location.latitude,
                        simpang.location.longitude,
                        simpang
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <FaMapMarkerAlt size={35} color="brown" />
                  </div>
                </Marker>
              ))}
            </Map>
          )}


          <div className="absolute top-3 left-3 w-[80%] text-sm text-base-800">
            <div className="flex flex-wrap gap-2">
              {/* Dropdown Pilih Kamera */}
              <Dropdown
                isOpen={isOpen}
                toggleOpen={() => setIsOpen(!isOpen)}
                label="Pilih Kamera"
              >
                {lokasiSimpang?.map((item) => (
                  <DropdownItem
                    key={item.id}
                    label={item.name}
                    icon={<FaMapMarkerAlt />}
                    onClick={() =>
                      flyToLocation(
                        item.location.latitude,
                        item.location.longitude,
                        item
                      )
                    }
                  />
                ))}
              </Dropdown>

              {/* Dropdown Pilih Lokasi */}
              <Dropdown
                isOpen={isOpenItem2}
                toggleOpen={() => setIsOpenItem2(!isOpenItem2)}
                label="Pilih Lokasi"
              >
                {Object.entries(categorizedBuildings).map(
                  ([category, buildings]) => (
                    <DropdownItem
                      key={category}
                      label={category}
                      onClick={() => flyToCategory(buildings)}
                      bold
                    />
                  )
                )}
              </Dropdown>

              <button
                className="btn btn-md rounded-xl shadow-xs capitalize"
                onClick={() => fitBoundsTosimpang()}
                disabled={!mapLoaded}
              >
                reset view
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
          <div className="bg-white rounded-xl p-5 shadow-lg w-80 max-w-full">
            <h2 className="text-lg font-semibold mb-4">Pilih Kamera</h2>
            <div className="space-y-2">
              {cameraOptions.map((camera) => (
                <button
                  key={camera.id}
                  className="w-full text-left rounded-xl btn btn-md hover:bg-gray-100"
                  onClick={() => {
                    onClick?.({ camera });
                    setIsModalOpen(false);
                  }}
                >
                  {camera.name || `Camera ${camera.id}`}
                </button>
              ))}
            </div>
            <button
              className="btn btn-md mt-4 w-full btn-error rounded-xl"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Dropdown Components
const Dropdown = ({ isOpen, toggleOpen, label, children }) => (
  <div className="relative">
    <div
      className="rounded-xl text-md w-fit shadow-xs bg-base-100/90 flex justify-end p-1"
      onClick={toggleOpen}
    >
      <button className="btn btn-sm btn-ghost text-sm bg-transparent border-none hover:shadow-none">
        <div className="w-fit px-2 flex items-center gap-3 font-semibold">
          {label}
          <FaAngleDown className={`${isOpen ? "rotate-180" : ""} text-neutral-600`} />
        </div>
      </button>
    </div>
    {isOpen && (
      <div className="absolute left-0 top-12 mt-2 w-64 rounded-xl shadow-xs bg-base-100/90 z-10">
        <div className="py-1 flex flex-col">{children}</div>
      </div>
    )}
  </div>
);

const DropdownItem = ({ label, onClick, icon, bold = false }) => (
  <div
    className={`w-fit py-2 px-5 m-2 rounded-xl cursor-pointer hover:bg-base-200 ${bold ? "font-bold text-md bg-base-200" : "font-semibold text-md"
      }`}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      {icon} {label}
    </div>
  </div>
);

export default MapComponent;