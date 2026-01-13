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

  // ===== SHEET 2: DETAILED TABLE (Per Time Slot) =====
  const detailedTableData = [];

  // Headers
  const headerRow1 = ['Periode', 'Jam', 'Status', 'Jenis Kendaraan'];
  movements.forEach((movement) => {
    headerRow1.push(movement);
    for (let i = 1; i < directions.length; i++) {
      headerRow1.push('');
    }
    headerRow1.push(`${movement} Total`);
  });
  headerRow1.push('GRAND TOTAL');
  detailedTableData.push(headerRow1);

  // Direction sub-headers
  const headerRow2 = ['', '', '', ''];
  movements.forEach(() => {
    directions.forEach((dir) => {
      const dirAbbrev = dir === 'barat' ? 'B' : dir === 'selatan' ? 'S' : dir === 'timur' ? 'T' : 'U';
      headerRow2.push(dirAbbrev);
    });
    headerRow2.push('Total');
  });
  detailedTableData.push(headerRow2);

  // Data rows
  timeSlots.forEach((timeSlot, timeIdx) => {
    const periodName = getTimePeriodName(timeSlot);
    const status = getStatusForTimeSlot(timeSlot);
    vehicleCategories.forEach((category, catIdx) => {
      const row = [];
      
      // Add period and time slot info only for first category
      if (catIdx === 0) {
        row.push(periodName);
        row.push(timeSlot);
        row.push(status);
      } else {
        row.push('');
        row.push('');
        row.push('');
      }
      
      row.push(category);

      let rowTotal = 0;
      movements.forEach((movement) => {
        directions.forEach((direction) => {
          const value = data.slots[timeSlot]?.[movement]?.[direction]?.[category] || 0;
          row.push(value);
          rowTotal += value;
        });
        
        // Movement total
        let movementTotal = 0;
        directions.forEach((dir) => {
          movementTotal += data.slots[timeSlot]?.[movement]?.[dir]?.[category] || 0;
        });
        row.push(movementTotal);
      });

      row.push(rowTotal);
      detailedTableData.push(row);
    });

    // Subtotal row per time slot
    const subtotalRow = ['', `Subtotal ${timeSlot}`, '', ''];
    let slotGrandTotal = 0;
    
    movements.forEach((movement) => {
      directions.forEach((direction) => {
        let subtotal = 0;
        vehicleCategories.forEach((category) => {
          subtotal += data.slots[timeSlot]?.[movement]?.[direction]?.[category] || 0;
          slotGrandTotal += data.slots[timeSlot]?.[movement]?.[direction]?.[category] || 0;
        });
        subtotalRow.push(subtotal);
      });

      let movementSubtotal = 0;
      directions.forEach((dir) => {
        vehicleCategories.forEach((category) => {
          movementSubtotal += data.slots[timeSlot]?.[movement]?.[dir]?.[category] || 0;
        });
      });
      subtotalRow.push(movementSubtotal);
    });

    subtotalRow.push(slotGrandTotal);
    detailedTableData.push(subtotalRow);
  });

  // Grand total row
  const grandTotalRow = ['', '', '', 'GRAND TOTAL'];
  let globalGrandTotal = 0;

  movements.forEach((movement) => {
    directions.forEach((direction) => {
      let grandTotal = 0;
      timeSlots.forEach((timeSlot) => {
        vehicleCategories.forEach((category) => {
          grandTotal += data.slots[timeSlot]?.[movement]?.[direction]?.[category] || 0;
          globalGrandTotal += data.slots[timeSlot]?.[movement]?.[direction]?.[category] || 0;
        });
      });
      grandTotalRow.push(grandTotal);
    });

    let movementGrandTotal = 0;
    directions.forEach((dir) => {
      timeSlots.forEach((timeSlot) => {
        vehicleCategories.forEach((category) => {
          movementGrandTotal += data.slots[timeSlot]?.[movement]?.[dir]?.[category] || 0;
        });
      });
    });
    grandTotalRow.push(movementGrandTotal);
  });

  grandTotalRow.push(globalGrandTotal);
  detailedTableData.push(grandTotalRow);

  const wsDetailed = wb.addWorksheet('Detailed');
  detailedTableData.forEach(row => wsDetailed.addRow(row));

  // ===== SHEET 3: SUMMARY (Per Time Period) =====
  const summaryTableData = [];

  // Headers
  const summaryHeaderRow1 = ['Periode', 'Jenis Kendaraan'];
  movements.forEach((movement) => {
    summaryHeaderRow1.push(movement);
    for (let i = 1; i < directions.length; i++) {
      summaryHeaderRow1.push('');
    }
    summaryHeaderRow1.push(`${movement} Total`);
  });
  summaryHeaderRow1.push('PERIOD TOTAL');
  summaryTableData.push(summaryHeaderRow1);

  // Direction sub-headers
  const summaryHeaderRow2 = ['', ''];
  movements.forEach(() => {
    directions.forEach((dir) => {
      const dirAbbrev = dir === 'barat' ? 'B' : dir === 'selatan' ? 'S' : dir === 'timur' ? 'T' : 'U';
      summaryHeaderRow2.push(dirAbbrev);
    });
    summaryHeaderRow2.push('Total');
  });
  summaryTableData.push(summaryHeaderRow2);

  // Data rows
  timePeriods.forEach((period, periodIdx) => {
    vehicleCategories.forEach((category, catIdx) => {
      const row = [];

      if (catIdx === 0) {
        row.push(period);
        row.push(`${period} ${data.timePeriods[period]}`);
      } else {
        row.push('');
        row.push('');
      }

      row.push(category);

      let periodRowTotal = 0;
      movements.forEach((movement) => {
        directions.forEach((direction) => {
          const value = getAggregatedValue(period, movement, direction, category);
          row.push(value);
          periodRowTotal += value;
        });

        let movementPeriodTotal = 0;
        directions.forEach((dir) => {
          movementPeriodTotal += getAggregatedValue(period, movement, dir, category);
        });
        row.push(movementPeriodTotal);
      });

      row.push(periodRowTotal);
      summaryTableData.push(row);
    });

    // Subtotal row per period
    const periodSubtotalRow = ['', `Subtotal ${period}`, ''];
    let periodGrandTotal = 0;

    movements.forEach((movement) => {
      directions.forEach((direction) => {
        let subtotal = 0;
        vehicleCategories.forEach((category) => {
          subtotal += getAggregatedValue(period, movement, direction, category);
          periodGrandTotal += getAggregatedValue(period, movement, direction, category);
        });
        periodSubtotalRow.push(subtotal);
      });

      let movementSubtotal = 0;
      directions.forEach((dir) => {
        vehicleCategories.forEach((category) => {
          movementSubtotal += getAggregatedValue(period, movement, dir, category);
        });
      });
      periodSubtotalRow.push(movementSubtotal);
    });

    periodSubtotalRow.push(periodGrandTotal);
    summaryTableData.push(periodSubtotalRow);
  });

  // Grand total row
  const summaryGrandTotalRow = ['', 'GRAND TOTAL', ''];
  let summaryGlobalGrandTotal = 0;

  movements.forEach((movement) => {
    directions.forEach((direction) => {
      let grandTotal = 0;
      timePeriods.forEach((period) => {
        vehicleCategories.forEach((category) => {
          grandTotal += getAggregatedValue(period, movement, direction, category);
          summaryGlobalGrandTotal += getAggregatedValue(period, movement, direction, category);
        });
      });
      summaryGrandTotalRow.push(grandTotal);
    });

    let movementGrandTotal = 0;
    directions.forEach((dir) => {
      timePeriods.forEach((period) => {
        vehicleCategories.forEach((category) => {
          movementGrandTotal += getAggregatedValue(period, movement, dir, category);
        });
      });
    });
    summaryGrandTotalRow.push(movementGrandTotal);
  });

  summaryGrandTotalRow.push(summaryGlobalGrandTotal);
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
