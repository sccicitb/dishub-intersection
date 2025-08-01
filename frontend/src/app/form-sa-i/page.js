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

export const Loading = () => { return (<div className="w-full h-full m-auto text-center p-2">Loading ...</div>) }


const FormSAIPage = () => {
  const [dataCameras, setDataCameras] = useState([]);
  const [selectCameras, setSelectCameras] = useState();
  const [lapangan, setLapangan] = useState({});
  const [headerData, setHeader] = useState({});
  const [faseApil, setFaseApil] = useState({});
  const [selectedId, setSelectedId] = useState(0);
  // const [PayloadData, setPayload] = useState({});

  const handleResetAll = () => {
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
    setLapangan({
      pendekat: [
        {
          kodePendekat: "",
          tipeLingkunganJalan: "",
          kelasHambatanSamping: "",
          median: "",
          kelandaianPendekat: "",
          bkjt: "",
          jarakKeKendaraanParkir: "",
          lebarPendekat: {
            awalLajur: "",
            garisHenti: "",
            lajurBki: "",
            lajurKeluar: ""
          }
        }
      ]
    });
    setFaseApil({
      lokasi: "",
      data: {}
    });
  };

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

    // payload = {
    //   header: { ...headerData },
    //   ...lapangan,
    //   fase: { ...faseApil }
    // };

    payload = {
      ...lapangan,
      fase: { ...faseApil }
    };
    // setPayload(payload)

    console.log('Payload gabungan:', payload, headerData);
    console.log('id:', selectedId);
  }, [lapangan, headerData, faseApil, selectedId]);


  const submitData = () => {
    console.log(payload);

    const existing = JSON.parse(localStorage.getItem('data')) || {
      data: { headerData: [], sa1: {}, sa2: {}, sa3: {}, sa4: {}, sa5: {} }
    };

    const headerId = headerData?.id;

    // Validasi id
    if (headerId !== undefined && headerId !== null && headerId !== 0 && headerId !== '0') {
      // Simpan payload ke sa1
      existing.data.sa1[headerId] = payload;
      localStorage.setItem('data', JSON.stringify(existing));
      console.log('Data berhasil disimpan ke sa1 dengan id:', headerId);
    } else {
      console.warn('⚠️ ID header tidak valid. Data tidak disimpan.');
    }
  };



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
      <SurveyFormSAHeader setDataHeader={setHeader} setSelectedId={setSelectedId} onResetAll={handleResetAll} />
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
        <FaseLapanganTable setDataLapangan={setLapangan} selectedId={selectedId} />
        <FaseApilTable setDataFaseApil={setFaseApil} dataLapangan={lapangan} />
      </Suspense>
      <div className="w-full items-center flex p-6">
        <button onClick={handleSubmit} className="btn btn-sm w-full mx-auto btn-success">Submit</button>
      </div>
      {/* <div className="w-full bg-gray-100 p-4 mt-4 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Log Data (Debug)</h3>
        <pre className="text-xs whitespace-pre-wrap break-all max-h-96 overflow-auto bg-white p-2 rounded border border-gray-300">
          {JSON.stringify(PayloadData, null, 2)}
        </pre>
      </div> */}
    </div>
  )
}
export default FormSAIPage;