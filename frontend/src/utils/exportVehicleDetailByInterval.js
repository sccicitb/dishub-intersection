import ExcelJS from 'exceljs';

export const exportVehicleDetailByInterval = async (data, simpangId, dateInput, interval, simpangName = '') => {
  if (!data || !data.slots) {
    alert('No data to export');
    return;
  }

  const wb = new ExcelJS.Workbook();

  // Vehicle category mapping
  const vehicleCategoryMap = {
    'SM': 'Sepeda Motor',
    'MP': 'Mobil Penumpang',
    'AUP': 'Angkutan Umum',
    'TR': 'Truk Ringan',
    'BS': 'Bus Sedang',
    'TS': 'Truk Sedang',
    'TB': 'Truk Berat',
    'BB': 'Bus Besar',
    'GANDENG': 'Gandeng/Semitrailer',
    'KTB': 'Kendaraan Tidak Bermotor',
  };

  const directions = ['north', 'south', 'east', 'west'];
  const directionNames = { 'north': 'Utara', 'south': 'Selatan', 'east': 'Timur', 'west': 'Barat' };
  const movements = ['IN', 'OUT'];
  const timeSlots = Object.keys(data.slots || {}).sort();

  // Helper function to get time period name
  const getTimePeriodName = (timeSlot) => {
    if (data.slots[timeSlot]?.time_period) {
      return data.slots[timeSlot].time_period;
    }
    return '';
  };

  // Get vehicle categories from first slot
  let vehicleCategories = Object.keys(vehicleCategoryMap);
  if (timeSlots.length > 0 && data.slots[timeSlots[0]]?.data?.north?.IN) {
    vehicleCategories = Object.keys(data.slots[timeSlots[0]].data.north.IN).filter(key => key !== 'total');
  }

  // Helper function to get slot value
  const getSlotValue = (timeSlot, direction, movement, category) => {
    return data.slots[timeSlot]?.data?.[direction]?.[movement]?.[category] || 0;
  };

  // ===== SHEET 1: INFO =====
  const infoData = [
    ['Vehicle Detail by Interval'],
    ['Simpang ID', data.simpang_id],
    ['Nama Simpang', simpangName || data.simpang_id],
    ['Tanggal', data.date],
    ['Interval', interval],
    ['Tanggal Export', new Date().toLocaleString('id-ID')],
  ];
  const wsInfo = wb.addWorksheet('Info');
  infoData.forEach(row => wsInfo.addRow(row));

  // ===== SHEET 2: DETAIL TABLE =====
  const detailedTableData = [];

  // Headers
  const headerRow1 = ['Periode', 'Jam', 'Jenis Kendaraan'];
  directions.forEach((direction) => {
    headerRow1.push(directionNames[direction]);
    for (let i = 1; i < movements.length; i++) {
      headerRow1.push('');
    }
    headerRow1.push(`${directionNames[direction]} Total`);
  });
  headerRow1.push('GRAND TOTAL');
  detailedTableData.push(headerRow1);

  // Movement sub-headers
  const headerRow2 = ['', '', ''];
  directions.forEach(() => {
    movements.forEach((movement) => {
      headerRow2.push(movement);
    });
    headerRow2.push('Total');
  });
  detailedTableData.push(headerRow2);

  // Data rows
  timeSlots.forEach((timeSlot, timeIdx) => {
    const periodName = getTimePeriodName(timeSlot);
    vehicleCategories.forEach((category, catIdx) => {
      const row = [];

      if (catIdx === 0) {
        row.push(periodName);
        row.push(timeSlot);
      } else {
        row.push('');
        row.push('');
      }

      row.push(vehicleCategoryMap[category] || category);

      let rowTotal = 0;
      directions.forEach((direction) => {
        movements.forEach((movement) => {
          const value = getSlotValue(timeSlot, direction, movement, category);
          row.push(value);
          rowTotal += value;
        });

        let directionTotal = 0;
        movements.forEach((mov) => {
          directionTotal += getSlotValue(timeSlot, direction, mov, category);
        });
        row.push(directionTotal);
      });

      row.push(rowTotal);
      detailedTableData.push(row);
    });

    // Subtotal row per time slot
    const subtotalRow = ['', `Subtotal ${timeSlot}`, ''];
    let slotGrandTotal = 0;

    directions.forEach((direction) => {
      movements.forEach((movement) => {
        let subtotal = 0;
        vehicleCategories.forEach((category) => {
          subtotal += getSlotValue(timeSlot, direction, movement, category);
          slotGrandTotal += getSlotValue(timeSlot, direction, movement, category);
        });
        subtotalRow.push(subtotal);
      });

      let directionSubtotal = 0;
      movements.forEach((mov) => {
        vehicleCategories.forEach((category) => {
          directionSubtotal += getSlotValue(timeSlot, direction, mov, category);
        });
      });
      subtotalRow.push(directionSubtotal);
    });

    subtotalRow.push(slotGrandTotal);
    detailedTableData.push(subtotalRow);
  });

  // Grand total row
  const grandTotalRow = ['', '', 'GRAND TOTAL'];
  let globalGrandTotal = 0;

  directions.forEach((direction) => {
    movements.forEach((movement) => {
      let grandTotal = 0;
      timeSlots.forEach((timeSlot) => {
        vehicleCategories.forEach((category) => {
          grandTotal += getSlotValue(timeSlot, direction, movement, category);
          globalGrandTotal += getSlotValue(timeSlot, direction, movement, category);
        });
      });
      grandTotalRow.push(grandTotal);
    });

    let directionGrandTotal = 0;
    movements.forEach((mov) => {
      timeSlots.forEach((timeSlot) => {
        vehicleCategories.forEach((category) => {
          directionGrandTotal += getSlotValue(timeSlot, direction, mov, category);
        });
      });
    });
    grandTotalRow.push(directionGrandTotal);
  });

  grandTotalRow.push(globalGrandTotal);
  detailedTableData.push(grandTotalRow);

  const wsDetailed = wb.addWorksheet('Detail');
  detailedTableData.forEach(row => wsDetailed.addRow(row));

  // Save file
  const fileName = `Vehicle_Detail_Simpang${simpangId}_${dateInput}_${interval}.xlsx`;
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};
