'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
// import VideoStream from '../components/videoStream';
// import CCTVStream from '../components/cctvStream';
import CameraStatusTimeline from "@/app/components/cameraStatusTime";
import { maps, cameras, logCamera } from '@/lib/apiService';
import AdaptiveVideoPlayer from './adaptiveCameraStream';

const CameraStream = () => {
  const [socketConnected, setSocketConnected] = useState(false);
  const [streamData, setStreamData] = useState({});
  const [activeCamera, setActiveCamera] = useState('');
  const [dataCameras, setDataCameras] = useState([]);
  const [cameraLogs, setCameraLogs] = useState({});

  // Sample images mapping untuk simpang
  const sampleImages = {
    'camera 1': '/image/sample/glagah.png',
    'camera 2': '/image/sample/piyungan.png',
    'camera 3': '/image/sample/other.png',
    'camera 4': '/image/sample/tempel.png'
  };

  const descriptionCamera = {
    'camera 1': 'Glagah',
    'camera 2': 'Piyungan',
    'camera 3': 'Prambanan',
    'camera 4': 'Tempel'
  };

  // Function untuk mendapatkan sample image berdasarkan nama kamera
  const getSampleImage = (cameraName) => {
    const name = cameraName.toLowerCase();
    for (const [key, imagePath] of Object.entries(sampleImages)) {
      if (name.includes(key)) {
        return imagePath;
      }
    }
    // Default fallback ke glagah jika tidak ada yang cocok
    return sampleImages.glagah;
  };

  const getSampleTitle = (cameraName) => {
    const name = cameraName.toLowerCase();
    for (const [key, imagePath] of Object.entries(descriptionCamera)) {
      if (name.includes(key)) {
        return imagePath;
      }
    }
    // Default fallback ke glagah jika tidak ada yang cocok
    return descriptionCamera.glagah;
  };

  // Utility functions
  const formatDateToInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const filterLogsByDate = (logs, targetDate) => {
    if (!Array.isArray(logs) || !targetDate) return [];

    // Format target date ke YYYY-MM-DD
    const targetDateStr = new Date(targetDate).toISOString().split('T')[0];

    return logs.filter(log => {
      if (!log.recorded_at) return false;

      // Ambil tanggal dari recorded_at
      const logDateStr = new Date(log.recorded_at).toISOString().split('T')[0];
      return logDateStr === targetDateStr;
    });
  };

  const getLogCamera = async (cameraId, filterDate = null) => {
    if (!cameraId) return;

    try {
      const res = await logCamera.getById(cameraId);
      const logs = Array.isArray(res?.data?.logs) ? res.data.logs : [];

      // Filter logs berdasarkan tanggal jika filterDate disediakan
      const filteredLogs = filterDate ? filterLogsByDate(logs, filterDate) : logs;

      // Filter hanya status mati (status = 0) jika diperlukan
      const offlineLogs = filteredLogs.filter(log => log.status === 0);

      setCameraLogs(prev => ({
        ...prev,
        [cameraId]: {
          all: filteredLogs,           // Semua log untuk tanggal tersebut
          offline: offlineLogs,        // Hanya log dengan status mati
          raw: logs                    // Data mentah tanpa filter
        }
      }));

      return {
        all: filteredLogs,
        offline: offlineLogs,
        raw: logs
      };
    } catch (err) {
      console.error("Error fetching camera logs:", err);
      setCameraLogs(prev => ({
        ...prev,
        [cameraId]: {
          all: [],
          offline: [],
          raw: []
        }
      }));
    }
  };

  const [dateInput, setDateInput] = useState(() => formatDateToInput(new Date()));

  useEffect(() => {
    if (activeCamera && dateInput) {
      getLogCamera(activeCamera, dateInput);
    }
  }, [activeCamera, dateInput])

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const res = await cameras.getAll();
        // console.log("Hasil getAll:", res); 
        const detectedCameras = res.data.cameras.filter(
          b => b.status == 1
        );
        setDataCameras(detectedCameras);
        // console.log(detectedCameras)
      } catch (err) {
        console.error("Failed to fetch cameras:", err);
      }
    };

    fetchCameras();
  }, []);

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

    dataCameras.forEach(cam => {
      if (cam?.socket_event && cam?.id && cam?.socket_event !== "not_yet_assign") {
        socket.on(cam.socket_event, (data) => {
          // console.log(cam)
          setStreamData(prev => ({ ...prev, [cam.id]: data }));
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [dataCameras]);

  useEffect(() => {
    if (dataCameras.length > 0) {
      dataCameras.forEach(cam => {
        if (cam?.id) {
          getLogCamera(cam.id, dateInput);
        }
      });
    }
  }, [dataCameras, dateInput]);

  // useEffect(() => {
  //   console.log("Logs untuk kamera ID", cameraLogs);
  // }, [cameraLogs])

  useEffect(() => {
    const today = new Date();
    setDateInput(formatDateToInput(today));
  }, []);

  const videoStreamCameras = dataCameras.filter(cam => cam.socket_event === "not_yet_assign");
  const cctvStreamCameras = dataCameras.filter(cam => cam.socket_event !== "not_yet_assign");

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-5">
        {/* Video Streams - untuk kamera dengan socket_event = "not_yet_assign" */}
        {/* {videoStreamCameras.map((cam) => {
      console.log(cam.url) 
      return(
        <div key={cam.id} className="bg-base-200 rounded-lg shadow-md overflow-hidden">
          <VideoStream
            videoUrl={cam.url}
            title={`Video ${cam.name}`}
            large
            onClick={() => console.log(`Clicked on ${cam.name}`)}
          />
          <div className="p-3 bg-gray-100">
            <p className="text-sm text-gray-600">Stream Type: HLS</p>
            <p className="text-sm text-gray-600">Status: Video Stream</p>
            <p className="text-sm text-gray-600">Socket Event: {cam.url} </p>
          </div>
        </div>
      )})} */}

      </div>
      <div className="h-fit bg-base-200/90 p-4 rounded-3xl backdrop-blur-sm shadow-base-100 my-2" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-5">
        {/* CCTV Streams - sementara diganti dengan sample images */}
        {cctvStreamCameras.map((cam) => {
          // console.log(dateInput);
          return (
            <div key={cam.id} className="bg-base-200 rounded-lg shadow-md overflow-hidden">
              {/* CCTVStream diganti dengan sample image */}
              {/* <CCTVStream
                data={streamData[cam.id]}
                title={`CCTV ${cam.name}`}
                large
                onClick={() => setActiveCamera(cam.camera?.id || cam.id)}
              /> */}

              {/* Sample Image Display */}
              <div
                className="relative w-full aspect-video bg-black cursor-pointer"
                onClick={() => setActiveCamera(cam.camera?.id || cam.id)}
              >
                <img
                  src={getSampleImage(cam.name)}
                  alt={`Sample CCTV ${cam.name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback jika gambar tidak ditemukan
                    e.target.src = sampleImages.glagah;
                  }}
                />
                <div className="absolute flex items-center gap-2 place-items-center top-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded-md font-semibold text-neutral-50 text-xs">
                  CCTV Simpang {getSampleTitle(cam.name)}
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                </div>
              </div>

              <CameraStatusTimeline
                cameraStatusData={cameraLogs[cam.id]?.all || []}
                selectedDate={dateInput}
              />
            </div>
          );
        })}
      </div>
    </div >
  );
};

export default CameraStream;