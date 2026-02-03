'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { getRequest } from '@/lib/apiService';
import ExcelJS from 'exceljs';

const CityTrafficSummary = forwardRef(({ simpangId, simpangName }, ref) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [interval, setInterval] = useState('1hour');

  // Mapping kategori kendaraan
  const vehicleCategories = [
    { key: 'SM', label: 'Sepeda Motor', sourceKeys: ['SM'] },
    { key: 'MP', label: 'Mobil Penumpang', sourceKeys: ['MP'] },
    { key: 'TRUK', label: 'Truk', sourceKeys: ['AUP', 'TR', 'TS', 'TB', 'GANDENG'] },
    { key: 'BUS', label: 'Bus', sourceKeys: ['BS', 'BB'] },
    { key: 'KTB', label: 'Kendaraan Tak Bermotor', sourceKeys: ['KTB'] }
  ];

  // Helper function to aggregate vehicle data based on new categories
  const aggregateVehicleData = (slotData) => {
    const aggregated = {};
    
    vehicleCategories.forEach(category => {
      aggregated[category.key] = {
        IN: 0,
        OUT: 0,
        label: category.label
      };
      
      // Sum up all source keys for this category
      category.sourceKeys.forEach(sourceKey => {
        if (slotData.vehicles[sourceKey]) {
          aggregated[category.key].IN += slotData.vehicles[sourceKey].IN || 0;
          aggregated[category.key].OUT += slotData.vehicles[sourceKey].OUT || 0;
        }
      });
    });
    
    return aggregated;
  };

  const fetchData = async () => {
    if (!simpangId || !startDate) return;

    try {
      setLoading(true);
      setError(null);

      const url = `/vehicles/city-traffic?simpang_id=${simpangId}&date=${startDate}&interval=${interval}`;
      const response = await getRequest(url);
      
      if (response.data?.status === 'ok') {
        setData(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message || 'Error fetching data');
      console.error('Error fetching city traffic summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refetchData: () => fetchData()
  }));

  useEffect(() => {
    fetchData();
  }, [simpangId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const exportToExcel = async () => {
    if (!data?.slots) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const slots = Object.keys(data.slots).sort();

      // ===== SHEET 1: DETAIL (Semua Klasifikasi) =====
      const detailSheet = workbook.addWorksheet('Detail Klasifikasi');
      
      // Detail categories (all 10 types)
      const detailCategories = [
        { key: 'SM', label: 'SM' },
        { key: 'MP', label: 'MP' },
        { key: 'AUP', label: 'AUP' },
        { key: 'TR', label: 'TR' },
        { key: 'BS', label: 'BS' },
        { key: 'TS', label: 'TS' },
        { key: 'TB', label: 'TB' },
        { key: 'BB', label: 'BB' },
        { key: 'GANDENG', label: 'GANDENG' },
        { key: 'KTB', label: 'KTB' }
      ];

      const detailTotalCols = detailCategories.length + 1;
      const detailEndColNum = 1 + detailTotalCols * 2;
      const detailEndColLetter = String.fromCharCode(64 + detailEndColNum);
      
      // Title
      detailSheet.mergeCells(`A1:${detailEndColLetter}1`);
      detailSheet.getCell('A1').value = 'DETAIL MASUK/KELUAR KOTA JOGJA';
      detailSheet.getCell('A1').font = { size: 14, bold: true };
      detailSheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

      // Info
      detailSheet.mergeCells(`A2:${detailEndColLetter}2`);
      detailSheet.getCell('A2').value = `${data.simpang_name || simpangName || 'Unknown'} (${data.simpang_position || ''}) | Tanggal: ${data.date} | Interval: ${interval === '5min' ? '5 Menit' : interval === '15min' ? '15 Menit' : interval === '30min' ? '30 Menit' : '1 Jam'}`;
      detailSheet.getCell('A2').font = { size: 10 };
      detailSheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

      // Description
      if (data.description) {
        detailSheet.mergeCells(`A3:${detailEndColLetter}3`);
        detailSheet.getCell('A3').value = data.description;
        detailSheet.getCell('A3').font = { size: 9, italic: true };
        detailSheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };
      }

      const detailMasukEndCol = String.fromCharCode(65 + detailTotalCols);
      const detailKeluarStartCol = String.fromCharCode(66 + detailTotalCols);
      const detailKeluarEndCol = String.fromCharCode(65 + detailTotalCols * 2);

      // Header Row 1
      const detailHeaderRow1Data = ['Waktu'];
      for (let i = 0; i < detailTotalCols; i++) detailHeaderRow1Data.push(i === 0 ? 'MASUK KOTA' : '');
      for (let i = 0; i < detailTotalCols; i++) detailHeaderRow1Data.push(i === 0 ? 'KELUAR KOTA' : '');
      const detailHeaderRow1 = detailSheet.addRow(detailHeaderRow1Data);

      // Header Row 2
      const detailHeaderRow2 = detailSheet.addRow([
        '',
        ...detailCategories.map(cat => cat.label),
        'TKB',
        ...detailCategories.map(cat => cat.label),
        'TKB'
      ]);
      
      // Merge cells
      const headerStartRow = data.description ? 4 : 3;
      detailSheet.mergeCells(`A${headerStartRow}:A${headerStartRow + 1}`);
      detailSheet.mergeCells(`B${headerStartRow}:${detailMasukEndCol}${headerStartRow}`);
      detailSheet.mergeCells(`${detailKeluarStartCol}${headerStartRow}:${detailKeluarEndCol}${headerStartRow}`);

      const detailMasukEndColNum = 1 + detailTotalCols;
      
      // Style headers
      detailHeaderRow1.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      detailHeaderRow2.eachCell((cell, colNumber) => {
        if (colNumber > 1) {
          cell.font = { bold: true, size: 9 };
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
      });

      // Data rows for detail sheet
      slots.forEach((slot) => {
        const slotData = data.slots[slot];
        
        // Calculate TKB (exclude KTB)
        let totalIN = 0;
        let totalOUT = 0;
        detailCategories.forEach(cat => {
          if (cat.key !== 'KTB') {
            totalIN += slotData.vehicles[cat.key]?.IN || 0;
            totalOUT += slotData.vehicles[cat.key]?.OUT || 0;
          }
        });

        const rowData = [
          slot,
          ...detailCategories.map(cat => slotData.vehicles[cat.key]?.IN || 0),
          totalIN,
          ...detailCategories.map(cat => slotData.vehicles[cat.key]?.OUT || 0),
          totalOUT
        ];

        const dataRow = detailSheet.addRow(rowData);
        
        dataRow.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          
          if (colNumber === 1 || colNumber === detailMasukEndColNum || colNumber === detailEndColNum) {
            cell.font = { bold: true };
          }
        });
      });

      // Set column widths
      detailSheet.getColumn(1).width = 12;
      for (let i = 2; i <= detailEndColNum; i++) {
        detailSheet.getColumn(i).width = 12;
      }

      // ===== SHEET 2: RINGKASAN (Klasifikasi Agregat) =====
      const summarySheet = workbook.addWorksheet('Ringkasan');

      const displayCategories = vehicleCategories.map(cat => ({
        key: cat.key,
        label: cat.label
      }));

      const totalCols = displayCategories.length + 1;
      const keluarEndColNum = 1 + totalCols * 2;
      const endColLetter = String.fromCharCode(64 + keluarEndColNum);
      
      // Title
      summarySheet.mergeCells(`A1:${endColLetter}1`);
      summarySheet.getCell('A1').value = 'RINGKASAN MASUK/KELUAR KOTA JOGJA';
      summarySheet.getCell('A1').font = { size: 14, bold: true };
      summarySheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

      // Info
      summarySheet.mergeCells(`A2:${endColLetter}2`);
      summarySheet.getCell('A2').value = `${data.simpang_name || simpangName || 'Unknown'} (${data.simpang_position || ''}) | Tanggal: ${data.date} | Interval: ${interval === '5min' ? '5 Menit' : interval === '15min' ? '15 Menit' : interval === '30min' ? '30 Menit' : '1 Jam'}`;
      summarySheet.getCell('A2').font = { size: 10 };
      summarySheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

      // Description
      if (data.description) {
        summarySheet.mergeCells(`A3:${endColLetter}3`);
        summarySheet.getCell('A3').value = data.description;
        summarySheet.getCell('A3').font = { size: 9, italic: true };
        summarySheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };
      }

      const masukEndCol = String.fromCharCode(65 + totalCols);
      const keluarStartCol = String.fromCharCode(66 + totalCols);
      const keluarEndCol = String.fromCharCode(65 + totalCols * 2);

      // Header Row 1
      const headerRow1Data = ['Waktu'];
      for (let i = 0; i < totalCols; i++) headerRow1Data.push(i === 0 ? 'MASUK KOTA' : '');
      for (let i = 0; i < totalCols; i++) headerRow1Data.push(i === 0 ? 'KELUAR KOTA' : '');
      const headerRow1 = summarySheet.addRow(headerRow1Data);

      // Header Row 2
      const headerRow2 = summarySheet.addRow([
        '',
        ...displayCategories.map(cat => cat.label),
        'TKB',
        ...displayCategories.map(cat => cat.label),
        'TKB'
      ]);
      
      // Merge cells
      const summaryHeaderStartRow = data.description ? 4 : 3;
      summarySheet.mergeCells(`A${summaryHeaderStartRow}:A${summaryHeaderStartRow + 1}`);
      summarySheet.mergeCells(`B${summaryHeaderStartRow}:${masukEndCol}${summaryHeaderStartRow}`);
      summarySheet.mergeCells(`${keluarStartCol}${summaryHeaderStartRow}:${keluarEndCol}${summaryHeaderStartRow}`);

      const masukEndColNum = 1 + totalCols;
      
      // Style headers
      headerRow1.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      headerRow2.eachCell((cell, colNumber) => {
        if (colNumber > 1) {
          cell.font = { bold: true, size: 9 };
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
      });

      // Data rows for summary sheet
      slots.forEach((slot) => {
        const slotData = data.slots[slot];
        const aggregated = aggregateVehicleData(slotData);
        
        // Calculate TKB
        let totalIN = 0;
        let totalOUT = 0;
        displayCategories.forEach(cat => {
          if (cat.key !== 'KTB') {
            totalIN += aggregated[cat.key]?.IN || 0;
            totalOUT += aggregated[cat.key]?.OUT || 0;
          }
        });

        const rowData = [
          slot,
          ...displayCategories.map(cat => aggregated[cat.key]?.IN || 0),
          totalIN,
          ...displayCategories.map(cat => aggregated[cat.key]?.OUT || 0),
          totalOUT
        ];

        const dataRow = summarySheet.addRow(rowData);
        
        dataRow.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          
          if (colNumber === 1 || colNumber === masukEndColNum || colNumber === keluarEndColNum) {
            cell.font = { bold: true };
          }
        });
      });

      // Set column widths
      summarySheet.getColumn(1).width = 12;
      for (let i = 2; i <= keluarEndColNum; i++) {
        summarySheet.getColumn(i).width = 14;
      }

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Masuk_Keluar_Kota_${data.simpang_name || simpangName || 'Unknown'}_${data.date}_${interval}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Gagal mengekspor data ke Excel');
    }
  };

  const renderTable = () => {
    if (!data?.slots) return null;

    const slots = Object.keys(data.slots).sort();

    return (
      <div className="overflow-x-auto">
        <table className="table table-sm w-full border-collapse">
          <thead>
            {/* First header row - Masuk/Keluar Kota */}
            <tr className="bg-gray-50 text-gray-800">
              <th rowSpan="2" className="text-center align-middle border-2 w-fit">Waktu</th>
              <th colSpan={vehicleCategories.length + 1} className="text-center border-2">
                MASUK KOTA
              </th>
              <th colSpan={vehicleCategories.length + 1} className="text-center border-2">
                KELUAR KOTA
              </th>
            </tr>
            {/* Second header row - Vehicle types */}
            <tr className="bg-gray-50 text-gray-800 text-xs">
              {/* Masuk columns */}
              {vehicleCategories.map(cat => (
                <th key={`in-${cat.key}`} className="text-center border-2 px-2">
                  {cat.label}
                </th>
              ))}
              <th className="text-center border-2 px-2 font-bold">
                TKB
              </th>
              {/* Keluar columns */}
              {vehicleCategories.map(cat => (
                <th key={`out-${cat.key}`} className="text-center border-2 px-2">
                  {cat.label}
                </th>
              ))}
              <th className="text-center border-2 px-2 font-bold">
                TKB
              </th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, idx) => {
              const slotData = data.slots[slot];
              const aggregated = aggregateVehicleData(slotData);
              
              // Calculate TKB (Total Kendaraan Bermotor - exclude KTB)
              let totalIN = 0;
              let totalOUT = 0;
              vehicleCategories.forEach(cat => {
                if (cat.key !== 'KTB') {
                  totalIN += aggregated[cat.key]?.IN || 0;
                  totalOUT += aggregated[cat.key]?.OUT || 0;
                }
              });

              return (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="font-semibold text-center border-2 px-2">{slot}</td>
                  
                  {/* Masuk data */}
                  {vehicleCategories.map(cat => {
                    const count = aggregated[cat.key]?.IN || 0;
                    return (
                      <td key={`in-${cat.key}`} className="text-center border-2 px-2">
                        {count.toLocaleString()}
                      </td>
                    );
                  })}
                  <td className="text-center border-2 px-2 font-bold">
                    {totalIN.toLocaleString()}
                  </td>
                  
                  {/* Keluar data */}
                  {vehicleCategories.map(cat => {
                    const count = aggregated[cat.key]?.OUT || 0;
                    return (
                      <td key={`out-${cat.key}`} className="text-center border-2 px-2">
                        {count.toLocaleString()}
                      </td>
                    );
                  })}
                  <td className="text-center border-2 px-2 font-bold">
                    {totalOUT.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input input-sm input-bordered focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Interval Waktu</label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="select select-sm select-bordered focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="5min">5 Menit</option>
                <option value="15min">15 Menit</option>
                <option value="30min">30 Menit</option>
                <option value="1hour">1 Jam</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? 'Memuat...' : 'Tampilkan Data'}
              </button>
              <button
                type="button"
                onClick={exportToExcel}
                disabled={!data || loading}
                className="btn btn-sm bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300"
              >
                Export Excel
              </button>
            </div>
          </div>

          {data && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium">Info:</span> {data.description || `Menampilkan ${data.slot_count} slot waktu untuk tanggal ${data.date} | ${simpangName || 'Unknown'} (${data.simpang_position || ''})`}
            </div>
          )}
        </form>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {error && (
        <div className="alert alert-error shadow-lg mb-4">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {!loading && !error && data && renderTable()}

      {!loading && !error && !data && (
        <div className="text-center py-12 text-gray-500">
          Pilih tanggal dan klik &quot;Tampilkan Data&quot; untuk melihat data masuk/keluar kota
        </div>
      )}
    </div>
  );
});

CityTrafficSummary.displayName = 'CityTrafficSummary';

export default CityTrafficSummary;
