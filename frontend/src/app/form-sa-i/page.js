"use client";
import { lazy, Suspense, useEffect, useState } from "react";
import { cameras } from '@/lib/apiService';
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FaseApilTable = lazy(() => import("@/app/components/table/faseApilTable"));
const FaseLapanganTable = lazy(() => import("@/app/components/table/faseLapanganTable"));
const MapComponent = lazy(() => import("@/app/components/map"));
const SurveyInfoTable = lazy(() => import('@/app/components/surveyorTable'));
const SurveyFormSAHeader = lazy(() => import('@/app/components/form/formSurveyHeader'))

export const Loading = () => { return (<div className="w-full h-full m-auto text-center p-2">Loading ...</div>) }


const FormSAIPage = () => {
  const [dataCameras, setDataCameras] = useState([]);
  const [selectCameras, setSelectCameras] = useState();
  const [lapangan, setLapangan] = useState({});
  const [headerData, setHeader] = useState({});
  const [faseApil, setFaseApil] = useState({});

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

  let payload;

  useEffect(() => {
    payload = {
      header: { ...headerData },
      ...lapangan,
      fase: { ...faseApil }
    };
    console.log('Payload gabungan:', payload);
  }, [lapangan, headerData, faseApil]);

  const submitData = () => {
    console.log(payload);
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

  return (
    <div>
      <ToastContainer />
      <div>
        {/* <div className="w-56 px-3">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Lokasi</legend>
            <select
              className="select select-sm w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100/90 focus:border-transparent"
              value={selectCameras}
              onChange={(e) => setSelectCameras(e.target.value)}
            >
              <option value="">Pilih Lokasi Camera</option>
              {
                dataCameras?.map(({ id, simpang_name, name, socket_event }) => {
                  return <option className={`${socket_event === "not_yet_assign" ? 'text-red-800/90' : 'text-green-800/90'} font-semibold`} value={id} key={id}>{simpang_name} : {name}</option>;
                })
              }
            </select>
          </fieldset>
        </div> */}
      </div>
      <div className="w-full p-8 text-xl">
        <h2>Analisis Kinerja Simpang APIL</h2>
      </div>
      <SurveyFormSAHeader setDataHeader={setHeader} />
      <div className="lg:w-1/2 p-3">
        {/* <SurveyInfoTable /> */}
      </div>
      <div className="w-full p-4 text-xl">
        <h2>Form SA-I</h2>
        <p className="text-[14px] py-1">Sketsa Simpang</p>
      </div>
      <Suspense fallback={<Loading />}>
        <MapComponent title={""} onClick={handleCameraSelect} onClickSimpang={handleSimpangSelect} form />
      </Suspense>
      <Suspense fallback={<Loading />}>
        <FaseLapanganTable setDataLapangan={setLapangan} />
        <FaseApilTable setDataFaseApil={setFaseApil}/>
      </Suspense>
      <div className="w-full items-center flex p-6">
        <button onClick={handleSubmit} className="btn btn-sm w-full mx-auto btn-success">Submit</button>
      </div>
    </div>
  )
}
export default FormSAIPage;