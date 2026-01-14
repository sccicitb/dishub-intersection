"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/app/context/authContext";
import dataTable from '@/data/DataTableHour.json';
import { ExportButton } from './exportExcel';

const HourVehicleTable = ({ statusHour, vehicleData: dataVehicle, classification, customSize, pdf, isEditor, exportExcel = false }) => {
  const { isAdmin } = useAuth();
  const pdfTableStyle = pdf ? {
    borderCollapse: 'collapse',
    width: '100%',
    color: '#000000',
    fontSize: customSize ? '10px' : '12px',
    fontFamily: 'Arial, sans-serif'
  } : {};

  const pdfCellStyle = pdf ? {
    textAlign: 'center',
    verticalAlign: 'middle',
    padding: '4px 8px',
    border: '1px solid #d1d5db',
    color: '#000000',
    backgroundColor: '#ffffff'
  } : {};

  const pdfHeaderStyle = pdf ? {
    ...pdfCellStyle,
    backgroundColor: '#e5e7eb',
    fontWeight: 'bold',
    fontSize: customSize ? '9px' : '11px'
  } : {};

  const pdfRowEvenStyle = pdf ? {
    backgroundColor: '#f9fafb'
  } : {};

  const pdfRowOddStyle = pdf ? {
    backgroundColor: '#ffffff'
  } : {};

  const pdfDividerStyle = pdf ? {
    ...pdfCellStyle,
    backgroundColor: '#e5e7eb',
    fontWeight: 'bold',
    fontSize: customSize ? '9px' : '11px'
  } : {};

  const classificationOptions = ['PKJI_2023_Luar_Kota', 'PKJI_2023_Dalam_Kota', 'Tipikal'];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formatClassification, setFormatClassification] = useState('');
  const [vehicleData, setVehicleData] = useState([]);

  useEffect(() => {
    // Ensure dataVehicle is an array before setting it
    if (dataVehicle && Array.isArray(dataVehicle)) {
      setVehicleData(dataVehicle);
    } else if (dataVehicle) {
      // If dataVehicle exists but is not an array, wrap it in an array or handle accordingly
      console.warn('dataVehicle is not an array:', dataVehicle);
      setVehicleData(Array.isArray(dataVehicle) ? dataVehicle : []);
    } else {
      setVehicleData([]);
    }
  }, [dataVehicle]);

  // Move useEffect to the top level - this should run on every render
  useEffect(() => {
    const format = classification.replace(/\s+/g, '_');
    setFormatClassification(format);
  }, [classification]);

  // Dynamic text size based on customSize prop
  const textSize = customSize ? 'text-xs' : 'text-sm';

  const generateRows = () => {
    if (!vehicleData || !Array.isArray(vehicleData) || vehicleData.length === 0) {
      return null;
    }
    let rows = [];
    let rowCount = 0;

    vehicleData?.forEach((periodData, periodIndex) => {
      periodData.timeSlots.forEach((slot, timeIndex) => {
        const rowStyle = pdf ? (rowCount % 2 === 0 ? pdfRowEvenStyle : pdfRowOddStyle) : {};

        rows.push(
          <tr
            key={`row-${rowCount}`}
            className={pdf ? '' : (rowCount % 2 === 0 ? 'bg-base-200' : 'bg-base-100')}
            style={rowStyle}
          >
            {timeIndex === 0 && !pdf ? (
              <td
                rowSpan={periodData.timeSlots.length}
                className={pdf ? '' : `border-r border-t border-b border-base-300 px-2 py-1 ${textSize} font-medium text-center align-middle`}
                style={pdf ? { ...pdfCellStyle, fontWeight: 'bold' } : {}}
              >
                {periodData.period}
              </td>
            ) : null}

            {pdf && (
              <td
                className={pdf ? '' : `border-r border-t border-b border-base-300 px-2 py-1 ${textSize} font-medium text-center align-middle`}
                style={pdf ? { ...pdfCellStyle, fontWeight: 'bold' } : {}}
              >
                {pdf ? timeIndex === 0 ? periodData.period : '' : timeIndex === 0 ? periodData.period : null}
              </td>
            )}

            {statusHour === true ? (
              <td
                className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center ${slot.status === 1 ? 'bg-green-500' : 'bg-red-500'}`}
                style={pdf ? { ...pdfCellStyle, backgroundColor: slot.status === 1 ? '#10b981' : '#ef4444' } : {}}
              >
                {''}
              </td>
            ) : null}
            {/* Time slot */}
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center whitespace-nowrap`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.time}
            </td>

            {/* Vehicle data columns */}
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.sm || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.mp || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.aup || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.tr || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.bs || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.ts || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.bb || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.tb || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.gandengSemitrailer || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.ktb || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.total || 0}
            </td>
          </tr>
        );

        rowCount++;
      });

      // Add dividing row after the third period (Siang)
      if (periodIndex === 2) {
        rows.push(
          <tr key={`divider-${periodIndex}`}>
            <td
              colSpan={15}
              className={pdf ? '' : `border border-base-300 font-semibold px-2 py-1 ${textSize} text-center bg-base-200`}
              style={pdf ? pdfDividerStyle : {}}
            >
              Lalu Lintas Jam-Jaman Rata-Rata 4 x VR (omit teringgi) (kend/jam)
            </td>
          </tr>
        );
      }
    });

    return rows;
  };

  const generateRowsLuarKota = () => {
    let rows = [];
    let rowCount = 0;

    vehicleData.forEach((periodData, periodIndex) => {
      periodData.timeSlots.forEach((slot, timeIndex) => {
        const rowStyle = pdf ? (rowCount % 2 === 0 ? pdfRowEvenStyle : pdfRowOddStyle) : {};

        rows.push(
          <tr
            key={`row-${rowCount}`}
            className={pdf ? '' : (rowCount % 2 === 0 ? 'bg-base-200' : 'bg-base-100')}
            style={rowStyle}
          >
            {timeIndex === 0 && !pdf ? (
              <td
                rowSpan={periodData.timeSlots.length}
                className={pdf ? '' : `border-r border-t border-b border-base-300 px-2 py-1 ${textSize} font-medium text-center align-middle`}
                style={pdf ? { ...pdfCellStyle, fontWeight: 'bold' } : {}}
              >
                {periodData.period}
              </td>
            ) : null}

            {pdf && (
              <td
                className={pdf ? '' : `border-r border-t border-b border-base-300 px-2 py-1 ${textSize} font-medium text-center align-middle`}
                style={pdf ? { ...pdfCellStyle, fontWeight: 'bold' } : {}}
              >
                {pdf ? timeIndex === 0 ? periodData.period : '' : timeIndex === 0 ? periodData.period : null}
              </td>
            )}

            {statusHour === true ? (
              <td
                className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center ${slot.status === 1 ? 'bg-green-500' : 'bg-red-500'}`}
                style={pdf ? { ...pdfCellStyle, backgroundColor: slot.status === 1 ? '#10b981' : '#ef4444' } : {}}
              >
                {''}
              </td>
            ) : null}
            {/* Time slot */}
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center whitespace-nowrap`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.time}
            </td>

            {/* Vehicle data columns */}
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.sm || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.mp || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.aup || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.tr || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.bs || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.ts || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.bb || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.tb || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.gandengSemitrailer || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.ktb || 0}
            </td>
          </tr>
        );

        rowCount++;
      });

      // Add dividing row after the third period (Siang)
      if (periodIndex === 2) {
        rows.push(
          <tr key={`divider-${periodIndex}`}>
            <td
              colSpan={14}
              className={pdf ? '' : `border border-base-300 font-semibold px-2 py-1 ${textSize} text-center bg-base-200`}
              style={pdf ? pdfDividerStyle : {}}
            >
              Lalu Lintas Jam-Jaman Rata-Rata 4 x VR (omit teringgi) (kend/jam)
            </td>
          </tr>
        );
      }
    });

    return rows;
  };

  const generateRowsTipikal = () => {
    let rows = [];
    let rowCount = 0;

    vehicleData.forEach((periodData, periodIndex) => {
      periodData.timeSlots.forEach((slot, timeIndex) => {
        const rowStyle = pdf ? (rowCount % 2 === 0 ? pdfRowEvenStyle : pdfRowOddStyle) : {};

        rows.push(
          <tr
            key={`row-${rowCount}`}
            className={pdf ? '' : (rowCount % 2 === 0 ? 'bg-base-200' : 'bg-base-100')}
            style={rowStyle}
          >

            {timeIndex === 0 && !pdf ? (
              <td
                rowSpan={periodData.timeSlots.length}
                className={pdf ? '' : `border-r border-t border-b border-base-300 px-2 py-1 ${textSize} font-medium text-center align-middle`}
                style={pdf ? { ...pdfCellStyle, fontWeight: 'bold' } : {}}
              >
                {periodData.period}
              </td>
            ) : null}

            {pdf && (
              <td
                className={pdf ? '' : `border-r border-t border-b border-base-300 px-2 py-1 ${textSize} font-medium text-center align-middle`}
                style={pdf ? { ...pdfCellStyle, fontWeight: 'bold' } : {}}
              >
                {pdf ? timeIndex === 0 ? periodData.period : '' : timeIndex === 0 ? periodData.period : null}
              </td>
            )}
            {statusHour === true ? (
              <td
                className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center ${slot.status === 1 ? 'bg-green-500' : 'bg-red-500'}`}
                style={pdf ? { ...pdfCellStyle, backgroundColor: slot.status === 1 ? '#10b981' : '#ef4444' } : {}}
              >
                {''}
              </td>
            ) : null}
            {/* Time slot */}
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center whitespace-nowrap`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.time}
            </td>

            {/* Vehicle data columns */}
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.sm || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.mp || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.aup || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.tr || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.bs || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.bb || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.ts || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.tb || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.gandengSemitrailer || 0}
            </td>
            <td
              className={pdf ? '' : `border border-base-300 px-2 py-1 ${textSize} text-center`}
              style={pdf ? pdfCellStyle : {}}
            >
              {slot.data.ktb || 0}
            </td>
          </tr>
        );

        rowCount++;
      });

      // Add dividing row after the third period (Siang)
      if (periodIndex === 2) {
        rows.push(
          <tr key={`divider-${periodIndex}`}>
            <td
              colSpan={13}
              className={pdf ? '' : `border border-base-300 font-semibold px-2 py-1 ${textSize} text-center bg-base-200`}
              style={pdf ? pdfDividerStyle : {}}
            >
              Lalu Lintas Jam-Jaman Rata-Rata 4 x VR (omit teringgi) (kend/jam)
            </td>
          </tr>
        );
      }
    });

    return rows;
  };


  return (
    <div className="mx-auto p-4 overflow-x-auto gap-5 flex flex-col">
      {isEditor && exportExcel && isAdmin && (
        <div className={`w-full gap-5 flex overflow-x-auto join ${pdf ? 'hidden' : ''}`}>
          <ExportButton vehicleData={vehicleData} fileName='Data_Kendaraan_perjam' classification={classification} />
        </div>
      )}
      <table
        className={pdf ? '' : "table-auto border-collapse border border-base-300 w-full text-black"}
        style={pdf ? pdfTableStyle : {}}
      >
        {formatClassification === "PKJI_2023_Luar_Kota" ? (
          <thead>
            <tr className={pdf ? '' : "bg-base-300"}>
              <th
                rowSpan={3}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Periode
              </th>
              {statusHour === true ? (
                <th
                  rowSpan={3}
                  className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                  style={pdf ? pdfHeaderStyle : {}}
                >
                  Status Camera
                </th>
              ) : null}
              <th
                colSpan={1}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Waktu
              </th>
              <th
                colSpan={9}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Kendaraan Bermotor (Lih. kend/jam)
              </th>
              <th
                rowSpan={3}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                KTB
              </th>
              <th
                rowSpan={3}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Total<br />(Lih. kend/jam)
              </th>
            </tr>
            <tr className={pdf ? '' : "bg-base-300"}>
              <th
                rowSpan={2}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Interval<br />
              </th>
              <th
                rowSpan={2}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                SM
              </th>
              <th
                colSpan={3}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                MP
              </th>
              <th
                colSpan={2}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                KS
              </th>
              <th
                rowSpan={2}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                BB
              </th>
              <th
                colSpan={2}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                TB
              </th>
            </tr>
            <tr className={pdf ? '' : "bg-base-300"}>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                MP
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                AUP
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                TR
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                BS
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                TS
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                TB
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Gandeng /<br />Semitrailer
              </th>
            </tr>
          </thead>
        ) : formatClassification === "PKJI_2023_Dalam_Kota" ? (
          <thead>
            <tr className={pdf ? '' : "bg-base-300"}>
              <th
                rowSpan={3}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Periode
              </th>
              {statusHour === true ? (
                <th
                  rowSpan={3}
                  className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                  style={pdf ? pdfHeaderStyle : {}}
                >
                  Status Camera
                </th>
              ) : null}
              <th
                colSpan={1}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Waktu
              </th>
              <th
                colSpan={9}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Kendaraan Bermotor (Lih. kend/jam)
              </th>
              <th
                rowSpan={3}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                KTB
              </th>
            </tr>
            <tr className={pdf ? '' : "bg-base-300"}>
              <th
                rowSpan={2}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Interval<br />
              </th>
              <th
                rowSpan={2}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                SM
              </th>
              <th
                colSpan={3}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                MP
              </th>
              <th
                colSpan={5}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                KS
              </th>
            </tr>
            <tr className={pdf ? '' : "bg-base-300"}>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                MP
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                AUP
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                TR
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                BS
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                TS
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                BB
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                TB
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Gandeng /<br />Semitrailer
              </th>
            </tr>
          </thead>
        ) : (
          <thead>
            <tr className={pdf ? '' : "bg-base-300"}>
              <th
                rowSpan={3}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Periode
              </th>
              {statusHour === true ? (
                <th
                  rowSpan={3}
                  className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                  style={pdf ? pdfHeaderStyle : {}}
                >
                  Status Camera
                </th>
              ) : null}
              <th
                colSpan={1}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Waktu
              </th>
              <th
                colSpan={9}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Kendaraan Bermotor (Lih. kend/jam)
              </th>
              <th
                rowSpan={3}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                KTB
              </th>
            </tr>
            <tr className={pdf ? '' : "bg-base-300"}>
              <th
                rowSpan={2}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Interval<br />
              </th>
              <th
                rowSpan={2}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                SM
              </th>
              <th
                colSpan={3}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                MP
              </th>
              <th
                colSpan={2}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Bus
              </th>
              <th
                colSpan={3}
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Truk
              </th>
            </tr>
            <tr className={pdf ? '' : "bg-base-300"}>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                MP
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                AUP
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                TR
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                BS
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                BB
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                TS
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                TB
              </th>
              <th
                className={pdf ? '' : `border border-base-100 px-2 py-1 ${textSize} font-medium`}
                style={pdf ? pdfHeaderStyle : {}}
              >
                Gandeng / <br />Semitrailer
              </th>
            </tr>
          </thead>
        )}
        <tbody>
          {formatClassification === classificationOptions[0] ? generateRows() : formatClassification === classificationOptions[1] ? generateRowsLuarKota() : generateRowsTipikal()}
        </tbody>
      </table>
    </div>
  );
};

export default HourVehicleTable;
