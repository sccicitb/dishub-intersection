"use client";
import Map, { NavigationControl, Marker } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useState, useRef } from "react";
import * as turf from "@turf/turf";
import { FaMapMarkerAlt } from "react-icons/fa";
import gedung from "@/app/data/gedung.json";
import ruangan from "@/app/data/ruangan.json";
import { FaAngleDown } from "react-icons/fa6";
import { useAuth } from "../context/authContext";

const MapComponent = ({title}) => {
  const { setLoading } = useAuth();
  const [lokasiGedung, setLokasiGedung] = useState([]);
  const [bounds, setBounds] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [selectedGedung, setSelectedGedung] = useState(null);
  const [detail, setDetailLocation] = useState(false);
  const center = { longitude: 110.4262, latitude: -7.8754 };
  
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenItem2, setIsOpenItem2] = useState(false);
  const [dataRoom, setDataRoom] = useState([]);
  const [gedungSelect, setGedungSelect] = useState(null);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [buildingData, setBuildingData] = useState(
    ruangan.find((b) => b.building === gedungSelect) || { floors: [] }
  );
  const [categorizedBuildings, setCategorizedBuildings] = useState({});

  useEffect(() => {
    const newBuilding = ruangan.find((b) => b.building === gedungSelect) || {
      floors: [],
    };
    setBuildingData(newBuilding);
    const firstFloor = newBuilding.floors?.[0] || { rooms: [] };
    setDataRoom(firstFloor.rooms || []);
    setCurrentFloor(1);
  }, [gedungSelect]);

  useEffect(() => {
    setGedungSelect("");
  }, [selectedGedung]);

  const totalFloors = buildingData.floors.length || 1;
  const [keymap, setKeymap] = useState("");
  const mapRef = useRef(null);

  let mapStyles = {
    light: `https://api.maptiler.com/maps/364bea8a-6a0f-47b3-b224-8f0371623426/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`,
    dark: `https://api.maptiler.com/maps/2826b85b-753a-402d-afae-e1f982e73d6d/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`,
  };

  useEffect(() => {
    setLokasiGedung(gedung);

    if (gedung?.buildings?.length > 0) {
      const coordinates = gedung.buildings.map((g) => [
        g.location.longitude,
        g.location.latitude,
      ]);
      const featureCollection = turf.featureCollection(
        coordinates.map((coord) => turf.point(coord))
      );
      const bbox = turf.bbox(featureCollection); // [minLng, minLat, maxLng, maxLat]
      setBounds(bbox);

      // Group buildings by category
      const groupedBuildings = gedung.buildings.reduce((acc, building) => {
        const category = building.category || "lainnya";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(building);
        return acc;
      }, {});
      setCategorizedBuildings(groupedBuildings);
    }

    setKeymap(mapStyles[theme]);
  }, []);

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

  const flyToLocation = (latitude, longitude, gedung) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: gedung !== null ? 16 : 15,
        essential: true,
      });
    }

    if (gedung !== null) {
      detailLocation(gedung);
    } else {
      setSelectedGedung(null);
      setGedungSelect("");
    }
  };

  const flyToCategory = (categoryBuildings) => {
    if (mapRef.current && categoryBuildings && categoryBuildings.length > 0) {
      // If there's only one location in the category
      if (categoryBuildings.length === 1) {
        const building = categoryBuildings[0];
        mapRef.current.flyTo({
          center: [building.location.longitude, building.location.latitude],
          zoom: 16,
          essential: true,
        });
        detailLocation(building);
      } else {
        // If there are multiple locations, calculate bounds
        const coordinates = categoryBuildings.map((building) => [
          building.location.longitude,
          building.location.latitude,
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
        
        setSelectedGedung(null);
        setGedungSelect("");
      }
    }
  };

  const detailLocation = (gedung) => {
    setSelectedGedung(gedung);
  };

  const MonitorGedung = (gedung) => {
    setGedungSelect(gedung.name);
  };

  const handleClickMonitor = (roomName) => {
    setLoading(true);
    setLoading(false);
    // Redirect logic if needed
  };

  const fitBoundsToGedung = () => {
    if (mapRef.current && bounds) {
      mapRef.current.fitBounds(
        [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ],
        { padding: 50, maxZoom: 20 }
      );
    }
    setSelectedGedung(null);
    setGedungSelect("");
  };

  const resetView = fitBoundsToGedung;

  return (
    <div>
      <div className="p-5 text-xl font-semibold">{!title ? "Titik Lokasi Kamera" : title}</div>
      <div className="block w-full">
        <div style={{ width: "100%", height: "50vh" }} className="relative ">
          <Map
            ref={mapRef}
            mapLib={import("maplibre-gl")}
            mapStyle={mapStyles[theme]}
            initialViewState={{
              longitude: center.longitude,
              latitude: center.latitude,
              zoom: 15,
            }}
            onLoad={fitBoundsToGedung}
          >
            <NavigationControl position="top-right" />

            {lokasiGedung?.buildings?.map((gedung) => (
              <Marker
                key={gedung.id}
                longitude={gedung.location.longitude}
                latitude={gedung.location.latitude}
              >
                <div
                  onClick={() =>
                    flyToLocation(
                      gedung.location.latitude,
                      gedung.location.longitude,
                      gedung
                    )
                  }
                  style={{ cursor: "pointer" }}
                >
                  <FaMapMarkerAlt size={35} color="brown" />
                </div>
              </Marker>
            ))}
          </Map>

          <div className="w-[90%] absolute top-5 left-10 text-sm text-base-800">
            <div className="relative flex gap-5 w-full">
            <div className="relative">
              <div
                className="rounded-xl text-md w-fit shadow-xs bg-base-100/90 flex justify-end p-1"
                onClick={() => setIsOpen(!isOpen)}
              >
                <button className="btn btn-sm btn-ghost text-sm bg-transparent border-none hover:shadow-none">
                  <div className="w-fit  px-2 flex items-center gap-3">
                    <div className="font-semibold">Pilih Kamera</div>
                    <FaAngleDown
                      className={`${isOpen ? "rotate-180" : ""} text-neutral-600 `}
                    />
                  </div>
                </button>
              </div>
              {isOpen && (
                <div className="absolute left-0 top-12 mt-2 w-48 rounded-xl shadow-xs bg-base-100/90 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">                  
                    <div className="flex flex-col">
                      {gedung.buildings?.map((gedung) => (
                        <div
                          key={gedung.id}
                          className="w-fit py-2 px-5 m-2 rounded-xl text-md cursor-pointer hover:bg-base-200"
                          onClick={() =>
                            flyToLocation(
                              gedung.location.latitude,
                              gedung.location.longitude,
                              gedung
                            )
                          }
                        >
                          <div className="flex items-center gap-3 font-semibold text-md">
                            <FaMapMarkerAlt /> {gedung.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              </div>
            <div className="relative">
              <div
                className="rounded-xl text-md w-fit shadow-xs bg-base-100/90 flex justify-end p-1"
                onClick={() => setIsOpenItem2(!isOpenItem2)}
              >
                <button className="btn btn-sm btn-ghost text-sm bg-transparent border-none hover:shadow-none">
                  <div className="w-fit  px-2 flex items-center gap-3">
                    <div className="font-semibold">Pilih Lokasi</div>
                    <FaAngleDown
                      className={`${isOpenItem2 ? "rotate-180" : ""} text-neutral-600 `}
                    />
                  </div>
                </button>
              </div>
              {isOpenItem2 && (
                <div className="absolute left-0 top-12 mt-2 w-64 rounded-xl shadow-xs bg-base-100/90 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">                  
                    <div className="flex flex-col">
                      {Object.keys(categorizedBuildings).map((category) => (
                        <div key={category} className="mb-2">
                          <div 
                            className="w-full py-2 px-5 font-bold text-md bg-base-200 cursor-pointer"
                            onClick={() => flyToCategory(categorizedBuildings[category])}
                          >
                            {category.charAt(0).toUpperCase() + category.slice(1)} ({categorizedBuildings[category].length})
                          </div>
                          
                          <div className="ml-3">
                            {categorizedBuildings[category].map((building) => (
                              <div
                                key={building.id}
                                className="w-fit py-2 px-4 m-1 rounded-xl text-md cursor-pointer hover:bg-base-200"
                                onClick={() =>
                                  flyToLocation(
                                    building.location.latitude,
                                    building.location.longitude,
                                    building
                                  )
                                }
                              >
                                <div className="flex items-center gap-2 font-semibold text-sm">
                                  <FaMapMarkerAlt /> {building.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>
          </div>
          </div>

          <button
            className="absolute top-3 right-15 bg-base-100/90 btn btn-sm rounded-md shadow-md text-sm cursor-pointer font-semibold"
            onClick={resetView}
          >
            Reset View
          </button>

          {selectedGedung && (
            <div className="w-full absolute bottom-5 bg-transparent p-5 ">
              <div
                className="bg-base-300/90 shadow-xs w-full p-5 m-2 rounded-xl text-md cursor-pointer hover:shadow-lg hover:shadow-red-400/10 hover:bg-base-200/70 transition-all duration-100 ease-in-out"
                onClick={() => MonitorGedung(selectedGedung)}
              >
                <div className="flex items-center gap-3 font-semibold text-lg">
                  <FaMapMarkerAlt /> {selectedGedung.name}
                </div>
                <div className="font-normal pl-7 capitalize">description</div>
              </div>
            </div>
          )}
        </div>

        <div>
          {gedungSelect && (
            <div className="w-full bg-transparent p-5">
              {dataRoom.map((room) => (
                <div
                  key={room.id}
                  className="bg-base-300/90 shadow-xs w-full p-5 m-2 rounded-xl text-sm cursor-pointer hover:shadow-m hover:bg-base-300/50 transition-all duration-100 ease-in-out"
                  onClick={() => handleClickMonitor(room.name)}
                >
                  <div>
                    <div className="flex items-center gap-3 text-sm">
                      <FaMapMarkerAlt className="text-lg" />
                      <div>
                        <div className="font-semibold text-md">
                          {room.name}
                        </div>
                        <div>{room.description}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapComponent;