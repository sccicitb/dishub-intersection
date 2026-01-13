"use client";
import { lazy, Suspense, useEffect, useState } from "react";
import { cameras } from '@/lib/apiService';
import { apiSAIVForm } from "@/lib/apiService";
import DisabledWrapper from "../components/form/disabledWrapper";
import { toast } from 'react-toastify';
import { Loading } from "../components/form/Loading";

const FaseApilTable = lazy(() => import("@/app/components/table/faseApilTable"));
const FaseLapanganTable = lazy(() => import("@/app/components/table/faseLapanganTable"));
const MapComponent = lazy(() => import("@/app/components/map"));
const SurveyInfoTable = lazy(() => import('@/app/components/surveyorTable'));
const SurveyFormSAHeader = lazy(() => import('@/app/components/form/formSurveyHeader'))
const FaseIVTable = lazy(() => import('@/app/components/table/faseIVTable'))
const FaseIVAnalisaTable = lazy(() => import('@/app/components/table/faseIVAnalisaTable'))

const FaseIVPage = () => {
  const [dataCameras, setDataCameras] = useState([]);
  const [selectCameras, setSelectCameras] = useState();
  const [headerData, setHeader] = useState({});
  const [dataTableSAIV, setDataTableSAIV] = useState({});
  const [selectedId, setSelectedId] = useState(0);

  const handleResetAll = () => {
    setSelectedId(0);
    setDataTableSAIV({})
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


  const [payload, setPayload] = useState({});

  useEffect(() => {
    setPayload({
      capacityAnalysis: { ...dataTableSAIV },
      headerData: { ...headerData },
      id: selectedId
    });
  }, [dataTableSAIV, headerData, selectedId]);

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

  const fetchCreateSAIV = async () => {
    let payloadAPI
    dataTableSAIV ? payloadAPI = { surveyHeader: { ...headerData, tanggal: headerData.tanggal.split('T')[0] }, capacityAnalysis: { ...dataTableSAIV } } : {}


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
    dataTableSAIV ? payloadAPI = { surveyHeader: { ...headerData, tanggal: headerData.tanggal.split('T')[0] }, capacityAnalysis: { ...dataTableSAIV } } : {}


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
      <DisabledWrapper selectedId={selectedId}>
        <Suspense fallback={<Loading />}>
          <FaseIVTable setFormTableIV={setDataTableSAIV} selectedId={selectedId} />
          <div className="w-full items-center flex p-6">
            <button onClick={submitData} className="btn btn-sm w-full mx-auto btn-success">Submit</button>
          </div>
          <FaseIVAnalisaTable selectedId={selectedId} dataTableSAIV={dataTableSAIV} />
        </Suspense>
      </DisabledWrapper>
      {/* <div className="w-full bg-gray-100 p-4 mt-4 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Log Data (Debug)</h3>
        <pre className="text-xs whitespace-pre-wrap break-all max-h-96 overflow-auto bg-white p-2 rounded border border-gray-300">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div> */}
    </div>
  )
}
export default FaseIVPage;
