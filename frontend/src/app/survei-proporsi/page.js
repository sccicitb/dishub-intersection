"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { io } from 'socket.io-client'
import { maps, survey, logCamera } from '@/lib/apiService';

// import DataSimpang from '@/data/DataSimpang.json';

const MapComponent = lazy(() => import("@/app/components/map"));
// const VehicleMonitoringTable = lazy(()=> import( '@/app/components/vehicleMonitoringTable'));
const VehicleTable = lazy(() => import("@/app/components/vehicleTable"));
const SurveyInfoTable = lazy(() => import("@/app/components/surveyorTable"));
const SelectionButtons = lazy(() => import("@/app/components/selectionButton"));
const GridVertical = lazy(() => import('@/app/components/gridVertical'));
const GridHorizontal = lazy(() => import('@/app/components/gridHorizontal'));
const GrafikRoad = lazy(() => import("@/app/components/roadChart"));
const CameraStatus2 = lazy(() => import("@/app/components/cameraStatusVer2"));
const RecentVehicle = lazy(() => import("@/app/components/recentVehicle"));
const CCTVStream = lazy(() => import('@/app/components/cctvStream'));
const CameraStatusTimeline = lazy(() => import('@/app/components/cameraStatusTime'))

function SurveiProporsi () {
  const [loading, setLoading] = useState(false);
  const [activeSurveyor, setActiveSurveyor] = useState('Semua');
  const [activeClassification, setActiveClassification] = useState('PKJI 2023 Luar Kota');
  const [activePendekatan, setActivePendekatan] = useState('Semua');
  const [activePergerakan, setActivePergerakan] = useState('Semua');
  const [socketConnected, setSocketConnected] = useState(false);
  const [activeTitle, setActiveTitle] = useState("Survei");
  const [activeCamera, setActiveCamera] = useState();
  const [dataCamera, setDataCamera] = useState([]);
  const [activeSimpang, setActiveSimpang] = useState("");
  const [streamData, setStreamData] = useState({
    detection3: null,
    detection4: null,
    detection5: null,
    detection1: null
  });
  const [categoryNames] = useState([
    { name: 'luar_kota', display: 'Luar Kota' },
    { name: 'dalam_kota', display: "Dalam Kota" },
    { name: 'tipikal', display: "Tipikal" },
  ]);


  const formatDateToInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateToYMDForAPI = (dateStr) => {
    return dateStr.replace(/-/g, '/');
  };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const [dateInput, setDateInput] = useState(formatDateToInput(yesterday));
  const [selectedCategory, setSelectedCategory] = useState(categoryNames[0].name);
  const [cameraLogs, setCameraLogs] = useState({});
  const [intersectionData, setIntersectionData] = useState({
    // North route data
    // north: {
    //   row1: [
    //     { id: 'n1-1', content: "" },
    //     { id: 'n1-2', content: "" },
    //     { id: 'n1-3', content: "" },
    //     { id: 'n1-4', content: "" }
    //   ],
    //   row2: [
    //     { id: 'n2-1', content: "" },
    //     { id: 'n2-2', content: "" },
    //     { id: 'n2-3', content: "" },
    //     { id: 'n2-4', content: "" }
    //   ],
    //   row3: [
    //     { id: 'n3-1', content: "" },
    //     { id: 'n3-2', content: "" },
    //     { id: 'n3-3', content: "" },
    //     { id: 'n3-4', content: "" }
    //   ]
    // },
    // // South route data
    // south: {
    //   row1: [
    //     { id: 's1-1', content: "" },
    //     { id: 's1-2', content: "" },
    //     { id: 's1-3', content: "" },
    //     { id: 's1-4', content: "" }
    //   ],
    //   row2: [
    //     { id: 's2-1', content: "" },
    //     { id: 's2-2', content: "" },
    //     { id: 's2-3', content: "" },
    //     { id: 's2-4', content: "" }
    //   ],
    //   row3: [
    //     { id: 's3-1', content: "" },
    //     { id: 's3-2', content: "" },
    //     { id: 's3-3', content: "" },
    //     { id: 's3-4', content: "" }
    //   ]
    // },
    // // East route data
    // east: {
    //   row1: [
    //     { id: 'e1-1', content: "" },
    //     { id: 'e1-2', content: "" },
    //     { id: 'e1-3', content: "" },
    //     { id: 'e1-4', content: "" }
    //   ],
    //   row2: [
    //     { id: 'e2-1', content: "" },
    //     { id: 'e2-2', content: "" },
    //     { id: 'e2-3', content: "" },
    //     { id: 'e2-4', content: "" }
    //   ],
    //   row3: [
    //     { id: 'e3-1', content: "" },
    //     { id: 'e3-2', content: "" },
    //     { id: 'e3-3', content: "" },
    //     { id: 'e3-4', content: "" }
    //   ]
    // },
    // // West route data
    // west: {
    //   row1: [
    //     { id: 'w1-1', content: "" },
    //     { id: 'w1-2', content: "" },
    //     { id: 'w1-3', content: "" },
    //     { id: 'w1-4', content: "" }
    //   ],
    //   row2: [
    //     { id: 'w2-1', content: "" },
    //     { id: 'w2-2', content: "" },
    //     { id: 'w2-3', content: "" },
    //     { id: 'w2-4', content: "" }
    //   ],
    //   row3: [
    //     { id: 'w3-1', content: "" },
    //     { id: 'w3-2', content: "" },
    //     { id: 'w3-3', content: "" },
    //     { id: 'w3-4', content: "" }
    //   ]
    // },
    // Total vehicle count
    // vehicleCount: "1,245"
  });



  useEffect(() => {
    const dynamicStreamData = {};
    dataCamera.forEach((item) => {
      if (item.camera && item.camera.id) {
        dynamicStreamData[item.camera.id] = null;
      }
    });
    setStreamData(dynamicStreamData);
    const foundCamera = dataCamera.find(b => b.camera?.id === activeCamera);
    console.log(foundCamera)
    if (foundCamera) {
      setActiveSimpang(foundCamera.name)
      setActiveCamera(foundCamera.camera.id)
    } else {
      setActiveCamera(null)
    }
  }, [dataCamera])


  const fetchSurveyProporsi = async (simpang_id, type, date) => {
    setLoading(true)
    try {
      const res = await survey.getProporsi(simpang_id.slice(simpang_id.indexOf('n') + 1), type, date);
      const datafetch = res ? res.data : [];
      console.log(datafetch)
      setIntersectionData(datafetch);
      setLoading(false)
    } catch (err) {
      setLoading(false)
      console.error('Error fetching survey data:', err);
      setIntersectionData([]);
    }
  };

  // const [activeCamera, setActiveCamera] = useState('detection4');

  useEffect(() => {
    const socket = io('https://sxe-data.layanancerdas.id');

    socket.on('connect', () => {
      console.log('Socket connected');
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });


    if (dataCamera.length > 0) {
      dataCamera.forEach((building) => {
        if (building.camera && building.camera.socketEvent) {
          const event = building.camera.socketEvent;
          socket.on(event, (data) => {
            setStreamData((prev) => ({
              ...prev,
              [building.camera.id]: data,
            }));
          });
        }
      });
    }
    return () => {
      socket.disconnect();
    };
  }, [dataCamera]);

  const getLogcamera = async (id) => {
    try {
      const res = await logCamera.getById(id.slice(id.indexOf('n') + 1));
      let logs = Array.isArray(res.data.logs) ? res.data.logs : [];
      setCameraLogs(prev => ({
        ...prev,
        [id]: logs
      }));
      // console.log("Logs untuk kamera ID", id, logs);
    } catch (err) {
      console.error("Gagal fetch data: ", err);
    }
  };

  useEffect(() => {
    const fetchSimpang = async () => {
      try {
        const res = await maps.getAll()
        const datafetch = res.data.buildings;
        setDataCamera(datafetch);

        setDataCamera(datafetch)
        setActiveCamera(datafetch[0].camera.id)
      } catch (err) { console.error(err) }
    }
    fetchSimpang()

    if (activeCamera) {
      fetchSurveyProporsi(activeCamera, selectedCategory, formatDateToYMDForAPI(dateInput));
      getLogcamera(activeCamera);
    }
  }, [])


  useEffect(() => {
    if (activeCamera) {
      fetchSurveyProporsi(activeCamera, selectedCategory, formatDateToYMDForAPI(dateInput));
      getLogcamera(activeCamera);
    }
  }, [activeCamera, dateInput, selectedCategory]);

  const handleClick = (building) => {
    setActiveCamera(building.camera.id);
    setActiveTitle("Survei " + building.name);
    setActiveSimpang(building.name)
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <div>
      <Suspense fallback={<div className="text-center font-medium m-auto w-full">Loading Data...</div>}>
        <MapComponent title={"Survei Proporsi"} onClick={handleClick} />
        <div className="w-[95%] m-auto">
          <div className="lg:grid lg:grid-cols-3 flex flex-col lg:items-center lg:place-items-center gap-5 py-10">
            <RecentVehicle customCSS={'h-[320px]'} />
            <div className="lg:col-span-2 h-fit items-center flex bg-black rounded-lg shadow-md overflow-hidden justify-center">
              <div className="w-[60%]">
                <CCTVStream
                  heightCamera
                  // customLarge={'h-[120px] w-fit'}
                  data={streamData[activeCamera]}
                  title={activeCamera
                    ? `CCTV Camera  ${activeCamera.slice(-1)} (${activeSimpang ?? ""})`
                    : "CCTV Camera (Loading...)"}
                  onClick={() => setActiveCamera(activeSimpang?.camera.id)}
                />
              </div>
            </div>
          </div>
          <div className="xl:grid xl:grid-cols-4 items-center place-items-center py-10">
            {/* <SurveyInfoTable /> */}
            {/* <div className="w-full justify-end flex flex-col">
              <SelectionButtons vehicleData={vehicleData}
                activeSurveyor={activeSurveyor}
                setActiveSurveyor={setActiveSurveyor}
                activeClassification={activeClassification}
                setActiveClassification={setActiveClassification}
                activePendekatan={activePendekatan}
                setActivePendekatan={setActivePendekatan}
                activePergerakan={activePergerakan}
                setActivePergerakan={setActivePergerakan}
              />
            </div> */}
          </div>
          <div className="w-full grid grid-cols-2 items-center mb-4">
            <div className="form-control w-full col-span-1 flex flex-col gap-2">
              <label className="label">
                <span className="label-text font-medium">Kategori:</span>
              </label>
              <select
                className="select select-bordered"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">Semua Kategori</option>
                {categoryNames.map((item, id) => (
                  <option key={id} value={item.name}>
                    {item.display}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control w-full col-span-1 flex flex-col gap-2">
              <label className="mr-2 font-medium">Pilih Tanggal:</label>
              <input
                type="date"
                className="border rounded px-2 py-1.5"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
              />
            </div>
          </div>
          {loading ? (<div className="my-2">Loading...</div>) :
            (
              <div className="w-full my-10 overflow-x-auto">
                <div className="min-w-[450px] flex flex-col w-fit bg-[#BCC3E1] mx-auto font-semibold">
                  <div className="flex justify-center">
                    <div></div>
                    <GridVertical position={true} data={intersectionData?.north ?? {}} category />
                    <div></div>
                  </div>

                  <div className="flex justify-center">
                    <div className="">
                      <GridHorizontal position={true} data={intersectionData?.west ?? {}} category />
                    </div>
                    <div className="w-40 text-center items-center flex font-medium text-sm bg-stone-400">
                      <div className="m-auto">
                        Jumlah<br />Kendaraan <br /> {intersectionData?.vehicleCount ?? ""}
                      </div>
                    </div>
                    <div className="">
                      <GridHorizontal position={false} data={intersectionData?.east ?? {}} category />
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div></div>
                    <GridVertical position={false} data={intersectionData?.south ?? {}} category />
                    <div></div>
                  </div>
                </div>
              </div>
            )}
          <div className="w-[85%] mx-auto">
            <CameraStatusTimeline cameraStatusData={cameraLogs[activeCamera] || []} />
          </div>
          <GrafikRoad />
        </div>
      </Suspense >
    </div >
  );
}
export default SurveiProporsi 