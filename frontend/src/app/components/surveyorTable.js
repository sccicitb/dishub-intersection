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

  const setUploadFormulir = (option) => {
    console.log(option);
  }
  return (
    <div className="w-full max-w-4xl mx-auto py-2 gap-5 flex flex-col">
    {/* <button
        className={`btn truncate btn-sm border-2 rounded-lg w-fit border-[#232f61]/90 btn-outline text-[#232f61]`}
        onClick={() => setUploadFormulir("test")}
      >
      Formulir
    </button> */}
    <div className="card bg-base-100 shadow-xs">
      <div className="card-body p-0 sm:p-2 outline-2 outline-[#232f61]/30">
        <div className="overflow-x-auto w-full">
          <table className="table w-full table-sm min-w-[200px]">
            <tbody>
              {surveyData.map((item, index) => (
                <tr key={index}>
                  <td className="bg-[#232f61]/90 font-semibold text-white whitespace-normal p-1">{item.label}</td>
                  <td className=' whitespace-normal p-1'>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  );
};

export default SurveyInfoTable;