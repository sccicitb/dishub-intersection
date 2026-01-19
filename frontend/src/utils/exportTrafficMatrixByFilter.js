import ExcelJS from 'exceljs';

export const exportTrafficMatrixByFilter = async (data, simpangId, dateInput, interval, statusLog = null, simpangName = '') => {
  if (!data || !data.slots) {
    alert('No data to export');
    return;
  }

  const wb = new ExcelJS.Workbook();

  // Vehicle categories
  const vehicleCategories = [
    'Sepeda Motor',
    'Mobil Penumpang',
    'Angkutan Umum',
    'Truk Ringan',
    'Bus Sedang',
    'Truk Sedang',
    'Truk Berat',
    'Bus Besar',
    'Gandeng/Semitrailer',
    'Kendaraan Tidak Bermotor',
  ];

  const directions = ['barat', 'selatan', 'timur', 'utara'];
  const movements = ['Belok Kiri', 'Lurus', 'Belok Kanan'];
  const timeSlots = Object.keys(data.slots || {}).sort();

  // Helper function to get time period name
  const getTimePeriodName = (timeSlot) => {
    if (!data.timePeriods) return '';
    for (const [periodName, timeRange] of Object.entries(data.timePeriods)) {
      const [start, end] = timeRange.split(' - ');
      const slotStart = timeSlot.split('-')[0];
      if (slotStart >= start && slotStart <= end) {
        return periodName;
      }
    }
    return '';
  };

  // Helper function to get status for a time slot
  const getStatusForTimeSlot = (timeSlot) => {
    if (!statusLog || !statusLog.timeline_5min) return '-';
    
    const [slotStart] = timeSlot.split('-');
    const timeWithSeconds = `${slotStart}:00`;
    
    const timelineEntry = statusLog.timeline_5min.find(entry => entry.time === timeWithSeconds);
    if (!timelineEntry) return '-';
    
    return timelineEntry.status === 1 ? 'Aktif' : 'Tidak Aktif';
  };

  // Group timeSlots by timePeriod
  const groupedByPeriod = {};
  timeSlots.forEach(slot => {
    const period = getTimePeriodName(slot);
    if (!groupedByPeriod[period]) {
      groupedByPeriod[period] = [];
    }
    groupedByPeriod[period].push(slot);
  });

  const timePeriods = Object.keys(groupedByPeriod);

  // Helper function to get aggregated value
  const getAggregatedValue = (period, movement, direction, category) => {
    let total = 0;
    groupedByPeriod[period].forEach(timeSlot => {
      total += data.slots[timeSlot]?.[movement]?.[direction]?.[category] || 0;
    });
    return total;
  };

  // ===== SHEET 1: INFO =====
  const infoData = [
    ['Traffic Matrix by Filter'],
    ['Simpang ID', data.simpang_id],
    ['Nama Simpang', simpangName || data.simpang_id],
    ['Tanggal', data.date],
    ['Interval', interval],
    ['Tanggal Export', new Date().toLocaleString('id-ID')],
  ];
  const wsInfo = wb.addWorksheet('Info');
  infoData.forEach(row => wsInfo.addRow(row));

  // ===== SHEET 2: DETAILED TABLE (Per Time Slot) - MATCHING trafficMatrixByFilter2 FORMAT =====
  const detailedTableData = [];

  // Headers - Row 1: Arah (Barat, Selatan, Timur, Utara)
  const headerRow1 = ['Waktu', 'Status Kamera'];
  directions.forEach((dir) => {
    headerRow1.push(dir);
    // Add empty cells for the 3 movements columns that will follow
    for (let i = 1; i < movements.length * (vehicleCategories.length + 1); i++) {
      headerRow1.push('');
    }
  });
  detailedTableData.push(headerRow1);

  // Headers - Row 2: Pergerakan (Belok Kiri, Lurus, Belok Kanan) per Direction
  const headerRow2 = ['', ''];
  directions.forEach((dir) => {
    movements.forEach((move) => {
      headerRow2.push(move);
      for (let i = 1; i < vehicleCategories.length + 1; i++) {
        headerRow2.push('');
      }
    });
  });
  detailedTableData.push(headerRow2);

  // Headers - Row 3: Jenis Kendaraan
  const headerRow3 = ['', ''];
  directions.forEach((dir) => {
    movements.forEach((move) => {
      vehicleCategories.forEach((cat) => {
        headerRow3.push(cat);
      });
      headerRow3.push('Total');
    });
  });
  detailedTableData.push(headerRow3);

  // Data rows
  timeSlots.forEach((timeSlot) => {
    const status = getStatusForTimeSlot(timeSlot);
    const row = [timeSlot, status];

    // For each direction
    directions.forEach((dir) => {
      // For each movement
      movements.forEach((move) => {
        // For each vehicle category
        vehicleCategories.forEach((cat) => {
          const value = data.slots[timeSlot]?.[move]?.[dir]?.[cat] || 0;
          row.push(value);
        });

        // Movement total for this direction
        let movementTotal = 0;
        vehicleCategories.forEach((cat) => {
          movementTotal += data.slots[timeSlot]?.[move]?.[dir]?.[cat] || 0;
        });
        row.push(movementTotal);
      });
    });

    detailedTableData.push(row);
  });

  // Grand total row
  const allCategoriesWithTotal = [...vehicleCategories, 'Total'];
  const grandTotalRow = ['GRAND TOTAL', ''];

  directions.forEach((dir) => {
    movements.forEach((move) => {
      vehicleCategories.forEach((cat) => {
        let grandTotal = 0;
        timeSlots.forEach((timeSlot) => {
          grandTotal += data.slots[timeSlot]?.[move]?.[dir]?.[cat] || 0;
        });
        grandTotalRow.push(grandTotal);
      });

      // Movement grand total for this direction
      let movementGrandTotal = 0;
      vehicleCategories.forEach((cat) => {
        timeSlots.forEach((timeSlot) => {
          movementGrandTotal += data.slots[timeSlot]?.[move]?.[dir]?.[cat] || 0;
        });
      });
      grandTotalRow.push(movementGrandTotal);
    });
  });

  detailedTableData.push(grandTotalRow);

  const wsDetailed = wb.addWorksheet('Detailed');
  detailedTableData.forEach(row => wsDetailed.addRow(row));

  // ===== SHEET 3: SUMMARY (Per Time Period) - MATCHING trafficMatrixByFilter2 FORMAT =====
  const summaryTableData = [];

  // Headers - Row 1: Arah (Barat, Selatan, Timur, Utara)
  const summaryHeaderRow1 = ['Periode'];
  directions.forEach((dir) => {
    summaryHeaderRow1.push(dir);
    // Add empty cells for the 3 movements columns that will follow
    for (let i = 1; i < movements.length * (vehicleCategories.length + 1); i++) {
      summaryHeaderRow1.push('');
    }
  });
  summaryTableData.push(summaryHeaderRow1);

  // Headers - Row 2: Pergerakan (Belok Kiri, Lurus, Belok Kanan) per Direction
  const summaryHeaderRow2 = [''];
  directions.forEach((dir) => {
    movements.forEach((move) => {
      summaryHeaderRow2.push(move);
      for (let i = 1; i < vehicleCategories.length + 1; i++) {
        summaryHeaderRow2.push('');
      }
    });
  });
  summaryTableData.push(summaryHeaderRow2);

  // Headers - Row 3: Jenis Kendaraan
  const summaryHeaderRow3 = [''];
  directions.forEach((dir) => {
    movements.forEach((move) => {
      vehicleCategories.forEach((cat) => {
        summaryHeaderRow3.push(cat);
      });
      summaryHeaderRow3.push('Total');
    });
  });
  summaryTableData.push(summaryHeaderRow3);

  // Data rows
  timePeriods.forEach((period) => {
    const row = [period];

    // For each direction
    directions.forEach((dir) => {
      // For each movement
      movements.forEach((move) => {
        // For each vehicle category
        vehicleCategories.forEach((cat) => {
          const value = getAggregatedValue(period, move, dir, cat);
          row.push(value);
        });

        // Movement total for this direction
        let movementTotal = 0;
        vehicleCategories.forEach((cat) => {
          movementTotal += getAggregatedValue(period, move, dir, cat);
        });
        row.push(movementTotal);
      });
    });

    summaryTableData.push(row);
  });

  // Grand total row
  const summaryGrandTotalRow = ['GRAND TOTAL'];

  directions.forEach((dir) => {
    movements.forEach((move) => {
      vehicleCategories.forEach((cat) => {
        let grandTotal = 0;
        timePeriods.forEach((period) => {
          grandTotal += getAggregatedValue(period, move, dir, cat);
        });
        summaryGrandTotalRow.push(grandTotal);
      });

      // Movement grand total for this direction
      let movementGrandTotal = 0;
      vehicleCategories.forEach((cat) => {
        timePeriods.forEach((period) => {
          movementGrandTotal += getAggregatedValue(period, move, dir, cat);
        });
      });
      summaryGrandTotalRow.push(movementGrandTotal);
    });
  });

  summaryTableData.push(summaryGrandTotalRow);

  const wsSummary = wb.addWorksheet('Summary');
  summaryTableData.forEach(row => wsSummary.addRow(row));

  // Save file
  const fileName = `Traffic_Matrix_Filter_Simpang${simpangId}_${dateInput}_${interval}.xlsx`;
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};
