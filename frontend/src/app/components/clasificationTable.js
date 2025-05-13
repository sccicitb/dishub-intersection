"use client"
import { useState, useEffect } from 'react';

export default function VehicleClassificationTable ({ typeClass }) {
  const [classificationData, setClassificationData] = useState([]);
  const [selectedType, setSelectedType] = useState('luar_kota');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // In a real implementation, you'd import from a file
    // We're using the data directly here
    import("@/data/classification.json").then((data) => {
      setClassificationData(data.default);
    }).catch(error => {
      console.error("Error loading classification data:", error);
    });

    // Get initial theme
    setTheme(localStorage.getItem("theme") || "light");

    // Observer for theme changes
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
    if (typeClass === "PKJI 2023 Luar Kota") {
      setSelectedType("luar_kota")
    } else if (typeClass === "PKJI 2023 Dalam Kota") {
      setSelectedType("dalam_kota")
    } else if (typeClass === "Tipikal") {
      setSelectedType("tipikal")
    } 
  }, [typeClass])

  // Filter data by selected type
  const filteredData = classificationData?.filter(item => item.type === selectedType) || [];

  // Group filtered data by mainCode
  const groupedData = filteredData.reduce((acc, vehicle) => {
    if (!acc[vehicle.mainCode]) {
      acc[vehicle.mainCode] = [];
    }
    acc[vehicle.mainCode].push(vehicle);
    return acc;
  }, {});

  return (
    <div className="w-full p-4 my-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Klasifikasi Kendaraan</h2>

        {/* <div className="mt-2 sm:mt-0">
          <label className="mr-2 font-medium">Pilih Tipe Klasifikasi:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border p-2 rounded bg-white text-black dark:bg-gray-700 dark:text-white"
          >
            <option value="luar_kota">PKJI 2023 Luar Kota</option>
            <option value="dalam_kota">PKJI 2023 Dalam Kota</option>
            <option value="tipikal">Tipikal</option>
          </select>
        </div> */}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-base-300">
          <thead>
            <tr className={theme === 'light' ? 'bg-green-50 text-black' : 'bg-base-200 text-white'}>
              <th className="border border-base-300 px-4 py-2 font-medium capitalize" colSpan={20}>{selectedType.replace(/_/g, ' ')}</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedData).length > 0 ? (
              Object.entries(groupedData).flatMap(([mainCode, items]) =>
                items.map((vehicle, index) => (
                  <tr key={`${mainCode}-${index}`} className={theme === 'light' ? 'bg-green-50 text-black' : 'bg-base-200 text-white'}>
                    {index === 0 && (
                      <>
                        <td
                          className="border border-base-300 px-4 py-2 text-center align-middle font-medium"
                          rowSpan={items.length}
                        >
                          {vehicle.mainCode}
                        </td>
                        <td
                          className="border border-base-300 px-4 py-2 align-middle"
                          rowSpan={items.length}
                        >
                          {vehicle.mainCategory}
                        </td>
                      </>
                    )}
                    <td className="border border-base-300 px-4 py-2 text-center">
                      {vehicle.subCode} <br /> {vehicle.subCategory}
                    </td>
                    <td className="border border-base-300 px-4 py-2">
                      {vehicle.description}
                    </td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan="4" className="border border-base-300 px-4 py-2 text-center">
                  {classificationData?.length > 0 ? 'Tidak ada data untuk tipe yang dipilih' : 'Memuat data...'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}