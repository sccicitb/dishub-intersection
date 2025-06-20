"use client";

import { io } from 'socket.io-client'
import { useState, useEffect, lazy, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CCTVStream from '../components/cctvStream';
import CameraActive from '../components/cameraActive';
// import DataSimpang from '@/data/DataSimpang.json'
import { FaRegEye, FaRegEyeSlash, FaPencil, FaTrashCan } from "react-icons/fa6";
import { FiDownload } from "react-icons/fi";
import { IoIosAdd } from "react-icons/io";
import { calendar, cameras, maps } from "@/lib/apiService"
import AdaptiveVideoPlayer from '../components/adaptiveCameraStream';
import { IoChevronBackSharp, IoChevronForwardSharp } from "react-icons/io5";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DialogFCamera from '../components/dialog/dialogFCamera';


const RecentVehicle = lazy(() => import('../components/recentVehicle'));
const MapComponent = lazy(() => import('../components/map'));

export const CameraCard = ({ C = '' }) => {
  const isFullWidth = C.includes('col-span-2');
  return (
    <div className={`rounded-md bg-[#314385]/80 min-h-[30px] ${isFullWidth ? 'w-full' : 'w-[60px]'} ${C}`}>
    </div>
  );
};


export function LayoutKamera ({ cols = 1, J = 2, bc = 0, rows = 0, Clicked = (t) => { } }) {
  return (
    <div className={`card bg-[#314385]/20 w-fit h-fit p-2 grid ${cols ? 'grid-cols-' + cols : ' '} gap-2 cursor-pointer`} onClick={() => Clicked()}>
      {
        Array.from({ length: bc }).map((_, i) => (<CameraCard key={i} C={`col-span-2 ${rows ? 'row-span-' + rows + ' ' : ''}`} />))
      }
      {
        Array.from({ length: J }).map((_, i) => (<CameraCard key={i} />))
      }
    </div>
  );
}

export const CameraPosition = ({ layout, streamData, urlData }) => {
  const streams = Object.values(streamData).filter(Boolean);
  const urls = Object.values(urlData).filter(Boolean);

  const { cols = 1, J = 2, bc = 0, rows = 0 } = layout;

  const totalSlots = bc + J;

  return (
    <div>
      <div className={`grid ${cols ? 'grid-cols-' + cols : ''} gap-2 py-5 min-h-[800px]`}>
        {streams.slice(0, totalSlots).map((stream, i) => {
          const isLarge = i < bc;
          return (
            <div
              key={`stream-${i}`}
              className={`${isLarge ? 'col-span-2' : ''} ${isLarge && rows ? `row-span-${rows}` : ''}`}
            >
              <CCTVStream
                data={stream}
                customLarge={isLarge ? 'min-h-[470px] h-full' : undefined}
                title={`CCTV Camera ${i + 1}`}
              />
            </div>
          );
        })}
      </div>
      <div className={`grid ${cols ? 'grid-cols-' + cols : ''} gap-2 py-5 min-h-[800px]`}>
        {urls.slice(0, totalSlots).map((item, i) => {
          const isLarge = i < bc;
          return (
            <div
              key={`item-${i}`}
              className={`${isLarge ? 'col-span-2' : ''} ${isLarge && rows ? `row-span-${rows}` : ''}`}
            >
              <AdaptiveVideoPlayer
                videoUrl={item.url}
                title={`Video ${item.name}`}
                large
                onClick={() => console.log(`Clicked on ${item.name}`)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};



const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  // const streams = Object.entries(streamData)
  // .filter(([key]) => key.includes('detection'))
  // .map(([, value]) => value)
  // .filter(Boolean);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
};

const ManajemenKamera = () => {
  const [layout, setLayout] = useState({ cols: 2, J: 4, bc: 0, rows: 0 });
  const [fullSize, setFullSize] = useState(false);
  const isMobile = useIsMobile();
  const [optionCamera, setOptionCamera] = useState('peta');
  const [dataSimpang, setDataSimpang] = useState([]);
  const [dataCameras, setDataCameras] = useState([]);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [streamData, setStreamData] = useState({
    detection1: null,
  });
  const [inputValue, setInputValue] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showDialogKalender, setShowDialogKalender] = useState(false)
  // Calendar states - simplified and fixed
  const [dataKalender, setDataKalender] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [kalenderForm, setKalenderForm] = useState({
    id: 0,
    date: "",
    event_type: "",
    description: "",
    rawDate: "",
  });
  const [actionDialog, setActionDialog] = useState("");
  const [formCameras, setFormCameras] = useState({
    id: "",
    name: "",
    url: "",
    thumbnail_url: "",
    location: "",
    resolution: "",
    status: 0,
    socket_event: "",
    ID_Simpang: 0,
    socket_status: false
  });

  const [formMaps, setFormMaps] = useState({
    id: 0,
    name: "",
    category: "",
    model_detection: false,
    location: {
      latitude: "",
      longitude: "",
    },
    socket_event: "",
    name: "",
    kategori: "",
    kota: "",
    ukuran_kota: "",
    tanggal: "",
    periode: "",
    ditangani_oleh: ""
  })
  const [dataMapsID, setDataMapsID] = useState([])
  const [statusDialogKalender, setStatusDialogKalender] = useState(false)
  const [statusDialogCameras, setStatusDialogCameras] = useState(false)
  const [mergedCameraData, setMergedCameraData] = useState([]);
  const [videoStream, setVideoStream] = useState({})

  // Fetch API Calendar, Maps, Cameras

  //# Fetch GET Camera (Maps)
  const fetchMaps = async () => {
    try {
      const res = await maps.getAllSimpang();
      // const location = res.data.buildings;
      const location = res.data.simpang;
      // console.log(location)
      setDataSimpang(location);
      console.log(location)
    } catch (err) {
      console.error("Failed to fetch location:", err);
      toast.error("Gagal mengambil data lokasi kamera!", { position: 'top-right' });
    }
  };

  const fetchCameras = async () => {
    try {
      const res = await cameras.getAll();
      console.log(res.data.cameras)
      const detectedCameras = res.data.cameras;
      setDataCameras(detectedCameras);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 404) {
          toast.info("API kamera belum tersedia (404)", { position: 'top-right' });
        } else {
          toast.error(`Gagal mengambil data kamera! (${err.response.status})`, { position: 'top-right' });
        }
      } else if (err.request) {
        toast.error("Server tidak merespons saat mengambil data kamera.", { position: 'top-right' });
      } else {
        toast.error("Terjadi kesalahan saat menghubungi API kamera.", { position: 'top-right' });
      }
      console.error("Failed to fetch cameras:", err);
    }
  };

  const fetchMapsById = async (id) => {
    try {
      const res = await maps.getById(id);
      const detectedSimpang = res.data;
      setDataMapsID(detectedSimpang || []);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 404) {
          toast.info("API kamera belum tersedia (404)", { position: 'top-right' });
        } else {
          toast.error(`Gagal mengambil data Simpang! (${err.response.status})`, { position: 'top-right' });
        }
      } else if (err.request) {
        toast.error("Server tidak merespons saat mengambil data Simpang.", { position: 'top-right' });
      } else {
        toast.error("Terjadi kesalahan saat menghubungi API Simpang.", { position: 'top-right' });
      }

      console.error("Failed to fetch cameras:", err);
      setDataCameras([]);
    }
  };

  //# Fetch Create Camera (Maps)
  const createMaps = async (data) => {
    const today = new Date();
    const dateNow = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const push = {
      model_detection: data.model_detection || false,
      latitude: data.latitude,
      longitude: data.longitude,
      socket_event: data.socket_event,
      name: data.name,
      latitude: data.location.latitude,
      longitude: data.location.longitude,
      kategori: data.category,
      kota: data.kota,
      ukuran_kota: data.ukuran_kota,
      tanggal: dateNow,
      periode: data.periode,
      ditangani_oleh: data.ditangani_oleh
    };

    try {
      const res = await maps.createData(push);
      // Perbaikan: Gunakan res.status === 200 atau 201 untuk success
      if (res.status === 201 || res.status === 200) {
        toast.success("Lokasi Kamera berhasil ditambahkan!!", {
          position: 'top-right'
        });
        console.log("Data berhasil ditambahkan!");
        // Refresh data setelah berhasil
        await fetchMaps();
      } else {
        toast.error("Data tidak berhasil ditambahkan, silakan coba lagi!", {
          position: 'top-right'
        });
      }
    } catch (err) {
      console.error("Gagal menambahkan Lokasi Kamera:", err);
      toast.error("Gagal menambahkan Lokasi Kamera!", { position: 'top-right' });
    }
  };

  //# Fetch Create Camera (Maps)
  const createCameras = async (data) => {
    const push = {
      name: data.name || "",
      url: data.url || "",
      thumbnail_url: data.thumbnail_url || "",
      location: data.location || "",
      resolution: data.resolution || "",
      status: data.status || 0,
      socket_event: data.socket_status ? data.socket_event : "not_yet_assign",
      ID_Simpang: data.ID_Simpang || 0
    };

    try {
      const res = await cameras.createData(push);
      // Perbaikan: Gunakan res.status === 200 atau 201 untuk success
      if (res.status === 201 || res.status === 200) {
        toast.success("Kamera berhasil ditambahkan!!", {
          position: 'top-right'
        });
        console.log("Data berhasil ditambahkan!");
        // Refresh data setelah berhasil
        await fetchMaps();
      } else {
        toast.error("Data tidak berhasil ditambahkan, silakan coba lagi!", {
          position: 'top-right'
        });
      }
    } catch (err) {
      console.error("Gagal menambahkan kamera:", err);
      toast.error("Gagal menambahkan kamera!", { position: 'top-right' });
    }
  };

  //# Fetch update Camera (Maps)
  const updateCameras = async (id, data) => {
    const push = {
      name: data.name,
      url: data.url,
      thumbnail_url: data.thumbnail_url,
      location: data.location,
      resolution: data.resolution,
      status: data.status,
      socket_event: data.socket_status ? data.socket_event : "not_yet_assign",
      ID_Simpang: data.ID_Simpang
    };

    try {
      const res = await cameras.updateById(id, push);
      // Perbaikan: Biasanya update menggunakan status 200
      if (res.status === 200 || res.status === 201) {
        toast.success("Kamera berhasil diperbaharui!!", {
          position: 'top-right'
        });
        console.log("Data berhasil diperbaharui!");
        // Refresh data setelah berhasil
        await fetchMaps();
        await fetchCameras();
      } else {
        toast.error("Data tidak berhasil diperbaharui, silakan coba lagi!", {
          position: 'top-right'
        });
      }
    } catch (err) {
      console.error("Gagal memperbaharui kamera:", err);
      toast.error("Gagal memperbaharui kamera!", { position: 'top-right' });
    }
  };

  //# Fetch update Maps
  const updateMaps = async (id, data) => {
    const push = {
      model_detection: data.model_detection || false,
      latitude: data.latitude,
      longitude: data.longitude,
      socket_event: data.socket_event,
      name: data.name,
      latitude: data.location.latitude,
      longitude: data.location.longitude,
      kategori: data.category,
      kota: data.kota,
      ukuran_kota: data.ukuran_kota,
      tanggal: data.tanggal,
      periode: data.periode,
      ditangani_oleh: data.ditangani_oleh
    };

    try {
      const res = await maps.updateById(id, push);
      // Perbaikan: Biasanya update menggunakan status 200
      if (res.status === 200 || res.status === 201) {
        toast.success("Maps berhasil diperbaharui!!", {
          position: 'top-right'
        });
        console.log("Data berhasil diperbaharui!");
        // Refresh data setelah berhasil
        await fetchMaps();
      } else {
        toast.error("Data tidak berhasil diperbaharui, silakan coba lagi!", {
          position: 'top-right'
        });
      }
    } catch (err) {
      console.error("Gagal memperbaharui Maps:", err);
      toast.error("Gagal memperbaharui Maps!", { position: 'top-right' });
    }
  };

  //# Fetch Delete Camera (Maps)
  const deleteCameras = async (id) => {
    try {
      const res = await cameras.deleteById(id);
      // Perbaikan: Delete biasanya menggunakan status 200 atau 204
      if (res.status === 200 || res.status === 204) {
        toast.success("Kamera berhasil dihapus!!", {
          position: 'top-right'
        });
        console.log("Data berhasil dihapus!");
        // Refresh data setelah berhasil
        await fetchCameras();
        await fetchMaps();
      } else {
        toast.error("Data tidak berhasil dihapus, silakan coba lagi!", {
          position: 'top-right'
        });
      }
    } catch (err) {
      console.error("Gagal menghapus kamera:", err);
      toast.error("Gagal menghapus kamera!", { position: 'top-right' });
    }
  };

  //# Fetch Delete Camera (Maps)
  const deleteMaps = async (id) => {
    try {
      const res = await maps.deleteById(id);
      // Perbaikan: Delete biasanya menggunakan status 200 atau 204
      if (res.status === 200 || res.status === 204) {
        toast.success("Kamera berhasil dihapus!!", {
          position: 'top-right'
        });
        console.log("Data berhasil dihapus!");
        // Refresh data setelah berhasil
        await fetchMaps();
      } else {
        toast.error("Data tidak berhasil dihapus, silakan coba lagi!", {
          position: 'top-right'
        });
      }
    } catch (err) {
      console.error("Gagal menghapus kamera:", err);
      toast.error("Gagal menghapus kamera!", { position: 'top-right' });
    }
  };

  //# Fetch GET calendar data with proper pagination
  const fetchCalendar = async (page = 1, limit = 5) => {
    setIsLoadingCalendar(true);
    try {
      const res = await calendar.getAll(page, limit);
      console.log("Calendar API Response:", res);

      if (res?.data?.holidays) {
        setDataKalender(res.data.holidays);
        setTotalItems(res.data.total);
      }
    } catch (err) {
      console.error("Failed to fetch calendar:", err);
      setDataKalender([]);
      toast.error("Gagal mengambil data kalender!", { position: 'top-right' });
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  //# Fetch Update Calendar
  const updateCalendar = async (data) => {
    try {
      if (!data) {
        console.log("data tidak sesuai cek kembali!");
        toast.error("Data tidak valid!", { position: 'top-right' });
        return;
      }

      const pushData = {
        date: data.tanggal,
        event_type: data.events,
        description: data.deskripsi
      };

      const res = await calendar.updateById(data.id, pushData);
      // console.log(res);

      // Perbaikan: Gunakan === untuk comparison yang benar
      if (res.status === 200 || res.status === 201) {
        toast.success("Data Kalender berhasil dirubah!!", {
          position: 'top-right'
        });
        // Refresh data setelah berhasil
        await fetchCalendar(1, itemsPerPage);
      } else {
        toast.error("Data tidak berhasil diperbaharui, silakan coba lagi!", {
          position: 'top-right'
        });
      }
    } catch (error) {
      console.error("Failed to update calendar: ", error);
      toast.error("Gagal memperbaharui kalender!", { position: 'top-right' });
    }
  };

  //# Fetch Delete Calendar
  const deleteDataKalender = async (id) => {
    try {
      if (!id) {
        console.log("data tidak sesuai cek kembali!");
        toast.error("ID tidak valid!", { position: 'top-right' });
        return;
      }

      const res = await calendar.deleteById(id);

      // Perbaikan: Delete biasanya menggunakan status 200 atau 204
      if (res.status === 200 || res.status === 204) {
        toast.success("Data Kalender berhasil dihapus!!", {
          position: 'top-right'
        });
        // Refresh data setelah berhasil
        await fetchCalendar(1, itemsPerPage);
      } else {
        toast.error("Data tidak berhasil dihapus, silahkan coba lagi!", {
          position: 'top-right'
        });
      }
    } catch (error) {
      console.error("Failed to delete calendar: ", error);
      toast.error("Gagal menghapus kalender!", { position: 'top-right' });
    }
  };

  //# Fetch Create Calendar
  const createCalendar = async (data) => {
    try {
      if (!data) {
        console.log("data tidak sesuai cek kembali!");
        toast.error("Data tidak valid!", { position: 'top-right' });
        return;
      }

      const push = {
        date: data.tanggal,
        event_type: data.events,
        description: data.deskripsi
      };

      const res = await calendar.createData(push);

      // Perbaikan: Create biasanya menggunakan status 201
      if (res.status === 201 || res.status === 200) {
        toast.success("Data Kalender berhasil ditambahkan!!", {
          position: 'top-right'
        });
        // Refresh data setelah berhasil
        await fetchCalendar(1, itemsPerPage);
      } else {
        toast.error("Data tidak berhasil ditambahkan, silahkan coba lagi!", {
          position: 'top-right'
        });
      }
    } catch (err) {
      console.error("Failed to create calendar: ", err);
      toast.error("Gagal menambahkan kalender!", { position: 'top-right' });
    }
  };

  useEffect(() => {
    const combineData = () => {
      const result = dataSimpang.map(building => {
        // Ambil semua kamera yang memiliki building.id yang cocok
        console.log(dataCameras.filter(camera => camera.ID_Simpang == building.id));
        const relatedCameras = dataCameras.filter(camera => camera.ID_Simpang === building.id);

        return {
          ...building,
          // camera: Array.isArray(building.camera)
          //   ? building.camera
          //   : building.camera
          //     ? [building.camera]
          //     : [],

          // Tambahkan kamera yang terkait jika ada di dataCameras (optional)
          camera: relatedCameras || [], // optional jika ingin akses kamera dari API lain
        };
      });

      setMergedCameraData(result);
      console.log(result)
      let videoStream;

      videoStream = result?.filter(cam => cam.socket_event === "not_yet_assign")
      setVideoStream(videoStream)
      console.log(videoStream)
    };


    if (dataSimpang.length && dataCameras.length) {
      combineData();
    }
  }, [dataSimpang, dataCameras]);

  useEffect(() => {
    console.log(mergedCameraData)
  }, [mergedCameraData])

  // useEffect(() => {
  //   console.log(mergedCameraData)
  // }, [mergedCameraData])

  useEffect(() => {
    fetchMaps();
    fetchCameras();
    fetchCalendar(1, itemsPerPage);
  }, []);

  useEffect(() => {
    fetchCalendar(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const handleToggle = (id, data, checked) => {
    if (!id) return console.warn("id tidak tersedia");

    const updatedCamera = {
      id: id,
      name: data?.name || "",
      url: data?.url || "",
      thumbnail_url: data?.thumbnail_url || "",
      location: data?.location || "",
      resolution: data?.resolution || "",
      status: checked ? 1 : 0 || 0,
      socket_status: data?.status_event === "not_yet_assign" ? true : false,
      socket_event: data?.socket_event || "",
      ID_Simpang: data?.ID_Simpang || 0
    };

    setFormCameras(updatedCamera);
    updateCameras(id, updatedCamera);
  };


  const handleCameraSelect = (data) => {
    setOptionCamera(data);
  };

  const handleClick = (layoutData) => {
    setLayout(layoutData);
  };

  useEffect(() => {
    if (isMobile) {
      handleClick({ cols: 1, J: 4, bc: 0, rows: 0 });
      setFullSize(false);
    }
  }, [isMobile]);

  // Socket connection for real-time data
  useEffect(() => {
    const socket = io('https://sxe-data.layanancerdas.id');

    socket.on('connect', () => console.log("socket connected"));
    socket.on('disconnect', () => console.log("socket disconnected"));

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const socket = io('https://sxe-data.layanancerdas.id');

    mergedCameraData.forEach((building) => {
      if (!Array.isArray(building?.camera)) return;
      building.camera.forEach((cam) => {
        console.log(cam)
        if (!cam?.socket_event || !cam?.id) return;

        socket.on(cam.socket_event, (data) => {
          setStreamData((prev) => ({
            ...prev,
            [cam.id]: data,
          }));
        });
      });
    });

    return () => {
      mergedCameraData.forEach((building) => {
        if (!Array.isArray(building?.camera)) return;

        building.camera.forEach((cam) => {
          if (cam?.socket_event) {
            socket.off(cam.socket_event);
          }
        });
      });
      let videoStream;

      videoStream = mergedCameraData.flatMap(b => b.camera || []).filter(cam => cam.socket_event === "not_yet_assign").filter(cam => cam.status === 1);
      setVideoStream(videoStream)
      console.log(videoStream)
    };
  }, [mergedCameraData]);


  const changeInputSearch = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddNewCamera = () => {
    setActionDialog("create_cameras")
    setStatusDialogCameras(false)
    setShowDialog(true);
  };

  const handleAddNewMaps = () => {
    setActionDialog("create_maps")
    setStatusDialogCameras(true)
    setShowDialog(true);
  };


  const handleSelectCameras = (id, select, data) => {
    console.log(data)
    if (!select) return console.error("select tidak diketahui")
    setActionDialog(select)

    if (select === "edit_cameras") {
      setFormCameras({
        id: data?.id || 0,
        name: data?.name || "",
        url: data?.url || "",
        thumbnail_url: data?.thumbnail_url || "",
        location: data?.location || "",
        resolution: data?.resolution || "",
        status: data.status ? data.status : 0,
        socket_event: data?.socket_event || "",
        socket_status: data?.socket_event === "not_yet_assign" ? false : true,
        ID_Simpang: data?.ID_Simpang || 0
      });

      setShowDialog(true);
    } else if (select === "delete_cameras") {
      deleteCameras(id)
    } else if (select === "delete_maps") {
      deleteMaps(id)
    } else if (select === "edit_maps") {
      fetchMapsById(id)
      console.log(data)
      setFormMaps({
        id: id,
        category: dataMapsID.kategori || data.category || "",
        model_detection: dataMapsID.model_detection || data.model_detection || false,
        name: dataMapsID.name || data.Nama_Simpang || "",
        location: {
          latitude: dataMapsID.latitude || data.location || "",
          longitude: dataMapsID.longitude || data.location || ""
        },
        socket_event: dataMapsID.socket_event || data.socket_event,
        kategori: dataMapsID.category || data.category,
        kota: dataMapsID.Kota || data.kota,
        ukuran_kota: dataMapsID.Ukuran_Kota || data.ukuran_kota,
        tanggal: dataMapsID?.Tanggal?.split("T")[0] || data.tanggal,
        periode: dataMapsID.Periode || data.periode,
        ditangani_oleh: dataMapsID.Ditangani_Oleh || data.ditangani_oleh
      });
      setShowDialog(true);

    } else {
      handleAddNewCamera()
    }
  }
  // useEffect(() => console.log(formMaps), [formMaps])

  const closeDialog = () => {
    setActionDialog("");
    setShowDialog(false);
    setFormCameras({
      id: "",
      name: "",
      url: "",
      thumbnail_url: "",
      location: "",
      resolution: "",
      status: 0,
      socket_event: "",
      ID_Simpang: 0
    })
    setFormMaps({
      id: 0,
      name: "",
      category: "",
      model_detection: false,
      location: {
        latitude: "",
        longitude: "",
      },
      socket_event: "",
      name: "",
      kategori: "",
      kota: "",
      ukuran_kota: "",
      tanggal: "",
      periode: "",
      ditangani_oleh: ""
    })
  };

  // Filter search for cameras
  const filteredBuildings = mergedCameraData.filter((buildings) => buildings.Nama_Simpang.toLowerCase().includes(inputValue.toLowerCase()));

  const filteredCameras = mergedCameraData.flatMap(b => b.camera || []).filter(cam => cam.socket_event === "not_yet_assign").filter((i) => i.name.toLowerCase().includes(inputValue.toLowerCase()));
  // Calendar pagination logic - Fixed
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // File upload handlers
  const handleUpload = async () => {
    if (!file) {
      setStatus("Silahkan pilih file terlebih dahulu!");
      return;
    }

    try {
      setStatus("Uploading...");
      const response = await calendar.uploadFile(file, "append");
      setStatus(`Sukses upload: ${response.data.processed} data`);
      // Refresh calendar data after successful upload
      fetchCalendar(currentPage, itemsPerPage);
    } catch (error) {
      setStatus("Gagal upload: " + error.message);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus(null); // Clear previous status
  };

  const updateDataKalender = (data) => {
    setShowDialogKalender(!showDialogKalender)
    setKalenderForm({ id: data.id, date: formatTanggal(data.tanggal), rawDate: formatToDateInput(data.tanggal), event_type: data.events, description: data.keterangan })
    setStatusDialogKalender(false)
  }

  const formatToDateInput = (tanggal) => {
    const bulanMap = {
      Januari: "01",
      Februari: "02",
      Maret: "03",
      April: "04",
      Mei: "05",
      Juni: "06",
      Juli: "07",
      Agustus: "08",
      September: "09",
      Oktober: "10",
      November: "11",
      Desember: "12",
    };
    const [tgl, namaBulan, tahun] = tanggal.split(" ");
    const bulan = bulanMap[namaBulan];
    return `${tahun}-${bulan}-${tgl.padStart(2, "0")}`;
  };

  const formatTanggal = (tanggal) => {
    const bulanMap = {
      Januari: "01",
      Februari: "02",
      Maret: "03",
      April: "04",
      Mei: "05",
      Juni: "06",
      Juli: "07",
      Agustus: "08",
      September: "09",
      Oktober: "10",
      November: "11",
      Desember: "12",
    };
    const [tgl, namaBulan, tahun] = tanggal.split(" ");
    const bulan = bulanMap[namaBulan];
    return `${tgl.padStart(2, "0")}/${bulan}/${tahun}`;
  };

  const convertToYYMMDD = (isoDate) => {
    const [year, month, day] = isoDate.split("-");
    const shortYear = year.slice(-2); // Ambil 2 digit terakhir
    return `${shortYear}-${month}-${day}`;
  };

  const handleSave = async () => {
    try {
      if (!statusDialogCameras && actionDialog === "create_cameras") {
        await createCameras(formCameras);
      }
      else if (actionDialog === "edit_cameras") {
        await updateCameras(formCameras.id, formCameras);
      }
      else if (actionDialog === "edit_maps") {
        await updateMaps(formMaps.id, formMaps);
      }
      else if (statusDialogCameras && actionDialog === "create_maps") {
        await createMaps(formMaps);
      }

      // Refresh data
      await fetchCameras();
      await fetchMaps();
      closeDialog();
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  return (
    <div className='w-[95%] py-10 mx-auto'>
      <Suspense fallback={<div className="text-center font-medium m-auto w-full">Loading Data...</div>}>
        <ToastContainer />

        {/* Add Camera Dialog */}
        {showDialog && (
          <DialogFCamera
            showDialog={showDialog}
            actionDialog={actionDialog}
            statusDialogCameras={statusDialogCameras}
            formMaps={formMaps}
            formCameras={formCameras}
            mergedCameraData={mergedCameraData}
            onFormMapsChange={setFormMaps}
            onFormCamerasChange={setFormCameras}
            onSave={handleSave}
            onClose={closeDialog}
          />
        )}

        {
          showDialogKalender && (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-md lg:w-[400px] w-[90%]">
                <h2 className="text-lg font-semibold mb-4">Tambah Tanggal</h2>

                {/* Input Date */}
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Tanggal (yy-mm-dd)</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={kalenderForm.rawDate} // harus dalam format yyyy-mm-dd untuk input type="date"
                    onChange={(e) => {
                      const raw = e.target.value; // misal: "2025-12-26"
                      const formattedDate = convertToYYMMDD(raw); // jadi "26-12-25"
                      setKalenderForm({
                        ...kalenderForm,
                        rawDate: raw, // untuk ditampilkan kembali di input
                        date: formattedDate, // untuk dikirim ke backend
                      });
                    }}
                  />
                </div>

                {/* Input Event Type */}
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Tipe Event</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Libur Nasional"
                    value={kalenderForm.event_type}
                    onChange={(e) => setKalenderForm({ ...kalenderForm, event_type: e.target.value })}
                  />
                </div>

                {/* Input Description */}
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Deskripsi</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Hari Raya Natal"
                    value={kalenderForm.description}
                    onChange={(e) => setKalenderForm({ ...kalenderForm, description: e.target.value })}
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2">
                  <button className="btn btn-sm" onClick={() => {
                    setShowDialogKalender(false);
                    setKalenderForm({ date: "", event_type: "", description: "" });
                  }}>
                    Batal
                  </button>
                  <button className="btn btn-sm bg-[#314385] text-white" onClick={async () => {
                    // Validasi sederhana
                    if (!kalenderForm.date || !kalenderForm.event_type) {
                      alert("Tanggal dan Tipe Event wajib diisi!");
                      return;
                    }

                    if (!statusDialogKalender) {
                      await updateCalendar({
                        id: kalenderForm.id,
                        tanggal: kalenderForm.rawDate,
                        events: kalenderForm.event_type,
                        deskripsi: kalenderForm.description
                      })
                    } else {
                      // Kirim ke API
                      await createCalendar({
                        tanggal: kalenderForm.rawDate,
                        events: kalenderForm.event_type,
                        deskripsi: kalenderForm.description
                      });
                    }

                    // Tutup dialog dan reset form
                    setShowDialogKalender(false);
                    setStatusDialogKalender(false)
                    setKalenderForm({ id: 0, date: "", rawDate: "", event_type: "", description: "" });

                    // Refresh data kalender
                    fetchCalendar(currentPage, itemsPerPage);
                  }}>
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )
        }


        {/* Main Content Grid */}
        <div className={`grid ${fullSize ? 'grid-cols-1' : 'xl:grid-cols-3 grid-cols-1'} h-fit gap-4`}>
          {/* Camera Management Section */}
          <div className={`w-full ${fullSize ? 'col-span-1' : 'xl:col-span-2'} bg-[#314385]/10 rounded-xl p-4 h-full flex flex-col gap-5`}>
            {/* <h3 className='text-lg font-medium mb-2'>Select Layout</h3>
            <div className='w-full overflow-x-auto'>
              <div className="flex gap-2 min-w-max">
                <div className={isMobile ? 'opacity-50 pointer-events-none' : ''}>
                  <LayoutKamera
                    cols={2}
                    J={4}
                    Clicked={() => [handleClick({ cols: 2, J: 4, bc: 0, rows: 0 }), setFullSize(false)]}
                  />
                </div>
                <div className={isMobile ? 'opacity-50 pointer-events-none' : ''}>
                  <LayoutKamera
                    cols={3}
                    J={2}
                    bc={1}
                    rows={2}
                    Clicked={() => [handleClick({ cols: 3, J: 3, bc: 1, rows: 2 }), setFullSize(true)]}
                  />
                </div>
                <LayoutKamera
                  cols={1}
                  J={2}
                  Clicked={() => [handleClick({ cols: 1, J: 4, bc: 0, rows: 0 }), setFullSize(false)]}
                />
              </div>
            </div>

            <div className='overflow-y-auto lg:max-h-[490px]'>
              {mergedCameraData.length > 0 && (
                <CameraPosition layout={layout} streamData={streamData} urlData={videoStream} />
              )}
            </div> */}

            <CameraActive
              onOptionChange={handleCameraSelect}
              inputSearch={changeInputSearch}
              addNewMaps={handleAddNewMaps}
              searchValue={inputValue}
              addNewCamera={handleAddNewCamera}
            >
              <div className="h-[65vh] overflow-y-auto my-2">
                {optionCamera === "peta" ? (
                  <MapComponent sizeHeight={"60vh"} onClick={() => { }} onClickSimpang={() => { }} />
                ) : optionCamera === "daftar" ? (
                  <div className="overflow-x-auto w-full bg-base-200 mt-5">
                    <table className="table table-sm">
                      <thead className="bg-stone-900/90 text-white text-xs">
                        <tr className="text-center">
                          <th rowSpan={2}>No</th>
                          <th rowSpan={2}>Lokasi</th>
                          <th rowSpan={2} colSpan={2}>Kamera</th>
                          <th rowSpan={2}>Tautan Socket</th>
                          <th colSpan={2}>Koordinat</th>
                          {/* <th rowSpan={2}>Thumbnail</th> */}
                          <th rowSpan={2}>Resolution</th>
                          <th rowSpan={2}>Status</th>
                          <th rowSpan={2}>Action</th>
                        </tr>
                        <tr>
                          <td>Latitude</td>
                          <td>Longitude</td>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          let rowNumber = 1; // Counter untuk nomor urut

                          return filteredBuildings?.flatMap((dataSimpang, i) => {
                            const cameras = Array.isArray(dataSimpang.camera) ? dataSimpang.camera : [];
                            console.log(dataSimpang)
                            if (cameras.length === 0) {
                              return (
                                <tr key={`no-camera-${i}`} className="text-xs font-normal text-left">
                                  <td className="text-center">{rowNumber++}</td>
                                  <td className='cursor-pointer flex items-center gap-1'>
                                    <button
                                      className="p-1 hover:bg-transparent focus:outline-none cursor-pointer"
                                      onClick={() => handleSelectCameras(dataSimpang.id, 'edit_maps', dataSimpang)}
                                    >
                                      <FaPencil className="text-green-300 text-lg" />
                                    </button>
                                    <button
                                      className="p-1 hover:bg-transparent focus:outline-none cursor-pointer"
                                      onClick={() => handleSelectCameras(dataSimpang.id, 'delete_maps')}
                                    >
                                      <FaTrashCan className="text-red-300 text-lg" />
                                    </button>
                                    <div className='text-nowrap'>{dataSimpang.Nama_Simpang}</div>
                                  </td>
                                  <td colSpan={3} className='text-left text-nowrap'>Tidak ada kamera</td>
                                  <td className='max-w-5 truncate'>{dataSimpang?.latitude || '-'}</td>
                                  <td className='max-w-5 truncate'>{dataSimpang?.longitude || '-'}</td>
                                  <td className='text-center'>-</td>
                                  <td className='text-center'>-</td>
                                  <td className='flex justify-center gap-1'>
                                    <button
                                      className={`p-1 hover:bg-transparent focus:outline-none btn-disabled cursor-not-allowed`}
                                      onClick={() => { }}
                                    >
                                      <FaPencil className="text-green-300 text-lg" />
                                    </button>
                                    <button
                                      className="p-1 hover:bg-transparent focus:outline-none cursor-pointer"
                                      onClick={() => handleSelectCameras(dataSimpang.id, 'delete_maps')}
                                    >
                                      <FaTrashCan className="text-red-300 text-lg" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            }

                            return cameras.map((cam, j) => (
                              <tr key={`cam-${i}-${j}`} className="text-xs font-normal text-left items-center">
                                <td className="text-center">{rowNumber++}</td>
                                <td className='cursor-pointer flex items-center gap-1'>
                                  <button
                                    className="p-1 hover:bg-transparent focus:outline-none cursor-pointer"
                                    onClick={() => handleSelectCameras(dataSimpang.id, 'edit_maps', dataSimpang)}
                                  >
                                    <FaPencil className="text-green-300 text-lg" />
                                  </button>
                                  <button
                                    className="p-1 hover:bg-transparent focus:outline-none cursor-pointer"
                                    onClick={() => handleSelectCameras(dataSimpang.id, 'delete_maps')}
                                  >
                                    <FaTrashCan className="text-red-300 text-lg" />
                                  </button>
                                  <div className='text-nowrap'>{dataSimpang.Nama_Simpang}</div>
                                </td>
                                <td colSpan={2} className='text-nowrap'>{cam.name}</td>
                                <td>{cam.socket_event || '-'}</td>
                                <td className='max-w-5 truncate'>{dataSimpang?.latitude || '-'}</td>
                                <td className='max-w-5 truncate'>{dataSimpang?.longitude || '-'}</td>
                                <td className="text-center">{cam.resolution || '-'}</td>
                                <td>
                                  <input
                                    type="checkbox"
                                    className={`toggle ${cam.status ? 'checked:toggle-success' : 'toggle-error'} toggle-sm`}
                                    checked={cam.status}
                                    onChange={(e) => handleToggle(cam.id, cam, e.target.checked)}
                                  />
                                </td>
                                <td>
                                  <div className="flex gap-1 justify-center">
                                    <button
                                      className="p-1 hover:bg-transparent focus:outline-none cursor-pointer"
                                      onClick={() => handleSelectCameras(cam.id, 'edit_cameras', cam)}
                                    >
                                      <FaPencil className="text-green-300 text-lg" />
                                    </button>
                                    <button
                                      className={`p-1 hover:bg-transparent focus:outline-none ${cam.socket_event === "not_yet_assign" ? "cursor-pointer" : "btn-disabled cursor-not-allowed"}`}
                                      onClick={() => {
                                        if (cam.socket_event !== "not_yet_assign") return;
                                        handleSelectCameras(cam.id, 'delete_cameras');
                                      }}
                                    >
                                      <FaTrashCan className="text-red-300 text-lg" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ));
                          });
                        })()}
                      </tbody>

                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-5 w-full">
                    {
                      filteredBuildings?.map((dataCamera, index) => {
                        const firstCamera = dataCamera?.camera?.[0];
                        const cameraId = firstCamera?.id;
                        const stream = cameraId ? streamData[cameraId] : null;
                        console.log(dataCamera.camera)
                        return (
                          <div className="w-full relative bg-black" key={index}>
                            <CCTVStream
                              heightCamera
                              customLarge={'h-[90px]'}
                              data={stream}
                              title={dataCamera?.name || `CCTV Camera ${index + 1}`}
                              onClick={() => handleClickCamera(dataCamera)}
                            />
                            <input
                              type="checkbox"
                              className={`toggle absolute bg-white/50 bottom-2.5 right-2 ${firstCamera?.status ? 'toggle-success' : 'toggle-error'} toggle-xs`}
                              checked={firstCamera?.status}
                              onChange={(e) => handleToggle(firstCamera.id, dataCamera, e.target.checked)}
                            />
                          </div>
                        );
                      })
                    }
                    {
                      filteredCameras?.map((item, i) => {
                        return (
                          <div className="w-full relative bg-black" key={i}>
                            <AdaptiveVideoPlayer
                              videoUrl={item.url}
                              title={`Video ${item.name}`}
                              onClick={() => console.log(`Clicked on ${item.name}`)}
                            />
                            <input
                              type="checkbox"
                              className={`toggle absolute bg-white/50 bottom-2.5 right-2 ${item.status ? 'toggle-success' : 'toggle-error'} toggle-xs`}
                              checked={item.status}
                              onChange={(e) => handleToggle(item.id, item, e.target.checked)}
                            />
                          </div>
                        );
                      })
                    }
                  </div>
                )}
              </div>
            </CameraActive>
          </div>

          {/* Recent Vehicle Section */}
          {!fullSize && (
            <RecentVehicle hg={600} />
          )}
        </div>

        {/* Calendar Management Section */}
        <div>
          {/* File Upload Section */}
          <div className="flex gap-2 w-full justify-end mt-5 flex-wrap">
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              className='block w-fit text-sm text-slate-500  bg-slate-50/50 hover:bg-slate-200 p-1 rounded-full
                file:mr-4 file:py-2 file:px-4
                file:hover:cursor-pointer
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-[#314385]/10 file:text-[#314385]/80
                hover:file:bg-[#314385]/20'
            />
            <button
              className={`btn btn-md rounded-md bg-[#314385]/80 text-white capitalize ${!file && 'btn-disabled'}`}
              onClick={handleUpload}
              disabled={!file}
            >
              <FiDownload />
              Impor Data
            </button>
            <button className="btn btn-md rounded-md bg-[#314385]/80 text-white capitalize" onClick={() => { setShowDialogKalender(!showDialogKalender), setStatusDialogKalender(true) }}>
              <IoIosAdd className="text-xl" />
              Tambah Data
            </button>
          </div>

          {/* Upload Status */}
          {status && (
            <div className={`alert ${status.includes('Sukses') ? 'alert-success' : status.includes('Gagal') ? 'alert-error' : 'alert-info'} mt-2`}>
              <span>{status}</span>
            </div>
          )}

          {/* Calendar Table */}
          <div className="overflow-x-auto w-full bg-base-200 mt-5">
            <table className="table table-sm">
              <thead className="bg-stone-900/90 text-white">
                <tr className="text-center font-normal">
                  <th>No</th>
                  <th>Tanggal</th>
                  <th>Events</th>
                  <th>Keterangan</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingCalendar ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8">
                      <span className="loading loading-spinner loading-md"></span>
                      <div>Memuat data kalender...</div>
                    </td>
                  </tr>
                ) : dataKalender?.length > 0 ? (
                  dataKalender.map((dataK, i) => (
                    <tr key={i} className="text-medium font-normal text-center">
                      <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                      <td>{dataK.tanggal}</td>
                      <td>{dataK.events}</td>
                      <td>{dataK.keterangan}</td>
                      <td>
                        <div className="flex gap-2 justify-center">
                          <button className="p-1 cursor-pointer hover:bg-gray-100 rounded" onClick={() => updateDataKalender(dataK)}>
                            <FaPencil className="text-green-300 text-lg" />
                          </button>
                          <button className="p-1 cursor-pointer hover:bg-gray-100 rounded" onClick={() => deleteDataKalender(dataK.id)}>
                            <FaTrashCan className="text-red-300 text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8">
                      Tidak ada data kalender
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4 px-4 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs">Tampilkan:</span>
                <select
                  className="select select-sm select-bordered"
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <span className="text-xs">data per halaman</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="btn btn-sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoadingCalendar}
                >

                  <IoChevronBackSharp className="text-xl" />
                </button>

                <div className="flex items-center gap-1">
                  {/* Page numbers */}
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = index + 1;
                    } else if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }

                    return (
                      <button
                        key={pageNum}
                        className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isLoadingCalendar}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="btn btn-sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoadingCalendar}
                >
                  <IoChevronForwardSharp className="text-xl" />
                </button>
              </div>

              <div className="text-xs text-gray-600">
                Halaman {currentPage} dari {totalPages}
                {totalItems > 0 && ` (${totalItems} total data)`}
              </div>
            </div>
          </div>
        </div>
      </Suspense >
    </div >
  );
};

export default ManajemenKamera;
