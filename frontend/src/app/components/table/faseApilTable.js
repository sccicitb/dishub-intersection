"use client"
import { useState, useEffect } from 'react';
import { SketsaAPILL } from '../sketsaApil';

const TrafficTable = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    import("@/data/DataFaseApil.json").then((data) => setData(data.default))
  }, []);

  // Handler untuk mengubah data
  const handleDataChange = (direction, field, subField, value) => {
    setData(prevData => {
      const newData = { ...prevData };
      if (subField) {
        newData.data[direction][field][subField] = value;
      } else {
        newData.data[direction][field] = value;
      }
      return newData;
    });
  };

  if (!data) {
    return <div className="p-4">Loading...</div>;
  }

  const directions = ['utara', 'selatan', 'timur', 'barat'];
  const phases = ['fase_1', 'fase_2', 'fase_3', 'fase_4'];

  const getDirectionLabel = (direction) => {
    const labels = {
      'utara': 'Utara (U)',
      'selatan': 'Selatan (S)',
      'timur': 'Timur (T)',
      'barat': 'Barat (B)'
    };
    return labels[direction];
  };

  // const getTipeLabel = (tipe) => {
  //   const labels = {
  //     'terlindung': 'Terlindung (P)',
  //     'terlawan': 'Terlawan (O)',
  //     'terlindung_terlawan': 'Terlindung (P) Terlawan (O)'
  //   };
  //   return labels[tipe];
  // };


  const Checkbox = ({ checked, onChange }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="checkbox checkbox-success checkbox-xs p-0.5"
    />
  );

  return (
    <div className="p-6 bg-white">
      <h2 className="text-[14px] font-semibold mb-4 capitalize text-start">
        Urutan Fase Apil - Lokasi: {data.lokasi}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr>
              <th className="border border-black p-2 bg-gray-100 text-[12px] font-medium">
                Kode<br />Pendekat
              </th>
              <th className="border border-black p-2 bg-gray-100 text-[12px] font-medium">
                Tipe<br />Pendekat
              </th>
              <th className="border border-black p-2 bg-gray-100 text-[12px] font-medium">
                Arah
              </th>
              <th className="border border-black p-2 bg-gray-100 text-[12px] font-medium">
                Pemisahan<br />Lurus - BKa
              </th>
              <th className="border border-black p-2 bg-gray-100 text-[12px] font-medium">
                Fase 1
              </th>
              <th className="border border-black p-2 bg-gray-100 text-[12px] font-medium">
                Fase 2
              </th>
              <th className="border border-black p-2 bg-gray-100 text-[12px] font-medium">
                Fase 3
              </th>
              <th className="border border-black p-2 bg-gray-100 text-[12px] font-medium">
                Fase 4
              </th>
            </tr>
          </thead>

          <tbody>
            {directions.map((direction) => {
              const directionData = data.data[direction];

              return (
                <tr key={direction}>
                  {/* Kode Pendekat */}
                  <td className="border border-black p-2 text-center">
                    <Checkbox
                      checked={true}
                      onChange={() => { }}
                    />
                    <br />
                    <span className="text-[12px] font-medium">
                      {getDirectionLabel(direction)}
                    </span>
                  </td>

                  {/* Tipe Pendekat */}
                  <td className="border border-black p-2 text-center text-[12px]">
                    {/* {getTipeLabel(directionData.tipe_pendekat)} */}
                    <div className="flex items-center space-x-2 text-[12px]">
                      <Checkbox
                        checked={directionData.tipe_pendekat.terlindung}
                        onChange={(e) => handleDataChange(direction, 'tipe_pendekat', 'terlindung', e.target.checked)}
                      />
                      <span>Terlindung (P)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[12px]">
                      <Checkbox
                        checked={directionData.tipe_pendekat.terlawan}
                        onChange={(e) => handleDataChange(direction, 'tipe_pendekat', 'terlawan', e.target.checked)}
                      />
                      <span>Terlawan (O)</span>
                    </div>
                  </td>

                  {/* Arah */}
                  <td className="border border-black p-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-[12px]">
                        <Checkbox
                          checked={directionData.arah.bki}
                          onChange={(e) => handleDataChange(direction, 'arah', 'bki', e.target.checked)}
                        />
                        <span>BKi / BKIJT</span>
                        <Checkbox
                          checked={directionData.arah.bkijt}
                          onChange={(e) => handleDataChange(direction, 'arah', 'bkijt', e.target.checked)}
                        />
                      </div>
                      <div className="flex items-center space-x-2 text-[12px]">
                        <Checkbox
                          checked={directionData.arah.lurus}
                          onChange={(e) => handleDataChange(direction, 'arah', 'lurus', e.target.checked)}
                        />
                        <span>Lurus</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[12px]">
                        <Checkbox
                          checked={directionData.arah.bka}
                          onChange={(e) => handleDataChange(direction, 'arah', 'bka', e.target.checked)}
                        />
                        <span>BKa</span>
                      </div>
                    </div>
                  </td>

                  {/* Pemisahan Lurus - BKa */}
                  <td className="border border-black p-2 text-center">
                    <Checkbox
                      checked={directionData.pemisahan_lurus_bka}
                      onChange={(e) => handleDataChange(direction, 'pemisahan_lurus_bka', null, e.target.checked)}
                    />
                  </td>

                  {/* Fase 1-4 */}
                  {phases.map((phase) => (
                    <td key={phase} className="border border-black p-2 text-center">
                      <div className="space-y-2">
                        <Checkbox
                          checked={directionData.fase[phase]}
                          onChange={(e) => handleDataChange(direction, 'fase', phase, e.target.checked)}
                        />
                        {direction === 'timur' && (
                          <div>
                            <Checkbox
                              checked={phase === 'fase_4'}
                              onChange={() => { }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr>
              <td colSpan={4} rowSpan={2} className="border border-black p-2 text-center">Sketsa Simpang APILL</td>
              <td rowSpan={2} className="border border-black p-2 text-center">
                <SketsaAPILL
                  directions={data.data}
                  currentPhase={"fase_1"}
                />
              </td>
              <td rowSpan={2} className="border border-black p-2 text-center">
                <SketsaAPILL
                  directions={data.data}
                  currentPhase={"fase_2"}
                />
              </td>
              <td rowSpan={2} className="border border-black p-2 text-center">
                <SketsaAPILL
                  directions={data.data}
                  currentPhase={"fase_3"}
                />
              </td>
              <td rowSpan={2} className="border border-black p-2 text-center">
                <SketsaAPILL
                  directions={data.data}
                  currentPhase={"fase_4"}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-[12px] text-gray-600">
        <p><strong>Keterangan:</strong></p>
        <p>• BKi/BKIJT = Belok Kiri/Belok Kiri Jalan Terus</p>
        <p>• BKa = Belok Kanan</p>
        <p>• P = Terlindung, O = Terlawan</p>
      </div>
    </div>
  );
};

export default TrafficTable;