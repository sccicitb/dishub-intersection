import { useState } from 'react';

export default function FormSAIVTable () {
  const [tableData, setTableData] = useState([
    {
      kodePendekat: 'U',
      tipependekat: 'P',
      rasioKendaraanBelok: { rusun: '', rlk: '', rlka: '' },
      arusBelokKanan: { dariArahDitinjau: '', dariArahBerlawanan: '' },
      lebarEfektif: { ls: '', jb: '' },
      arusJenuhDasar: 6900,
      faktorPenyesuaian: {
        fus: 1.05,
        fuk: 0.95,
        fug: 1.00,
        fup: 1.00,
        fbki: 1.00,
        fbka: 0.99
      },
      arusJenuhYangDisesuaikan: { j: 6814, q: 1234 },
      arusLaluLintas: 0.181,
      rasioArus: 0.233,
      rasioFase: 24,
      waktuHijauPerFase: 1398,
      kapasitas: '',
      derajatKejenuhan: 0.883
    },
    {
      kodePendekat: 'S',
      tipependekat: 'P',
      rasioKendaraanBelok: { rusun: 0.11, rlk: 0.42, rlka: '' },
      arusBelokKanan: { dariArahDitinjau: '', dariArahBerlawanan: '' },
      lebarEfektif: { ls: 11.0, jb: 6600 },
      arusJenuhDasar: '',
      faktorPenyesuaian: {
        fus: 1.05,
        fuk: 0.98,
        fug: 1.00,
        fup: 1.00,
        fbki: 1.00,
        fbka: 0.98
      },
      arusJenuhYangDisesuaikan: { j: 6656, q: 1460 },
      arusLaluLintas: 0.219,
      rasioArus: 0.282,
      rasioFase: 29,
      waktuHijauPerFase: 1654,
      kapasitas: '',
      derajatKejenuhan: 0.883
    },
    {
      kodePendekat: 'T',
      tipependekat: 'O',
      rasioKendaraanBelok: { rusun: 0.43, rlk: '', rlka: 0.02 },
      arusBelokKanan: { dariArahDitinjau: 26, dariArahBerlawanan: 193 },
      lebarEfektif: { ls: 6.0, jb: 2350 },
      arusJenuhDasar: '',
      faktorPenyesuaian: {
        fus: 1.05,
        fuk: 0.97,
        fug: 1.00,
        fup: 1.00,
        fbki: 1.00,
        fbka: 1.00
      },
      arusJenuhYangDisesuaikan: { j: 2393, q: 733 },
      arusLaluLintas: 0.306,
      rasioArus: 0.394,
      rasioFase: 41,
      waktuHijauPerFase: 830,
      kapasitas: '',
      derajatKejenuhan: 0.883
    },
    {
      kodePendekat: 'B',
      tipependekat: 'P',
      rasioKendaraanBelok: { rusun: '', rlk: 0.19, rlka: 0.23 },
      arusBelokKanan: { dariArahDitinjau: '', dariArahBerlawanan: '' },
      lebarEfektif: { ls: 7.0, jb: 4200 },
      arusJenuhDasar: '',
      faktorPenyesuaian: {
        fus: 1.05,
        fuk: 0.97,
        fug: 1.00,
        fup: 1.00,
        fbki: 1.00,
        fbka: 0.97
      },
      arusJenuhYangDisesuaikan: { j: 4149, q: 774 },
      arusLaluLintas: 0.070,
      rasioArus: 0.091,
      rasioFase: 9,
      waktuHijauPerFase: '',
      kapasitas: '',
      derajatKejenuhan: ''
    },
    {
      kodePendekat: 'B',
      tipependekat: 'O',
      rasioKendaraanBelok: { rusun: '', rlk: 0.19, rlka: 0.23 },
      arusBelokKanan: { dariArahDitinjau: 193, dariArahBerlawanan: 26 },
      lebarEfektif: { ls: 7.0, jb: 3600 },
      arusJenuhDasar: '',
      faktorPenyesuaian: {
        fus: 1.05,
        fuk: 0.97,
        fug: 1.00,
        fup: 1.00,
        fbki: 1.00,
        fbka: 1.00
      },
      arusJenuhYangDisesuaikan: { j: 3667, q: 841 },
      arusLaluLintas: 0.142,
      rasioArus: '',
      rasioFase: 41,
      waktuHijauPerFase: '',
      kapasitas: '',
      derajatKejenuhan: ''
    },
    {
      kodePendekat: 'B',
      tipependekat: 'P/O',
      rasioKendaraanBelok: { rusun: '', rlk: '', rlka: '' },
      arusBelokKanan: { dariArahDitinjau: '', dariArahBerlawanan: '' },
      lebarEfektif: { ls: '', jb: '' },
      arusJenuhDasar: '',
      faktorPenyesuaian: {
        fus: '',
        fuk: '',
        fug: '',
        fup: '',
        fbki: '',
        fbka: ''
      },
      arusJenuhYangDisesuaikan: { j: 3850, q: 816 },
      arusLaluLintas: 0.212,
      rasioArus: '',
      rasioFase: 50,
      waktuHijauPerFase: 1643,
      kapasitas: '',
      derajatKejenuhan: 0.497
    }
  ]);

  const handleInputChange = (rowIndex, field, subField, value) => {
    const newData = [...tableData];
    if (subField) {
      if (!newData[rowIndex][field]) {
        newData[rowIndex][field] = {};
      }
      newData[rowIndex][field][subField] = value;
    } else {
      newData[rowIndex][field] = value;
    }
    setTableData(newData);
  };

  return (
    <div className="p-6 bg-base-100">
      <div className="mb-6">
        {/* <h2 className="text-[20px] text-base-content mb-2">
          FORM SA-IV
        </h2> */}
        <p className="text-sm text-base-content/70">
          Formulir analisis arus jenuh dan kapasitas
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-xs w-full border border-base-300">
          <thead>
            <tr className="bg-gray-300 text-sm">
              <th rowSpan={5} className="text-center border border-base-300">
                <div className="rotate-[270deg] font-semibold origin-center whitespace-nowrap">
                  Kode pendekat
                </div>
              </th>
              <th rowSpan={5} className="text-center border border-base-300">
                <div className='rotate-[270deg] font-semibold origin-center whitespace-nowrap'>
                  Hijau dalam fase ke-
                </div>
              </th>
              <th rowSpan={5} className="text-center border border-base-300 min-w-10">
                <div className='rotate-[270deg] font-semibold origin-center whitespace-nowrap'>
                  Tipe pendekat
                </div>
              </th>
              <th colSpan="3" className="text-center font-semibold border border-base-300 min-w-10">
                Rasio kendaraan belok
              </th>
              <th colSpan={2} className="text-center font-semibold border border-base-300 min-w-10">
                Arus belok kanan
              </th>
              <th rowSpan={3} className="text-center font-semibold border border-base-300 min-w-10">
                Lebar efektif
              </th>
              <th colSpan={8} className="text-center font-semibold border border-base-300 min-w-10">
                Arus jenuh
              </th>
              <th rowSpan={3} className="text-center font-semibold border border-base-300 min-w-10">
                Arus lalu lintas
              </th>
              <th rowSpan={3} className="text-center font-semibold border border-base-300 min-w-10">
                Rasio Arus
              </th>
              <th rowSpan={3} className="text-center font-semibold border border-base-300 min-w-10">
                Rasio Fase
              </th>
              <th rowSpan={3} className="text-center font-semibold border border-base-300 min-w-10">
                Waktu hijau per fase (i)
              </th>
              <th rowSpan={3} className="text-center font-semibold border border-base-300 min-w-10">
                Kapasitas
              </th>
              <th rowSpan={3} className="text-center font-semibold border border-base-300 min-w-10">
                Derajat kejenuhan
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th rowSpan={4} className="text-center font-semibold border border-base-300 min-w-10">R<sub>bkijt</sub></th>
              <th rowSpan={4} className="text-center font-semibold border border-base-300 min-w-10">R<sub>bki</sub></th>
              <th rowSpan={4} className="text-center font-semibold border border-base-300 min-w-10">R<sub>bka</sub></th>
              <th rowSpan={3} className="text-center font-semibold border border-base-300 min-w-10">dari arah ditinjau</th>
              <th rowSpan={3} className="text-center font-semibold border border-base-300 min-w-10">dari arah berlawanan</th>
              {/* <th className="text-center font-semibold border border-base-300 min-w-10">L<sub>e</sub></th> */}
              <th rowSpan={2} className="text-center font-semibold border border-base-300 min-w-10">Arus jenuh dasar</th>
              <th colSpan="6" className="text-center font-semibold border border-base-300 min-w-10">
                Faktor-faktor penyesuaian
              </th>
              <th rowSpan={2} className="text-center font-semibold border border-base-300 min-w-10">
                Arus jenuh yang disesuaikan
              </th>
            </tr>
            <tr className="bg-gray-300 text-xs">
              <th colSpan={4} className="text-center font-semibold border border-base-300 min-w-10">Semua Tipe Pendekat</th>
              <th colSpan={2} className="text-center font-semibold border border-base-300 min-w-10">Hanya tipe P</th>
            </tr>
            <tr className="bg-gray-300 text-xs">
              <th className="text-center font-semibold border border-base-300 min-w-16">L<sub>E</sub></th>
              <th className="text-center font-semibold border border-base-300 min-w-16">J<sub>O</sub></th>
              <th className="text-center font-semibold border border-base-300 min-w-16">F<sub>HS</sub></th>
              <th className="text-center font-semibold border border-base-300 min-w-16">F<sub>UK</sub></th>
              <th className="text-center font-semibold border border-base-300 min-w-16">F<sub>G</sub></th>
              <th className="text-center font-semibold border border-base-300 min-w-16">F<sub>P</sub></th>
              <th className="text-center font-semibold border border-base-300 min-w-16">F<sub>BKI</sub></th>
              <th className="text-center font-semibold border border-base-300 min-w-16">F<sub>BKA</sub></th>
              <th className="text-center font-semibold border border-base-300 min-w-16">J</th>
              <th className="text-center font-semibold border border-base-300 min-w-16">q</th>
              <th className="text-center font-semibold border border-base-300 min-w-16">R<sub>q/j</sub></th>
              <th className="text-center font-semibold border border-base-300 min-w-16">R<sub>F</sub></th>
              <th className="text-center font-semibold border border-base-300 min-w-16">W<sub>Hi</sub></th>
              <th className="text-center font-semibold border border-base-300 min-w-16">C</th>
              <th className="text-center font-semibold border border-base-300 min-w-16">D<sub>J</sub></th>
            </tr>
            <tr className="bg-gray-300 text-xs">
              <th className="text-center font-semibold border border-base-300 min-w-10">SMP/jam</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">SMP/jam</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">m</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">Gambar<br />SMP/jam</th>
              <th colSpan={6} className="text-center font-semibold border border-base-300 min-w-10">J = l<sub>s</sub> x F<sub>us</sub> x F<sub>uk</sub> x F<sub>ug</sub> x F<sub>up</sub> x F<sub>bki</sub> x F<sub>bka</sub></th>
              <th className="text-center font-semibold border border-base-300 min-w-10">SMP/jam</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">SMP/jam</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(18)/(17)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(19)/R<sub>ig</sub></th>
              <th className="text-center font-semibold border border-base-300 min-w-10">detik</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(17)×(21)/S<br />SMP/jam</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(18)/(22)</th>

            </tr>
            <tr className="bg-gray-300 text-xs">
              <th className="text-center font-semibold border border-base-300 min-w-10">(1)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(2)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(3)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(4)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(5)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(6)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(7)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(8)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(9)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(10)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(11)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(12)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(13)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(14)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(15)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(16)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(17)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(18)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(19)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(20)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(21)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(22)</th>
              <th className="text-center font-semibold border border-base-300 min-w-10">(23)</th>


            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-base-200">
                <td className="text-center border border-base-300">
                  <input
                    type="text"
                    className="h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.kodePendekat}
                    onChange={(e) => handleInputChange(rowIndex, 'kodePendekat', null, e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="text"
                    className="h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.tipependekat}
                    onChange={(e) => handleInputChange(rowIndex, 'tipependekat', null, e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    step="0.01"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.rasioKendaraanBelok?.rusun || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'rasioKendaraanBelok', 'rusun', e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    step="0.01"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.rasioKendaraanBelok?.rlk || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'rasioKendaraanBelok', 'rlk', e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    step="0.01"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.rasioKendaraanBelok?.rlka || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'rasioKendaraanBelok', 'rlka', e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.arusBelokKanan?.dariArahDitinjau || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'arusBelokKanan', 'dariArahDitinjau', e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.arusBelokKanan?.dariArahBerlawanan || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'arusBelokKanan', 'dariArahBerlawanan', e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    step="0.1"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.lebarEfektif?.ls || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'lebarEfektif', 'ls', e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.arusJenuhDasar || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'arusJenuhDasar', null, e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    step="0.01"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.faktorPenyesuaian?.fus || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'faktorPenyesuaian', 'fus', e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    step="0.01"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.faktorPenyesuaian?.fuk || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'faktorPenyesuaian', 'fuk', e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    step="0.01"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.faktorPenyesuaian?.fug || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'faktorPenyesuaian', 'fug', e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    step="0.01"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.faktorPenyesuaian?.fup || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'faktorPenyesuaian', 'fup', e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    step="0.01"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.faktorPenyesuaian?.fbki || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'faktorPenyesuaian', 'fbki', e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    step="0.01"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.faktorPenyesuaian?.fbka || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'faktorPenyesuaian', 'fbka', e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.arusJenuhYangDisesuaikan?.j || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'arusJenuhYangDisesuaikan', 'j', e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.arusJenuhYangDisesuaikan?.q || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'arusJenuhYangDisesuaikan', 'q', e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    step="0.001"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.arusLaluLintas || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'arusLaluLintas', null, e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    step="0.001"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.rasioArus || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'rasioArus', null, e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.rasioFase || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'rasioFase', null, e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.waktuHijauPerFase || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'waktuHijauPerFase', null, e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.kapasitas || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'kapasitas', null, e.target.value)}
                  />
                </td>
                <td className="text-center border border-base-300">
                  <input
                    type="number"
                    step="0.001"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-full p-1 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center"
                    value={row.derajatKejenuhan || ''}
                    onChange={(e) => handleInputChange(rowIndex, 'derajatKejenuhan', null, e.target.value)}
                  />
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="24" className="border border-base-300 p-2">
                <div className="flex justify-center">
                  <div className="bg-yellow-200 px-4 py-2 text-center text-xs">
                    <span className="font-bold">Catatan:</span> P = <span className="bg-yellow-300 px-1">P</span> &nbsp;&nbsp; O = <span className="bg-orange-300 px-1">O</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            const newRow = {
              kodePendekat: '',
              tipependekat: '',
              rasioKendaraanBelok: { rusun: '', rlk: '', rlka: '' },
              arusBelokKanan: { dariArahDitinjau: '', dariArahBerlawanan: '' },
              lebarEfektif: { ls: '', jb: '' },
              arusJenuhDasar: '',
              faktorPenyesuaian: {
                fus: '',
                fuk: '',
                fug: '',
                fup: '',
                fbki: '',
                fbka: ''
              },
              arusJenuhYangDisesuaikan: { j: '', q: '' },
              arusLaluLintas: '',
              rasioArus: '',
              rasioFase: '',
              waktuHijauPerFase: '',
              kapasitas: '',
              derajatKejenuhan: ''
            };
            setTableData([...tableData, newRow]);
          }}
        >
          Tambah Baris
        </button>

        <button
          className="btn btn-sm btn-success"
          onClick={() => {
            console.log('Data saved:', tableData);
            alert('Data berhasil disimpan! (Lihat console untuk detail)');
          }}
        >
          Simpan Data
        </button>

        <button
          className="btn btn-sm btn-warning"
          onClick={() => {
            if (confirm('Apakah Anda yakin ingin menghapus semua data?')) {
              setTableData([]);
            }
          }}
        >
          Reset Tabel
        </button>
      </div>
    </div>
  );
}