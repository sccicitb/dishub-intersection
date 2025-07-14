"use client";
import { lazy, Suspense, useEffect, useState } from "react";
import { cameras } from '@/lib/apiService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FaseApilTable = lazy(() => import("@/app/components/table/faseApilTable"));
const FaseLapanganTable = lazy(() => import("@/app/components/table/faseLapanganTable"));
const MapComponent = lazy(() => import("@/app/components/map"));
const SurveyInfoTable = lazy(() => import('@/app/components/surveyorTable'));
const SurveyFormSAHeader = lazy(() => import('@/app/components/form/formSurveyHeader'))
const FaseKonflik = lazy(() => import('@/app/components/table/faseKonflik'))

export const Loading = () => { return (<div className="w-full h-full m-auto text-center p-2">Loading ...</div>) }


const FormSAIIIPage = () => {
  const [dataCameras, setDataCameras] = useState([]);
  const [selectCameras, setSelectCameras] = useState();
  const [headerData, setHeader] = useState({});
  const [dataKonflik, setDataKonflik] = useState([]);
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

  useEffect(() => {
    payload = {
      tabel_konflik: { ...dataKonflik }
    };
    console.log('Payload gabungan:', payload);
  }, [dataKonflik, headerData]);

  const submitData = () => {
    console.log(payload);

    const existing = JSON.parse(localStorage.getItem('data')) || {
      data: { headerData: [], sa1: {}, sa2: {}, sa3: {}, sa4: {}, sa5: {} }
    };

    const headerId = headerData?.id;

    // Validasi id
    if (headerId !== undefined && headerId !== null && headerId !== 0 && headerId !== '0') {
      // Simpan payload ke sa1
      existing.data.sa3[headerId] = payload;
      localStorage.setItem('data', JSON.stringify(existing));
      console.log('Data berhasil disimpan ke sa1 dengan id:', headerId);
    } else {
      console.warn('⚠️ ID header tidak valid. Data tidak disimpan.');
    }
  }


  const [selectedId, setSelectedId] = useState(0);

  const handleResetAll = () => {
    setDataKonflik({})
    setSelectedId(0);
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

  const handleSubmit = () => {
    toast.info(
      ({ closeToast }) => (
        <div>
          <p className="text-sm">Yakin ingin mengirim data?</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                submitData(); // fungsi kirim API
                toast.dismiss(); // tutup semua toast
              }}
              className="btn btn-sm text-white font-light btn-success"
            >
              Ya
            </button>
            <button
              onClick={() => toast.dismiss()}
              className="btn btn-sm text-white font-light btn-error"
            >
              Batal
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const handleSimpangSelect = () => {

  }

  const handleCameraSelect = () => {

  }

  return (
    <div>
      <ToastContainer />
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
      <Suspense fallback={<Loading />}>
        <FaseKonflik setDataKonflik={setDataKonflik} selectedId={selectedId}/>
      </Suspense>
      <div className="w-full items-center flex p-6">
        <button onClick={handleSubmit} className="btn btn-sm w-full mx-auto btn-success">Submit</button>
      </div>
    </div>
  )
}
export default FormSAIIIPage;