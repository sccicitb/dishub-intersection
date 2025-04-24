// components/SurveyInfoTable.jsx
import React from 'react';

const SurveyInfoTable = () => {
  // Data survei
  const surveyData = [
    { label: 'Cuaca', value: 'Cerah berawan' },
    { label: 'Metode Survei', value: 'Pencacahan Lalu Lintas ( Volume Kendaraan)' },
    { label: 'Lokasi', value: 'Simpang Condongcatur (koordinat)' },
    { label: 'Kabupaten/Kota', value: 'Sleman' },
    { label: 'Kecamatan', value: 'Depok' },
    { label: 'Lebar Jalur', value: '7 meter' },
    { label: 'Jumlah Lajur', value: '2 lajur' },
    { label: 'Median', value: 'Ada / Tanpa' },
    { label: 'Belok Kiri Jalan Terus', value: 'Ya / Tidak' },
    { label: 'Hambatan Samping', value: 'Tinggi / Sedang / Rendah' },
  ];

  return (
    <div className="overflow-x-auto w-full max-w-4xl mx-auto p-4">
      <div className="card bg-base-100 shadow-xs">
        <div className="card-body p-2 outline-3 outline-[#7585C1]/30">
          <table className="table table-sm w-full">
            <tbody>
              {surveyData.map((item, index) => (
                <tr key={index}>
                  <td className="bg-[#7585C1]/90 w-1/3 font-semibold  text-white">{item.label}</td>
                  <td className='font-semibold'>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SurveyInfoTable;