"use client";
import { lazy, Suspense, useEffect, useState } from "react";
import { cameras } from '@/lib/apiService';
import { apiSAIVForm } from "@/lib/apiService";

const FaseApilTable = lazy(() => import("@/app/components/table/faseApilTable"));
const FaseLapanganTable = lazy(() => import("@/app/components/table/faseLapanganTable"));
const MapComponent = lazy(() => import("@/app/components/map"));
const SurveyInfoTable = lazy(() => import('@/app/components/surveyorTable'));
const SurveyFormSAHeader = lazy(() => import('@/app/components/form/formSurveyHeader'))
const FaseIVTable = lazy(() => import('@/app/components/table/faseIVTable'))
const FaseIVAnalisaTable = lazy(() => import('@/app/components/table/faseIVAnalisaTable'))

export const Loading = () => { return (<div className="w-full h-full m-auto text-center p-2">Loading ...</div>) }

const FaseIVPage = () => {
  const [dataCameras, setDataCameras] = useState([]);
  const [selectCameras, setSelectCameras] = useState();
  const [headerData, setHeader] = useState({});
  const [dataTableSAIV, setDataTableSAIV] = useState([]);
  const [selectedId, setSelectedId] = useState(0);

  const handleResetAll = () => {
    setSelectedId(0);
    setDataTableSAIV([])
    setHeader({
      id: 0,
      tanggal: '',
      kabupatenKota: '',
      lokasi: '',
      ruasJalanMayor: [''],
      ruasJalanMinor: [''],
      ukuranKota: '',
      perihal: '',
      periode: ''
    });
  }

  function transformData (data) {
    return {
      whh: data?.whh,
      phaseData: data?.dataFase?.map(faseItem => {
        const jarakArray = Object.entries(faseItem.jarak).map(([type, detail]) => {
          return {
            type,
            pendekat: detail.pendekat,
            kecepatan: {
              berangkat: detail.kecepatan.vkbr,
              datang: detail.kecepatan.vkdt,
              pejalanKaki: detail.kecepatan.vpk
            },
            waktuTempuh: detail.waktuTempuh,
            wws: detail.wms,
            wusDisarankan: detail.wmsDisesuaikan,
            wk: detail.wk,
            wAll: detail.wah,
            wHijau: data.whh // << nilai whh dimasukkan di setiap item
          };
        });

        return {
          fase: faseItem.fase,
          kode: faseItem.kode,
          jarak: jarakArray
        };
      })
    };
  }


  let payload;

  useEffect(() => {

    payload = {
      capacityAnalysis: { ...dataTableSAIV },
      // fase: { ...faseApil }
    };

    console.log('Payload gabungan:', payload, headerData);
    console.log('id:', selectedId);
  }, [dataTableSAIV, headerData, selectedId]);

  // const handleSubmit = () => {
  //   console.log(payload);

  //   const existing = JSON.parse(localStorage.getItem('data')) || {
  //     data: { headerData: [], sa1: {}, sa2: {}, sa3: {}, sa4: {}, sa5: {} }
  //   };

  //   const headerId = headerData?.id;

  //   if (!existing.data.sa4) {
  //     existing.data.sa4 = {};
  //   }
  //   // Validasi id
  //   if (headerId !== undefined && headerId !== null && headerId !== 0 && headerId !== '0') {
  //     // Simpan payload ke sa1
  //     existing.data.sa4[headerId] = payload;
  //     localStorage.setItem('data', JSON.stringify(existing));
  //     console.log('Data berhasil disimpan ke sa1 dengan id:', headerId);
  //   } else {
  //     console.warn('⚠️ ID header tidak valid. Data tidak disimpan.');
  //   }
  // };

  const fetchData = async () => {
    try {
      const camerasRes = await cameras.getAll();
      const data = camerasRes.data.cameras || [];
      setDataCameras(data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setDataCameras([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimpangSelect = () => {

  }

  const handleCameraSelect = () => {

  }

  const fetchCreateSAIV = async () => {
    let payloadAPI
    dataTableSAIV ? payloadAPI = { surveyHeader: { ...headerData, tanggal: headerData.tanggal.split('T')[0] }, capacityAnalysis: { ...dataTableSAIV } } : { }


    try {
      const res = await apiSAIVForm.createSAIV(payloadAPI)
      if (res.status !== 200) {
        toast.error('Data Gagal Ditambahkan!', {
          position: 'top-center'
        })
        return;
      }
      toast.success(res.data.message, { position: 'top-center' })
      // payloadAPI = {}
      // handleResetAll()
    } catch (error) {
      console.error(`${error}`)
    }
  }

  const fetchUpdateSAIV = async (id) => {
    let payloadAPI;
    dataTableSAIV ? payloadAPI = { surveyHeader: { ...headerData, tanggal: headerData.tanggal.split('T')[0] }, capacityAnalysis: { ...dataTableSAIV } } : { }


    try {
      const res = await apiSAIVForm.updateByIdSAIV(id, payloadAPI)
      console.log(res)
      if (res.status !== 200) {
        toast.error('Data Gagal Dirubah!', { position: 'top-center' })
        return;
      }
      toast.success(res.data.message, { position: 'top-center' })
      // payloadAPI = {}
      // handleResetAll()
    } catch (error) {
      console.error(`${error}`)
    }
  }
  
  const submitData = () => {
    // selectedId != 0 ? createSAIV() : fetchCreateSAIV(selectedId)
    toast.info(
      ({ closeToast }) => (
        <div>
          <p>Apakah Anda yakin ingin menyimpan data ini?</p>
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                closeToast();
                if (selectedId === 0) {
                  fetchCreateSAIV();
                } else {
                  fetchUpdateSAIV(selectedId);
                }
                toast.dismiss();
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
  };

  return (
    <div>
      <div className="w-full p-8 text-xl">
        <h2>Analisis Kinerja Simpang APIL</h2>
      </div>
      <SurveyFormSAHeader setDataHeader={setHeader} setSelectedId={setSelectedId} onResetAll={handleResetAll} />
      <div className="lg:w-1/2 p-3">
        {/* <SurveyInfoTable /> */}
      </div>
      <div className="w-full p-4 text-xl">
        <h2>Form SA-IV</h2>
      </div>
      {/* <Suspense fallback={<Loading />}>
        <MapComponent title={""} onClick={handleCameraSelect} onClickSimpang={handleSimpangSelect} form />
      </Suspense> */}
      <Suspense fallback={<Loading />}>
        <FaseIVTable setFormTableIV={setDataTableSAIV} selectedId={selectedId} />
        <div className="w-full items-center flex p-6">
          <button onClick={submitData} className="btn btn-sm w-full mx-auto btn-success">Submit</button>
        </div>
        <FaseIVAnalisaTable selectedId={selectedId} dataTableSAIV={dataTableSAIV} />
      </Suspense>
    </div>
  )
}
export default FaseIVPage;