"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { apiSAIForm, apiSAIIIForm } from '@/lib/apiService';
import { toast } from 'react-toastify';

export default function VehicleDataTable ({ setDataKonflik, selectedId }) {
  const [tableData, setTableData] = useState({
    whh: 0,
    dataFase: [
      // {
      //   fase: 2,
      //   kode: 'U',
      //   whh: 0,
      //   jarak: {
      //     lintasanBerangkat: {
      //       pendekat: {
      //         u: 0, s: 0, t: 0, b: 0
      //       },
      //       kecepatan: {
      //         vkbr: 0, vkdt: 0, vpk: 0
      //       },
      //       waktuTempuh: 0,
      //       wms: 0,
      //       wmsDisesuaikan: 0,
      //       wk: 0,
      //       wah: 0,
      //     },
      //     panjangBerangkat: {
      //       pendekat: {
      //         u: 0, s: 0, t: 0, b: 0
      //       },
      //       kecepatan: {
      //         vkbr: 0, vkdt: 0, vpk: 0
      //       },
      //       waktuTempuh: 0,
      //       wms: 0,
      //       wmsDisesuaikan: 0,
      //       wk: 0,
      //       wah: 0,
      //     },
      //     lintasanDatang: {
      //       pendekat: {
      //         u: 0, s: 0, t: 0, b: 0
      //       },
      //       kecepatan: {
      //         vkbr: 0, vkdt: 0, vpk: 0
      //       },
      //       waktuTempuh: 0,
      //       wms: 0,
      //       wmsDisesuaikan: 0,
      //       wk: 0,
      //       wah: 0,
      //     },
      //     lintasanPejalan: {
      //       pendekat: {
      //         u: 0, s: 0, t: 0, b: 0
      //       },
      //       kecepatan: {
      //         vkbr: 0, vkdt: 0, vpk: 0
      //       },
      //       waktuTempuh: 0,
      //       wms: 0,
      //       wmsDisesuaikan: 0,
      //       wk: 0,
      //       wah: 0,
      //     }
      //   }
      // },
      // {
      //   fase: 1,
      //   kode: 'S',
      //   whh: 0,
      //   jarak: {
      //     lintasanBerangkat: {
      //       pendekat: {
      //         u: 0, s: 0, t: 0, b: 0
      //       },
      //       kecepatan: {
      //         vkbr: 0, vkdt: 0, vpk: 0
      //       },
      //       waktuTempuh: 0,
      //       wms: 0,
      //       wmsDisesuaikan: 0,
      //       wk: 0,
      //       wah: 0,
      //     },
      //     panjangBerangkat: {
      //       pendekat: {
      //         u: 0, s: 0, t: 0, b: 0
      //       },
      //       kecepatan: {
      //         vkbr: 0, vkdt: 0, vpk: 0
      //       },
      //       waktuTempuh: 0,
      //       wms: 0,
      //       wmsDisesuaikan: 0,
      //       wk: 0,
      //       wah: 0,
      //     },
      //     lintasanDatang: {
      //       pendekat: {
      //         u: 0, s: 0, t: 0, b: 0
      //       },
      //       kecepatan: {
      //         vkbr: 0, vkdt: 0, vpk: 0
      //       },
      //       waktuTempuh: 0,
      //       wms: 0,
      //       wmsDisesuaikan: 0,
      //       wk: 0,
      //       wah: 0,
      //     },
      //     lintasanPejalan: {
      //       pendekat: {
      //         u: 0, s: 0, t: 0, b: 0
      //       },
      //       kecepatan: {
      //         vkbr: 0, vkdt: 0, vpk: 0
      //       },
      //       waktuTempuh: 0,
      //       wms: 0,
      //       wmsDisesuaikan: 0,
      //       wk: 0,
      //       wah: 0,
      //     }
      //   }
      // }
    ]
  });

  const recalculateWhh = (dataFase) => {
    // Menjumlahkan semua nilai wah dari lintasanBerangkat di setiap fase
    const totalWah = dataFase.reduce((total, fase) => {
      return total + (fase.jarak.lintasanBerangkat.wah || 0);
    }, 0);

    return totalWah;
  };


  const [totals, setTotals] = useState({});
  const wkBaku = 3;

  const safeNum = (v) => {
    const num = parseFloat(v);
    return isNaN(num) ? 0 : num;
  };

  const handleInputChange = (rowIndex, jarakType, field, subField, value) => {
    // Clone data agar aman
    const updatedData = JSON.parse(JSON.stringify(tableData));
    const updatedRow = updatedData.dataFase[rowIndex];

    // Simpan nilai mentah (string) supaya edit lancar
    if (subField) {
      updatedRow.jarak[jarakType][field][subField] = value;
    } else {
      updatedRow.jarak[jarakType][field] = value;
    }

    // Helper: jumlah pendekat
    const sumPendekat = (p) =>
      safeNum(p?.u) + safeNum(p?.t) + safeNum(p?.b) + safeNum(p?.s);

    // Hitung ulang total per jarakType
    const LKBR = sumPendekat(updatedRow.jarak.panjangBerangkat?.pendekat);
    const PKBR = sumPendekat(updatedRow.jarak.lintasanBerangkat?.pendekat);
    const LKDT = sumPendekat(updatedRow.jarak.lintasanDatang?.pendekat);
    const LPK = sumPendekat(updatedRow.jarak.lintasanPejalan?.pendekat);

    // Kecepatan
    const vkbr = safeNum(updatedRow.jarak.lintasanBerangkat?.kecepatan?.vkbr ||
      updatedRow.jarak.panjangBerangkat?.kecepatan?.vkbr);
    const vkdt = safeNum(updatedRow.jarak.lintasanDatang?.kecepatan?.vkdt);

    // Ambil WMS Disesuaikan & Waktu Kehilangan
    const wmsLintasan = safeNum(updatedRow.jarak.lintasanBerangkat?.wmsDisesuaikan);
    const wmsPanjang = safeNum(updatedRow.jarak.panjangBerangkat?.wmsDisesuaikan);
    const wmsDatang = safeNum(updatedRow.jarak.lintasanDatang?.wmsDisesuaikan);

    const wkLintasan = safeNum(updatedRow.jarak.lintasanBerangkat?.wk);
    const wkPanjang = safeNum(updatedRow.jarak.panjangBerangkat?.wk);
    const wkDatang = safeNum(updatedRow.jarak.lintasanDatang?.wk);

    const wk = wkBaku ?? wkLintasan ?? wkPanjang ?? wkDatang ?? 0;

    // Hitung WMS & WAH
    const waktums2 = vkdt > 0 ? parseFloat((LKDT / vkdt).toFixed(2)) : 0;
    const waktums =
      vkbr > 0
        ? parseFloat((((PKBR + LKBR) / vkbr) - waktums2) * 0.1).toFixed(2)
        : 0;

    if (vkbr > 0) {
      ["lintasanBerangkat", "panjangBerangkat", "lintasanDatang"].forEach((jt) => {
        updatedRow.jarak[jt].wms = parseFloat(waktums);
        updatedRow.jarak[jt].wmsDisesuaikan = Math.ceil(waktums);
      });
    }

    const totalswah = (wmsLintasan || wmsPanjang || wmsDatang || 0) + wk;
    if (totalswah > 0) {
      ["lintasanBerangkat", "panjangBerangkat", "lintasanDatang"].forEach((jt) => {
        updatedRow.jarak[jt].wah = totalswah;
      });
    }

    // Hitung ulang WHH
    if (totalswah > 0) {
      updatedData.whh = recalculateWhh(updatedData.dataFase);
    }

    // Hitung ulang waktu tempuh
    if (vkbr > 0) {
      ["lintasanBerangkat", "panjangBerangkat"].forEach((jt) => {
        const totalJarak = sumPendekat(updatedRow.jarak[jt]?.pendekat);
        updatedRow.jarak[jt].waktuTempuh = parseFloat((totalJarak / vkbr).toFixed(2));
      });
    }
    if (vkdt > 0) {
      ["lintasanDatang"].forEach((jt) => {
        const totalJarak = sumPendekat(updatedRow.jarak[jt]?.pendekat);
        updatedRow.jarak[jt].waktuTempuh = parseFloat((totalJarak / vkdt).toFixed(2));
      });
    }

    // Simpan ke state
    updatedData.dataFase[rowIndex] = updatedRow;
    setTableData(updatedData);
  };



  const handleKodeChange = (rowIndex, value) => {
    const newData = { ...tableData };
    const newDataFase = [...newData.dataFase];
    newDataFase[rowIndex].kode = value;
    newData.dataFase = newDataFase;
    setTableData(newData);
  };

  const jarakTypes = [
    { key: 'lintasanBerangkat', label: 'Lintasan Kendaraan Berangkat, L', sub: 'kbr' },
    { key: 'panjangBerangkat', label: 'Panjang Kendaraan Berangkat, P', sub: 'kbr' },
    { key: 'lintasanDatang', label: 'Lintasan Kendaraan Datang, L', sub: 'kdt' },
    { key: 'lintasanPejalan', label: 'Lintasan Pejalan Kaki, L', sub: 'pk' }
  ];

  function convertPhaseDataToOriginal (phaseData) {
    const cleanNumber = (num) => {
      // Kalau null, undefined, string kosong → kembalikan 0
      if (num === null || num === undefined || num === '') return 0;

      const parsed = parseFloat(num);
      if (isNaN(parsed)) return 0; // bukan angka valid

      // Kalau integer, langsung kembalikan
      if (Number.isInteger(parsed)) return parsed;

      // Kalau ada desimal, bulatkan ke 2 digit
      return parseFloat(parsed.toFixed(2));
    };

    // const whhGlobal = cleanNumber(phaseData?.[0]?.jarak?.[0]?.wHijau) || 0;
    const whhGlobal = Math.max(
      0,
      ...(phaseData || [])
        .flatMap(phase => (phase?.jarak || []).map(j => cleanNumber(j?.wHijau) || 0))
    );


    return {
      whh: whhGlobal,
      dataFase: phaseData.map((phase) => {
        // dari array `jarak` ke object keyed by type
        const jarakObj = {};
        phase.jarak.forEach((item) => {
          jarakObj[item.type] = {
            pendekat: item.pendekat,
            kecepatan: {
              vkbr: cleanNumber(item.kecepatan.berangkat),
              vkdt: cleanNumber(item.kecepatan.datang),
              vpk: cleanNumber(item.kecepatan.pejalanKaki)
            },
            waktuTempuh: cleanNumber(item.waktuTempuh),
            wms: cleanNumber(item.wws),
            wmsDisesuaikan: cleanNumber(item.wusDisarankan),
            wk: cleanNumber(item.wk),
            wah: cleanNumber(item.wAll),
          };
        });

        return {
          fase: phase.fase,
          kode: phase.kode,
          whh: whhGlobal, // semua pakai whhGlobal
          jarak: jarakObj
        };
      })
    };
  }

  const fetchDataSAI = async (id) => {
    try {
      const response = await apiSAIForm.getByIdSAI(id);
      console.log(response.data.data)
      if (response && response.data) {
        return response.data.data || [];
      }
    } catch (error) {
      console.error('Error fetching survey data:', error);
      const existing = JSON.parse(localStorage.getItem('data'));
      return existing?.data?.sa1?.[selectedId];
    }
  };

  const fetchDataSAIII = async (id) => {
    try {
      const response = await apiSAIIIForm.getByIdSAIII(id);

      if (response && response.data) {
        const { phaseData, whh } = response.data.data;
        console.log(convertPhaseDataToOriginal(phaseData, whh))
        return convertPhaseDataToOriginal(phaseData, whh);
      }
    } catch (error) {
      console.error('Error fetching survey data:', error);
      const existing = JSON.parse(localStorage.getItem('data'));
      return existing?.data?.sa3?.[selectedId];
    }
  };

  const fetchAllData = async (id) => {
    try {
      const [sa1Result, sa3Result] = await Promise.all([
        fetchDataSAI(id),
        fetchDataSAIII(id)
      ]);

      toast.success("Semua data SA berhasil dimuat", {
        autoClose: 1000,
        position: "top-center",
      });
      return { sa1Result, sa3Result };
    } catch (error) {
      console.error("Error loading SA data:", error);
      toast.error("Gagal memuat data SA", {
        autoClose: 1500,
        position: "top-center",
      });
      return null;
    }
  };


  useEffect(() => {
    const loadData = async () => {
      if (!selectedId || selectedId === 0 || selectedId === '0') {
        setTableData({});
        return;
      }
      const { sa1Result, sa3Result } = await fetchAllData(selectedId);
      const sa1 = sa1Result;
      const sa3 = sa3Result;
      const faseData = sa1?.fase || {};

      const pendekatMap = {
        u: "U",
        s: "S",
        t: "T",
        b: "B",
      };

      const defaultJarak = () => ({
        pendekat: { u: 0, s: 0, t: 0, b: 0 },
        kecepatan: { vkbr: 0, vkdt: 0, vpk: 0 },
        waktuTempuh: 0,
        wms: 0,
        wmsDisesuaikan: 0,
        wk: 3,
        wah: 0
      });

      // Ambil data awal dari sa3 jika ada
      const baseTableData = sa3 || { whh: 0, dataFase: [] };

      // Kumpulkan semua kombinasi fase dan kode yang aktif dari SA I
      const activeCombinations = new Map(); // key: "fase_kode", value: { fase: number, kode: string }
      const codeUsageCount = new Map(); // untuk tracking penggunaan kode per fase

      Object.entries(faseData).forEach(([key, detail]) => {
        const kode = pendekatMap[key.toLowerCase()?.charAt(0)] || '-';
        const fasePendekat = detail?.fase || {};

        // Hitung berapa fase yang aktif untuk kode ini
        const activeFases = Object.entries(fasePendekat)
          .filter(([_, aktif]) => aktif)
          .map(([faseKey, _]) => parseInt(faseKey.replace('fase_', '')));

        // Jika kode ini aktif di multiple fase, prioritaskan fase yang sudah ada di SA III
        if (activeFases.length > 1) {
          // Cek apakah ada data existing di SA III untuk kode ini
          let priorityFase = null;
          if (baseTableData.dataFase && baseTableData.dataFase.length > 0) {
            const existingItem = baseTableData.dataFase.find(item => item.kode === kode);
            if (existingItem && activeFases.includes(existingItem.fase)) {
              priorityFase = existingItem.fase;
            }
          }

          // Jika tidak ada di SA III, ambil fase terkecil
          const targetFase = priorityFase || Math.min(...activeFases);
          const combinationKey = `${targetFase}_${kode}`;
          activeCombinations.set(combinationKey, { fase: targetFase, kode });

          console.log(`Kode ${kode} aktif di fase: [${activeFases.join(', ')}], dipilih fase: ${targetFase}`);
        } else {
          // Jika hanya aktif di 1 fase, langsung masukkan
          activeFases.forEach(faseNum => {
            const combinationKey = `${faseNum}_${kode}`;
            activeCombinations.set(combinationKey, { fase: faseNum, kode });
          });
        }
      });

      // Buat mapping data SA III yang ada berdasarkan fase dan kode
      const existingDataMap = new Map();
      if (baseTableData.dataFase && baseTableData.dataFase.length > 0) {
        baseTableData.dataFase.forEach(item => {
          const key = `${item.fase}_${item.kode}`;
          existingDataMap.set(key, item);
        });
      }

      // Proses penggabungan data
      const processedDataFase = [];
      const processedKeys = new Set();

      // 1. Pertama, masukkan semua data SA III yang masih aktif di SA I
      activeCombinations.forEach((combination, key) => {
        if (existingDataMap.has(key)) {
          // Data sudah ada di SA III dan masih aktif di SA I
          processedDataFase.push({ ...existingDataMap.get(key) });
          processedKeys.add(key);
        }
      });

      // 2. Untuk kombinasi baru dari SA I yang belum ada di SA III
      activeCombinations.forEach((combination, key) => {
        if (!processedKeys.has(key)) {
          const { fase, kode } = combination;

          // Cari data dari fase yang sama tapi kode berbeda untuk di-copy
          const samePhaseExistingData = processedDataFase.find(item =>
            item.fase === fase && item.kode !== kode
          );

          // Cari data dari SA III yang ada di fase yang sama (untuk referensi copy)
          const samePhaseFromSA3 = Array.from(existingDataMap.values()).find(item =>
            item.fase === fase && item.kode !== kode
          );

          let newItem;

          if (samePhaseExistingData) {
            // Copy dari data yang sudah diproses di fase yang sama
            newItem = {
              fase: fase,
              kode: kode,
              whh: samePhaseExistingData.whh,
              jarak: JSON.parse(JSON.stringify(samePhaseExistingData.jarak))
            };
          } else if (samePhaseFromSA3) {
            // Copy dari SA III yang ada di fase yang sama
            newItem = {
              fase: fase,
              kode: kode,
              whh: samePhaseFromSA3.whh,
              jarak: JSON.parse(JSON.stringify(samePhaseFromSA3.jarak))
            };
          } else {
            // Cari data dari kode yang sama tapi fase berbeda
            const sameCodeData = Array.from(existingDataMap.values()).find(item =>
              item.kode === kode && item.fase !== fase
            );

            if (sameCodeData) {
              newItem = {
                fase: fase,
                kode: kode,
                whh: sameCodeData.whh,
                jarak: JSON.parse(JSON.stringify(sameCodeData.jarak))
              };
            } else {
              // Jika tidak ada referensi sama sekali, buat default
              newItem = {
                fase: fase,
                kode: kode,
                whh: baseTableData.whh || 0,
                jarak: {
                  lintasanBerangkat: defaultJarak(),
                  panjangBerangkat: defaultJarak(),
                  lintasanDatang: defaultJarak(),
                  lintasanPejalan: defaultJarak(),
                }
              };
            }
          }

          processedDataFase.push(newItem);
          processedKeys.add(key);
        }
      });

      // Urutkan berdasarkan fase, kemudian kode
      const sortedDataFase = processedDataFase.sort((a, b) => {
        if (a.fase !== b.fase) {
          return a.fase - b.fase;
        }
        return a.kode.localeCompare(b.kode);
      });

      // Set ke tableData
      const finalData = {
        whh: baseTableData.whh || Math.max(0, ...sortedDataFase.map(item => item.whh || 0)),
        dataFase: sortedDataFase
      };

      setTableData(finalData);
      setDataKonflik(finalData);

      console.log("Merged SA I and SA III data:", {
        "SA I active combinations": Array.from(activeCombinations.keys()),
        "SA III existing data": Array.from(existingDataMap.keys()),
        "Final processed data": sortedDataFase.map(item => `${item.fase}_${item.kode}`)
      });
    };

    loadData();
  }, [selectedId]);


  useEffect(() => {
    const newData = { ...tableData };
    const updatedDataFase = newData?.dataFase?.map((row) => {
      const newRow = { ...row };

      // iterasi semua jenis jarak (misalnya: 'lintasanBerangkat', 'pendekat', dst.)
      Object.keys(newRow.jarak).forEach((jarakKey) => {
        console.log(newRow.jarak, jarakKey)
        if (newRow.jarak[jarakKey].wk !== 3) {
          newRow.jarak[jarakKey].wk = 3;
        }
      });

      return newRow;
    });

    newData.dataFase = updatedDataFase;
    setTableData(newData);

  }, []);

  const totalRows = tableData?.dataFase?.length * jarakTypes.length || 0;

  const safeValue = (v) => v ?? '';

  return (
    <div className="p-6 bg-base-100 min-h-fit">
      <div className="mb-6">
        <h2 className="text-[20px] text-base-content mb-2">
          Tabel Data Kendaraan
        </h2>
        <p className="text-sm text-base-content/70">
          Input data kendaraan berdasarkan fase, kode pendekat, dan parameter lainnya
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-xs w-full border border-base-300">
          <thead>
            <tr className="bg-base-300">
              <th rowSpan="3" className="text-center border border-base-300 min-w-10 font-semibold">
                Fase
              </th>
              <th rowSpan="3" className="text-center border border-base-300 min-w-5 font-semibold">
                Kode <br /> Pendekat
              </th>
              <th rowSpan={'2'} className="text-center border border-base-300 min-w-14 font-semibold">
                Jarak
              </th>
              <th colSpan="4" className="text-center border border-base-300 font-semibold">
                Kode Pendekat
              </th>
              <th colSpan="3" className="text-center border border-base-300 font-semibold">
                Kecepatan (m/detik)
              </th>
              <th rowSpan="2" className="text-center border border-base-300 min-w-10 font-semibold">
                Waktu <br />Tempuh
              </th>
              <th rowSpan="2" className="text-center border border-base-300 min-w-10 font-semibold">
                W<sub>MS</sub>
              </th>
              <th rowSpan="2" className="text-center border border-base-300 min-w-10 font-semibold">
                W<sub>MS</sub> <br /> Disesuaikan
              </th>
              <th rowSpan="2" className="text-center border border-base-300 min-w-10 font-semibold">
                W<sub>K</sub>
              </th>
              <th rowSpan="2" className="text-center border border-base-300 min-w-10 font-semibold">
                W<sub>AH</sub>
              </th>
              <th rowSpan="2" className="text-center border border-base-300 min-w-10 font-semibold">
                W<sub>HH</sub>
              </th>
            </tr>
            <tr className="bg-base-300">
              <th rowSpan={2} className="text-center border border-base-300 min-w-10 font-semibold">U</th>
              <th rowSpan={2} className="text-center border border-base-300 min-w-10 font-semibold">S</th>
              <th rowSpan={2} className="text-center border border-base-300 min-w-10 font-semibold">T</th>
              <th rowSpan={2} className="text-center border border-base-300 min-w-10 font-semibold">B</th>
              <th className="text-center border border-base-300 min-w-10 font-semibold">
                Berangkat
              </th>
              <th className="text-center border border-base-300 min-w-10 font-semibold">
                Datang
              </th>
              <th className="text-center border border-base-300 min-w-10 font-semibold">
                Pejalan Kaki
              </th>
            </tr>
            <tr className="bg-base-300 text-xs">
              <th className="text-center border border-base-300 font-semibold">(m)</th>
              <th className="text-center border border-base-300 font-semibold">
                V<sub>kbr</sub>
              </th>
              <th className="text-center border border-base-300 font-semibold">
                V<sub>kdt</sub>
              </th>
              <th className="text-center border border-base-300 font-semibold">
                V<sub>pk</sub>
              </th>
              <th className="text-center border border-base-300 font-semibold">(detik)</th>
              <th className="text-center border border-base-300 font-semibold">(detik)</th>
              <th className="text-center border border-base-300 font-semibold">(detik)</th>
              <th className="text-center border border-base-300 font-semibold">(detik)</th>
              <th className="text-center border border-base-300 font-semibold">(detik)</th>
              <th className="text-center border border-base-300 font-semibold">(detik/siklus)</th>
            </tr>
          </thead>
          <tbody>
            {tableData?.dataFase?.map((row, rowIndex) =>
            (
              jarakTypes.map((jarakType, jarakIndex) => (
                <tr key={`${rowIndex}-${jarakIndex}`} className="hover:bg-base-200">
                  {jarakIndex === 0 && (
                    <td rowSpan="4" className="text-center border border-base-300 font-semibold align-middle">
                      {safeValue(row.fase)}
                    </td>
                  )}
                  {jarakIndex === 0 && (
                    <td rowSpan="4" className="text-center border border-base-300 p-0">
                      <div className="flex h-full min-h-[16rem]">
                        <input
                          type="text"
                          className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-full min-w-10 border-0"
                          value={safeValue(row.kode)}
                          onChange={(e) => handleKodeChange(rowIndex, e.target.value)}
                        />
                      </div>
                    </td>
                  )}
                  <td className="border border-base-300">
                    <div className="text-xs text-base-content/70">
                      {jarakType.label}<sub>{jarakType.sub}</sub>
                    </div>
                  </td>
                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-full min-w-10 border-0"
                        value={safeValue(row.jarak[jarakType.key].pendekat.u === 0 || row.jarak[jarakType.key].pendekat.u === '0' ? '' : row.jarak[jarakType.key].pendekat.u)}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'pendekat', 'u', e.target.value)
                        }
                      />
                    </div>
                  </td>
                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-full min-w-10 border-0"
                        value={safeValue(row.jarak[jarakType.key].pendekat.s === 0 || row.jarak[jarakType.key].pendekat.s === '0' ? '' : row.jarak[jarakType.key].pendekat.s)}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'pendekat', 's', e.target.value)
                        }
                      />
                    </div>
                  </td>
                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-full min-w-10 border-0"
                        value={safeValue(row.jarak[jarakType.key].pendekat.t === 0 || row.jarak[jarakType.key].pendekat.t === '0' ? '' : row.jarak[jarakType.key].pendekat.t)}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'pendekat', 't', e.target.value)
                        }
                      />
                    </div>

                  </td>
                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-full min-w-10 border-0"
                        value={safeValue(row.jarak[jarakType.key].pendekat.b === 0 || row.jarak[jarakType.key].pendekat.b === '0' ? '' : row.jarak[jarakType.key].pendekat.b)}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'pendekat', 'b', e.target.value)
                        }
                      />
                    </div>

                  </td>
                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        step="0.1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-full min-w-10 border-0"
                        value={safeValue(row.jarak[jarakType.key].kecepatan.vkbr === 0 || row.jarak[jarakType.key].kecepatan.vkbr === '0' ? '' : row.jarak[jarakType.key].kecepatan.vkbr)}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'kecepatan', 'vkbr', e.target.value)
                        }
                      />
                    </div>

                  </td>
                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        step="0.1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-full min-w-10 border-0"
                        value={safeValue(row.jarak[jarakType.key].kecepatan.vkdt === 0 || row.jarak[jarakType.key].kecepatan.vkdt === '0' ? '' : row.jarak[jarakType.key].kecepatan.vkdt)}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'kecepatan', 'vkdt', e.target.value)
                        }
                      />
                    </div>
                  </td>
                  <td className="border border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        step="0.1"
                        className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 p-0 focus:border-transparent focus:outline-0 focus:ring-0 text-center w-full min-w-10 border-0"
                        value={safeValue(row.jarak[jarakType.key].kecepatan.vpk === 0 || row.jarak[jarakType.key].kecepatan.vpk === '0' ? '' : row.jarak[jarakType.key].kecepatan.vpk)}
                        onChange={(e) =>
                          handleInputChange(rowIndex, jarakType.key, 'kecepatan', 'vpk', e.target.value)
                        }
                      />
                    </div>

                  </td>
                  <td className="text-center border-base-300 p-0">
                    <div className="flex h-full min-h-[4rem]">
                      <input
                        type="number"
                        step="0.01"
                        readOnly
                        className="focus:outline-none appearance-none flex-1 p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-10 font-semibold border-0 focus:ring-0 text-center"
                        // value={safeValue(row.jarak[jarakType.key].waktuTempuh}
                        value={safeValue(row.jarak[jarakType.key].waktuTempuh === 0 || row.jarak[jarakType.key].waktuTempuh === '0' ? '' : row.jarak[jarakType.key].waktuTempuh)}

                      // value={safeValue(row.jarak[jarakType.key].pendekat.u / row.jarak[jarakType.key].kecepatan.vkbr}
                      // onChange={() => {
                      //   const pendekatU = row?.jarak?.[jarakType?.key]?.pendekat?.u ?? 0;
                      //   const kecepatanVkbr = row?.jarak?.[jarakType?.key]?.kecepatan?.vkbr ?? 1; // hindari dibagi 0

                      //   const hasil = pendekatU / kecepatanVkbr;
                      //   handleInputChange(rowIndex, jarakType.key, 'waktuTempuh', null, hasil)
                      // }
                      // }
                      />
                    </div>
                  </td>
                  {jarakIndex === 0 && (
                    <td className="border border-base-300 p-0" rowSpan={4}>
                      <div className="flex h-full min-h-[4rem]">
                        <input
                          type="number"
                          step="0.01"
                          readOnly
                          className="focus:outline-none appearance-none flex-1 p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-10 font-semibold border-0 focus:ring-0 text-center"
                          value={safeValue(row.jarak[jarakType.key].wms === 0 || row.jarak[jarakType.key].wms === '0' ? '' : row.jarak[jarakType.key].wms)}
                          onChange={(e) =>
                            handleInputChange(rowIndex, jarakType.key, 'wms', null, e.target.value)
                          }
                        />
                      </div>
                    </td>
                  )}
                  {jarakIndex === 0 && (
                    <td className="border border-base-300 p-0" rowSpan={4}>
                      <div className="flex h-full min-h-[4rem]">
                        <input
                          type="number"
                          step="1"
                          readOnly
                          className="focus:outline-none appearance-none flex-1 p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-10 font-semibold border-0 focus:ring-0 text-center"
                          value={safeValue(row.jarak[jarakType.key].wmsDisesuaikan === 0 || row.jarak[jarakType.key].wmsDisesuaikan === '0' ? '' : row.jarak[jarakType.key].wmsDisesuaikan)}
                          // value={safeValue(row.jarak[jarakType.key].wms === 0 || row.jarak[jarakType.key].wms === '0' ? '' : row.jarak[jarakType.key].wms}
                          onChange={(e) =>
                            handleInputChange(rowIndex, jarakType.key, 'wmsDisesuaikan', null, e.target.value)
                          }
                        />
                      </div>
                    </td>
                  )}
                  {jarakIndex === 0 && (
                    <td className="border border-base-300 p-0" rowSpan={4}>
                      <div className="flex h-full min-h-[4rem]">
                        <input
                          type="number"
                          step="1"
                          className="focus:outline-none appearance-none flex-1 p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-10 font-semibold border-0 focus:ring-0 text-center"
                          value={safeValue(row.jarak[jarakType.key].wk === 0 || row.jarak[jarakType.key].wk === '0' ? '' : row.jarak[jarakType.key].wk)}
                          onChange={(e) =>
                            handleInputChange(rowIndex, jarakType.key, 'wk', null, e.target.value)
                          }
                        />
                      </div>
                    </td>
                  )}

                  {jarakIndex === 0 && (
                    <td className="border border-base-300 p-0" rowSpan={4}>
                      <div className="flex h-full min-h-[4rem]">
                        <input
                          type="number"
                          step="1"
                          readOnly
                          className="focus:outline-none appearance-none flex-1 p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-10 font-semibold border-0 focus:ring-0 text-center"
                          value={safeValue(row.jarak[jarakType.key].wah === 0 || row.jarak[jarakType.key].wah === '0' ? '' : row.jarak[jarakType.key].wah)}
                        // onChange={(e) =>
                        //   handleInputChange(rowIndex, jarakType.key, 'wah', null, e.target.value)
                        // }
                        />
                      </div>
                    </td>
                  )}
                  {/* 
                  {jarakIndex === 0 && (
                    <td className="border border-base-300 p-0" rowSpan={4 * (jarakIndex + 1)}>
                      <div className="flex h-full min-h-[4rem]">
                        <input
                          type="number"
                          step="1"
                          readOnly
                          className="focus:outline-none appearance-none flex-1 p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-10 font-semibold border-0 focus:ring-0 text-center"
                          value={tableData.whh}
                        // onChange={(e) =>
                        //   handleInputChange(rowIndex, jarakType.key, 'wah', null, e.target.value)
                        // }
                        />
                      </div>
                    </td>
                  )} */}

                  {rowIndex === 0 && jarakIndex === 0 && (
                    <td rowSpan={totalRows}>
                      <input
                        value={tableData.whh === 0 || tableData.whh === '0' ? '' : tableData.whh}
                        readOnly
                        className="focus:outline-none appearance-none flex-1 p-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full min-w-10 font-semibold border-0 focus:ring-0 text-center"
                      />
                    </td>
                  )}
                </tr>
              ))))}
            <tr>
              <td colSpan={8} className='text-xs text-base-600 align-text-top border-1 border-base-100'>
                <strong>Catatan:</strong><br /> Dari fase 3 ke 4 tidak memerlukan WMS karena arus dari barat tetap berjalan
              </td>
              <td colSpan={3} className='text-xs text-base-600 align-text-top'>
                <table>
                  <tbody>
                    <tr>
                      <td>V<sub>KDT</sub></td>
                      <td className='text-nowrap'>= m/det (Kendaraan Bermotor)</td>
                    </tr>
                    <tr>
                      <td className='align-text-top'>V<sub>KBR</sub></td>
                      <td className='text-nowrap'>
                        <ul>
                          <li>= 10 m/det (Kendaraan Bermotor)</li>
                          <li>= 3 m/det (Kendaraan tidak bermotor misalnya sepeda)</li>
                          <li>= 1,2 m/det (pejalan kaki)</li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td className='align-text-top'>V<sub>KBR</sub></td>
                      <td className='text-nowrap'>
                        <ul>
                          <li>= 5 m/det (MP atau KS)</li>
                          <li>= 2 m/det (SM atau KTB)</li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td colSpan={5} className='border-1 border-base-100'>
                <Image
                  src="/image/Picture1.png"
                  alt=""
                  width={300}
                  height={200}
                  className='m-auto'
                /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          className="btn btn-sm btn-success"
          onClick={() => {
            setDataKonflik(tableData)
          }}
        >
          Simpan Data
        </button>

        {/* <button
          className="btn btn-sm btn-warning"
          onClick={() => {
            if (confirm('Apakah Anda yakin ingin menghapus semua data?')) {
              setTableData([]);
            }
          }}
        >
          Reset Tabel
        </button> */}
      </div>

      {/* <div className="mt-4 p-3 bg-gray-100 rounded">
        <h3 className="text-[12px] font-medium mb-2">Data JSON saat ini:</h3>
        <pre className="text-[10px] overflow-x-auto">
          {JSON.stringify(tableData, null, 2)}
        </pre>
      </div> */}
      {/* <div className="mt-6 p-4 bg-base-200 rounded-lg">
        <h3 className="font-semibold mb-2">Keterangan:</h3>
        <div className="text-sm space-y-1">
          <p>• L<sub>bkr</sub>: Lintasan Kendaraan Berangkat</p>
          <p>• P<sub>bkr</sub>: Panjang Kendaraan Berangkat</p>
          <p>• L<sub>dkt</sub>: Lintasan Kendaraan Datang</p>
          <p>• L<sub>pk</sub>: Lintasan Pejalan Kaki</p>
          <p>• V<sub>bkr</sub>: Kecepatan Berangkat</p>
          <p>• V<sub>dkt</sub>: Kecepatan Datang</p>
          <p>• V<sub>pk</sub>: Kecepatan Pejalan Kaki</p>
        </div>
      </div> */}
    </div>
  );
}
