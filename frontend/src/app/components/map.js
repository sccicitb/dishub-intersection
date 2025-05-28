"use client";

import Map, { NavigationControl, Marker } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useState, useRef } from "react";
import * as turf from "@turf/turf";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaAngleDown } from "react-icons/fa6";
// import simpang from "@/data/DataSimpang.json";
import ruangan from "@/data/ruangan.json";
import { useAuth } from "../context/authContext";
import { maps } from '@/lib/apiAccess';


const MapComponent = ({ title, onClick, sizeHeight }) => {
  const { setLoading } = useAuth();
  const mapRef = useRef(null);

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
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
    const fetchLocation = async () => {
      try {
        const res = await maps.getAll();
        // console.log("Hasil getAll:", res); 
        const detectedCameras = res.data.buildings
        setLokasiSimpang(detectedCameras);
      } catch (err) {
        console.error("Failed to fetch cameras:", err);
      }
    };
    // setLokasiSimpang(simpang);
    fetchLocation();

    setKeymap(mapStyles[theme]);
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
  }, [lokasiSimpang])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme") || "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

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

  const flyToLocation = (latitude, longitude, simpang) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: simpang ? 16 : 15,
        essential: true,
      });
      onClick?.(simpang);
    }

    if (simpang) {
      detailLocation(simpang);
    } else {
      setSelectedSimpang(null);
      setSimpang("");
    }
  };

  const flyToCategory = (categoryBuildings) => {
    if (!mapRef.current || !categoryBuildings?.length) return;

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
    if (mapRef.current && bounds) {
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

  return (
    <div>
      <div className="p-5 text-xl font-semibold">
        {title || null}
      </div>
      <div className="w-full">
        <div style={{ width: "100", height: sizeHeight ? sizeHeight : "50vh" }} className="relative">
          <Map
            ref={mapRef}
            mapLib={import("maplibre-gl")}
            mapStyle={mapStyles[theme]}
            initialViewState={{
              longitude: center.longitude,
              latitude: center.latitude,
              zoom: 7,
            }}
            onLoad={fitBoundsTosimpang}
          >
            <NavigationControl position="top-right" />

            {lokasiSimpang?.map((simpang) => (
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
              
              <button className="btn btn-md rounded-xl shadow-xs capitalize" onClick={() => fitBoundsTosimpang()}>reset view</button>
            </div>
          </div>
        </div>
      </div>
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
