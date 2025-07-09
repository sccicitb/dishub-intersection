'use client'
import { useEffect, useState } from "react"
import { InputTable } from '@/app/components/ui/inputTable'

const EkuivalensiForm = () => {

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
  
  return (
    <div className="overflow-x-auto">
      <table className={`table table-xs border w-fit text-stone-600 font-semibold mx-5`}>
        <thead>
          <tr className="border border-base-300 text-center">
            <th rowSpan={2}>Jenis Kendaraan</th>
            <th colSpan={2}>EMP untuk tipe pendekat</th>
          </tr>
          <tr className="border border-base-300 text-center">
            <th>terlindung</th>
            <th>terlawan</th>
          </tr>
        </thead>
        <tbody>
          {['mp', 'ks', 'sm'].map((tipe) => (
            <tr key={tipe} className="border border-base-300 text-center">
              <td>{tipe.toUpperCase()}</td>
              <td>
                <InputTable
                  type="text"
                  style="medium"
                  value={dataEMP.terlindung[tipe]}
                  onChange={handleChange('terlindung', tipe)}
                />
              </td>
              <td>
                <InputTable
                  type="text"
                  style="medium"
                  value={dataEMP.terlawan[tipe]}
                  onChange={handleChange('terlawan', tipe)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EkuivalensiForm;