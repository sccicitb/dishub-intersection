"use client";

import { useState, useEffect, useCallback } from "react";

const FILTERS = [
  { key: 'day', label: 'Hari Ini' },
  { key: 'week', label: 'Minggu Ini' },
  { key: 'month', label: 'Bulan Ini' },
  { key: 'quarter', label: 'Quarter Ini' },
  { key: 'year', label: 'Tahun Ini' },
];

function computeDateRange(filterType, customStart, customEnd) {
  const toDateTimeString = (d, isEnd = false) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return isEnd
      ? `${year}-${month}-${day} 23:59:59`
      : `${year}-${month}-${day} 00:00:00`;
  };

  if (filterType === 'customrange') {
    // customStart/customEnd come from <input type="date"> → YYYY-MM-DD, append times
    return {
      startDate: customStart ? `${customStart} 00:00:00` : customStart,
      endDate: customEnd ? `${customEnd} 23:59:59` : customEnd,
    };
  }

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (filterType === 'week') {
    const currentDay = now.getDay();
    start.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  } else if (filterType === 'month') {
    start.setDate(1);
  } else if (filterType === 'quarter') {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    start.setMonth(quarterStartMonth);
    start.setDate(1);
  } else if (filterType === 'year') {
    start.setMonth(0);
    start.setDate(1);
  }
  // 'day': start === end === today

  return { startDate: toDateTimeString(start, false), endDate: toDateTimeString(end, true) };
}

function getPeriodDisplayText(filter) {
  const now = new Date();
  const options = { timeZone: 'Asia/Jakarta' };

  switch (filter) {
    case 'day':
      return now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', ...options });

    case 'week': {
      const currentDay = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const mondayStr = monday.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', ...options });
      const sundayStr = sunday.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', ...options });
      return `${mondayStr} - ${sundayStr}`;
    }

    case 'month':
      return now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric', ...options });

    case 'quarter': {
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      const quarterMonths = { 1: 'Januari - Maret', 2: 'April - Juni', 3: 'Juli - September', 4: 'Oktober - Desember' };
      return `Q${quarter} ${quarterMonths[quarter]} ${now.getFullYear()}`;
    }

    case 'year':
      return now.getFullYear().toString();

    default:
      return '';
  }
}

export default function FilterBar({ onChange }) {
  const [activeFilter, setActiveFilter] = useState('day');
  const [customRangeStart, setCustomRangeStart] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  });
  const [customRangeEnd, setCustomRangeEnd] = useState(() => new Date().toISOString().split('T')[0]);

  const notify = useCallback((filter, start, end) => {
    const { startDate, endDate } = computeDateRange(filter, start, end);
    onChange?.({ activeFilter: filter, startDate, endDate });
  }, [onChange]);

  // Notify parent once on mount with the default 'day' range
  useEffect(() => {
    notify('day', customRangeStart, customRangeEnd);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notify parent when custom date inputs change (only if customrange is active)
  useEffect(() => {
    if (activeFilter === 'customrange') {
      notify('customrange', customRangeStart, customRangeEnd);
    }
  }, [activeFilter, customRangeStart, customRangeEnd, notify]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    if (filter !== 'customrange') {
      notify(filter, customRangeStart, customRangeEnd);
    }
  };

  const periodDisplayText = activeFilter !== 'customrange' ? getPeriodDisplayText(activeFilter) : '';

  return (
    <>
      {FILTERS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => handleFilterChange(key)}
          className={`px-3 py-1.5 rounded-md ${
            activeFilter === key ? 'bg-blue-950 text-white' : 'bg-base-300 hover:bg-blue-200'
          }`}
        >
          {label}
        </button>
      ))}

      {/* Custom Range button */}
      <button
        onClick={() => setActiveFilter('customrange')}
        className={`px-3 py-1.5 rounded-md ${
          activeFilter === 'customrange' ? 'bg-blue-950 text-white' : 'bg-base-300 hover:bg-blue-200'
        }`}
      >
        Custom Range
      </button>

      {/* Custom date inputs — visible only when customrange is active */}
      {activeFilter === 'customrange' && (
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={customRangeStart}
            onChange={(e) => setCustomRangeStart(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <span className="text-gray-500">hingga</span>
          <input
            type="date"
            value={customRangeEnd}
            onChange={(e) => setCustomRangeEnd(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      )}

      {/* Period label */}
      {periodDisplayText && (
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap">
          Periode: {periodDisplayText}
        </div>
      )}
    </>
  );
}
