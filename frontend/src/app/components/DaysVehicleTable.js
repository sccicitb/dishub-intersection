import React, { useState, useEffect } from 'react';
import monthlyData from '@/app/data/DataTableDaysMonth.json';

const DaysVehicleTable = () => {
  const initialMonth = monthlyData.dailyData?.[0]?.month || '';
  const initialStartDate = monthlyData.dailyData?.[0]?.days?.[0]?.date || '';
  const initialEndDate = monthlyData.dailyData?.[0]?.days?.slice(-1)[0]?.date || '';

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const [isDateRangeMode, setIsDateRangeMode] = useState(false);
  const [vehicleData, setVehicleData] = useState({
    dailyData: [],
    lhrkData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real application, you might fetch this data from an API
    // For now, we'll use the static JSON data
    setVehicleData(monthlyData);
    
    // Set the first month as default if available
    if (monthlyData.dailyData && monthlyData.dailyData.length > 0) {
      setSelectedMonth(monthlyData.dailyData[0].month);
      
      // Set default date range to the first month's full range
      if (monthlyData.dailyData[0].days && monthlyData.dailyData[0].days.length > 0) {
        const days = monthlyData.dailyData[0].days;
        setStartDate(days[0].date);
        setEndDate(days[days.length - 1].date);
      }
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="bg-red-200 border border-red-400 text-red-700 px-4 py-3 rounded">
      {error}
    </div>;
  }

  // Handle month selection
  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    
    // When month changes, update date range to cover the full month
    const monthData = vehicleData.dailyData?.find(month => month.month === newMonth);
    if (monthData && monthData.days && monthData.days.length > 0) {
      setStartDate(monthData.days[0].date);
      setEndDate(monthData.days[monthData.days.length - 1].date);
    }
  };

  // Handle date range change
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  // Toggle between month and date range selection
  const toggleDateRangeMode = () => {
    setIsDateRangeMode(!isDateRangeMode);
  };

  // Get all days data from all months
  const getAllDaysData = () => {
    return vehicleData.dailyData?.flatMap(month => month.days) || [];
  };

  // Get days data based on selection (month or date range)
  const getDaysData = () => {
    if (isDateRangeMode && startDate && endDate) {
      const allDays = getAllDaysData();
      return allDays.filter(day => {
        const date = new Date(day.date);
        return date >= new Date(startDate) && date <= new Date(endDate);
      }).sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
      const monthData = vehicleData.dailyData?.find(month => month.month === selectedMonth);
      return monthData ? monthData.days : [];
    }
  };

  // Format date to display nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      weekday: 'long'
    });
  };

  const formatDateNoDays = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'numeric', 
      year: 'numeric',
    });
  };

  // Check if a date is a weekend (Saturday or Sunday)
  const isWeekend = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  // Get workday indicator (K for workday, P for weekend/holiday)
  const getWorkdayIndicator = (dateString) => {
    return isWeekend(dateString) ? 'Akhir Pekan' : 'Hari Kerja';
  };
  
  // Generate rows for daily data
  const generateDailyRows = () => {
    const daysData = getDaysData();
    let rows = [];

    
    if (!daysData || daysData.length === 0) {
      return (
        <tr>
          <td colSpan="13" className="text-center py-4 border border-base-300">
            Tidak ada data harian tersedia untuk periode yang dipilih
          </td>
        </tr>
      );
    }

    daysData.map((day, index) => {
      rows.push(
      <tr key={`day-${index}`} className={index % 2 === 0 ? 'bg-base-200' : 'bg-base-100'}>
        <td className="border border-base-300 text-sm text-center">{getWorkdayIndicator(day.date)}</td>
        <td className="border border-base-300 text-sm text-center">{formatDateNoDays(day.date)}</td>
        <td className="border border-base-300 text-sm text-center">{day.data?.sm || 0}</td>
        <td className="border border-base-300 text-sm text-center">{day.data?.mp || 0}</td>
        <td className="border border-base-300 text-sm text-center">{day.data?.aup || 0}</td>
        <td className="border border-base-300 text-sm text-center">{day.data?.trMp || 0}</td>
        <td className="border border-base-300 text-sm text-center">{day.data?.bs || 0}</td>
        <td className="border border-base-300 text-sm text-center">{day.data?.ts || 0}</td>
        <td className="border border-base-300 text-sm text-center">{day.data?.bb || 0}</td>
        <td className="border border-base-300 text-sm text-center">{day.data?.tb || 0}</td>
        <td className="border border-base-300 text-sm text-center">{day.data?.gandengSemitrailer || 0}</td>
        <td className="border border-base-300 text-sm text-center">{day.data?.ktb || 0}</td>
        <td className="border border-base-300 text-sm text-center">{day.data?.total || 0}</td>
      </tr>
      )
    });

    rows.push(
      <tr key="divider-row">
        <td colSpan={13} className="border border-base-300 font-semibold text-sm text-center bg-base-200">
          Lalu Lintas Harian Rata-Rata (kend/hari)
        </td>
      </tr>
    );

    return rows;
  };

  // Calculate daily totals for the selected period
  const calculateDailyTotal = () => {
    const daysData = getDaysData();
    const totals = {
      sm: 0, mp: 0, aup: 0, trMp: 0, bs: 0, ts: 0, bb: 0, tb: 0, gandengSemitrailer: 0, ktb: 0, total: 0
    };

    if (daysData && daysData.length > 0) {
      daysData.forEach(day => {
        Object.keys(totals).forEach(key => {
          totals[key] += day.data?.[key] || 0;
        });
      });
    }

    return totals;
  };

  // Calculate daily average for the selected period
  const calculateDailyAverage = () => {
    const daysData = getDaysData();
    const totals = calculateDailyTotal();
    const daysCount = daysData.length || 1;
    
    // Create an object with the averages for each vehicle type
    const averages = {};
    Object.entries(totals).forEach(([key, value]) => {
      averages[key] = Math.round(value / daysCount);
    });
    
    return averages;
  };

  // Get min and max dates from all available data for the date inputs
  const getDateBoundaries = () => {
    const allDays = getAllDaysData();
    if (allDays.length === 0) return { min: '', max: '' };
    
    const sortedDates = [...allDays].sort((a, b) => new Date(a.date) - new Date(b.date));
    return {
      min: sortedDates[0].date,
      max: sortedDates[sortedDates.length - 1].date
    };
  };

  const dateBoundaries = getDateBoundaries();
  
  return (
    <div className="mx-auto p-4">
      <div className="items-center flex mb-4 flex-wrap">
        <div className="flex items-center mr-4 gap-5">
          <button 
            onClick={toggleDateRangeMode} 
            className={`btn tab ${isDateRangeMode ? 'tab-active bg-[#7585C1]/80 border-none text-white ' : ''}`}
            >
            Berdasarkan Bulan
          </button>
          <button 
            onClick={toggleDateRangeMode} 
            className={`btn tab ${!isDateRangeMode ? 'tab-active bg-[#7585C1]/80 border-none text-white ' : ''}`}
          >
            Berdasarkan Rentang Tanggal
          </button>
        </div>
        
        {isDateRangeMode ? (
          <div className="flex flex-wrap items-center not-lg:my-2 gap-4">
            <div className="flex gap-2 items-center">
              <label htmlFor="start-date" className="mr-2 font-medium">Dari:</label>
              <input 
                type="date" 
                id="start-date"
                value={startDate}
                onChange={handleStartDateChange}
                max={endDate}
                className="px-5 py-1 input input-md"
              />
            </div>
            <div className="flex gap-2 items-center">
              <label htmlFor="end-date" className="mr-2 font-medium">Sampai:</label>
              <input 
                type="date" 
                id="end-date"
                value={endDate}
                onChange={handleEndDateChange}
                min={startDate}
                className="px-5 py-1 input input-md"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center ">
            <label htmlFor="month-select" className="mr-2 font-medium text-nowrap ">Pilih Bulan:</label>
            <select 
              id="month-select" 
              value={selectedMonth || ''}
              onChange={handleMonthChange}
              className="select select-md"
            >
              {vehicleData.dailyData?.map((month, index) => (
                <option key={index} value={month.month}>
                  {month.month}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse border border-base-300 w-full">
          <thead>
            <tr className="bg-base-300">
              <th rowSpan={3} className="border border-base-100 text-sm font-medium">
                Pekan
              </th>
              <th rowSpan={3} className="border border-base-100 text-sm font-medium">
                Tanggal
              </th>
              <th colSpan={9} className="border border-base-100 text-sm font-medium text-center">
                Kendaraan Bermotor
              </th>
              <th rowSpan={1} className="border border-base-100 text-sm font-medium text-center">
                Kend. Tak<br />Bermotor
              </th>
              <th rowSpan={3} className="border border-base-100 text-sm font-medium text-center">
                Total<br />Kendaraan
              </th>
            </tr>
            <tr className="bg-base-300">
              <th rowSpan={2} className="border border-base-100 text-sm font-medium text-center">SM</th>
              <th colSpan={3} className="border border-base-100 text-sm font-medium text-center">MP</th>
              <th colSpan={2} className="border border-base-100 text-sm font-medium text-center">KS</th>
              <th rowSpan={2} className="border border-base-100 text-sm font-medium text-center">BB</th>
              <th colSpan={2} className="border border-base-100 text-sm font-medium text-center">TB</th>
              <th rowSpan={2} className="border border-base-100 text-sm font-medium">KTB</th>
            </tr>
            <tr className="bg-base-300">
              <th className="border border-base-100 text-sm font-medium">MP</th>
              <th className="border border-base-100 text-sm font-medium">AUP</th>
              <th className="border border-base-100 text-sm font-medium">TR</th>
              <th className="border border-base-100 text-sm font-medium">BS</th>
              <th className="border border-base-100 text-sm font-medium">TS</th>
              <th className="border border-base-100 text-sm font-medium">TB</th>
              <th className="border border-base-100 text-sm font-medium">Gandeng /<br />Semitrailer</th>
            </tr>
          </thead>
          <tbody>
            {generateDailyRows()}
            
            {/* Daily average row */}
            {(selectedMonth || (isDateRangeMode && startDate && endDate)) && (
              <tr className="bg-base-200 font-medium">
                <td className="border border-base-300 text-sm text-center" colSpan={2}>LHR</td>
                {Object.entries(calculateDailyAverage()).map(([key, value], idx) => (
                  <td key={idx} className="border border-base-300 text-sm text-center">
                    {value}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Display information about the selected period */}
      {getDaysData().length > 0 && (
        <div className="mt-4 text-sm">
          <p>
            Periode data: {formatDateNoDays(getDaysData()[0].date)} - {formatDateNoDays(getDaysData()[getDaysData().length - 1].date)}
          </p>
          <p>Jumlah hari: {getDaysData().length}</p>
        </div>
      )}
    </div>
  );
};

export default DaysVehicleTable;