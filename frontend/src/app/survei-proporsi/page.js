"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { io } from 'socket.io-client'

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

import { maps } from '@/lib/apiAccess';
// import DataSimpang from '@/data/DataSimpang.json';

function SurveiProporsi () {
  const [vehicleData, setVehicleData] = useState(null);
  const [activeSurveyor, setActiveSurveyor] = useState('Semua');
  const [activeClassification, setActiveClassification] = useState('PKJI 2023 Luar Kota');
  const [activePendekatan, setActivePendekatan] = useState('Semua');
  const [activePergerakan, setActivePergerakan] = useState('Semua');
  // const [activeTitle, setActiveTitle] = useState("Survei Proporsi");
  // const [selectOption, setSelectOption] = useState('detection4');
  const [socketConnected, setSocketConnected] = useState(false);
  const [activeTitle, setActiveTitle] = useState("Survei");
  const [activeCamera, setActiveCamera] = useState();
  const [dataCamera, setDataCamera] = useState([])
  const [streamData, setStreamData] = useState({
    detection3: null,
    detection4: null,
    detection5: null,
    detection1: null
  });

  useEffect(() => {
    const fetchSimpang = async () => {
      try {
        const res = await maps.getAll()
        const datafetch = res.data.buildings;
        const dynamicStreamData = {};
        datafetch.forEach((item) => {
          dynamicStreamData[item.camera.id] = null;
        });

        setDataCamera(datafetch);
        setStreamData(dynamicStreamData);
        setDataCamera(datafetch)
        setActiveCamera(datafetch[3].camera.id)
        setActiveTitle("Survei " + datafetch[3].name)
      } catch (err) { console.error(err) }
    }
    fetchSimpang()
  }, [])
  const activeSimpang = dataCamera.find(b => b.camera.id === activeCamera);


  useEffect(() => {
    import('@/data/sampleVehicleData.json').then((data) => {
      setVehicleData(data.default);
    });
  }, [])
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
        const event = building.camera.socketEvent;
        socket.on(event, (data) => {
          setStreamData((prev) => ({
            ...prev,
            [building.camera.id]: data,
          }));
        });
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [dataCamera]);


  useEffect(() => {
    import('@/data/sampleVehicleData.json').then((data) => {
      setVehicleData(data.default);
    });
  }, []);

  const handleClick = (building) => {
    setActiveCamera(building.camera.id);
    setActiveTitle("Survei " + building.name);
  };


  const [intersectionData, setIntersectionData] = useState({
    // North route data
    north: {
      row1: [
        { id: 'n1-1', content: "n1.1" },
        { id: 'n1-2', content: "n1.2" },
        { id: 'n1-3', content: "n1.3" },
        { id: 'n1-4', content: "n1.4" }
      ],
      row2: [
        { id: 'n2-1', content: "n2.1" },
        { id: 'n2-2', content: "n2.2" },
        { id: 'n2-3', content: "n2.3" },
        { id: 'n2-4', content: "n2.4" }
      ],
      row3: [
        { id: 'n3-1', content: "n3.1" },
        { id: 'n3-2', content: "n3.2" },
        { id: 'n3-3', content: "n3.3" },
        { id: 'n3-4', content: "n3.4" }
      ]
    },
    // South route data
    south: {
      row1: [
        { id: 's1-1', content: "s1.1" },
        { id: 's1-2', content: "s1.2" },
        { id: 's1-3', content: "s1.3" },
        { id: 's1-4', content: "s1.4" }
      ],
      row2: [
        { id: 's2-1', content: "s2.1" },
        { id: 's2-2', content: "s2.2" },
        { id: 's2-3', content: "s2.3" },
        { id: 's2-4', content: "s2.4" }
      ],
      row3: [
        { id: 's3-1', content: "s3.1" },
        { id: 's3-2', content: "s3.2" },
        { id: 's3-3', content: "s3.3" },
        { id: 's3-4', content: "s3.4" }
      ]
    },
    // East route data
    east: {
      row1: [
        { id: 'e1-1', content: "E1.1" },
        { id: 'e1-2', content: "E1.2" },
        { id: 'e1-3', content: "E1.3" },
        { id: 'e1-4', content: "E1.4" }
      ],
      row2: [
        { id: 'e2-1', content: "E2.1" },
        { id: 'e2-2', content: "E2.2" },
        { id: 'e2-3', content: "E2.3" },
        { id: 'e2-4', content: "E2.4" }
      ],
      row3: [
        { id: 'e3-1', content: "E3.1" },
        { id: 'e3-2', content: "E3.2" },
        { id: 'e3-3', content: "E3.3" },
        { id: 'e3-4', content: "E3.4" }
      ]
    },
    // West route data
    west: {
      row1: [
        { id: 'w1-1', content: "W1.1" },
        { id: 'w1-2', content: "W1.2" },
        { id: 'w1-3', content: "W1.3" },
        { id: 'w1-4', content: "W1.4" }
      ],
      row2: [
        { id: 'w2-1', content: "W2.1" },
        { id: 'w2-2', content: "W2.2" },
        { id: 'w2-3', content: "W2.3" },
        { id: 'w2-4', content: "W2.4" }
      ],
      row3: [
        { id: 'w3-1', content: "W3.1" },
        { id: 'w3-2', content: "W3.2" },
        { id: 'w3-3', content: "W3.3" },
        { id: 'w3-4', content: "W3.4" }
      ]
    },
    // Total vehicle count
    vehicleCount: "1,245"
  });

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
                    ? `CCTV Camera  ${activeCamera.slice(-1)} (${activeSimpang?.name ?? ""})`
                    : "CCTV Camera (Loading...)"}
                  onClick={() => setActiveCamera(activeSimpang?.camera.id)}
                />
              </div>
            </div>
          </div>
          <div className="xl:grid xl:grid-cols-2 items-center place-items-center py-10">
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
          {/* <div className="w-full overflow-x-auto">
            <div className="min-w-[550px] flex flex-col w-fit bg-[#BCC3E1] mx-auto font-semibold">
              <div className="flex justify-between">
                <div></div>
                <GridVertical position={true} />
                <div></div>
              </div>
              <div className="flex justify-center">
                <div className="">
                  <GridHorizontal position={true} />
                </div>
                <div className="w-38 text-center items-center flex font-medium text-md bg-stone-400"><div className="m-auto">Jumlah<br /> Kendaraan</div></div>
                <div className="">
                  <GridHorizontal />
                </div>
              </div>
              <div className="flex justify-center">
                <div></div>
                <GridVertical />
                <div></div>
              </div>
            </div>
          </div> */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[450px] flex flex-col w-fit bg-[#BCC3E1] mx-auto font-semibold">
              <div className="flex justify-center">
                <div></div>
                <GridVertical position={true} data={intersectionData.north} />
                <div></div>
              </div>

              <div className="flex justify-center">
                <div className="">
                  <GridHorizontal position={true} data={intersectionData.west} />
                </div>
                <div className="w-40 text-center items-center flex font-medium text-md bg-stone-400">
                  <div className="m-auto">
                    Jumlah<br />Kendaraan
                  </div>
                </div>
                <div className="">
                  <GridHorizontal position={false} data={intersectionData.east} />
                </div>
              </div>

              <div className="flex justify-center">
                <div></div>
                <GridVertical position={false} data={intersectionData.south} />
                <div></div>
              </div>
            </div>
          </div>
          <CameraStatus2 />
          <GrafikRoad />
        </div>
      </Suspense >
    </div >
  );
}
export default SurveiProporsi 