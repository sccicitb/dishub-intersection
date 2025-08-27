"use client";
import { lazy, Suspense, useEffect, useState } from "react";
import { cameras } from '@/lib/apiService';
import { toast } from 'react-toastify';
import { apiSAIIIForm } from '@/lib/apiService'
import DisabledWrapper from "../components/form/disabledWrapper";
import { Loading } from "@/app/components/form/Loading";

const FaseApilTable = lazy(() => import("@/app/components/table/faseApilTable"));
const FaseLapanganTable = lazy(() => import("@/app/components/table/faseLapanganTable"));
const MapComponent = lazy(() => import("@/app/components/map"));
const SurveyInfoTable = lazy(() => import('@/app/components/surveyorTable'));
const SurveyFormSAHeader = lazy(() => import('@/app/components/form/formSurveyHeader'))
const FaseKonflik = lazy(() => import('@/app/components/table/faseKonflik'))

const FormSAIIIPage = () => {
  const [dataCameras, setDataCameras] = useState([]);
  const [selectCameras, setSelectCameras] = useState();
  const [headerData, setHeader] = useState({});
  const [dataKonflik, setDataKonflik] = useState([]);
  const [payloadData, setPayloadData] = useState({})

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


  let payload;

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


  useEffect(() => {
    // payload = {
    //   tabel_konflik: { ...dataKonflik }
    // };
    dataKonflik ? payload = { surveyHeader: headerData, ...transformData(dataKonflik) } : {}

    console.log('Payload gabungan:', payload);
    setPayloadData(payload);
  }, [dataKonflik, headerData]);

  const [selectedId, setSelectedId] = useState(0);

  const handleResetAll = () => {
    setDataKonflik({})
    setSelectedId(0);
    setHeader({
      id: 0,
      tanggal: '',
      kabupatenKota: '',
      lokasi: '',
      simpang_id: 0,
      survey_type: "",
      ruasJalanMayor: [''],
      ruasJalanMinor: [''],
      ukuranKota: '',
      perihal: '',
      periode: '',
      status: ''
    });
  }

  const handleSimpangSelect = () => {

  }

  const handleCameraSelect = () => {

  }

  const fetchCreateSAIII = async () => {
    let payloadAPI
    dataKonflik ? payloadAPI = { surveyHeader: { ...headerData, tanggal: headerData.tanggal.split('T')[0] }, ...transformData(dataKonflik) } : {}


    try {
      const res = await apiSAIIIForm.createSAIII(payloadAPI)
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

  const fetchUpdateSAIII = async (id) => {
    let payloadAPI;
    dataKonflik ? payloadAPI = { surveyHeader: { ...headerData, tanggal: headerData.tanggal.split('T')[0] }, ...transformData(dataKonflik) } : {}


    try {
      const res = await apiSAIIIForm.updateByIdSAIII(id, payloadAPI)
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
    // selectedId != 0 ? createSAIII() : fetchCreateSAIII(selectedId)
    toast.info(
      ({ closeToast }) => (
        <div>
          <p>Apakah Anda yakin ingin menyimpan data ini?</p>
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                closeToast();
                if (selectedId === 0) {
                  fetchCreateSAIII();
                } else {
                  fetchUpdateSAIII(selectedId);
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
        <h2>Form SA-III</h2>
        <p className="text-[14px] py-1">Sketsa Simpang</p>
      </div>
      <Suspense fallback={<Loading />}>
        <MapComponent title={""} onClick={handleCameraSelect} onClickSimpang={handleSimpangSelect} form />
      </Suspense>
      <DisabledWrapper selectedId={selectedId}>
        <Suspense fallback={<Loading />}>
          <FaseKonflik setDataKonflik={setDataKonflik} selectedId={selectedId} />
        </Suspense>
        <div className="w-full items-center flex p-6">
          <button onClick={submitData} className="btn btn-sm w-full mx-auto btn-success">Submit</button>
        </div>
      </DisabledWrapper>
    </div>
  )
}
export default FormSAIIIPage;