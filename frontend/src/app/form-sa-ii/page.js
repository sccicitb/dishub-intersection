"use client"
import { lazy, Suspense, useEffect, useState } from "react"
import DataEkuivalensi from '@/data/DataEkuivalensi.json';
import EkuivalensiForm from "../components/form/ekuivalensiForm";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SimpangTrafficKinerja = lazy(() => import("@/app/components/simpangTrafficKinerja"));
const TrafficKinerjaTable = lazy(() => import("@/app/components/trafficSurveyTable"));
const EkuivalensiChart = lazy(() => import("@/app/components/ekuivalensiChart"))
const SurveyFormSAHeader = lazy(() => import('@/app/components/form/formSurveyHeader'))

const FormSAIIPage = () => {
  const [dataChart, setDataChart] = useState([]);
  const [dataTerlindung, setDataTerlindung] = useState([]);
  const [dataTerlawan, setDataTerlawan] = useState([]);
  const [headerData, setHeader] = useState({});
  const [dataEmp, setDataEmp] = useState({});
  const [selectedId, setSelectedId] = useState(0);

  useEffect(() => {
    import('@/data/DataEkuivalensi.json').then((data) => {
      setDataChart(data.default)
      setDataTerlindung(data.default.filter((item) => item.type === "terlindungi" ? data.default.data : []))
      setDataTerlawan(data.default.filter((item) => item.type === "terlawanan" ? data.default.data : []))
    })
  }, [])

  useEffect(() => {
    console.log(dataEmp)
  }, [dataEmp])


  const handleResetAll = () => {
    setSelectedId(0);
    setDataEmp(
      {
        terlindung: { mp: '', ks: '', sm: '' },
        terlawan: { mp: '', ks: '', sm: '' }
      }
    )
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


  let payload;

  useEffect(() => {

    payload = {
      ekuivalensi: { ...dataEmp },
      // fase: { ...faseApil }
    };


    console.log('Payload gabungan:', payload, headerData);
    console.log('id:', selectedId);
  }, [dataEmp, headerData, selectedId]);

  const submitData = () => {
    console.log(payload);

    const existing = JSON.parse(localStorage.getItem('data')) || {
      data: { headerData: [], sa1: {}, sa2: {}, sa3: {}, sa4: {}, sa5: {} }
    };

    const headerId = headerData?.id;

    // Validasi id
    if (headerId !== undefined && headerId !== null && headerId !== 0 && headerId !== '0') {
      // Simpan payload ke sa1
      existing.data.sa2[headerId] = payload;
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
      <div className="w-full p-8 text-xl">
        <h2>Analisis Kinerja Simpang APIL</h2>
      </div>
      <SurveyFormSAHeader setDataHeader={setHeader} setSelectedId={setSelectedId} onResetAll={handleResetAll} />
      <EkuivalensiForm setEMP={setDataEmp} selectedId={selectedId} />
      <Suspense fallback={<div className="my-5 w-full text-center">Loading...</div>}>
        <TrafficKinerjaTable dataEMP={dataEmp} selectedId={selectedId} />
        <SimpangTrafficKinerja />
        <div className="w-full">
          <EkuivalensiChart data={dataTerlindung} />
          <EkuivalensiChart data={dataTerlawan} />
        </div>
        <div className="w-full items-center flex p-6">
          <button onClick={handleSubmit} className="btn btn-sm w-full mx-auto btn-success">Submit</button>
        </div>
      </Suspense>
    </div>
  )
}
export default FormSAIIPage;