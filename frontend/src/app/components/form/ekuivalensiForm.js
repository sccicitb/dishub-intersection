'use client'
import { useEffect, useState } from "react"
import { InputTable } from '@/app/components/ui/inputTable'
import { Description } from "../ui/description";

const EkuivalensiForm = ({ setEMP }) => {

  const [dataEMP, setDataEMP] = useState({
    terlindung: { mp: '', ks: '', sm: '' },
    terlawan: { mp: '', ks: '', sm: '' }
  });

  const handleChange = (jenis, tipe) => (e) => {
    setDataEMP((prev) => ({
      ...prev,
      [jenis]: {
        ...prev[jenis],
        [tipe]: e.target.value
      }
    }));
  };

  useEffect(() => setEMP(dataEMP), [])

  return (
    <div>
        <h2 className="text-lg mx-6 my-4">Ekuivalensi Mobil Penumpang</h2>
      <Description style={'x5'}>
        <div className="overflow-x-auto p-5">
          <table className={`table table-xs border w-fit font-semibold`}>
            <thead>
              <tr className="border border-gray-300 text-center">
                <th rowSpan={2} className="border-r border-gray-300">Jenis Kendaraan</th>
                <th colSpan={2} className="border-r border-gray-300">EMP untuk tipe pendekat</th>
              </tr>
              <tr className="border border-gray-300 text-center">
                <th className="border-r border-gray-300">terlindung</th>
                <th className="border-r border-gray-300">terlawan</th>
              </tr>
            </thead>
            <tbody>
              {['mp', 'ks', 'sm'].map((tipe) => (
                <tr key={tipe} className="border border-gray-300 text-center">
                  <td className="border-r border-gray-300">{tipe.toUpperCase()}</td>
                  <td className="border-r border-gray-300">
                    <InputTable
                      type="text"
                      style="medium"
                      value={dataEMP.terlindung[tipe]}
                      onChange={handleChange('terlindung', tipe)}
                      width={'ds'}
                    />
                  </td>
                  <td className="border-r border-gray-300">
                    <InputTable
                      type="text"
                      style="medium"
                      value={dataEMP.terlawan[tipe]}
                      onChange={handleChange('terlawan', tipe)}
                      width={'ds'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Description>
      <Description style={'x5'}><div className="text-xs">Gunakan tanda titik ( . ) sebagai pemisah desimal, bukan koma ( , ) untuk memastikan perhitungan berjalan dengan benar.</div></Description>
      <div className="w-full items-center flex px-5">
        <button className="btn btn-sm w-full m-auto btn-success" onClick={() => setEMP(dataEMP)}>Simpan</button>
      </div>
    </div>
  )
}

export default EkuivalensiForm;