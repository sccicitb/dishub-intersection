// components HourVehicleTable.jsx
import React, { useState, useEffect } from 'react';
import dataTable from '@/data/DataTableHour.json';
import { ExportButton } from './exportExcel';

const HourVehicleTable = ({ statusHour, vehicleData, classification, customSize, pdf }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formatClassification, setFormatClassification] = useState(null);
  const classificationOptions = ['PKJI_2023_Luar_Kota', 'PKJI_2023_Dalam_Kota', 'Tipikal'];

  // Dynamic text size based on customSize prop
  const textSize = customSize ? 'text-xs' : 'text-sm';

  const generateRows = () => {
    let rows = [];
    let rowCount = 0;

    useEffect(() => {
      let format = classification.replace(/\s+/g, '_');
      setFormatClassification(format)
      console.log(format)
    }, [classification])


    vehicleData.forEach((periodData, periodIndex) => {
      periodData.timeSlots.forEach((slot, timeIndex) => {
        rows.push(
          <tr key={`row-${rowCount}`} className={rowCount % 2 === 0 ? 'bg-base-200' : 'bg-base-100'}>
            {/* Period name only on first time slot */}
            {timeIndex === 0 ? (
              <td rowSpan={periodData.timeSlots.length} className={`border-r border-t border-b border-base-300 px-2 py-1 ${textSize} font-medium text-center align-middle`}>
                {periodData.period}
              </td>
            ) : null}
            {statusHour === true ? (
              <td className={`border border-base-300 px-2 py-1 ${textSize} text-center ${slot.status === 1 ? 'bg-green-500' : 'bg-red-500'}`}>{''}</td>
            ) : null}
            {/* Time slot */}
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center whitespace-nowrap`}>
              {slot.time}
            </td>

            {/* Vehicle data columns */}
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.sm || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.mp || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.aup || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.trMp || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.tr || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.bs || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.ts || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.bb || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.tb || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>
              {slot.data.gandengSemitrailer || 0}
            </td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.ktb || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.total || 0}</td>
          </tr>
        );

        rowCount++;
      });

      // Add dividing row after the third period (Siang)
      if (periodIndex === 2) {
        rows.push(
          <tr key={`divider-${periodIndex}`}>
            <td colSpan={14} className={`border border-base-300 font-semibold px-2 py-1 ${textSize} text-center bg-base-200`}>
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

    useEffect(() => {
      let format = classification.replace(/\s+/g, '_');
      setFormatClassification(format)
    }, [classification])

    vehicleData.forEach((periodData, periodIndex) => {
      periodData.timeSlots.forEach((slot, timeIndex) => {
        rows.push(
          <tr key={`row-${rowCount}`} className={rowCount % 2 === 0 ? 'bg-base-200' : 'bg-base-100'}>
            {/* Period name only on first time slot */}
            {timeIndex === 0 ? (
              <td rowSpan={periodData.timeSlots.length} className={`border-r border-t border-b border-base-300 px-2 py-1 ${textSize} font-medium text-center align-middle`}>
                {periodData.period}
              </td>
            ) : null}
            {statusHour === true ? (
              <td className={`border border-base-300 px-2 py-1 ${textSize} text-center ${slot.status === 1 ? 'bg-green-500' : 'bg-red-500'}`}>{''}</td>
            ) : null}
            {/* Time slot */}
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center whitespace-nowrap`}>
              {slot.time}
            </td>

            {/* Vehicle data columns */}
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.sm || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.mp || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.aup || 0}</td>
            {/* <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.trMp || 0}</td> */}
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.tr || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.bs || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.ts || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.bb || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.tb || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>
              {slot.data.gandengSemitrailer || 0}
            </td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.ktb || 0}</td>
            {/* <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.total || 0}</td> */}
          </tr>
        );

        rowCount++;
      });

      // Add dividing row after the third period (Siang)
      if (periodIndex === 2) {
        rows.push(
          <tr key={`divider-${periodIndex}`}>
            <td colSpan={14} className={`border border-base-300 font-semibold px-2 py-1 ${textSize} text-center bg-base-200`}>
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

    useEffect(() => {
      let format = classification.replace(/\s+/g, '_');
      setFormatClassification(format)
    }, [classification])

    vehicleData.forEach((periodData, periodIndex) => {
      periodData.timeSlots.forEach((slot, timeIndex) => {
        rows.push(
          <tr key={`row-${rowCount}`} className={rowCount % 2 === 0 ? 'bg-base-200' : 'bg-base-100'}>
            {/* Period name only on first time slot */}
            {timeIndex === 0 ? (
              <td rowSpan={periodData.timeSlots.length} className={`border-r border-t border-b border-base-300 px-2 py-1 ${textSize} font-medium text-center align-middle`}>
                {periodData.period}
              </td>
            ) : null}
            {statusHour === true ? (
              <td className={`border border-base-300 px-2 py-1 ${textSize} text-center ${slot.status === 1 ? 'bg-green-500' : 'bg-red-500'}`}>{''}</td>
            ) : null}
            {/* Time slot */}
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center whitespace-nowrap`}>
              {slot.time}
            </td>

            {/* Vehicle data columns */}
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.sm || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.mp || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.aup || 0}</td>
            {/* <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.trMp || 0}</td> */}
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.tr || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.bs || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.bb || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.ts || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.tb || 0}</td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>
              {slot.data.gandengSemitrailer || 0}
            </td>
            <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.ktb || 0}</td>
            {/* <td className={`border border-base-300 px-2 py-1 ${textSize} text-center`}>{slot.data.total || 0}</td> */}
          </tr>
        );

        rowCount++;
      });

      // Add dividing row after the third period (Siang)
      if (periodIndex === 2) {
        rows.push(
          <tr key={`divider-${periodIndex}`}>
            <td colSpan={14} className={`border border-base-300 font-semibold px-2 py-1 ${textSize} text-center bg-base-200`}>
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
      <div className={`w-full gap-5 flex overflow-x-auto join ${pdf ? 'hidden': ''}`}>
        <ExportButton vehicleData={vehicleData} fileName='Data_Kendaraan_perjam' classification={classification} />
      </div>
      <table className="table-auto border-collapse border border-base-300 w-full">
        {formatClassification === "PKJI_2023_Luar_Kota" ? (
          <thead>
            <tr className="bg-base-300">
              <th rowSpan={3} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Periode
              </th>
              {statusHour === true ? (
                <th rowSpan={3} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                  Status Camera
                </th>
              ) : null}
              <th colSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Waktu
              </th>
              <th colSpan={8} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Kendaraan Bermotor (Lih. kend/jam)
              </th>
              <th colSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Kend. Tak Bermotor
              </th>
              <th rowSpan={3} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Total<br />(Lih. kend/jam)
              </th>
            </tr>
            <tr className="bg-base-300">
              <th rowSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Interval<br />
              </th>
              <th rowSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                SM
              </th>
              <th colSpan={3} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                MP
              </th>
              <th rowSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                TR
              </th>
              <th rowSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                BS
              </th>
              <th rowSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                TS
              </th>
              <th rowSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                BB
              </th>
              <th rowSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                TB
              </th>
              <th rowSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Gandeng /<br />Semitrailer
              </th>
              <th rowSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                KTB
              </th>
            </tr>
            <tr className="bg-base-300">
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>MP</th>
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>AUP</th>
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>TR</th>
            </tr>
          </thead>
        ) : formatClassification === "PKJI_2023_Dalam_Kota" ? (
          <thead>
            <tr className="bg-base-300">
              <th rowSpan={3} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Periode
              </th>
              {statusHour === true ? (
                <th rowSpan={3} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                  Status Camera
                </th>
              ) : null}
              <th colSpan={1} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Waktu
              </th>
              <th colSpan={9} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Kendaraan Bermotor (Lih. kend/jam)
              </th>
              <th colSpan={1} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Kend. Tak Bermotor
              </th>
            </tr>
            <tr className="bg-base-300">
              <th rowSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Interval<br />
              </th>
              <th rowSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                SM
              </th>
              <th colSpan={3} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                MP
              </th>
              <th colSpan={5} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                KS
              </th>

              <th rowSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                KTB
              </th>
            </tr>
            <tr className="bg-base-300">
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>MP</th>
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>AUP</th>
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>TR</th>
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                BS
              </th>
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                TS
              </th>
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                BB
              </th>
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                TB
              </th>
              <th rowSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Gandeng /<br />Semitrailer
              </th>
            </tr>
          </thead>
        ) : (
          <thead>
            <tr className="bg-base-300">
              <th rowSpan={3} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Periode
              </th>
              {statusHour === true ? (
                <th rowSpan={3} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                  Status Camera
                </th>
              ) : null}
              <th colSpan={1} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Waktu
              </th>
              <th colSpan={8} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Kendaraan Bermotor (Lih. kend/jam)
              </th>
              <th colSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Kend. Tak Bermotor
              </th>
            </tr>
            <tr className="bg-base-300">
              <th rowSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Interval<br />
              </th>
              <th rowSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                SM
              </th>
              <th colSpan={3} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                MP
              </th>
              <th colSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Bus
              </th>
              <th colSpan={3} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                Truk
              </th>
              <th rowSpan={2} className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>
                KTB
              </th>
            </tr>
            <tr className="bg-base-300">
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>MP</th>
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>AUP</th>
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>TR</th>
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>BS</th>
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>BB</th>
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>TS</th>
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>TB</th>
              <th className={`border border-base-100 px-2 py-1 ${textSize} font-medium`}>Gandeng / <br />Semitrailer</th>
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