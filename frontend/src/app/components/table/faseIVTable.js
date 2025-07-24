import Image from 'next/image';
import { lazy, Suspense, useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';

export default function FormSAIVTable ({ setFormTableIV, selectedId }) {
  const [tableData, setTableData] = useState({
    foot: {
      whh: 0,
      sbp: 0,
      S: 0,
      ras: 0,
    },
    tabel: [
      {
        kodePendekat: 'U',
        hijauFase: 1,
        tipependekat: 'P',
        rasioKendaraanBelok: { rbkijt: 0, rbki: 0, rbka: 0 },
        arusBelokKanan: { dariArahDitinjau: 0, dariArahBerlawanan: 0 },
        lebarEfektif: 0,
        arusJenuhDasar: 0,
        faktorPenyesuaian: {
          fhs: 0,
          fux: 0,
          fg: 0,
          fp: 0,
          fbki: 0,
          fbka: 0
        },
        arusJenuhYangDisesuaikan: { j: 0 },
        arusLaluLintas: 0,
        rasioArus: 0,
        rasioFase: 0,
        waktuHijauPerFase: 0,
        kapasitas: 0,
        derajatKejenuhan: 0
      }
    ]
  });

  const recalculateTableData = (tabel, foot) => {
    const updatedTable = tabel.map((row) => {
      // Hitung ulang arus jenuh disesuaikan jika perlu
      const arusJenuhDasar = row.lebarEfektif * 600;
      const totalFaktor = Object.values(row.faktorPenyesuaian || {}).reduce(
        (acc, val) => acc * (parseFloat(val) || 1),
        1
      );
      const arusJenuhDisesuaikan = Math.round(arusJenuhDasar * totalFaktor);
      const arusLaluLintas = parseFloat(row.arusLaluLintas) || 0;

      return {
        ...row,
        arusJenuhDasar,
        arusJenuhYangDisesuaikan: { j: arusJenuhDisesuaikan },
        rasioArus: arusJenuhDisesuaikan > 0 ? (arusLaluLintas / arusJenuhDisesuaikan).toFixed(3) : 0
      };
    });

    // Hitung total rasio per pendekat
    const totalRasio = hitungTotalRasioArusPerPendekat(updatedTable);
    const uniqueKodePendekat = [...new Set(updatedTable.map((row) => row.kodePendekat))];
    const rasTotal = uniqueKodePendekat.reduce((acc, kode) => acc + (totalRasio[kode] || 0), 0);

    const tableWithRasioFase = updatedTable.map((row) => {
      const key = row.kodePendekat;
      const total = totalRasio[key] || 0;
      const arusJenuh = row.arusJenuhYangDisesuaikan?.j || 0;
      const arusLaluLintas = row.arusLaluLintas || 0;
      const rasioFase = rasTotal > 0 ? Number((total / rasTotal).toFixed(3)) : 0;
      const hijauFase = ((foot.S - foot.whh) * rasioFase).toFixed(0);
      const kapasitas = (arusJenuh * hijauFase) / foot.S;
      const derajatKejenuhan = kapasitas > 0 ? (arusLaluLintas / kapasitas).toFixed(3) : 0;

      return {
        ...row,
        rasioFase,
        waktuHijauPerFase: hijauFase,
        kapasitas,
        derajatKejenuhan
      };
    });

    const sbp = (((1.5 * foot.whh) + 5) / (1 - rasTotal)).toFixed(2);

    setTableData((prev) => ({
      ...prev,
      tabel: tableWithRasioFase,
      foot: {
        ...foot,
        ras: Number(rasTotal.toFixed(3)),
        sbp
      }
    }));
  };



  const handleInputChangeFoot = (rowIndex, field, subField, value) => {
    const newValue = parseFloat(value);

    // Jika field termasuk properti di foot, update foot
    // if (['whh', 'sbp', 'S', 'ras'].includes(field)) {
    //   setTableData((prev) => ({
    //     ...prev,
    //     foot: {
    //       ...prev.foot,
    //       [field]: newValue
    //     }
    //   }));
    //   return;
    // }

    if (['whh', 'sbp', 'S', 'ras'].includes(field)) {
      const updatedFoot = {
        ...tableData.foot,
        [field]: newValue
      };

      recalculateTableData(tableData.tabel, updatedFoot);
      return;
    }


    // Update isi tabel
    const newTabel = [...tableData.tabel];

    if (subField) {
      if (!newTabel[rowIndex][field]) {
        newTabel[rowIndex][field] = {};
      }
      newTabel[rowIndex][field][subField] = newValue;

      // Perhitungan khusus jika ubah faktorPenyesuaian
      if (field === 'faktorPenyesuaian') {
        const faktorObj = newTabel[rowIndex].faktorPenyesuaian;
        const arusJenuhDasar = newTabel[rowIndex].arusJenuhDasar || 0;
        const totalFaktor = Object.values(faktorObj).reduce((acc, val) => acc * (parseFloat(val) || 1), 1);
        newTabel[rowIndex].arusJenuhYangDisesuaikan = {
          j: Math.round(arusJenuhDasar * totalFaktor)
        };
      }

    } else {
      newTabel[rowIndex][field] = newValue;

      // Perhitungan khusus jika lebarEfektif diubah
      if (field === 'lebarEfektif') {
        const lebar = newValue;
        if (!isNaN(lebar)) {
          newTabel[rowIndex].arusJenuhDasar = lebar * 600;

          const faktorObj = newTabel[rowIndex].faktorPenyesuaian;
          const totalFaktor = Object.values(faktorObj).reduce((acc, val) => acc * (parseFloat(val) || 1), 1);
          newTabel[rowIndex].arusJenuhYangDisesuaikan = {
            j: Math.round(lebar * 600 * totalFaktor)
          };
        }
      }
    }

    setTableData((prev) => ({
      ...prev,
      tabel: newTabel
    }));
  };

  const parseNumber = (v) => {
    const num = parseFloat(v);
    return isNaN(num) ? 0 : num;
  };

  const handleInputChange = (rowIndex, field, subField, value) => {
    // Step 1: Copy tabel dan row
    const updatedTabel = [...tableData.tabel];
    const updatedRow = { ...updatedTabel[rowIndex] };

    // Step 2: Ubah subfield (contoh: faktorPenyesuaian.fux)
    if (subField) {
      const subObject = { ...updatedRow[field] }; // misalnya field === 'faktorPenyesuaian'
      subObject[subField] = parseFloat(value) || 0;
      updatedRow[field] = subObject;

      // Hitung ulang arus jenuh disesuaikan
      if (field === 'faktorPenyesuaian') {
        const totalFaktor = Object.values(subObject).reduce(
          (acc, val) => acc * (parseFloat(val) || 1),
          1
        );
        updatedRow.arusJenuhYangDisesuaikan = {
          j: Math.round((updatedRow.arusJenuhDasar || 0) * totalFaktor)
        };
      }
    } else {
      // Step 3: Ubah langsung nilai utama di row
      updatedRow[field] = parseFloat(value) || 0;

      if (field === 'lebarEfektif') {
        const lebar = updatedRow.lebarEfektif || 0;
        updatedRow.arusJenuhDasar = lebar * 600;

        const faktor = updatedRow.faktorPenyesuaian || {};
        const totalFaktor = Object.values(faktor).reduce(
          (acc, val) => acc * (parseFloat(val) || 1),
          1
        );
        updatedRow.arusJenuhYangDisesuaikan = {
          j: Math.round(lebar * 600 * totalFaktor)
        };
      }
    }

    // Step 4: Update baris di tabel
    updatedTabel[rowIndex] = updatedRow;

    // Step 5: Recalculate total rasio dll
    recalculateTableData(updatedTabel, tableData.foot);
  };



  const getPendekatFromLocalStorage = (id) => {
    const raw = localStorage.getItem('data');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return parsed?.data?.sa1[id] || [];
    } catch (e) {
      console.error('Gagal parse data:', e);
      return [];
    }
  };

  const getArahBerlawanan = (kode) => {
    const mapping = {
      U: 'S',
      S: 'U',
      T: 'B',
      B: 'T'
    };
    return mapping[kode] || '';
  };

  const hitungTotalRasioArusPerPendekat = (rows) => {
    const totalPerArah = {};

    for (const row of rows) {
      const kode = row.kodePendekat;
      if (!(kode in totalPerArah)) {
        totalPerArah[kode] = parseFloat(row.rasioArus) || 0;
      }
      // jika sudah ada, lewati (ambil satu saja)
    }

    return totalPerArah;
  };

  useEffect(() => {
    if (!selectedId || selectedId === 0 || selectedId === '0') {
      setTableData([]);
      return;
    }

    const raw = localStorage.getItem('data');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      const sa1 = parsed?.data?.sa1?.[selectedId];
      const sa2 = parsed?.data?.sa2?.[selectedId];
      const sa3 = parsed?.data?.sa3?.[selectedId];
      const sa4 = parsed?.data?.sa4?.[selectedId];

      if (!sa1) {
        setTableData({})
        toast.error("Data Form SA 1 tidak ditemukan!", { position: 'top-right' });
        return;
      }

      if (!sa2) {
        toast.error("Data Form SA 2 tidak ditemukan!", { position: 'top-right' });
        setTableData({})
        return;
      }

      if (!sa3) {
        setTableData({})
        toast.error("Data Form SA 3 tidak ditemukan!", { position: 'top-right' });
        return;
      }

      const pendekats = sa1.pendekat || [];
      const faseData = sa1.fase?.data || {};
      const surveyData = sa2.surveyData || [];
      const formsa3 = sa3.tabel_konflik || {};

      // Ambil data tabel dari SA4 jika ada
      const sa4TableData = sa4?.SAIV?.tabel || [];
      console.log('SA4 table data:', sa4TableData);

      const newTable = [];
      pendekats.forEach((pendekat) => {
        const kode = pendekat.kodePendekat?.toUpperCase();
        const arahBerlawananKode = getArahBerlawanan(kode);
        const arahKey = Object.keys(faseData).find((key) =>
          key.toLowerCase().startsWith(kode.toLowerCase())
        );

        const fasePendekat = faseData[arahKey]?.fase || {};
        const faseAktif = Object.entries(fasePendekat)
          .filter(([_, isTrue]) => isTrue)
          .map(([faseKey]) => parseInt(faseKey.replace('fase_', '')));

        // Data survey pendekat saat ini
        const surveyForDirection = Array.isArray(surveyData)
          ? surveyData.find((item) => item.direction?.toUpperCase() === kode)
          : null;

        // Data survey dari arah berlawanan
        const surveyBerlawanan = Array.isArray(surveyData)
          ? surveyData.find((item) => item.direction?.toUpperCase() === arahBerlawananKode)
          : null;

        const rasio = {
          rbkijt: '',
          rbki: '',
          rbka: ''
        };

        let arusLaluLintas = 0

        const arus = {
          dariArahDitinjau: '',
          dariArahBerlawanan: ''
        };

        if (surveyForDirection?.rows?.length) {
          surveyForDirection.rows.forEach((row) => {
            const type = row?.type?.toLowerCase() || '';
            const val = row?.ktb?.rasio ?? '';
            const vals = row?.total?.terlawan ?? '';

            if (type.includes('lurus')) rasio.rbkijt = val;
            if (type.includes('bki / bkijt')) rasio.rbki = val;
            if (type.includes('bka')) {
              rasio.rbka = val;
              arus.dariArahDitinjau = vals;
            }
            arusLaluLintas = row?.total?.terlindung || ''
          });
        }

        if (surveyBerlawanan?.rows?.length) {
          surveyBerlawanan.rows.forEach((row) => {
            const type = row?.type?.toLowerCase() || '';
            const val = row?.total?.terlawan ?? '';

            if (type.includes('bka')) {
              arus.dariArahBerlawanan = val;
            }
          });
        }

        faseAktif.forEach((fase) => {
          const lebar = parseFloat(pendekat.lebarPendekat.awalLajur || 0);
          const arusJenuhDasar = lebar * 600;

          // Set nilai default faktorPenyesuaian
          let faktorPenyesuaian = {
            fhs: 1.0,
            fux: 1.0,
            fg: 1.0,
            fp: 1.0,
            fbki: 1.0,
            fbka: 1.0
          };

          // Cari data faktorPenyesuaian dari SA4 berdasarkan kodePendekat dan hijauFase
          const existingRow = sa4TableData.find((row) =>
            row.kodePendekat?.toUpperCase() === kode &&
            row.hijauFase === fase
          );

          if (existingRow?.faktorPenyesuaian) {
            // Override dengan data dari SA4 jika ada
            faktorPenyesuaian = {
              fhs: existingRow.faktorPenyesuaian.fhs ?? 1.0,
              fux: existingRow.faktorPenyesuaian.fux ?? 1.0,
              fg: existingRow.faktorPenyesuaian.fg ?? 1.0,
              fp: existingRow.faktorPenyesuaian.fp ?? 1.0,
              fbki: existingRow.faktorPenyesuaian.fbki ?? 1.0,
              fbka: existingRow.faktorPenyesuaian.fbka ?? 1.0
            };
            console.log(`Found faktorPenyesuaian for ${kode} fase ${fase}:`, faktorPenyesuaian);
          } else {
            console.log(`No faktorPenyesuaian found for ${kode} fase ${fase}, using default values`);
          }

          const totalFaktor = Object.values(faktorPenyesuaian).reduce(
            (acc, val) => acc * (parseFloat(val) || 1),
            1
          );

          const arusJenuh = arusJenuhDasar * totalFaktor;

          newTable.push({
            kodePendekat: kode,
            hijauFase: fase,
            tipependekat: 'P',
            rasioKendaraanBelok: rasio,
            arusBelokKanan: arus,
            lebarEfektif: lebar,
            arusJenuhDasar,
            faktorPenyesuaian,
            arusJenuhYangDisesuaikan: { j: Math.round(arusJenuh) },
            arusLaluLintas,
            rasioArus: arusJenuh > 0 ? arusLaluLintas / arusJenuh : 0,
            rasioFase: 0,
            waktuHijauPerFase: 0,
            kapasitas: 0,
            derajatKejenuhan: 0
          });
        });
      });

      console.log('Direction yang tersedia:', surveyData.map(d => d.direction));
      console.log('new data', newTable);

      const totalRasio = hitungTotalRasioArusPerPendekat(newTable);

      // 1. Hitung total ras berdasarkan kode pendekat unik
      const uniqueKodePendekat = [...new Set(newTable.map((row) => row.kodePendekat))];
      console.log(uniqueKodePendekat, totalRasio);
      const rasTotal = uniqueKodePendekat.reduce((acc, kode) => {
        const val = totalRasio[kode] || 0;
        return acc + val;
      }, 0);

      // 2. Baru hitung tableWithRasioFase berdasarkan rasTotal yang sudah dihitung
      const whh = formsa3?.whh || 0;
      const S = 100;
      const ras = Number(rasTotal.toFixed(3));

      const tableWithRasioFase = newTable.map((row) => {
        const key = row.kodePendekat;
        const total = totalRasio[key] || 0;
        const arusJenuh = row.arusJenuhYangDisesuaikan?.j || 0;
        const arusLaluLintas = row.arusLaluLintas || 0;
        const rasioFase = ras > 0 ? Number((total / ras).toFixed(3)) : 0;
        const hijauFase = ((S - whh) * rasioFase).toFixed(0);
        const kapasitas = (arusJenuh * hijauFase) / S;
        const derajatKejenuhan = kapasitas > 0 ? (arusLaluLintas / kapasitas).toFixed(3) : 0;
        return {
          ...row,
          rasioFase,
          kapasitas,
          waktuHijauPerFase: hijauFase,
          derajatKejenuhan
        };
      });

      const sbp = (((1.5 * whh) + 5) / (1 - ras)).toFixed(2);

      // 3. Update tableData sekaligus
      setTableData((prev) => ({
        ...prev,
        tabel: tableWithRasioFase,
        foot: {
          ...prev.foot,
          ras,
          whh,
          S,
          sbp
        }
      }));

    } catch (e) {
      console.error('Gagal parse data:', e);
    }
  }, [selectedId]);

  const setToLocal = () => {
    setFormTableIV(tableData)
  }

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
            <tr className="bg-gray-200 text-sm">
              <th rowSpan={5} className="text-center border border-base-300">
                <div className="rotate-[270deg] text-xs font-semibold text-gray-900 origin-center whitespace-nowrap">
                  Kode pendekat
                </div>
              </th>
              <th rowSpan={5} className="text-center border border-base-300">
                <div className='rotate-[270deg] text-xs font-semibold text-gray-900 origin-center whitespace-nowrap'>
                  Hijau dalam fase ke-
                </div>
              </th>
              <th rowSpan={5} className="text-center border border-base-300">
                <div className='rotate-[270deg] text-xs font-semibold text-gray-900 origin-center whitespace-nowrap'>
                  Tipe pendekat
                </div>
              </th>
              <th colSpan="3" className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">
                Rasio kendaraan belok
              </th>
              <th colSpan={2} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">
                Arus belok kanan
              </th>
              <th rowSpan={3} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">
                Lebar efektif
              </th>
              <th colSpan={8} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">
                Arus jenuh
              </th>
              <th rowSpan={3} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">
                Arus lalu lintas
              </th>
              <th rowSpan={3} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">
                Rasio Arus
              </th>
              <th rowSpan={3} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">
                Rasio Fase
              </th>
              <th rowSpan={3} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">
                Waktu hijau per fase (i)
              </th>
              <th rowSpan={3} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">
                Kapasitas
              </th>
              <th rowSpan={3} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">
                Derajat kejenuhan
              </th>
            </tr>
            <tr className="bg-gray-200">
              <th rowSpan={4} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">R<sub>bkijt</sub></th>
              <th rowSpan={4} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">R<sub>bki</sub></th>
              <th rowSpan={4} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">R<sub>bka</sub></th>
              <th rowSpan={3} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">dari arah ditinjau</th>
              <th rowSpan={3} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">dari arah berlawanan</th>
              {/* <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">L<sub>e</sub></th> */}
              <th rowSpan={2} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">Arus jenuh dasar</th>
              <th colSpan="6" className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">
                Faktor-faktor penyesuaian
              </th>
              <th rowSpan={2} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">
                Arus jenuh yang disesuaikan
              </th>
            </tr>
            <tr className="bg-gray-200 text-xs">
              <th colSpan={4} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">Semua Tipe Pendekat</th>
              <th colSpan={2} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">Hanya tipe P</th>
            </tr>
            <tr className="bg-gray-200 text-xs">
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap min-w-10">L<sub>E</sub></th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap min-w-10">J<sub>O</sub></th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap min-w-10">F<sub>HS</sub></th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap min-w-10">F<sub>UX</sub></th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap min-w-10">F<sub>G</sub></th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap min-w-10">F<sub>P</sub></th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap min-w-10">F<sub>BKI</sub></th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap min-w-10">F<sub>BKA</sub></th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap min-w-10">J</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap min-w-10">q</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap min-w-10">R<sub>q/j</sub></th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap min-w-10">R<sub>F</sub></th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap min-w-10">W<sub>HI</sub></th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap min-w-10">C</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap min-w-10">D<sub>J</sub></th>
            </tr>
            <tr className="bg-gray-200 text-xs">
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">SMP/jam</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">SMP/jam</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">m</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">Gambar<br />SMP/jam</th>
              <th colSpan={6} className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">J = l<sub>s</sub> x F<sub>us</sub> x F<sub>uk</sub> x F<sub>ug</sub> x F<sub>up</sub> x F<sub>bki</sub> x F<sub>bka</sub></th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">SMP/jam</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">SMP/jam</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(18)/(17)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(19)/R<sub>ig</sub></th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">detik</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(17)×(21)/S<br />SMP/jam</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(18)/(22)</th>

            </tr>
            <tr className="bg-gray-200 text-xs">
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(1)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(2)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(3)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(4)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(5)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(6)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(7)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(8)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(9)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(10)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(11)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(12)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(13)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(14)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(15)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(16)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(17)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(18)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(19)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(20)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(21)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(22)</th>
              <th className="text-center text-xs font-semibold text-gray-900 border border-base-300 text-wrap">(23)</th>


            </tr>
          </thead>
          <tbody>
            {tableData?.tabel?.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-base-200">

                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="text"
                      disabled
                      className="p-0 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center flex-1 "
                      value={row.kodePendekat}
                      onChange={(e) => handleInputChange(rowIndex, 'kodePendekat', null, e.target.value)}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="text"
                      disabled
                      className="p-0 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center flex-1"
                      value={row.hijauFase}
                      onChange={(e) => handleInputChange(rowIndex, 'tipependekat', null, e.target.value)}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="text"
                      disabled
                      className="p-0 focus:border-transparent focus:outline-0 focus:ring-0 w-full text-center flex-1"
                      value={row.tipependekat}
                      onChange={(e) => handleInputChange(rowIndex, 'tipependekat', null, e.target.value)}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      disabled
                      step="0.01"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.rasioKendaraanBelok?.rbkijt || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'rasioKendaraanBelok', 'rusun', e.target.value)}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      disabled
                      step="0.01"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.rasioKendaraanBelok?.rbki || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'rasioKendaraanBelok', 'rlk', e.target.value)}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      disabled
                      step="0.01"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.rasioKendaraanBelok?.rbka || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'rasioKendaraanBelok', 'rlka', e.target.value)}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      disabled
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.arusBelokKanan?.dariArahDitinjau || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'arusBelokKanan', 'dariArahDitinjau', e.target.value)}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      disabled
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.arusBelokKanan?.dariArahBerlawanan || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'arusBelokKanan', 'dariArahBerlawanan', e.target.value)}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      step="0.1"
                      disabled
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.lebarEfektif || ''}
                      onChange={(e) =>
                        handleInputChange(rowIndex, 'lebarEfektif', null, parseFloat(e.target.value))
                      }
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      disabled
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.arusJenuhDasar || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'arusJenuhDasar', null, e.target.value)}
                    />
                  </div>
                </td>
                <td className="border bg-green-500/10 border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      step="0.01"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.faktorPenyesuaian?.fhs || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'faktorPenyesuaian', 'fhs', e.target.value)}
                    />
                  </div>
                </td>
                <td className="border bg-green-500/10 border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      step="0.01"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.faktorPenyesuaian?.fux || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'faktorPenyesuaian', 'fux', e.target.value)}
                    />
                  </div>
                </td>
                <td className="border bg-green-500/10 border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      step="0.01"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.faktorPenyesuaian?.fg || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'faktorPenyesuaian', 'fg', e.target.value)}
                    />
                  </div>
                </td>
                <td className="border bg-green-500/10 border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      step="0.01"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.faktorPenyesuaian?.fp || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'faktorPenyesuaian', 'fp', e.target.value)}
                    />
                  </div>
                </td>
                <td className="border bg-green-500/10 border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      step="0.01"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.faktorPenyesuaian?.fbki || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'faktorPenyesuaian', 'fbki', e.target.value)}
                    />
                  </div>
                </td>
                <td className="border bg-green-500/10 border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      step="0.01"
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.faktorPenyesuaian?.fbka || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'faktorPenyesuaian', 'fbka', e.target.value)}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      disabled
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.arusJenuhYangDisesuaikan?.j || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'arusJenuhYangDisesuaikan', 'j', e.target.value)}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      step="0.001"
                      disabled
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.arusLaluLintas || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'arusLaluLintas', null, e.target.value)}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      step="0.001"
                      disabled
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.rasioArus || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'rasioArus', null, e.target.value)}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      disabled
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.rasioFase || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'rasioFase', null, e.target.value)}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      disabled
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.waktuHijauPerFase || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'waktuHijauPerFase', null, e.target.value)}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      disabled
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.kapasitas || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'kapasitas', null, e.target.value)}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 p-0">
                  <div className="flex h-full min-h-[2rem]">
                    <input
                      type="number"
                      step="0.001"
                      disabled
                      className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                      value={row.derajatKejenuhan || ''}
                      onChange={(e) => handleInputChange(rowIndex, 'derajatKejenuhan', null, e.target.value)}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {/* <tr>
              {[...Array(23)].map((_, i) => (
                <td className="border border-gray-300 p-0" key={i}>
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              {[...Array(10)].map((_, i) => (
                <td className="border border-gray-300 p-0" key={i}>
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                  </div>
                </td>
              ))}

              <td className="border border-gray-300 p-0">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  Catatan
                </div>
              </td>
              <td className="border border-gray-300 p-0 bg-yellow-200">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  P
                </div>
              </td>
              <td className="border border-gray-300 p-0 bg-yellow-200">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  O
                </div>
              </td>
              {[...Array(10)].map((_, i) => (
                <td className="border border-gray-300 p-0" key={i}>
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              {[...Array(10)].map((_, i) => (
                <td className="border border-gray-300 p-0" key={i}>
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                  </div>
                </td>
              ))}

              <td className="border border-gray-300 p-0 bg-yellow-200">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  Asumsi
                </div>
              </td>
              <td className="border border-gray-300 p-0 text-blue-600">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  0,35
                </div>
              </td>
              <td className="border border-gray-300 p-0 text-blue-600">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  0,65
                </div>
              </td>
              <td className="border border-gray-300 p-0 text-blue-600">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                </div>
              </td>
              <td className="border border-gray-300 p-0" colSpan={4} rowSpan={3}>
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  Pada fase 3, arus terlindung dari Barat "dianggap" 35% tersalurkan, dan sisanya disalurkan dalam fase ke 4 bersamaan dengan arus terlawan
                </div>
              </td>
              {[...Array(5)].map((_, i) => (
                <td className="border border-gray-300 p-0" key={i}>
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              {[...Array(10)].map((_, i) => (
                <td className="border border-gray-300 p-0" key={i}>
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                  </div>
                </td>
              ))}

              <td className="border border-gray-300 p-0 bg-yellow-200">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  q
                </div>
              </td>
              <td className="border border-gray-300 p-0 text-blue-600">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  0,35
                </div>
              </td>
              <td className="border border-gray-300 p-0 text-blue-600">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  0,65
                </div>
              </td>
              <td className="border border-gray-300 p-0 text-blue-600">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  0,65
                </div>
              </td>
              {[...Array(5)].map((_, i) => (
                <td className="border border-gray-300 p-0" key={i}>
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              {[...Array(10)].map((_, i) => (
                <td className="border border-gray-300 p-0" key={i}>
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                  </div>
                </td>
              ))}

              <td className="border border-gray-300 p-0 bg-yellow-200">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  <sup>R</sup>q/j
                </div>
              </td>
              <td className="border border-gray-300 p-0 text-blue-600">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  0,35
                </div>
              </td>
              <td className="border border-gray-300 p-0 text-blue-600">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  0,65
                </div>
              </td>
              <td className="border border-gray-300 p-0 text-blue-600">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                </div>
              </td>
              {[...Array(5)].map((_, i) => (
                <td className="border border-gray-300 p-0" key={i}>
                  <div className="flex h-full min-h-[2rem] items-center justify-center">
                  </div>
                </td>
              ))}
            </tr> */}
            <tr>
              <td className="border border-gray-300 p-0" colSpan={4} rowSpan={2}>
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  Waktu hilang hijau total, W<sup>HH</sup> =
                </div>
              </td>
              <td className="border border-gray-300 p-0" rowSpan={2}>
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  {tableData?.foot?.whh || 0}
                </div>
              </td>
              <td className="border border-gray-300 p-0" rowSpan={2}>
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  detik
                </div>
              </td>
              <td className="border border-gray-300 p-0" colSpan={4}>
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  Waktu siklus pra penyesuaian, s<sup>bp</sup> =
                </div>
              </td>
              <td className="border border-gray-300 p-0">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  {isNaN(tableData?.foot?.sbp) ? 0 : tableData?.foot?.sbp}
                </div>
              </td>
              <td className="border border-gray-300 p-0">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  detik
                </div>
              </td>
              <td className="border border-gray-300 p-0" colSpan={3} rowSpan={2}>
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  <Image src={"/image/Picture2.png"} alt={""} width={100} height={50} />
                </div>
              </td>
              <td className="border border-gray-300 p-0 bg-gray-200" rowSpan={2}>
                <div className="flex h-full min-h-[2rem] items-center justify-center ">
                </div>
              </td>
              <td className="border border-gray-300 p-0" rowSpan={2} colSpan={2}>
                <div className="flex flex-col h-full min-h-[2rem] items-center justify-center">
                  <div>Rasio Arus Simpang RAS</div>
                  <div>
                    = Σi (R<sub>q</sub>/J kritis)i =
                  </div>
                </div>
              </td>
              <td className="border border-gray-300 p-0" rowSpan={2}>
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  {tableData?.foot?.ras || ''}
                </div>
              </td>
              <td className="border border-gray-300 p-0 bg-gray-200" rowSpan={2}>
                <div className="flex h-full min-h-[2rem] items-center justify-center ">
                </div>
              </td>
              <td className="border border-gray-300 p-0" rowSpan={2} colSpan={3}>
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  W<sub>HI</sub>  =   s  -  W<sub>HH</sub> x R<sub>F</sub>
                </div>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-0" colSpan={4}>
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  Waktu siklus disesuaikan, s =
                </div>
              </td>
              <td className="border border-gray-300 p-0">
                {/* <div className="flex h-full min-h-[2rem] items-center justify-center">
                  
                </div> */}
                <div className="flex h-full min-h-[2rem]">
                  <input
                    type="number"
                    step="0.001"
                    className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-10 border-0"
                    value={tableData?.foot?.S || ''}
                    onChange={(e) =>
                      handleInputChangeFoot(null, 'S', null, e.target.value)
                    } />
                </div>
              </td>
              <td className="border border-gray-300 p-0">
                <div className="flex h-full min-h-[2rem] items-center justify-center">
                  detik
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          className="btn btn-sm btn-success"
          onClick={() => {
            setToLocal()
          }}
        >
          Simpan Data
        </button>
      </div>
    </div>
  );
}