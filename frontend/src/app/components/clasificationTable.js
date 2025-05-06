"use client"
import { useState, useEffect } from 'react';

export default function VehicleClassificationTable() {
  
  const vehicleData = [
    // SM group
    {
      mainCode: "SM",
      mainCategory: "Sepeda Motor",
      isMainRow: true,
      subCode: "SM",
      subCategory: "(Sepeda Motor)",
      description: "Kendaraan Bermotor dengan 2 atau 3 Roda (Sepeda Motor, Skuter, Becak/Gerobak Motor)"
    },
    // MP group
    {
      mainCode: "MP",
      mainCategory: "Mobil Penumpang (Kendaraan Ringan)",
      isMainRow: true,
      subCode: "MP",
      subCategory: "(Mobil Pribadi)",
      description: "Kendaraan Penumpang dengan 4 (2 baris) s.d. 7 (3 baris) tempat duduk (Jeep, Sedan, Minibus, Taksi)"
    },
    {
      mainCode: "MP",
      mainCategory: "",
      isMainRow: false,
      subCode: "AUP",
      subCategory: "(Angkutan Umum Penumpang)",
      description: "Kendaraan Penumpang maksimal 15 tempat duduk (Angkot, Angkudes, Mikrobus/Van)"
    },
    {
      mainCode: "MP",
      mainCategory: "",
      isMainRow: false,
      subCode: "TR",
      subCategory: "(Truk Ringan)",
      description: "Mobil Bak Terbuka dan Bak Tertutup, Mobil Hantaran (Pickup, Box, Blind Van)"
    },
    // KS group
    {
      mainCode: "KS",
      mainCategory: "Kendaraan Sedang",
      isMainRow: true,
      subCode: "BS",
      subCategory: "(Bus Sedang)",
      description: "Kendaraan Penumpang dengan tempat duduk antara 16 s.d. 26 kursi (Bus Engkel, Bus Antar Jemput, Bus Kota, AKDP)"
    },
    {
      mainCode: "KS",
      mainCategory: "",
      isMainRow: false,
      subCode: "TS",
      subCategory: "(Truk Sedang)",
      description: "Truk 2 Sumbu dengan 4 atau 6 roda jarak gandar 3,5 s.d. 5 m"
    },
    {
      mainCode: "KS",
      mainCategory: "",
      isMainRow: false,
      subCode: "BB",
      subCategory: "(Bus Besar)",
      description: "Bus 2 atau 3 Sumbu dengan jarak gandar 5 s.d. 6 m (Bus AKAP, Bus Wisata, Bus Tingkat)"
    },
    {
      mainCode: "KS",
      mainCategory: "",
      isMainRow: false,
      subCode: "TB",
      subCategory: "(Truk Berat)",
      description: "Truk 2 Sumbu dengan 6 roda jarak gandar 5 s.d. 6 m, Truk 3 Sumbu atau lebih (Truk Trintin, Tronton, Trinton)"
    },
    {
      mainCode: "KS",
      mainCategory: "",
      isMainRow: false,
      subCode: "Gandeng/Semitrailer",
      subCategory: "",
      description: "Truk Gandeng, Truk Semitrailer"
    },
    // KTB group
    {
      mainCode: "KTB",
      mainCategory: "Kendaraan Tidak Bermotor",
      isMainRow: true,
      subCode: "KTB",
      subCategory: "(Kendaraan Tidak Bermotor)",
      description: "Sepeda, Becak, Gerobak Dorong/Tarik, Kendaraan ditarik Hewan (Pedati, Delman, Andong)"
    }
  ];
  
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Group data by main code
  const groupedData = vehicleData.reduce((acc, vehicle) => {
    if (!acc[vehicle.mainCode]) {
      acc[vehicle.mainCode] = [];
    }
    acc[vehicle.mainCode].push(vehicle);
    return acc;
  }, {});
  

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
  return (
    <div className="w-full p-4 my-2">
      <h2 className="text-xl font-semibold mb-4">Klasifikasi Kendaraan</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-green-50 text-black border border-base-300">
          <tbody>
            {Object.keys(groupedData).map((mainCode) => {
              const items = groupedData[mainCode];
              const rowCount = items.length;
              
              return items.map((vehicle, index) => (
                <tr key={`${mainCode}-${index}`} className={theme === 'light' ? 'bg-green-50 text-black' : 'bg-base-200 text-white'}>
                  {index === 0 && (
                    <>
                      <td 
                        className="border border-base-300 px-4 py-2 text-center align-middle" 
                        rowSpan={rowCount}
                      >
                        {vehicle.mainCode}
                      </td>
                      <td 
                        className="border border-base-300 px-4 py-2 align-middle" 
                        rowSpan={rowCount}
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
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}