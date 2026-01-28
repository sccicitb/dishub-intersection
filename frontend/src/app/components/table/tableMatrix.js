'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

const TableMatrix = ({ 
  categories, 
  asalTujuan, 
  arahPergerakan, 
  loading = false, 
  error = null,
  onDateChange = null,
  simpangList = [],
  selectedLocation = 0,
  onLocationChange = null,
  startDate = null,
  endDate = null,
  onSubmit = null,
  isLoading = false,
  onFilterChange = null,
  selectedFilter = 'customrange'
}) => {
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [filteredLocations, setFilteredLocations] = useState(simpangList);

  // Filter locations based on search
  useEffect(() => {
    if (!searchLocation.trim()) {
      setFilteredLocations(simpangList);
    } else {
      const filtered = simpangList.filter(loc =>
        (loc.Nama_Simpang || `Simpang ${loc.id}`).toLowerCase().includes(searchLocation.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [searchLocation, simpangList]);

  const handleLocationSelect = (locationId, locationName) => {
    onLocationChange?.(locationId);
    setIsLocationDropdownOpen(false);
    setSearchLocation('');
  };

  const getSelectedLocationName = () => {
    if (selectedLocation === 0) return '-- Pilih Lokasi --';
    if (selectedLocation === 'semua') return 'Semua Simpang';
    const location = simpangList.find(loc => loc.id === selectedLocation);
    return location?.Nama_Simpang || `Simpang ${selectedLocation}`;
  };
  const renderLoadingState = () => (
    <div className="bg-white px-8 py-5 rounded-lg w-full flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="text-sm text-gray-500">Memuat data matriks...</p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-red-50 px-8 py-5 rounded-lg w-full border border-red-200">
      <div className="flex items-center gap-2">
        <span className="text-red-500 font-semibold">Error:</span>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="bg-yellow-50 px-8 py-5 rounded-lg w-full border border-yellow-200">
      <p className="text-sm text-yellow-700">Tidak ada data matriks yang tersedia. Silakan pilih lokasi dan tanggal.</p>
    </div>
  );

  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  const hasData = asalTujuan && Object.keys(asalTujuan).length > 0 && arahPergerakan && Object.keys(arahPergerakan).length > 0;

  if (!hasData) {
    return renderEmptyState();
  }

  return (
    <div className="space-y-6 flex flex-col gap-5 w-full p-5">
      {/* Location & Date Selection Header */}
      <div className="bg-gradient-to-r bg-[#314385]/90 px-8 py-5 rounded-lg w-full shadow-lg">
        <h2 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
          Pilih Lokasi & Periode
        </h2>
        {simpangList.length === 0 && (
          <div className="mb-4 p-3 bg-yellow-100 rounded-lg border-l-4 border-yellow-400">
            <p className="text-sm text-yellow-800 font-medium flex items-center gap-2">Tidak ada data simpang yang tersedia.</p>
          </div>
        )}
        {/* Filter Controls */}
          {simpangList && simpangList.length > 0 && (
            <div className="relative">
              <label className="block text-xs font-semibold text-blue-50 mb-2">
                Lokasi Simpang ({filteredLocations.length})
              </label>
              
              {/* Location Button/Dropdown Toggle */}
              <div
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md cursor-pointer flex items-center justify-between hover:border-blue-400 transition"
              >
                <span className="text-sm flex items-center gap-2">
                  <span className="truncate">{getSelectedLocationName()}</span>
                </span>
                <span className={`text-gray-400 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </div>

              {/* Dropdown Menu */}
              {isLocationDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20">
                  {/* Search Input */}
                  <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                    <div className="relative flex items-center">
                      <FaSearch className="absolute left-3 text-gray-400 text-xs" />
                      <input
                        type="text"
                        placeholder="Cari lokasi..."
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      {searchLocation && (
                        <button
                          onClick={() => setSearchLocation('')}
                          className="absolute right-2 text-gray-400 hover:text-gray-600"
                        >
                          <FaTimes size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Location List */}
                  <div className="max-h-48 overflow-y-auto">
                    {/* Semua Simpang Option */}
                    <button
                      onClick={() => handleLocationSelect('semua', 'Semua Simpang')}
                      className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-blue-50 transition ${
                        selectedLocation === 'semua' ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <FaMapMarkerAlt className={`${selectedLocation === 'semua' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={selectedLocation === 'semua' ? 'font-semibold text-blue-700' : ''}>
                        Semua Simpang
                      </span>
                    </button>

                    {filteredLocations.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        Tidak ada lokasi yang ditemukan
                      </div>
                    ) : (
                      filteredLocations.map((location) => (
                        <button
                          key={location.id}
                          onClick={() => handleLocationSelect(location.id, location.Nama_Simpang)}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-blue-50 transition ${
                            selectedLocation === location.id ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                          }`}
                        >
                          <FaMapMarkerAlt className={`${selectedLocation === location.id ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className={selectedLocation === location.id ? 'font-semibold text-blue-700' : ''}>
                            {location.Nama_Simpang || `Simpang ${location.id}`}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mt-4 md:space-x-2">
          {/* Filter Type */}
          <div>
            <label className="block text-xs font-semibold text-blue-50 mb-2">
              Filter Periode
            </label>
            <select
              value={selectedFilter || 'customrange'}
              onChange={(e) => onFilterChange?.(e.target.value)}
              className="select select-bordered select-sm w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            >
              <option value="day">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="quarter">Quarter Ini</option>
              <option value="year">Tahun Ini</option>
              <option value="customrange">Custom Range</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-blue-50 mb-2">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate || ''}
              onChange={(e) => onDateChange?.('start', e.target.value)}
              disabled={selectedFilter !== 'customrange'}
              className="input input-bordered input-sm w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white disabled:bg-gray-100"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-semibold text-blue-50 mb-2">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate || ''}
              onChange={(e) => onDateChange?.('end', e.target.value)}
              disabled={selectedFilter !== 'customrange'}
              className="input input-bordered input-sm w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white disabled:bg-gray-100"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-end gap-2">
            <button
              onClick={() => onSubmit?.()}
              disabled={selectedLocation === 0}
              className={`btn btn-md shadow-none border-none rounded-lg font-semibold transition w-full ${
                selectedLocation === 0
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-green-700/90 text-white hover:bg-green-600 cursor-pointer'
              }`}
            >
              Submit
            </button>
            {isLoading && (
              <div className="flex items-center gap-1 text-sm text-[#314385] whitespace-nowrap">
                <span className="animate-spin">⏳</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Asal-Tujuan */}
      <div className="bg-white px-8 py-5 rounded-lg w-full shadow-sm">
        <h3 className="font-semibold text-base mb-3 text-gray-700 flex items-center gap-2">
          <span className="text-lg"></span> Matriks Asal - Tujuan (kendaraan)
        </h3>
        <div className="overflow-x-auto">
          <table className="table table-auto w-full text-center text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50
              to-blue-100 border-b-2 border-blue-200">
                <th className="p-3 font-semibold text-gray-700 text-left">dari  ke</th>
                {categories.map((c) => (
                  <th key={c} className="p-3 font-semibold text-gray-700 capitalize">{c}</th>
                ))}
                <th className="p-3 font-semibold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(asalTujuan).map((from, idx) => (
                <tr key={from} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-200 p-3 font-semibold text-gray-700 text-left capitalize">{from}</td>
                  {categories.map((to) => (
                    <td key={to} className="border border-gray-200 p-3 text-gray-600">
                      <span className="inline-block bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium">
                        {asalTujuan[from][to] ? Number(asalTujuan[from][to]).toLocaleString('id-ID') : '-'}
                      </span>
                    </td>
                  ))}
                  <td className="border border-gray-200 p-3 text-gray-600">
                    <span className="inline-block bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium">
                      {asalTujuan[from]['Total'] ? Number(asalTujuan[from]['Total']).toLocaleString('id-ID') : '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabel Arah Pergerakan */}
      <div className="bg-white px-8 py-5 rounded-lg w-full shadow-sm">
        <h3 className="font-semibold text-base mb-3 text-gray-700 flex items-center gap-2">
          <span className="text-lg"></span> Matriks Arah Pergerakan (kendaraan)
        </h3>
        <div className="overflow-x-auto">
          <table className="table table-auto w-full text-center text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
                <th className="p-3 font-semibold text-gray-700 text-left">arah pergerakan</th>
                {categories.map((c) => (
                  <th key={c} className="p-3 font-semibold text-gray-700 capitalize">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(arahPergerakan).map((arah, idx) => (
                <tr key={arah} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-200 p-3 font-semibold text-gray-700 text-left capitalize">{arah}</td>
                  {categories.map((to) => (
                    <td key={to} className="border border-gray-200 p-3 text-gray-600">
                      <span className="inline-block bg-green-100 px-2 py-1 rounded text-green-800 font-medium">
                        {arahPergerakan[arah][to] ? Number(arahPergerakan[arah][to]).toLocaleString('id-ID') : '-'}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableMatrix;
