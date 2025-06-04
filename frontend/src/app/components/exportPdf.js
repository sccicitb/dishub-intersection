"use client"
import React, { useRef } from 'react';
import { FaFilePdf } from 'react-icons/fa6';
import Image from 'next/image';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import HourVehicleTable from './HourVehicleTable';
import ClasificationTable from "@/app/components/clasificationTable";

const ExportSurveyTable = ({ vehicleData, activeClassification }) => {
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

        // Simpan overflow original
        const originalOverflow = tableRef.current.style.overflow;
        tableRef.current.style.overflow = 'visible';

        // Capture canvas
        const canvas = await html2canvas(tableRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: tableRef.current.scrollWidth,
          height: tableRef.current.scrollHeight,
        });

        // Kembalikan overflow
        tableRef.current.style.overflow = originalOverflow;

        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);

        // Hitung ukuran gambar
        const imgWidth = pageWidth;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        // Metode sederhana: bagi tinggi gambar dengan tinggi halaman
        const totalPages = Math.ceil(imgHeight / pageHeight);

        for (let i = 0; i < totalPages; i++) {
          if (i > 0) {
            pdf.addPage();
          }

          const yPosition = -(i * pageHeight);

          pdf.addImage(
            imgData,
            'PNG',
            MARGIN,
            MARGIN + yPosition,
            imgWidth,
            imgHeight
          );
        }

        pdf.save('SurveyLalulintas.pdf');

      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Terjadi kesalahan saat mengexport PDF. Silakan coba lagi.');
      }
    } else {
      console.error('Table reference is null or not available.');
      alert('Tabel tidak ditemukan. Silakan refresh halaman.');
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
        className="fixed left-[-999px] top-[-999px] w-[210mm] bg-white p-4"
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

        <HourVehicleTable statusHour={true} vehicleData={vehicleData} classification={activeClassification} customSize={true} pdf={true} />
        <ClasificationTable typeClass={activeClassification} customSize={true} />
      </div>
    </div>
  );
};

export default ExportSurveyTable;