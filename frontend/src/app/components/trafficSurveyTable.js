'use client'

import React, { useEffect, useState } from 'react';
import { apiSAIForm, apiSAIIForm } from '@/lib/apiService';
import { useAuth } from '../context/authContext';
import { TbReload } from "react-icons/tb";
import { BiMath } from "react-icons/bi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TrafficSurveyTable = ({ dataEMP, selectedId, setDataTraffic, idSimpang }) => {
  const { setLoading } = useAuth()

  const mock = {
    u: {
      mp: [500, 100, 140],
      ks: [100, 250, 80],
      sm: [120, 220, 50],
      ktb: [0, 2, 0],
      rktb: [4, null, null]
    },
    t: {
      mp: [300, 120, 90],
      ks: [80, 210, 70],
      sm: [110, 200, 45],
      ktb: [1, 1, 1],
      rktb: [3, null, null]
    },
    b: {
      mp: [500, 620, 290],
      ks: [80, 270, 420],
      sm: [110, 110, 65],
      ktb: [1, 5, 2],
      rktb: [3, null, null]
    },
    s: {
      mp: [312, 620, 290],
      ks: [850, 270, 420],
      sm: [160, 310, 65],
      ktb: [1, 4, 2],
      rktb: [2, null, null]
    },
  };

  const defaultValue = {
    mp: [0, 0, 0],
    ks: [0, 0, 0],
    sm: [0, 0, 0],
    ktb: [0, 0, 0],
    rktb: [null, null, null]
  };

  const fetchDataSAII = async (id) => {
    try {
      setLoading(true);
      const response = await apiSAIIForm.getByIdSAII(id);
      console.log(response.data.data)
      if (response && response.data) {
        return response.data.data || [];
      }
    } catch (error) {
      console.error('Error fetching survey data:', error);
      const existing = JSON.parse(localStorage.getItem('data'));
      setLoading(false);
      return existing?.data?.sa1?.[selectedId];
    }
  };

  const fetchDataSAIIArus = async (id) => {
    try {
      setLoading(true);
      const response = await apiSAIIForm.getByIdArus(id);
      console.log(response.data.data)
      if (response && response.data) {
        return response.data.data || [];
      }
    } catch (error) {
      console.error('Error fetching survey data:', error);
      const existing = JSON.parse(localStorage.getItem('data'));
      setLoading(false);
      return existing?.data?.sa1?.[selectedId];
    }
  };

  const getKinerjaDataByDirection = async (direction, surveyData) => {
    try {
      const newMock = {};

      const dirData = surveyData.find(d => d.direction?.toLowerCase() === direction?.toLowerCase());
      if (!dirData) return mock[direction.toLowerCase()] || defaultValue;

      const rows = Array.isArray(dirData.rows) ? dirData.rows : [];

      // Urutan harus sesuai: BKi / BKIJT, Lurus, BKa
      newMock[direction.toLowerCase()] = {
        mp: rows.map(r => r.mp?.kendjam ?? 0),
        ks: rows.map(r => r.ks?.kendjam ?? 0),
        sm: rows.map(r => r.sm?.kendjam ?? 0),
        ktb: rows.map(r => r.ktb?.count ?? 0),
        rktb: rows.map(r => r.rktb ?? null)
      }
      return newMock;
    } catch (error) {
      console.error(`Gagal ambil data kinerja untuk direction ${direction}:`, error);
    }
  };

  const generateSurveyDataFromPendekat = async (pendekatArray) => {
    if (!Array.isArray(pendekatArray)) return [];

    const pendekatMap = {
      u: "U",
      s: "S",
      t: "T",
      b: "B"
    };

    const result = [];

    const data = await fetchDataSAII(selectedId);

    const surveyData = Array.isArray(data?.surveyData) ? data.surveyData : [];

    for (const item of pendekatArray) {
      const kode = item?.kodePendekat?.toLowerCase();
      const direction = pendekatMap[kode];
      if (!direction) continue;
      const kinerja = await getKinerjaDataByDirection(kode, surveyData);

      const urutanJenis = ["BKi / BKIJT", "Lurus", "BKa"];

      // default mock kalau tidak ada data
      const defaultKinerja = {
        mp: [0, 0, 0],
        ks: [0, 0, 0],
        sm: [0, 0, 0],
        ktb: [0, 0, 0],
        rktb: [0, 0, 0]
      };

      result.push({
        direction,
        rows: urutanJenis.map((type, idx) => {
          const kData = kinerja?.[kode] || defaultKinerja;

          return {
            type,
            mp: { kendjam: kData.mp?.[idx] || 0, terlindung: 0, terlawan: 0 },
            ks: { kendjam: kData.ks?.[idx] || 0, terlindung: 0, terlawan: 0 },
            sm: {
              kendjam: kData.sm?.[idx] || 0,
              terlindung: 0,
              terlawan: 0,
              smpTerlindung: 0,
              smpTerlawan: 0
            },
            ktb: {
              rasio: 0,
              count: kData.ktb?.[idx] || 0
            },
            rktb: kData.rktb?.[idx] || 0
            // PERBAIKAN: Hapus subtotal dari setiap row
          };
        })
      });
    }

    return result;
  };

  const [trafficData, setTrafficData] = useState({
    surveyData: []
  });

  const getPendekatFromAPI = async (id) => {
    try {
      const response = await apiSAIForm.getByIdSAI(id);
      console.log(response)
      return response?.data?.data?.pendekat || [];
    } catch (error) {
      console.error('Gagal fetch data dari API:', error);
      return [];
    }
  };

  // PERBAIKAN: Revisi fungsi calculateDataDirectly
  const calculateDataDirectly = async (surveyDataArray) => {
    if (!surveyDataArray || !dataEMP?.terlindung || !dataEMP?.terlawan) {
      return [];
    }

    const updatedData = surveyDataArray.map((directionData) => {
      // PERBAIKAN: Inisialisasi subtotal di level direction
      const subtotal = {
        mp: { kendjam: 0, terlindung: 0, terlawan: 0 },
        ks: { kendjam: 0, terlindung: 0, terlawan: 0 },
        sm: { kendjam: 0, terlindung: 0, terlawan: 0, smpTerlindung: 0, smpTerlawan: 0 },
        total: { kendjam: 0, terlindung: 0, terlawan: 0, smpTerlindung: 0, smpTerlawan: 0 },
        ktb: 0,
        rktb: 0
      };

      const updatedRows = directionData.rows.map((row) => {
        const newRow = { ...row };
        let totalTerlindung = 0;
        let totalTerlawan = 0;
        let totalKendjam = 0;

        ['mp', 'ks', 'sm'].forEach((kendaraan) => {
          const kendjam = row[kendaraan]?.kendjam ?? 0;
          const empTerlindung = parseFloat(dataEMP.terlindung?.[kendaraan]) || 0;
          const empTerlawan = parseFloat(dataEMP.terlawan?.[kendaraan]) || 0;

          const terlindung = kendjam * empTerlindung;
          const terlawan = kendjam * empTerlawan;

          newRow[kendaraan] = {
            ...row[kendaraan],
            terlindung,
            terlawan,
            kendjam
          };

          // PERBAIKAN: Handle sm dengan SMP
          if (kendaraan === 'sm') {
            newRow[kendaraan].smpTerlindung = terlindung;
            newRow[kendaraan].smpTerlawan = terlawan;
          }

          totalTerlindung += terlindung;
          totalTerlawan += terlawan;
          totalKendjam += kendjam;

          // PERBAIKAN: Akumulasi ke subtotal
          subtotal[kendaraan].kendjam += kendjam;
          subtotal[kendaraan].terlindung += terlindung;
          subtotal[kendaraan].terlawan += terlawan;
          
          if (kendaraan === 'sm') {
            subtotal[kendaraan].smpTerlindung += terlindung;
            subtotal[kendaraan].smpTerlawan += terlawan;
          }
        });

        newRow.total = {
          terlindung: totalTerlindung,
          terlawan: totalTerlawan,
          smpTerlindung: totalTerlindung,
          smpTerlawan: totalTerlawan,
          kendjam: totalKendjam
        };

        // PERBAIKAN: Akumulasi total ke subtotal
        subtotal.total.kendjam += totalKendjam;
        subtotal.total.terlindung += totalTerlindung;
        subtotal.total.terlawan += totalTerlawan;
        subtotal.total.smpTerlindung += totalTerlindung;
        subtotal.total.smpTerlawan += totalTerlawan;
        subtotal.ktb += row.ktb?.count ?? 0;

        return newRow;
      });

      // PERBAIKAN: Hitung rktb setelah semua data terakumulasi
      subtotal.rktb = Number(((subtotal.ktb / subtotal.total.kendjam) || 0).toFixed(3));

      // PERBAIKAN: Hitung rasio KTB untuk setiap row
      const finalRows = updatedRows.map((row) => {
        const rowKendjam = row.total.kendjam || 0;
        const subtotalKendjam = subtotal.total.kendjam || 1;

        return {
          ...row,
          ktb: {
            ...row.ktb,
            rasio: +((rowKendjam / subtotalKendjam) || 0).toFixed(2)
          }
        };
      });

      // PERBAIKAN: Return dengan subtotal di level direction
      return {
        ...directionData,
        rows: finalRows,
        subtotal: {
          ...subtotal,
          mp: {
            ...subtotal.mp,
            terlindung: +subtotal.mp.terlindung.toFixed(0),
            terlawan: +subtotal.mp.terlawan.toFixed(0),
          },
          ks: {
            ...subtotal.ks,
            terlindung: +subtotal.ks.terlindung.toFixed(0),
            terlawan: +subtotal.ks.terlawan.toFixed(0),
          },
          sm: {
            ...subtotal.sm,
            terlindung: +subtotal.sm.terlindung.toFixed(0),
            terlawan: +subtotal.sm.terlawan.toFixed(0),
            smpTerlindung: +subtotal.sm.smpTerlindung.toFixed(0),
            smpTerlawan: +subtotal.sm.smpTerlawan.toFixed(0),
          },
          total: {
            ...subtotal.total,
            terlindung: +subtotal.total.terlindung.toFixed(0),
            terlawan: +subtotal.total.terlawan.toFixed(0),
            smpTerlindung: +subtotal.total.smpTerlindung.toFixed(0),
            smpTerlawan: +subtotal.total.smpTerlawan.toFixed(0),
          },
        }
      };
    });

    return updatedData;
  };

  const fetchData = async () => {
    console.log("testsa", selectedId);

    if (selectedId === 0 || selectedId === '0' || !selectedId) {
      setTrafficData({ surveyData: [] });
      setDataTraffic({ surveyData: [] });
      return;
    }

    try {
      if (!selectedId || selectedId === 0 || selectedId === '0') return;
      
      // Ambil data dari API
      const pendekatArr = await getPendekatFromAPI(selectedId);
      console.log(pendekatArr)
      const generated = await generateSurveyDataFromPendekat(pendekatArr);
      console.log(generated)
      
      // Jika ada dataEMP, langsung hitung data
      if (dataEMP?.terlindung && dataEMP?.terlawan && generated.length > 0) {
        const calculatedData = await calculateDataDirectly(generated);
        setTrafficData({ surveyData: calculatedData });
        setDataTraffic({ surveyData: calculatedData });
      } else {
        // Jika belum ada dataEMP, set data mentah dulu
        setTrafficData({ surveyData: generated });
        setDataTraffic({ surveyData: generated });
      }
      
      console.log("Data sent to parent:", generated);
    } catch (error) {
      console.error('Error fetching data:', error);
      setTrafficData({ surveyData: [] });
      setDataTraffic({ surveyData: [] });
    }
  };

  const recalculateData = async () => {
    if (!trafficData?.surveyData?.length || !dataEMP?.terlindung || !dataEMP?.terlawan) return;

    const calculatedData = await calculateDataDirectly(trafficData.surveyData);
    setTrafficData({ surveyData: calculatedData });
    setDataTraffic({ surveyData: calculatedData });
  };

  useEffect(() => {
    fetchData();
  }, [selectedId]);

  useEffect(() => {
    if (trafficData?.surveyData?.length > 0 && dataEMP?.terlindung && dataEMP?.terlawan) {
      const recalculate = async () => {
        const calculatedData = await calculateDataDirectly(trafficData.surveyData);
        setTrafficData({ surveyData: calculatedData });
        setDataTraffic({ surveyData: calculatedData });
      };
      recalculate();
    }
  }, [dataEMP]);

  const loadDataNew = async () => {
    try {
      setLoading(true);
      
      // ambil data arus terbaru
      const dataArus = await fetchDataSAIIArus(selectedId);

      // ambil pendekat dari API
      const pendekatArr = await getPendekatFromAPI(selectedId);

      const pendekatMap = { u: "U", s: "S", t: "T", b: "B" };
      const urutanJenis = ["BKi / BKIJT", "Lurus", "BKa"];

      // pakai Promise.all supaya tunggu semua kinerja selesai diambil
      const result = await Promise.all(
        pendekatArr.map(async (item) => {
          const kode = item?.kodePendekat?.toLowerCase();
          const direction = pendekatMap[kode];
          if (!direction) return null;

          // ambil data dari dataArus
          const arusData = dataArus[kode] || {
            mp: [0, 0, 0],
            ks: [0, 0, 0], 
            sm: [0, 0, 0],
            ktb: [0, 0, 0],
            rktb: [0, 0, 0]
          };

          return {
            direction,
            rows: urutanJenis.map((type, idx) => ({
              type,
              mp: { kendjam: arusData.mp[idx] || 0, terlindung: 0, terlawan: 0 },
              ks: { kendjam: arusData.ks[idx] || 0, terlindung: 0, terlawan: 0 },
              sm: {
                kendjam: arusData.sm[idx] || 0,
                terlindung: 0,
                terlawan: 0,
                smpTerlindung: 0,
                smpTerlawan: 0
              },
              ktb: { rasio: 0, count: arusData.ktb[idx] || 0 },
              rktb: arusData.rktb[idx] || 0
              // PERBAIKAN: Hapus subtotal dari setiap row
            }))
          };
        })
      );

      const cleanedResult = result.filter(Boolean);

      // Hitung data dan pastikan dikirim ke parent
      if (dataEMP?.terlindung && dataEMP?.terlawan) {
        const calculatedData = await calculateDataDirectly(cleanedResult);
        setTrafficData({ surveyData: calculatedData });
        setDataTraffic({ surveyData: calculatedData });
      } else {
        setTrafficData({ surveyData: cleanedResult });
        setDataTraffic({ surveyData: cleanedResult });
      }
      
      toast.success('Data berhasil dimuat ulang!');
    } catch (err) {
      console.error("Gagal load data arus terbaru:", err);
      setTrafficData({ surveyData: [] });
      setDataTraffic({ surveyData: [] });
      toast.error('Gagal memuat data baru.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!trafficData?.surveyData?.length) {
      toast.warning('Tidak ada data untuk dihitung ulang. Silakan ambil data terlebih dahulu.');
      return;
    }

    if (!dataEMP?.terlindung || !dataEMP?.terlawan) {
      toast.warning('Data EMP belum lengkap. Pastikan data EMP terlindung dan terlawan sudah terisi.');
      return;
    }

    try {
      setLoading(true);
      const calculatedData = await calculateDataDirectly(trafficData.surveyData);
      setTrafficData({ surveyData: calculatedData });
      setDataTraffic({ surveyData: calculatedData });
      toast.success('Perhitungan berhasil diperbarui!');
    } catch (error) {
      console.error('Error recalculating data:', error);
      toast.error('Gagal menghitung ulang data.');
    } finally {
      setLoading(false);
    }
  };

  const setLoadData = () => {
    toast.info(
      ({ closeToast }) => (
        <div>
          <p>Apakah Anda yakin ingin mengambil data baru?</p>
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                closeToast();
                loadDataNew();
                handleRecalculate();
              }}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Ya
            </button>
            <button
              onClick={closeToast}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
          </div>
        </div>
      ),
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
      }
    );
  }
  const renderTableRows = () => {
    const rows = [];

    console.log("test", trafficData)

    if (!trafficData || !trafficData.surveyData) {
      return rows;
    }

    console.log("test", trafficData)
    trafficData.surveyData?.forEach((directionData, dirIndex) => {
      const rowsData = directionData?.rows || []; // fallback empty array
      rowsData.forEach((row, rowIndex) => {
        const mp = row?.mp || { kendjam: 0, terlindung: 0, terlawan: 0 };
        const ks = row?.ks || { kendjam: 0, terlindung: 0, terlawan: 0 };
        const sm = row?.sm || { kendjam: 0, terlindung: 0, terlawan: 0, smpTerlindung: 0, smpTerlawan: 0 };
        const total = row?.total || { kendjam: 0, terlindung: 0, terlawan: 0, smpTerlindung: 0, smpTerlawan: 0 };
        const ktb = row?.ktb || { rasio: 0, count: 0 };

        rows.push(
          <tr key={`${dirIndex}-${rowIndex}`} className="border-gray-300">
            {rowIndex === 0 && (
              <td
                rowSpan={rowsData.length + 1}
                className="border-r border-gray-400 px-2 py-3 text-center font-semibold bg-base-100 align-middle"
              >
                {directionData?.direction || ""}
              </td>
            )}
            <td className="border-r border-gray-300 px-2 py-1 text-xs bg-base-50">
              {row?.type || ""}
            </td>

            {/* MP */}
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center text-blue-600 font-semibold">
              {mp.kendjam}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center">
              {mp.terlindung.toFixed(0)}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center">
              {mp.terlawan.toFixed(0)}
            </td>

            {/* KS */}
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center text-blue-600 font-semibold">
              {ks.kendjam}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center">
              {ks.terlindung.toFixed(0)}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center">
              {ks.terlawan.toFixed(0)}
            </td>

            {/* SM */}
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center text-blue-600 font-semibold">
              {sm.kendjam}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center">
              {sm.terlindung.toFixed(0)}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center">
              {sm.terlawan.toFixed(0)}
            </td>

            {/* Total */}
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center text-blue-600 font-semibold">
              {total.kendjam}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center text-green-600 font-semibold">
              {total.smpTerlindung.toFixed(0)}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center text-green-600 font-semibold">
              {total.smpTerlawan.toFixed(0)}
            </td>

            {/* KTB */}
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center">
              {ktb.rasio}
            </td>
            <td className="border-r border-gray-300 px-1 py-1 text-xs text-center text-blue-600 font-semibold">
              {ktb.count}
            </td>

            {/* RKTB */}
            <td className="px-1 py-1 text-xs text-center bg-base-200"></td>
          </tr>
        );
      });

      // Subtotal
      const sub = directionData?.subtotal || {
        mp: { kendjam: 0, terlindung: 0, terlawan: 0 },
        ks: { kendjam: 0, terlindung: 0, terlawan: 0 },
        sm: { kendjam: 0, terlindung: 0, terlawan: 0 },
        total: { kendjam: 0, smpTerlindung: 0, smpTerlawan: 0 },
        ktb: 0,
        rktb: 0
      };

      rows.push(
        <tr key={`subtotal-${dirIndex}`} className="bg-base-100 font-semibold border-gray-400">
          <td className="border-r border-gray-300 px-2 py-1 text-xs">Total</td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">{sub.mp.kendjam}</td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">{sub.mp.terlindung}</td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">{sub.mp.terlawan}</td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">{sub.ks.kendjam}</td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">{sub.ks.terlindung}</td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">{sub.ks.terlawan}</td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">{sub.sm.kendjam}</td>
          <td className="border-r border-green-300 px-1 py-1 text-xs text-center font-semibold">{sub.sm.terlindung}</td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">{sub.sm.terlawan}</td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">{sub.total.kendjam}</td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">{sub.total.smpTerlindung}</td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">{sub.total.smpTerlawan}</td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold"></td>
          <td className="border-r border-gray-300 px-1 py-1 text-xs text-center font-semibold">{sub.ktb}</td>
          <td className="px-1 py-1 text-xs text-center font-semibold bg-base-200">{sub.rktb}</td>
        </tr>
      );
    });


    return rows;
  };

  return (
    <div className="w-full p-4 overflow-x-auto">
      <div className="p-2">
        <div className="py-4 justify-between flex">
          <h2 className="text-[20px] font-normal text-gray-800">Form SA-II</h2>
          <div>
            <div className='flex items-center gap-2'>
              <button className="bg-transparent cursor-pointer btn w-fit btn-sm rounded-full outline-none border-0 shadow-none hover:border hover:btn-success" onClick={() => setLoadData()}><TbReload size={20} />Ambil Data Baru</button>
              <button className="bg-transparent cursor-pointer btn w-fit btn-sm rounded-full outline-none border-0 shadow-none hover:border hover:btn-success" onClick={() => handleRecalculate()}><BiMath size={20} />Hitung Ulang</button>
            </div>
            <p className="text-xs text-right pr-3 text-gray-600 mt-1">Data kendaraan berdasarkan arah pergerakan</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-400 text-xs table table-xs">
            <thead className="text-center">
              {/* Header Row 1 */}
              <tr className="bg-base-200 ">
                <th rowSpan={6} className="border border-gray-400 px-2 py-3 text-xs font-semibold min-w-[60px]">
                  Kode Pendekat
                </th>
                <th rowSpan={6} className="border border-gray-400 px-2 py-3 text-xs font-semibold min-w-[80px]">
                  Arah
                </th>
                <th colSpan={13} className="border border-gray-400 px-2 py-2 text-xs font-semibold bg-base-200">
                  KENDARAAN BERMOTOR
                </th>
                <th colSpan={2} className="border border-gray-400 px-2 py-2 text-xs font-semibold bg-base-200">
                  KEND. TAK BERMOTOR
                </th>
              </tr>

              {/* Header Row 2 */}
              <tr className="bg-base-200">
                <th colSpan={3} className="border border-gray-400 px-1 py-2 text-xs font-semibold">
                  Mobil Penumpang (MP)
                </th>
                <th colSpan={3} className="border border-gray-400 px-1 py-2 text-xs font-semibold">
                  Kendaraan Sedang (KS)
                </th>
                <th colSpan={3} className="border border-gray-400 px-1 py-2 text-xs font-semibold">
                  Sepeda Motor (SM)
                </th>
                <th colSpan={3} rowSpan={3} className="border border-gray-400 px-1 py-2 text-xs font-semibold">
                  Total Kendaraan Bermotor
                </th>
                <th rowSpan={5} className="border border-gray-400 px-1 py-1 text-xs font-semibold">
                  Rasio Belok Kendaraan
                </th>
                <th rowSpan={5} className="border border-gray-400 px-1 py-2 text-xs font-semibold">
                  KTB
                </th>
                <th rowSpan={5} className="border border-gray-400 px-1 py-2 text-xs font-semibold">
                  RKTB
                </th>
              </tr>

              {/* Header Row 3 */}
              <tr className="bg-base-200 text-center">
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={2}>
                  EMP<sub>terlindung</sub>
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={1}>
                  {dataEMP?.terlindung?.mp || 0}
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={2}>
                  EMP<sub>terlindung</sub>
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={1}>
                  {dataEMP?.terlindung?.ks || 0}
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={2}>
                  EMP<sub>terlindung</sub>
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={1}>
                  {dataEMP?.terlindung?.sm || 0}
                </th>
              </tr>

              {/* Header Row 4 */}
              <tr className="bg-base-200 text-center">
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={2}>
                  EMP<sub>terlawan</sub>
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={1}>
                  {dataEMP?.terlawan?.mp || 0}
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={2}>
                  EMP<sub>terlawan</sub>
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={1}>
                  {dataEMP?.terlawan?.ks || 0}
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={2}>
                  EMP<sub>terlawan</sub>
                </th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" colSpan={1}>
                  {dataEMP?.terlawan?.sm || 0}
                </th>
              </tr>

              {/* Column Headers */}
              <tr className="bg-base-200">
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" rowSpan={2}>kend/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">terlindung</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">terlawan</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" rowSpan={2}>kend/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">terlindung</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">terlawan</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" rowSpan={2}>kend/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">terlindung</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">terlawan</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold" rowSpan={2}>kend/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">terlindung</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">terlawan</th>
              </tr>

              {/* Column Headers */}
              <tr className="bg-base-200">
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">SMP/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">SMP/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">SMP/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">SMP/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">SMP/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">SMP/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">SMP/jam</th>
                <th className="border border-gray-400 px-1 py-1 text-xs font-semibold">SMP/jam</th>
              </tr>

              {/* Row Numbers */}
              <tr className="bg-base-100 text-center">
                <th className="border border-gray-400 px-1 py-1 text-xs">(1)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(2)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(3)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(4)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(5)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(6)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(7)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(8)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(9)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(10)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(11)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(12)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(13)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(14)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(16)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(17)</th>
                <th className="border border-gray-400 px-1 py-1 text-xs">(18)</th>
              </tr>
            </thead>

            <tbody>
              {renderTableRows()}
            </tbody>
          </table>
        </div>
      </div>
      <div className="w-full items-center flex">
        <button className="btn btn-sm w-full m-auto btn-success" onClick={() => setDataTraffic(trafficData)}>Simpan</button>
      </div>
    </div>
  );
};

export default TrafficSurveyTable;