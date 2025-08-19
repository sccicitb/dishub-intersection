"use client";
import { lazy, Suspense, useEffect, useState } from "react";
import { cameras } from '@/lib/apiService';
import { apiSAVForm } from './../../lib/apiService';

const FaseApilTable = lazy(() => import("@/app/components/table/faseApilTable"));
const FaseLapanganTable = lazy(() => import("@/app/components/table/faseLapanganTable"));
const MapComponent = lazy(() => import("@/app/components/map"));
const SurveyInfoTable = lazy(() => import('@/app/components/surveyorTable'));
const SurveyFormSAHeader = lazy(() => import('@/app/components/form/formSurveyHeader'))
const FaseIVTable = lazy(() => import('@/app/components/table/faseIVTable'))
const FaseVTable = lazy(() => import('@/app/components/table/faseVTable'))
const FaseIVAnalisaTable = lazy(() => import('@/app/components/table/faseIVAnalisaTable'))

export const Loading = () => { return (<div className="w-full h-full m-auto text-center p-2">Loading ...</div>) }


const FaseIVPage = () => {
  const [dataCameras, setDataCameras] = useState([]);
  const [selectCameras, setSelectCameras] = useState();
  const [headerData, setHeader] = useState({});
  const [selectedId, setSelectedId] = useState(0);
  const [dataSAV, setDataSAV] = useState([]);
  const [payloadData, setPayloadData] = useState({});

  const handleResetAll = () => {
    setSelectedId(0);
    setDataSAV([])
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

  // const fetchData = async () => {
  //   try {
  //     const camerasRes = await cameras.getAll();
  //     const data = camerasRes.data.cameras || [];
  //     setDataCameras(data);
  //   } catch (err) {
  //     console.error("Failed to fetch data:", err);
  //     setDataCameras([]);
  //   }
  // };

  let payload;

  useEffect(() => {

    payload = {
      SAV: { ...dataSAV },
      // fase: { ...faseApil }
    };

    setPayloadData(payload)
    console.log('Payload gabungan:', payload, headerData);
    console.log('id:', selectedId);
  }, [dataSAV, headerData, selectedId]);

  // const handleSubmit = () => {
  //   payload = {
  //     SAV: { ...dataSAV },
  //     // fase: { ...faseApil }
  //   };

  //   console.log(payload);

  //   const existing = JSON.parse(localStorage.getItem('data')) || {
  //     data: { headerData: [], sa1: {}, sa2: {}, sa3: {}, sa4: {}, sa5: {} }
  //   };

  //   const headerId = headerData?.id;

  //   if (!existing.data.sa5) {
  //     existing.data.sa5 = {};
  //   }
  //   // Validasi id
  //   if (headerId !== undefined && headerId !== null && headerId !== 0 && headerId !== '0') {
  //     // Simpan payload ke sa1
  //     existing.data.sa5[headerId] = payload;
  //     localStorage.setItem('data', JSON.stringify(existing));
  //     console.log('Data berhasil disimpan ke sa5 dengan id:', headerId);
  //   } else {
  //     console.warn('⚠️ ID header tidak valid. Data tidak disimpan.');
  //   }
  // };

  const fetchCreateSAV = async () => {
    let payloadAPI
    dataSAV ? payloadAPI = { surveyHeader: { ...headerData, tanggal: headerData.tanggal.split('T')[0] }, delayData: { ...dataSAV } } : {}


    try {
      const res = await apiSAVForm.createSAV(payloadAPI)
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

  const fetchUpdateSAV = async (id) => {
    let payloadAPI;
    dataTableSAV ? payloadAPI = { surveyHeader: { ...headerData, tanggal: headerData.tanggal.split('T')[0] }, delayData: { ...dataSAV } } : {}


    try {
      const res = await apiSAVForm.updateByIdSAV(id, payloadAPI)
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
    // selectedId != 0 ? createSAV() : fetchCreateSAV(selectedId)
    toast.info(
      ({ closeToast }) => (
        <div>
          <p>Apakah Anda yakin ingin menyimpan data ini?</p>
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                closeToast();
                if (selectedId === 0) {
                  fetchCreateSAV();
                } else {
                  fetchUpdateSAV(selectedId);
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
  useEffect(() => { console.log(headerData) }, [headerData])

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
        <h2>Form SA-V</h2>
      </div>
      <Suspense fallback={<Loading />}>
        <FaseVTable selectedId={selectedId} setDataSAV={setDataSAV} />
      </Suspense>
      <div className="w-full items-center flex p-6">
        <button onClick={submitData} className="btn btn-sm w-full mx-auto btn-success">Submit</button>
      </div>
      {/* <div className="w-full bg-gray-100 p-4 mt-4 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Log Data (Debug)</h3>
        <pre className="text-xs whitespace-pre-wrap break-all max-h-[800px] overflow-auto bg-white p-2 rounded border border-gray-300">
          {JSON.stringify(payloadData, null, 2)}
        </pre>
      </div> */}
    </div>
  )
}
export default FaseIVPage;