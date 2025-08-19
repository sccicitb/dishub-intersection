"use client"
import { lazy, Suspense, useEffect, useState } from "react"
import DataEkuivalensi from '@/data/DataEkuivalensi.json';
import EkuivalensiForm from "../components/form/ekuivalensiForm";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { apiSAIIForm, maps, cameras } from "@/lib/apiService";

const SimpangTrafficKinerja = lazy(() => import("@/app/components/simpangTrafficKinerja"));
const TrafficKinerjaTable = lazy(() => import("@/app/components/trafficSurveyTable"));
const EkuivalensiChart = lazy(() => import("@/app/components/ekuivalensiChart"))
const SurveyFormSAHeader = lazy(() => import('@/app/components/form/formSurveyHeader'))


const FormSAIIPage = () => {
  const [dataChart, setDataChart] = useState([]);
  const [dataTerlindung, setDataTerlindung] = useState([]);
  const [dataTerlawan, setDataTerlawan] = useState([]);
  const [trafficData, setTrafficData] = useState([]);
  const [headerData, setHeader] = useState({});
  const [idSelect, setIdSelect] = useState(0);
  const [dataEmp, setDataEmp] = useState({
    terlindung: { mp: '', ks: '', sm: '' },
    terlawan: { mp: '', ks: '', sm: '' }
  });
  const [selectedId, setSelectedId] = useState(0);
  // const [payloadData, setPayloadData] = useState({})

  const combineData = (buildings, camerasData) => {
    const result = buildings.filter(b => b.latitude != null && b.longitude != null).map(building => {
      const relatedCameras = camerasData.filter(camera => camera.ID_Simpang === building.id);

      return {
        ...building,
        latitude: building.latitude ? parseFloat(building.latitude) : null,
        longitude: building.longitude ? parseFloat(building.longitude) : null,
        cameras: relatedCameras || [],
      };
    });

    return result;
  };

  useEffect(() => {
    // import('@/data/DataEkuivalensi.json').then((data) => {
    //   setDataChart(data.default)
    //   setDataTerlindung(data.default.filter((item) => item.type === "terlindungi" ? data.default.data : []))
    //   setDataTerlawan(data.default.filter((item) => item.type === "terlawanan" ? data.default.data : []))
    // })
    setDataChart(DataEkuivalensi);
    setDataTerlindung(DataEkuivalensi.filter(item => item.type.toLowerCase() === "terlindungi"));
    setDataTerlawan(DataEkuivalensi.filter(item => item.type.toLowerCase() === "terlawanan"));
    console.log(DataEkuivalensi);
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
      simpang_id: 0,
      survey_type: "",
      ruasJalanMayor: [''],
      ruasJalanMinor: [''],
      ukuranKota: '',
      perihal: '',
      periode: '',
      status: ''
    });
    setTrafficData({ surveyData: [] });
  }


  let payload;

  const fetchAllMap = async () => {
    try {
      const camerasRes = await cameras.getAll();
      const data = camerasRes.data.cameras || [];

      const buildingsRes = await maps.getAllSimpang();
      const buildingsData = buildingsRes.data.simpang || [];

      const filtered = combineData(buildingsData, data);

      console.log(filtered);
      const validation = filtered
        .map(item => ({
          ...item,
          cameras: (item.cameras || []).filter(
            cam => cam?.socket_event && cam?.socket_event !== "not_yet_assign"
          )
        }))
        .filter(item => item.cameras.length > 0) // hanya simpang yang punya kamera valid
        .filter(item =>
          (item.Nama_Simpang || "").toLowerCase().includes((headerData.lokasi || "").toLowerCase())
        )

      setIdSelect(validation && validation.length > 0 ? validation[0].id : 1);
    } catch (error) {
      console.error(`${error}`)
    }
  }
  useEffect(() => {
    payload = {
      ekuivalensi: { ...dataEmp },
      ...trafficData
      // fase: { ...faseApil }
    };
    // setPayloadData(payload)

    console.log('Payload gabungan:', payload, headerData);
    console.log('id:', selectedId);
  }, [dataEmp, headerData, trafficData, selectedId]);


  useEffect(() => {
    fetchAllMap();
    console.log('test fetch:');

  }, [headerData, selectedId])

  const fetchCreateSAII = async () => {
    payload = {
      ekuivalensi: { ...dataEmp },
      ...trafficData
    };

    try {
      const res = await apiSAIIForm.createSAII(payload)
      if (res.status !== 200) {
        toast.error('Data Gagal Ditambahkan!', { position: 'top-center' })
        return;
      } toast.success(res.data.message, { position: 'top-center' })
    } catch (error) {
      console.error(`${error}`)
    }
  }

  const fetchUpdateSAII = async (id) => {
    payload = {
      ekuivalensi: { ...dataEmp },
      ...trafficData
    };

    try {
      const res = await apiSAIIForm.updateByIdSAII(id, payload)
      if (res.status !== 200) {
        toast.error('Data Gagal Ditambahkan!', { position: 'top-center' })
        return;
      } toast.success(res.data.message, { position: 'top-center' })
    } catch (error) {
      console.error(`${error}`)
    }
  }

  const submitData = () => {

    // console.log(payload);

    // const existing = JSON.parse(localStorage.getItem('data')) || {
    //   data: { headerData: [], sa1: {}, sa2: {}, sa3: {}, sa4: {}, sa5: {} }
    // };

    // const headerId = headerData?.id;

    // // Validasi id
    // if (headerId !== undefined && headerId !== null && headerId !== 0 && headerId !== '0') {
    //   // Simpan payload ke sa1
    //   existing.data.sa2[headerId] = payload;
    //   localStorage.setItem('data', JSON.stringify(existing));
    //   console.log('Data berhasil disimpan ke sa1 dengan id:', headerId);
    // } else {
    //   console.warn('⚠️ ID header tidak valid. Data tidak disimpan.');
    // }

    // selectedId != 0 ? createSAII() : updateSAII(selectedId)
    toast.info(
      ({ closeToast }) => (
        <div>
          <p>Apakah Anda yakin ingin menyimpan data ini?</p>
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                closeToast();
                if (selectedId === 0) {
                  fetchCreateSAII();
                } else {
                  fetchUpdateSAII(selectedId);
                }
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
        <TrafficKinerjaTable dataEMP={dataEmp} selectedId={selectedId} setDataTraffic={setTrafficData} idSimpang={idSelect} />
        <SimpangTrafficKinerja />
        <div className="w-full">
          <EkuivalensiChart data={dataTerlindung} />
          <EkuivalensiChart data={dataTerlawan} />
        </div>
        <div className="w-full items-center flex p-6">
          <button onClick={submitData} className="btn btn-sm w-full mx-auto btn-success">Submit</button>
        </div>
        {/* <div className="w-full bg-gray-100 p-4 mt-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Log Data (Debug)</h3>
          <pre className="text-xs whitespace-pre-wrap break-all max-h-[800px] overflow-auto bg-white p-2 rounded border border-gray-300">
            {JSON.stringify(payloadData, null, 2)}
          </pre>
        </div> */}
      </Suspense>
    </div>
  )
}
export default FormSAIIPage;