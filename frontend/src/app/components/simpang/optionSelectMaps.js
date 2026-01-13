"use client";
import { useEffect, useState } from 'react';
import { maps, cameras } from '@/lib/apiService';
import { FaAngleDown, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import { useRef } from 'react';
// Komponen Dropdown
const Dropdown = ({ isOpen, onToggle, onClose, label, children, className = "" }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose?.();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div
        className="w-full px-3 input input-sm cursor-pointer border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        onClick={onToggle}
      >
        <button className="flex w-full justify-between btn btn-xs focus:outline-0 btn-ghost text-xs bg-transparent border-none hover:shadow-none items-center gap-3 font-semibold">
          {label}
          <FaAngleDown className={`${isOpen ? "rotate-180" : ""} text-neutral-600`} />
        </button>
      </div>
      {isOpen && (
        <div className="absolute left-0 top-8 mt-2 w-72 rounded-xl shadow-xs bg-base-100/90 z-10">
          <div className="py-2">{children}</div>
        </div>
      )}
    </div>
  );
};

// Komponen Date Picker (single date)
const DatePicker = ({ selectedDate, onDateChange, onClearDate }) => (
  <div className="p-3 border-b border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <label className="text-xs font-semibold text-gray-600">Pilih Tanggal:</label>
      {selectedDate && (
        <button
          onClick={onClearDate}
          className="btn btn-xs btn-ghost text-red-500 hover:bg-red-50"
          title="Clear date"
        >
          <FaTimes />
        </button>
      )}
    </div>
    <input
      type="date"
      value={selectedDate || ''}
      onChange={(e) => onDateChange(e.target.value)}
      className="input input-xs w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
    />
  </div>
);

// Komponen Date Range Picker
const DateRangePicker = ({ startDate, endDate, onChange, onClear }) => (
  <div className="p-3 border-b border-gray-200 space-y-3">
    <div className="flex justify-between items-center">
      <label className="text-xs font-semibold text-gray-600">Pilih Rentang Tanggal:</label>
      {(startDate || endDate) && (
        <button
          onClick={onClear}
          className="btn btn-xs btn-ghost text-red-500 hover:bg-red-50"
        >
          <FaTimes />
        </button>
      )}
    </div>
    <div className="flex gap-2">
      <input
        type="date"
        value={startDate || ''}
        onChange={(e) => onChange(e.target.value, endDate)}
        className="input input-xs w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
      />
      <input
        type="date"
        value={endDate || ''}
        onChange={(e) => onChange(startDate, e.target.value)}
        className="input input-xs w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
      />
    </div>
  </div>
);

const OptionSelectMaps = ({
  onSelect,
  onDateSelect,
  optionMap = false,
  optionDate = false,
  optionDateRange = false,
  startDateRange = () => {},
  endDateRange = () => {},
}) => {
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  const [locationName, setLocationName] = useState('');
  const [buildings, setBuildings] = useState([]);
  const [camerasData, setCamerasData] = useState([]);

  const [selectedDate, setSelectedDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [filteredBuildings, setFilteredBuildings] = useState([]);

  // Combine buildings + cameras
  const combineData = (buildings, camerasData) => {
    return buildings
      .filter(b => b.latitude != null && b.longitude != null)
      .map(building => {
        const relatedCameras = camerasData.filter(camera => camera.ID_Simpang === building.id);
        return {
          ...building,
          latitude: building.latitude ? parseFloat(building.latitude) : null,
          longitude: building.longitude ? parseFloat(building.longitude) : null,
          cameras: relatedCameras || [],
        };
      });
  };

  // Filter single date
  const filterBySingleDate = (items, date) => {
    if (!date) return items;
    return items.filter(b => {
      const d = b.created_at || b.updated_at || b.tanggal;
      if (!d) return false;
      return new Date(d).toISOString().split("T")[0] === date;
    });
  };

  // Filter date range
  const filterByRange = (items, start, end) => {
    if (!start || !end) return items;
    return items.filter(b => {
      const d = b.created_at || b.updated_at || b.tanggal;
      if (!d) return false;
      const dOnly = new Date(d).toISOString().split("T")[0];
      return dOnly >= start && dOnly <= end;
    });
  };

  // Format date for display
  const formatDateLabel = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID');
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const camerasRes = await cameras.getAll();
        const cams = camerasRes.data.cameras || [];
        setCamerasData(cams);

        const buildingsRes = await maps.getAllSimpang();
        const sims = buildingsRes.data.simpang || [];

        const merged = combineData(sims, cams);

        const valid = merged
          .map(item => ({
            ...item,
            cameras: (item.cameras || []).filter(
              cam => cam?.socket_event && cam?.socket_event !== "not_yet_assign"
            )
          }))
          .filter(item => item.cameras.length > 0);

        setBuildings(merged);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setBuildings([]);
        setCamerasData([]);
      }
    };
    fetchData();
  }, []);

  // Filtering
  useEffect(() => {
    setFilteredBuildings(buildings);
    onDateSelect?.(buildings);
    endDateRange?.(endDate);
    startDateRange?.(startDate);
  }, [buildings, selectedDate, startDate, endDate]);

  // Clear handler
  const clearSingleDate = () => setSelectedDate('');
  const clearRange = () => { setStartDate(''); setEndDate(''); };

  // Label
  const getDateLabel = () => {
    if (optionDate && selectedDate) return `Tanggal: ${formatDateLabel(selectedDate)}`;
    if (optionDateRange && startDate && endDate) return `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`;
    return "Filter Tanggal";
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {(optionDate || optionDateRange) && (
        <Dropdown
          isOpen={isDateDropdownOpen}
          onClose={() => setIsDateDropdownOpen(false)} 
          onToggle={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
          label={getDateLabel()}
        >
          {optionDate && (
            <DatePicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onClearDate={clearSingleDate}
            />
          )}
          {optionDateRange && (
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(s, e) => { setStartDate(s); setEndDate(e); }}
              onClear={clearRange}
            />
          )}
        </Dropdown>
      )}

      {optionMap && (
        <Dropdown
          isOpen={isLocationDropdownOpen}
          onToggle={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
          onClose={() => setIsDateDropdownOpen(false)} 
          label={`Lokasi (${filteredBuildings.length}) ${locationName ? `: ${locationName}` : ''}`}
          className="min-w-full"
        >
          {filteredBuildings.length > 0 ? (
            filteredBuildings.map((building) => (
              <button
                key={building.id}
                onClick={() => {
                  onSelect?.(building)
                  setLocationName(building.Nama_Simpang)
                  setIsLocationDropdownOpen(false)
                }}
                className="btn btn-ghost text-xs btn-sm btn-block justify-start rounded-none"
              >
                <FaMapMarkerAlt className="mr-2" /> {building.Nama_Simpang}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-xs text-gray-400 italic">
              Tidak ada lokasi
            </div>
          )}
        </Dropdown>
      )}
    </div>
  );
};

export default OptionSelectMaps;
