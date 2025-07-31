"use client"
import { useEffect, useState } from 'react';
import { maps } from '@/lib/apiService';
import { FaAngleDown } from "react-icons/fa";

const Dropdown = ({ isOpen, onToggle, label, children, onSelect }) => (
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
      <div className="absolute left-0 top-8 mt-2 w-64 rounded-xl shadow-xs bg-base-100/90 z-10">
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

const OptionSelectMaps = () => {
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [buildings, setBuildings] = useState([]);

  const combineData = (buildings, camerasData) => {
    const result = buildings.filter(b => b.latitude != null && b.longitude != null).map(building => {
      const relatedCameras = camerasData.filter(camera => camera.ID_Simpang === building.id);

      return {
        ...building,
        latitude: building.latitude ? parseFloat(building.latitude) : null,
        longitude: building.longitude ? parseFloat(building.longitude) : null,
        cameras: relatedCameras || [],
      };
    });
    return result;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // setLoading(true);
        const camerasRes = await cameras.getAll();
        const data = camerasRes.data.cameras || [];
        setCamerasData(data);
        const buildingsRes = await maps.getAllSimpang();
        const buildingsData = buildingsRes.data.simpang || [];
        // const filtered = filterBuildingsByActiveCameras(buildingsData, data);
        const filtered = combineData(buildingsData, data);
        // console.log(filtered)
        setBuildings(filtered);
        setupMapData(filtered);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setBuildings([]);
        setCamerasData([]);
      }
    };

    fetchData();
  }, []);
  return (
    <>
      <Dropdown
        isOpen={isLocationDropdownOpen}
        onToggle={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
        label="Pilih Lokasi"
      >
        {Array.isArray(buildings) && buildings.length > 0 ? (
          buildings.map((building) => (
            <DropdownItem
              key={building.id}
              label={building.Nama_Simpang}
              icon={<FaMapMarkerAlt />}
              onClick={() => {
                flyToLocation(building);
                setIsLocationDropdownOpen(false);
                onSelect?.(building)
              }}
            />
          ))
        ) : (
          <p className="text-xs px-4 text-gray-400 italic">Tidak ada lokasi tersedia</p>
        )}
      </Dropdown>

    </>
  )
}

export default OptionSelectMaps;