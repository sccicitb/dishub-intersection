import React, { useState, useEffect } from 'react';
import { maps } from '@/lib/apiService';
import { getCuacaJogja } from '@/lib/weatherAccess';

const HeaderSurvei = ({ simpangId, selectedDate, arahPergerakan }) => {
  const [simpangData, setSimpangData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimpangData = async () => {
      if (!simpangId) {
        setLoading(false);
        return;
      }

      if (simpangId === "semua") {
        setSimpangData({
          cuaca: 'Cerah', 
          metodeSurvei: 'Semua Data',
          lokasi: 'Semua Simpang',
          kabupaten: 'Yogyakarta',
          kecamatan: '-',
          lebarJalur: '-',
          jumlahLajur: '-',
          median: '-',
          belokKiriJalanTerus: '-',
          hambatanSamping: '-'
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const detailRes = await maps.getById(simpangId);
        const detail = detailRes?.data || {};
        
        // Fetch cuaca
        let cuaca = 'Cerah berawan';
        if (detail.latitude && detail.longitude) {
          const cuacaData = await getCuacaJogja(detail.latitude, detail.longitude);
          cuaca = cuacaData?.cuaca || 'Cerah berawan';
        }

        setSimpangData({
          cuaca: cuaca,
          metodeSurvei: detail?.Metode_Survei || '',
          lokasi: detail?.Nama_Simpang || '',
          kabupaten: detail?.Kota || '',
          kecamatan: detail?.Kecamatan || '',
          lebarJalur: detail?.Lebar_Jalur || '',
          jumlahLajur: detail?.Jumlah_Lajur || '',
          median: detail?.Median || '',
          belokKiriJalanTerus: detail?.Belok_Kiri_Jalan_Terus || '',
          hambatanSamping: detail?.Hambatan_Samping || ''
        });
      } catch (err) {
        console.error('Error fetching simpang detail:', err);
        // Set default values if fetch fails
        setSimpangData({
          cuaca: 'Cerah berawan',
          metodeSurvei: '',
          lokasi: '',
          kabupaten: '',
          kecamatan: '',
          lebarJalur: '',
          jumlahLajur: '',
          median: '',
          belokKiriJalanTerus: '',
          hambatanSamping: ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSimpangData();
  }, [simpangId]);

  // Format tanggal
  const formatTanggal = (date) => {
    if (!date) return 'Kamis, 30/01/2025';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[dateObj.getDay()];
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${dayName}, ${day}/${month}/${year}`;
  };

  // Default values if data not loaded yet
  const data = simpangData || {
    cuaca: '',
    metodeSurvei: 'Pencacahan Lalu Lintas ( Volume Kendaraan)',
    lokasi: '',
    kabupaten: '',
    kecamatan: '',
    lebarJalur: '',
    jumlahLajur: '',
    median: '',
    belokKiriJalanTerus: '',
    hambatanSamping: ''
  };

  return (
    <div className="w-full mx-auto border-[1.5px] md:border-2 border-black text-sm md:text-xs lg:text-sm bg-white text-black font-sans shadow-sm">
      {/* SEKSI ATAS: Identitas Instansi & Judul */}
      <div className="grid grid-cols-1 md:grid-cols-12 border-b-[1.5px] md:border-b-2 border-black">
        
        {/* Logo & Nama Instansi (Gabung di Mobile) */}
        <div className="md:col-span-4 flex border-b-[1.5px] md:border-b-0 md:border-r-2 border-black">
          <div className="w-1/4 md:w-1/3 p-2 flex items-center justify-center border-r-[1.5px] md:border-r-2 border-black">
            <img 
              src="/image/logo-diy.png" 
              alt="Logo DIY" 
              className="h-12 md:h-16 lg:h-20 object-contain"
            />
          </div>
          <div className="w-3/4 md:w-2/3 p-2 flex items-center font-bold text-left md:text-center leading-tight">
            DINAS PERHUBUNGAN<br className="hidden md:block" />
            DAERAH ISTIMEWA YOGYAKARTA
          </div>
        </div>

        {/* Judul Formulir */}
        <div className="md:col-span-4 p-2 md:p-4 border-b-[1.5px] md:border-b-0 md:border-r-2 border-black flex flex-col items-center justify-center font-bold text-center bg-gray-50 md:bg-transparent">
          <span className="tracking-widest">FORMULIR</span>
          <span>SURVEI LALU LINTAS</span>
          <span>SIMPANG APILL</span>
        </div>

        {/* Metadata Surveyor */}
        <div className="md:col-span-4 p-2 space-y-1 flex flex-col justify-center bg-white">
          <RowInfo label="Surveyor" value="VIANA" isUpper />
          <RowInfo label="Hari, Tanggal" value={formatTanggal(selectedDate)} />
          <RowInfo label="Cuaca" value={data.cuaca} />
          <RowInfo label="Arah Pergerakan" value={arahPergerakan || ''} isRed />
        </div>
      </div>

      {/* SEKSI BAWAH: Detail Lokasi & Teknis */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Kolom 1: Lokasi */}
        <div className="p-2 border-b-[1.5px] md:border-b-0 md:border-r-2 border-black space-y-1">
          <RowInfo label="Lokasi" value={data.lokasi} />
          <RowInfo label="Kabupaten" value={data.kabupaten} />
          <RowInfo label="Kecamatan" value={data.kecamatan} />
        </div>

        {/* Kolom 2: Teknis Pendekat */}
        <div className="p-2 border-b-[1.5px] md:border-b-0 md:border-r-2 border-black space-y-1">
          <RowInfo label="Pendekat Simpang" value={arahPergerakan} />
          <RowInfo label="Lebar Jalur" value={data.lebarJalur} />
          <RowInfo label="Jumlah Lajur" value={data.jumlahLajur} />
        </div>

        {/* Kolom 3: Fasilitas */}
        <div className="p-2 space-y-1">
          <RowInfo label="Median" value={data.median} />
          <RowInfo label="Belok Kiri Langsung" value={data.belokKiriJalanTerus} />
          <RowInfo label="Hambatan Samping" value={data.hambatanSamping} />
        </div>
      </div>
    </div>
  );
};

/* Sub-komponen agar kode lebih bersih dan mudah dikelola */
const RowInfo = ({ label, value, isUpper = false, isRed = false }) => (
  <div className="grid grid-cols-[150px_10px_1fr] md:grid-cols-[110px_10px_1fr] lg:grid-cols-[130px_10px_1fr] items-start">
    <span className="whitespace-nowrap">{label}</span>
    <span>:</span>
    <span className={`font-semibold ${isUpper ? 'uppercase' : ''} ${isRed ? 'text-red-600 underline underline-offset-4 decoration-dotted' : ''}`}>
      {value}
    </span>
  </div>
);

export default HeaderSurvei;