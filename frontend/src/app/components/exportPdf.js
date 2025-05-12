"use client"
import React, { useRef } from 'react';
import { FaFilePdf } from 'react-icons/fa6';
import Image from 'next/image';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

const ExportSurveyTable = ({ vehicleData }) => {
  const tableRef = useRef(null);

  const exportToPdf = async () => {
  if (tableRef.current) {
    try {
      const A4_WIDTH = 210;
      const A4_HEIGHT = 297;
      const MARGIN = 10;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = A4_WIDTH - (MARGIN * 2);
      const pageHeight = A4_HEIGHT - (MARGIN * 2);

      const originalOverflow = tableRef.current.style.overflow;
      tableRef.current.style.overflow = 'visible';

      const canvas = await html2canvas(tableRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: tableRef.current.scrollWidth,
        height: tableRef.current.scrollHeight,
        windowWidth: tableRef.current.scrollWidth,
        windowHeight: tableRef.current.scrollHeight,
      });

      tableRef.current.style.overflow = originalOverflow;

      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', MARGIN, MARGIN, imgWidth, imgHeight);

      pdf.save('SurveyLalulintas.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  } else {
    console.error('Table reference is null or not available.');
  }
};


  const clasificationData = [
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

  const groupedData = clasificationData.reduce((acc, vehicle) => {
    if (!acc[vehicle.mainCode]) {
      acc[vehicle.mainCode] = [];
    }
    acc[vehicle.mainCode].push(vehicle);
    return acc;
  }, {});
  
  return (
    <div className="relative w-[100%] m-auto">
      <button
        onClick={exportToPdf}
        className="btn btn-md w-full bg-green-500 rounded-lg text-white flex items-center gap-2"
      >
        <FaFilePdf />
        Export PDF
      </button>

       <div 
        ref={tableRef} 
        className="fixed left-[-9999px] top-[-9999px] w-[210mm] bg-white p-4"
      >
        {/* Header */}
        <div className="header flex items-center border-b-2 border-gray-300 pb-2">
          <div className="logo-container w-16">
            <Image
              src="/image/logo-yogyakarta.png"
              alt="Background"
              width={80}
              height={80}
              className="w-full"
            />
          </div>
          <div className="title-container ml-4">
            <h2 className="text-lg font-bold uppercase text-gray-800">
              Dinas Perhubungan Daerah Istimewa Yogyakarta
            </h2>
            <h3 className="text-base font-semibold text-gray-700">
              Formulir Survey Lalu Lintas Simpang Apill
            </h3>
          </div>
          <div className="info-container ml-auto text-sm">
            <div className="grid grid-cols-2 gap-x-2">
              <span className="font-semibold">Tanggal</span>
              <span>: {new Date().toLocaleDateString()}</span>
              <span className="font-semibold">Kode Simpang</span>
              <span>: {vehicleData?.surveyInfo?.simpangCode || '-'}</span>
              <span className="font-semibold">Arah Pergerakan</span>
              <span>: {vehicleData?.surveyInfo?.direction || '-'}</span>
              <span className="font-semibold">Nama Surveyor</span>
              <span>: {vehicleData?.surveyInfo?.surveyor || '-'}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full mt-4 border-collapse text-[12px]">
          <thead>
            <tr className="bg-gray-100">
              <th rowSpan="3" className="border px-1 py-2 text-center">Periode</th>
              <th rowSpan="3" className="border px-1 py-2 text-center">Waktu</th>
              <th rowSpan="3" className="border px-1 py-2 text-center">Interval</th>
              <th colSpan="8" className="border px-1 py-1 text-center">Kendaraan Bermotor</th>
              <th colSpan="2" className="border px-1 py-1 text-center">Tak Bermotor</th>
              <th rowSpan="3" className="border px-1 py-2 text-center">Total</th>
            </tr>
            <tr className="bg-gray-100">
              <th rowSpan="2" className="border px-1 py-1 text-center">SM</th>
              <th colSpan="3" className="border px-1 py-1 text-center">MP</th>
              <th rowSpan="2" className="border px-1 py-1 text-center">TR</th>
              <th rowSpan="2" className="border px-1 py-1 text-center">BS</th>
              <th rowSpan="2" className="border px-1 py-1 text-center">TS</th>
              <th rowSpan="2" className="border px-1 py-1 text-center">BB</th>
              <th rowSpan="2" className="border px-1 py-1 text-center">TB</th>
              <th rowSpan="2" className="border px-1 py-1 text-center">Gandeng</th>
              <th rowSpan="2" className="border px-1 py-1 text-center">KTB</th>
            </tr>
            <tr className="bg-gray-100">
              <th className="border px-1 py-1 text-center">MP</th>
              <th className="border px-1 py-1 text-center">AUP</th>
              <th className="border px-1 py-1 text-center">TR</th>
            </tr>
          </thead>
          <tbody>
            {vehicleData?.periods?.map((period, periodIndex) => (
              <React.Fragment key={periodIndex}>
                {periodIndex === 3 && (
                  <tr className="bg-gray-200">
                    <td colSpan="15" className="border px-1 py-2 text-center font-semibold">
                      Lalu Lintas Jam-Jaman Rata-Rata 4 x VR (kend/jam)
                    </td>
                  </tr>
                )}
                {period.timeSlots.map((slot, slotIndex) => (
                  <tr key={slotIndex}>
                    {slotIndex === 0 && (
                      <td rowSpan={period.timeSlots.length} className="border text-center align-middle">
                        {period.name}
                      </td>
                    )}
                    <td className="border text-center">{slot.status === 1 ? 1 : 0}</td>
                    <td className="border text-center">{slot.time}</td>
                    <td className="border text-center">{slot.data.sm || 0}</td>
                    <td className="border text-center">{slot.data.mp || 0}</td>
                    <td className="border text-center">{slot.data.aup || 0}</td>
                    <td className="border text-center">{slot.data.trMp || 0}</td>
                    <td className="border text-center">{slot.data.tr || 0}</td>
                    <td className="border text-center">{slot.data.bs || 0}</td>
                    <td className="border text-center">{slot.data.ts || 0}</td>
                    <td className="border text-center">{slot.data.bb || 0}</td>
                    <td className="border text-center">{slot.data.tb || 0}</td>
                    <td className="border text-center">{slot.data.gandengSemitrailer || 0}</td>
                    <td className="border text-center">{slot.data.ktb || 0}</td>
                    <td className="border text-center">{slot.data.total || 0}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        <table className="min-w-full bg-green-50 text-black border border-base-300 text-xs mt-10">
          <tbody>
            {Object.keys(groupedData).map((mainCode) => {
              const items = groupedData[mainCode];
              const rowCount = items.length;
              
              return items.map((vehicle, index) => (
                <tr key={`${mainCode}-${index}`} className={'bg-green-50 text-black'}>
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
};

export default ExportSurveyTable;

// "use client";
// import React from 'react';
// import { FaFilePdf } from 'react-icons/fa6';
// import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image as PdfImage } from '@react-pdf/renderer';

// const styles = StyleSheet.create({
//   page: {
//     padding: 12,
//     fontSize: 10,
//     fontFamily: 'Helvetica',
//     backgroundColor: '#fff',
//   },
//   header: {
//     borderWidth: 1,
//     borderColor: '#000',
//     marginBottom: 10,
//   },
//   headerTopRow: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: '#000',
//   },
//   logoContainer: {
//     width: '15%',
//     padding: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRightWidth: 1,
//     borderRightColor: '#000',
//   },
//   logo: {
//     width: 60,
//     height: 60,
//   },
//   titleContainer: {
//     width: '45%',
//     padding: 8,
//     borderRightWidth: 1,
//     borderRightColor: '#000',
//     justifyContent: 'center',
//   },
//   formTitleContainer: {
//     width: '40%',
//     padding: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   titleLarge: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     textTransform: 'uppercase',
//     color: '#2a2a2a',
//   },
//   titleMedium: {
//     fontSize: 10,
//     fontWeight: 'semibold',
//     textTransform: 'uppercase',
//     marginTop: 4,
//     textAlign: 'center',
//     color: '#3a3a3a',
//   },
//   headerBottomRow: {
//     flexDirection: 'row',
//   },
//   locationContainer: {
//     width: '40%',
//     borderRightWidth: 1,
//     borderRightColor: '#000',
//     padding: 6,
//   },
//   junctionContainer: {
//     width: '35%',
//     borderRightWidth: 1,
//     borderRightColor: '#000',
//     padding: 6,
//   },
//   surveyorContainer: {
//     width: '25%',
//     padding: 6,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     marginBottom: 4,
//   },
//   infoLabel: {
//     width: '30%',
//     fontWeight: 'bold',
//   },
//   infoValue: {
//     width: '70%',
//   },
//   table: {
//     marginTop: 6,
//     display: 'table',
//     width: '100%',
//     borderStyle: 'solid',
//     borderWidth: 1,
//     borderColor: '#000',
//   },
//   tableRow: {
//     flexDirection: 'row',
//   },
//   tableHeaderCell: {
//     borderStyle: 'solid',
//     borderWidth: 1,
//     borderColor: '#000',
//     padding: 3,
//     textAlign: 'center',
//     fontWeight: 'bold',
//     backgroundColor: '#e0e0e0',
//   },
//   tableCell: {
//     borderStyle: 'solid',
//     borderWidth: 1,
//     borderColor: '#000',
//     padding: 3,
//     textAlign: 'center',
//   },
//   tableCellLeft: {
//     borderStyle: 'solid',
//     borderWidth: 1,
//     borderColor: '#000',
//     padding: 3,
//     textAlign: 'left',
//   },
//   summary: {
//     marginTop: 10,
//     fontSize: 8,
//     textAlign: 'right',
//   }
// });

// const ExportSurveyTable = ({ vehicleData }) => {
//   // Define periods with unique keys and their corresponding time slots
//   const periods = [
//     {
//       name: 'Dini Hari',
//       key: 'early-morning',
//       timeSlots: ['00:00 - 00:15', '00:15 - 00:30', '00:30 - 00:45', '00:45 - 01:00']
//     },
//     {
//       name: 'Pagi',
//       key: 'morning',
//       timeSlots: ['06:00 - 06:15', '06:15 - 06:30', '06:30 - 06:45', '06:45 - 07:00']
//     },
//     {
//       name: 'Siang',
//       key: 'afternoon',
//       timeSlots: ['12:00 - 12:15', '12:15 - 12:30', '12:30 - 12:45', '12:45 - 13:00']
//     },
//     {
//       name: 'Sore',
//       key: 'evening',
//       timeSlots: ['16:00 - 16:15', '16:15 - 16:30', '16:30 - 16:45', '16:45 - 17:00']
//     },
//     {
//       name: 'Malam',
//       key: 'night',
//       timeSlots: ['20:00 - 20:15', '20:15 - 20:30', '20:30 - 20:45', '20:45 - 21:00']
//     }
//   ];

//   // Helper function to get vehicle count data (mocked for now)
//   const getVehicleCount = (period, timeSlot, vehicleType) => {
//     if (!vehicleData || !vehicleData.counts) return '';
    
//     // In a real implementation, you would access the actual data from vehicleData
//     // For example: return vehicleData.counts[period]?.[timeSlot]?.[vehicleType] || '';
    
//     return '';  // Placeholder
//   };

//   // PDF Document component
//   const PdfDocument = () => (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         {/* New Header Structure based on the provided example */}
//         <View style={styles.header}>
//           {/* Top row with logo, title, and form title */}
//           <View style={styles.headerTopRow}>
//             <View style={styles.logoContainer}>
//               <PdfImage src="/image/logo-yogyakarta.png" style={styles.logo} />
//             </View>
//             <View style={styles.titleContainer}>
//               <Text style={styles.titleLarge}>DINAS PERHUBUNGAN</Text>
//               <Text style={styles.titleLarge}>DAERAH ISTIMEWA</Text>
//               <Text style={styles.titleLarge}>YOGYAKARTA</Text>
//             </View>
//             <View style={styles.formTitleContainer}>
//               <Text style={styles.titleMedium}>FORMULIR</Text>
//               <Text style={styles.titleMedium}>SURVEI LALU LINTAS</Text>
//               <Text style={styles.titleMedium}>SIMPANG APILL</Text>
//             </View>
//           </View>
          
//           {/* Bottom row with three columns for different info */}
//           <View style={styles.headerBottomRow}>
//             {/* Left column - Location info */}
//             <View style={styles.locationContainer}>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Lokasi</Text>
//                 <Text style={styles.infoValue}>: {vehicleData?.surveyInfo?.location || 'Simpang Condongcatur'}</Text>
//               </View>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Kabupaten</Text>
//                 <Text style={styles.infoValue}>: {vehicleData?.surveyInfo?.regency || 'Sleman'}</Text>
//               </View>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Kecamatan</Text>
//                 <Text style={styles.infoValue}>: {vehicleData?.surveyInfo?.district || 'Depok'}</Text>
//               </View>
//             </View>
            
//             {/* Middle column - Junction info */}
//             <View style={styles.junctionContainer}>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Pendekat Simpang</Text>
//                 <Text style={styles.infoValue}>: {vehicleData?.surveyInfo?.approach || 'Utara'}</Text>
//               </View>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Lebar Jalur</Text>
//                 <Text style={styles.infoValue}>: {vehicleData?.surveyInfo?.laneWidth || '7 meter'}</Text>
//               </View>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Jumlah Lajur</Text>
//                 <Text style={styles.infoValue}>: {vehicleData?.surveyInfo?.laneCount || '2 Lajur'}</Text>
//               </View>
//             </View>
            
//             {/* Right column - Surveyor info */}
//             <View style={styles.surveyorContainer}>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Surveyor</Text>
//                 <Text style={styles.infoValue}>: {vehicleData?.surveyInfo?.surveyor || 'VIANA'}</Text>
//               </View>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Hari, Tanggal</Text>
//                 <Text style={styles.infoValue}>: {vehicleData?.surveyInfo?.date || 'Kamis, 30/01/2025'}</Text>
//               </View>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Cuaca</Text>
//                 <Text style={styles.infoValue}>: {vehicleData?.surveyInfo?.weather || 'Cerah berawan'}</Text>
//               </View>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Arah Pergerakan</Text>
//                 <Text style={styles.infoValue}>: {vehicleData?.surveyInfo?.direction || 'Belok Kiri'}</Text>
//               </View>
//             </View>
//           </View>
          
//           {/* Additional row for median and other info */}
//           <View style={styles.headerBottomRow}>
//             <View style={[styles.locationContainer, { width: '33.33%' }]}>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Median</Text>
//                 <Text style={styles.infoValue}>: {vehicleData?.surveyInfo?.median || 'Ada'}</Text>
//               </View>
//             </View>
//             <View style={[styles.junctionContainer, { width: '33.33%' }]}>  
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Belok Kiri Langsung</Text>
//                 <Text style={styles.infoValue}>: {vehicleData?.surveyInfo?.leftTurnDirect || 'Ya'}</Text>
//               </View>
//             </View>
//             <View style={[styles.surveyorContainer, { width: '33.33%', borderRightWidth: 0 }]}>
//               <View style={styles.infoRow}>
//                 <Text style={styles.infoLabel}>Hambatan Samping</Text>
//                 <Text style={styles.infoValue}>: {vehicleData?.surveyInfo?.sideConstraint || 'Tinggi'}</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Data Table - Keep the existing table */}
//         <View style={styles.table}>
//           {/* Table Headers */}
//           <View style={styles.tableRow}>
//             <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Periode</Text>
//             <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Waktu</Text>
//             <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Interval</Text>
//             <Text style={[styles.tableHeaderCell, { width: '7%' }]}>SM</Text>
//             <Text style={[styles.tableHeaderCell, { width: '7%' }]}>MP</Text>
//             <Text style={[styles.tableHeaderCell, { width: '7%' }]}>AUP</Text>
//             <Text style={[styles.tableHeaderCell, { width: '7%' }]}>TR</Text>
//             <Text style={[styles.tableHeaderCell, { width: '7%' }]}>BS</Text>
//             <Text style={[styles.tableHeaderCell, { width: '7%' }]}>TS</Text>
//             <Text style={[styles.tableHeaderCell, { width: '7%' }]}>BB</Text>
//             <Text style={[styles.tableHeaderCell, { width: '7%' }]}>TB</Text>
//             <Text style={[styles.tableHeaderCell, { width: '14%' }]}>Gandeng/Semitrailer</Text>
//             <Text style={[styles.tableHeaderCell, { width: '7%' }]}>KTB</Text>
//           </View>

//           {/* Periods and Time Slots */}
//           {periods.map((period) => (
//             period.timeSlots.map((timeSlot, timeIndex) => (
//               <View style={styles.tableRow} key={`${period.key}-${timeSlot}`}>
//                 {timeIndex === 0 ? (
//                   <Text style={[styles.tableCell, { width: '10%', fontWeight: 'bold' }]}>{period.name}</Text>
//                 ) : (
//                   <Text style={[styles.tableCell, { width: '10%' }]}></Text>
//                 )}
//                 <Text style={[styles.tableCell, { width: '10%' }]}>{timeSlot}</Text>
//                 <Text style={[styles.tableCell, { width: '10%' }]}>15 menit</Text>
//                 <Text style={[styles.tableCell, { width: '7%' }]}>{getVehicleCount(period.key, timeSlot, 'SM')}</Text>
//                 <Text style={[styles.tableCell, { width: '7%' }]}>{getVehicleCount(period.key, timeSlot, 'MP')}</Text>
//                 <Text style={[styles.tableCell, { width: '7%' }]}>{getVehicleCount(period.key, timeSlot, 'AUP')}</Text>
//                 <Text style={[styles.tableCell, { width: '7%' }]}>{getVehicleCount(period.key, timeSlot, 'TR')}</Text>
//                 <Text style={[styles.tableCell, { width: '7%' }]}>{getVehicleCount(period.key, timeSlot, 'BS')}</Text>
//                 <Text style={[styles.tableCell, { width: '7%' }]}>{getVehicleCount(period.key, timeSlot, 'TS')}</Text>
//                 <Text style={[styles.tableCell, { width: '7%' }]}>{getVehicleCount(period.key, timeSlot, 'BB')}</Text>
//                 <Text style={[styles.tableCell, { width: '7%' }]}>{getVehicleCount(period.key, timeSlot, 'TB')}</Text>
//                 <Text style={[styles.tableCell, { width: '14%' }]}>{getVehicleCount(period.key, timeSlot, 'GANDENG')}</Text>
//                 <Text style={[styles.tableCell, { width: '7%' }]}>{getVehicleCount(period.key, timeSlot, 'KTB')}</Text>
//               </View>
//             ))
//           ))}
//         </View>

//         {/* Summary or Notes Section */}
//         <View style={styles.summary}>
//           <Text>Keterangan:</Text>
//           <Text>SM: Sepeda Motor, MP: Mobil Penumpang, AUP: Angkutan Umum Penumpang, TR: Truk Ringan</Text>
//           <Text>BS: Bus Sedang, TS: Truk Sedang, BB: Bus Besar, TB: Truk Besar, KTB: Kendaraan Tidak Bermotor</Text>
//         </View>
//       </Page>
//     </Document>
//   );

//   return (
//     <div className="relative">
//       {vehicleData ? (
//         <PDFDownloadLink 
//           document={PdfDocument()} 
//           fileName="SurveyLalulintas.pdf"
//         >
//           {({ loading, error }) => {
//             if (error) {
//               console.error('PDF Generation Error:', error);
//               return <div>Error generating PDF</div>;
//             }
//             return (
//               <button 
//                 className="btn btn-md bg-red-700 m-5 text-white rounded flex items-center gap-2 hover:bg-red-800 transition-colors" 
//                 disabled={loading}
//               >
//                 <FaFilePdf />
//                 {loading ? 'Menyiapkan PDF...' : 'Ekspor PDF'}
//               </button>
//             );
//           }}
//         </PDFDownloadLink>
//       ) : (
//         <div className="m-5 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
//           <p>Tidak ada data kendaraan tersedia untuk diekspor.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ExportSurveyTable;