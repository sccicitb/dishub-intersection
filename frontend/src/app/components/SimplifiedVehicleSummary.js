'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { getRequest } from '@/lib/apiService';
import ExcelJS from 'exceljs';

const SimplifiedVehicleSummary = forwardRef(({ simpangId, simpangName }, ref) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [interval, setInterval] = useState('1hour');

  const vehicleTypeLabels = {
    'SM': 'SM',
    'MP': 'MP',
    'AUP': 'AUP',
    'TR': 'TR',
    'BS': 'BS',
    'TS': 'TS',
    'TB': 'TB',
    'BB': 'BB',
    'GANDENG': 'GANDENG',
    'KTB': 'KTB'
  };

  const fetchData = async () => {
    if (!simpangId || !startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      // Validate date range
      if (new Date(startDate) > new Date(endDate)) {
        throw new Error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
      }

      const url = `/vehicles/simplified-summary?simpang_id=${simpangId}&date=${startDate}&interval=${interval}`;
      const response = await getRequest(url);
      
      if (response.data?.status === 'ok') {
        setData(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message || 'Error fetching data');
      console.error('Error fetching simplified vehicle summary:', err);
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
      const worksheet = workbook.addWorksheet('Ringkasan Kendaraan');

      // Get all vehicle types from data first to calculate column count
      const slots = Object.keys(data.slots).sort();
      const firstSlot = slots[0];
      const vehicleTypes = firstSlot ? Object.keys(data.slots[firstSlot].vehicles) : [];
      const displayTypes = vehicleTypes.filter(type => type !== 'TOTAL'); // Exclude TOTAL from display
      const displayLabels = displayTypes.reduce((acc, type) => {
        acc[type] = vehicleTypeLabels[type] || type;
        return acc;
      }, {});

      const totalCols = displayTypes.length + 1; // +1 for Total column
      const keluarEndColNum = 1 + totalCols * 2;
      const endColLetter = String.fromCharCode(64 + keluarEndColNum);
      
      // Title
      worksheet.mergeCells(`A1:${endColLetter}1`);
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'RINGKASAN VOLUME KENDARAAN';
      titleCell.font = { size: 14, bold: true };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      titleCell.font.color = { argb: 'FFFFFFFF' };

      // Info
      worksheet.mergeCells(`A2:${endColLetter}2`);
      const infoCell = worksheet.getCell('A2');
      infoCell.value = `Lokasi: ${simpangName || simpangId} | Tanggal: ${data.date} | Interval: ${interval === '5min' ? '5 Menit' : interval === '15min' ? '15 Menit' : interval === '30min' ? '30 Menit' : '1 Jam'}`;
      infoCell.font = { size: 10 };
      infoCell.alignment = { vertical: 'middle', horizontal: 'center' };

      const masukEndCol = String.fromCharCode(65 + totalCols); // B + totalCols
      const keluarStartCol = String.fromCharCode(66 + totalCols); // masukEndCol + 1
      const keluarEndCol = String.fromCharCode(65 + totalCols * 2); // masukEndCol + totalCols

      // Header Row 1: Arus MASUK and Arus KELUAR
      const headerRow1Data = ['Waktu'];
      for (let i = 0; i < totalCols; i++) headerRow1Data.push(i === 0 ? 'ARUS MASUK' : '');
      for (let i = 0; i < totalCols; i++) headerRow1Data.push(i === 0 ? 'ARUS KELUAR' : '');
      const headerRow1 = worksheet.addRow(headerRow1Data);

      // Header Row 2: Vehicle types
      const headerRow2 = worksheet.addRow([
        '',
        ...displayTypes.map(type => displayLabels[type]),
        'Total Kend. Bermotor',
        ...displayTypes.map(type => displayLabels[type]),
        'Total Kend. Bermotor'
      ]);
      
      // Merge cells for headers (after both rows are added)
      worksheet.mergeCells('A4:A5'); // Waktu
      worksheet.mergeCells(`B4:${masukEndCol}4`); // ARUS MASUK
      worksheet.mergeCells(`${keluarStartCol}4:${keluarEndCol}4`); // ARUS KELUAR

      // Calculate column numbers for styling
      const masukEndColNum = 1 + totalCols;
      
      // Style header row 1
      headerRow1.eachCell((cell, colNumber) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        if (colNumber === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF808080' } };
        } else if (colNumber >= 2 && colNumber <= masukEndColNum) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } }; // Green
        } else if (colNumber > masukEndColNum && colNumber <= keluarEndColNum) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE74C3C' } }; // Red
        }
      });

      // Style header row 2
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
          
          if (colNumber >= 2 && colNumber <= masukEndColNum) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } }; // Light green
          } else if (colNumber > masukEndColNum && colNumber <= keluarEndColNum) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } }; // Light red
          }
        }
      });

      // Data rows
      slots.forEach((slot, idx) => {
        const slotData = data.slots[slot];
        
        // Calculate totals (exclude KTB from Total Kendaraan Bermotor)
        let totalIN = 0;
        let totalOUT = 0;
        displayTypes.forEach(type => {
          if (type !== 'KTB') {
            totalIN += slotData.vehicles[type]?.IN || 0;
            totalOUT += slotData.vehicles[type]?.OUT || 0;
          }
        });

        const rowData = [
          slot,
          ...displayTypes.map(type => slotData.vehicles[type]?.IN || 0),
          totalIN,
          ...displayTypes.map(type => slotData.vehicles[type]?.OUT || 0),
          totalOUT
        ];

        const dataRow = worksheet.addRow(rowData);
        
        dataRow.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          
          // Alternate row colors
          if (idx % 2 === 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
          } else {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
          }
          
          // Bold for time column and total columns
          if (colNumber === 1 || colNumber === masukEndColNum || colNumber === keluarEndColNum) {
            cell.font = { bold: true };
          }
          
          // Highlight total columns
          if (colNumber === masukEndColNum) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
          } else if (colNumber === keluarEndColNum) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } };
          }
        });
      });

      // Set column widths
      worksheet.getColumn(1).width = 12; // Waktu
      for (let i = 2; i <= keluarEndColNum; i++) {
        worksheet.getColumn(i).width = 14;
      }

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ringkasan_Kendaraan_${simpangName || simpangId}_${data.date}_${interval}.xlsx`;
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
    // Get all vehicle types from data
    const firstSlot = slots[0];
    const vehicleTypes = firstSlot ? Object.keys(data.slots[firstSlot].vehicles) : [];
    const displayTypes = vehicleTypes.filter(type => type !== 'TOTAL'); // Exclude TOTAL from display
    const displayLabels = displayTypes.reduce((acc, type) => {
      acc[type] = vehicleTypeLabels[type] || type;
      return acc;
    }, {});

    return (
      <div className="overflow-x-auto">
        <table className="table table-sm w-full border-collapse">
          <thead>
            {/* First header row - Arus MASUK and Arus KELUAR */}
            <tr className="bg-gray-100 text-gray-800">
              <th rowSpan="2" className="text-center align-middle border-[1.7px] w-fit">Waktu</th>
              <th colSpan={displayTypes.length + 1} className="text-center border-[1.7px] bg-gray-100">
                ARUS MASUK
              </th>
              <th colSpan={displayTypes.length + 1} className="text-center border-[1.7px] bg-gray-100">
                ARUS KELUAR
              </th>
            </tr>
            {/* Second header row - Vehicle types */}
            <tr className="bg-gray-100 text-gray-800 text-xs">
              {/* Masuk columns */}
              {displayTypes.map(type => (
                <th key={`in-${type}`} className="text-center border-[1.7px] px-2">
                  {displayLabels[type]}
                </th>
              ))}
              <th className="text-center border-[1.7px] px-2 font-bold bg-gray-100">
                TKB
              </th>
              {/* Keluar columns */}
              {displayTypes.map(type => (
                <th key={`out-${type}`} className="text-center border-[1.7px] px-2">
                  {displayLabels[type]}
                </th>
              ))}
              <th className="text-center border-[1.7px] px-2 font-bold bg-gray-100">
                TKB
              </th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, idx) => {
              const slotData = data.slots[slot];
              
              // Calculate total IN and OUT (exclude KTB from Total Kendaraan Bermotor)
              let totalIN = 0;
              let totalOUT = 0;
              displayTypes.forEach(type => {
                if (type !== 'KTB') {
                  totalIN += slotData.vehicles[type]?.IN || 0;
                  totalOUT += slotData.vehicles[type]?.OUT || 0;
                }
              });

              return (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="font-semibold text-center border-[1.7px] px-2">{slot}</td>
                  
                  {/* Masuk data */}
                  {displayTypes.map(type => {
                    const count = slotData.vehicles[type]?.IN || 0;
                    return (
                      <td key={`in-${type}`} className="text-center border-[1.7px] px-2">
                        {count.toLocaleString()}
                      </td>
                    );
                  })}
                  <td className="text-center border-[1.7px] px-2 font-bold bg-green-50">
                    {totalIN.toLocaleString()}
                  </td>
                  
                  {/* Keluar data */}
                  {displayTypes.map(type => {
                    const count = slotData.vehicles[type]?.OUT || 0;
                    return (
                      <td key={`out-${type}`} className="text-center border-[1.7px] px-2">
                        {count.toLocaleString()}
                      </td>
                    );
                  })}
                  <td className="text-center border-[1.7px] px-2 font-bold bg-red-50">
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
              <span className="font-medium">Info:</span> Menampilkan {data.slot_count} slot waktu untuk tanggal {data.date} Lokasi: {simpangName || simpangId}
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
          Pilih tanggal dan klik &quot;Tampilkan Data&quot; untuk melihat ringkasan
        </div>
      )}
    </div>
  );
});

SimplifiedVehicleSummary.displayName = 'SimplifiedVehicleSummary';

export default SimplifiedVehicleSummary;
