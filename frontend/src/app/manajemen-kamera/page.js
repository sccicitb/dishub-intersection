"use client";

import { useSocket } from '@/hooks/useSocket';
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
import { useAuth } from "@/app/context/authContext";


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
  const { isEditor, isAdmin } = useAuth();
  // const isStrictEditor = ['admin', 'operator'].every(role => userRoles.includes(role));

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
    ditangani_oleh: "",
    kecamatan: "",
    kategori: "",
    hambatan_samping: "",
    cuaca: "",
    lebar_jalur: 0,
    jumlah_lajur: 1,
    median: "",
    belok_kiri_jalan_terus: "",
    metode_survei: "",
  })
  const [dataMapsID, setDataMapsID] = useState([])
  const [statusDialogKalender, setStatusDialogKalender] = useState(false)
  const [statusDialogCameras, setStatusDialogCameras] = useState(false)
  const [mergedCameraData, setMergedCameraData] = useState([]);
  const [videoStream, setVideoStream] = useState({})
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    console.log(isAdmin, isEditor)
  }, [isAdmin, isEditor])
  // Fetch API Calendar, Maps, Cameras

  //# Fetch GET Camera (Maps)
  const fetchMaps = async () => {
    setIsLoadingData(true);
    try {
      const res = await maps.getAllSimpang();
      // const location = res.data.buildings;
      const location = res.data.simpang;
      // console.log(location)
      setDataSimpang(location);
      // console.log(location)
    } catch (err) {
      console.error("Failed to fetch location:", err);
      toast.error("Gagal mengambil data lokasi kamera!", { position: 'top-right' });
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchCameras = async () => {
    setIsLoadingData(true);
    try {
      const res = await cameras.getAll();
      // console.log(res.data.cameras)
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
    } finally {
      setIsLoadingData(false);
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
      Status_Non_Aktif: data.model_detection || false,
      cuaca: data.cuaca || "",
      metode_survei: data.metode_survei || "",
      latitude: data.latitude,
      longitude: data.longitude,
      socket_event: data.socket_event,
      name: data.name,
      latitude: data.location.latitude,
      longitude: data.location.longitude,
      kategori: data.category,
      kota: data.kota || "Jogja",
      ukuran_kota: data.ukuran_kota,
      tanggal: dateNow,
      periode: data.periode,
      ditangani_oleh: data.ditangani_oleh,
      kecamatan: data.kecamatan,
      hambatan_samping: data.hambatan_samping,
      cuaca: data.cuaca,
      lebar_jalur: data.lebar_jalur,
      jumlah_lajur: data.jumlah_lajur,
      median: data.median,
      belok_kiri_jalan_terus: data.belok_kiri_jalan_terus,
      metode_survei: data.metode_survei,
    };

    try {
      const res = await maps.createData(push);
      // Perbaikan: Gunakan res.status === 200 atau 201 untuk success
      if (res.status === 201 || res.status === 200) {
        toast.success("Lokasi Kamera berhasil ditambahkan!!", {
          position: 'top-right'
        });
      } else {
        toast.error("Data tidak berhasil ditambahkan, silakan coba lagi!", {
          position: 'top-right'
        });
      }
    } catch (err) {
      console.error("Gagal menambahkan Lokasi Kamera:", err);
      toast.error("Gagal menambahkan Lokasi Kamera!", { position: 'top-right' });
      throw err;
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
      } else {
        toast.error("Data tidak berhasil ditambahkan, silakan coba lagi!", {
          position: 'top-right'
        });
      }
    } catch (err) {
      console.error("Gagal menambahkan kamera:", err);
      toast.error("Gagal menambahkan kamera!", { position: 'top-right' });
      throw err;
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
      } else {
        toast.error("Data tidak berhasil diperbaharui, silakan coba lagi!", {
          position: 'top-right'
        });
      }
    } catch (err) {
      console.error("Gagal memperbaharui kamera:", err);
      toast.error("Gagal memperbaharui kamera!", { position: 'top-right' });
      throw err;
    }
  };

  //# Fetch update Maps
  const updateMaps = async (id, data) => {
    const push = {
      Status_Non_Aktif: data.model_detection || false,
      cuaca: data.cuaca || "",
      metode_survei: data.metode_survei || "",
      latitude: data.latitude,
      longitude: data.longitude,
      socket_event: data.socket_event,
      name: data.name,
      latitude: data.location.latitude,
      longitude: data.location.longitude,
      kategori: data.category,
      kota: data.kota || "Jogja",
      ukuran_kota: data.ukuran_kota,
      tanggal: data.tanggal,
      periode: data.periode,
      ditangani_oleh: data.ditangani_oleh,
      kecamatan: data.kecamatan,
      hambatan_samping: data.hambatan_samping,
      cuaca: data.cuaca,
      lebar_jalur: data.lebar_jalur,
      jumlah_lajur: data.jumlah_lajur,
      median: data.median,
      belok_kiri_jalan_terus: data.belok_kiri_jalan_terus,
      metode_survei: data.metode_survei,
    };

    try {
      const res = await maps.updateById(id, push);
      // Perbaikan: Biasanya update menggunakan status 200
      if (res.status === 200 || res.status === 201) {
        toast.success("Maps berhasil diperbaharui!!", {
          position: 'top-right'
        });
      } else {
        toast.error("Data tidak berhasil diperbaharui, silakan coba lagi!", {
          position: 'top-right'
        });
      }
    } catch (err) {
      console.error("Gagal memperbaharui Maps:", err);
      toast.error("Gagal memperbaharui Maps!", { position: 'top-right' });
      throw err;
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
        // console.log(dataCameras.filter(camera => camera.ID_Simpang == building.id));
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
      // console.log(result)
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

  // Update form ketika dataMapsID berubah (setelah fetchMapsById)
  useEffect(() => {
    if (dataMapsID && Object.keys(dataMapsID).length > 0 && actionDialog === "edit_maps") {
      setFormMaps({
        id: dataMapsID.id || 0,
        category: dataMapsID.kategori || "",
        model_detection: dataMapsID.Status_Non_Aktif || false,
        name: dataMapsID.Nama_Simpang || "",
        location: {
          latitude: dataMapsID.latitude || "",
          longitude: dataMapsID.longitude || ""
        },
        socket_event: dataMapsID.socket_event || "",
        kota: dataMapsID.Kota || "Jogja",
        ukuran_kota: dataMapsID.Ukuran_Kota || "",
        tanggal: dataMapsID?.Tanggal?.split("T")[0] || "",
        periode: dataMapsID.Periode || "",
        ditangani_oleh: dataMapsID.Ditangani_Oleh || "",
        kecamatan: dataMapsID.Kecamatan || "",
        hambatan_samping: dataMapsID.Hambatan_Samping || "",
        cuaca: dataMapsID.Cuaca || "",
        lebar_jalur: dataMapsID.Lebar_Jalur || 0,
        jumlah_lajur: dataMapsID.Jumlah_Lajur > 0 ? dataMapsID.Jumlah_Lajur : 1,
        median: dataMapsID.Median || "",
        belok_kiri_jalan_terus: dataMapsID.Belok_Kiri_Jalan_Terus || "",
        metode_survei: dataMapsID.Metode_Survei || "",
      });
    }
  }, [dataMapsID, actionDialog]);

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

  // Fixed: Single useSocket hook instance (no duplicate)
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !mergedCameraData.length) return;

    const handleData = (data, camId) => {
      setStreamData(prev => ({ ...prev, [camId]: data }));
    };

    const eventListeners = [];

    mergedCameraData.forEach((building) => {
      if (!Array.isArray(building?.camera)) return;
      building.camera.forEach((cam) => {
        if (!cam?.socket_event || !cam?.id || cam.socket_event === "not_yet_assign") return;

        socket.on(cam.socket_event, (data) => handleData(data, cam.id));
        eventListeners.push(cam.socket_event);
      });
    });

    // Update videoStream filter
    const videoStream = mergedCameraData.flatMap(b => b.camera || [])
      .filter(cam => cam.socket_event === "not_yet_assign" && cam.status === 1);
    setVideoStream(videoStream);

    return () => {
      eventListeners.forEach(event => socket.off(event));
    };
  }, [socket, mergedCameraData]);


  const changeInputSearch = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddNewCamera = () => {
    // Hitung total kamera yang ada
    const totalCameras = dataCameras.length;
    
    // Cek apakah sudah mencapai maksimal 4 kamera
    if (totalCameras >= 4) {
      toast.error("Maksimal 4 kamera telah tercapai. Anda tidak dapat menambahkan kamera lagi karena pembatasan sistem.", {
        position: 'top-right',
        autoClose: 5000,
      });
      return;
    }
    
    setActionDialog("create_cameras")
    setStatusDialogCameras(false)
    setShowDialog(true);
  };

  const handleAddNewMaps = () => {
    // Hitung total lokasi/maps yang ada
    const totalMaps = dataSimpang.length;
    
    // Cek apakah sudah mencapai maksimal 4 lokasi
    if (totalMaps >= 4) {
      toast.error("Maksimal 4 lokasi telah tercapai. Anda tidak dapat menambahkan lokasi lagi karena pembatasan sistem.", {
        position: 'top-right',
        autoClose: 5000,
      });
      return;
    }
    
    setActionDialog("create_maps")
    setStatusDialogCameras(true)
    setShowDialog(true);
  };


  const handleSelectCameras = async (id, select, data) => {
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
      // Fetch data terbaru dari API dan tunggu sampai selesai
      await fetchMapsById(id);
      
      // Tunggu sebentar untuk memastikan state dataMapsID sudah update
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
      kecamatan: "",
      kategori: "",
      hambatan_samping: "",
      cuaca: "",
      lebar_jalur: 0,
      jumlah_lajur: 1,
      median: "",
      belok_kiri_jalan_terus: "",
      metode_survei: "",
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
    setIsLoadingData(true);
    try {
      // Execute create/update operation
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

      // Refresh data dan tunggu sampai selesai
      await Promise.all([fetchCameras(), fetchMaps()]);
      
      // Delay 3 detik untuk memastikan state update selesai dan data ter-refresh
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Close dialog setelah semua selesai
      closeDialog();
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsLoadingData(false);
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
            isLoading={isLoadingData}
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
        <div className={`flex w-full gap-5 not-md:flex-col lg:h-[700px]`}>
          {/* Camera Management Section */}
          <div className={`w-full ${fullSize ? 'col-span-1' : 'xl:col-span-2'} bg-[#314385]/10 rounded-xl p-4 h-full flex flex-col gap-5`}>

            <CameraActive
              onOptionChange={handleCameraSelect}
              inputSearch={changeInputSearch}
              addNewMaps={handleAddNewMaps}
              searchValue={inputValue}
              editorStatus={isAdmin}
              addNewCamera={handleAddNewCamera}
              cameraCount={dataCameras.length}
              maxCameras={4}
              mapsCount={dataSimpang.length}
              maxMaps={4}
            >
              <div className="h-[65vh] overflow-y-auto my-2">
                {isLoadingData ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <span className="loading loading-spinner loading-lg text-[#314385]"></span>
                    <p className="text-gray-600 font-medium">Memuat data...</p>
                  </div>
                ) : optionCamera === "peta" ? (
                  <MapComponent sizeHeight={"60vh"} onClick={() => { }} onClickSimpang={() => { }} />
                ) : optionCamera === "daftar" ? (
                  <div className="space-y-6 mt-5">
                    {/* Tabel Daftar Lokasi/Simpang */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="bg-stone-800 px-4 py-3">
                        <h3 className="text-white font-semibold text-sm">Daftar Lokasi Simpang</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="table table-sm w-full">
                          <thead className="bg-stone-800 text-white text-xs">
                            <tr className="text-center">
                              <th className="w-12">No</th>
                              <th className="text-left">Nama Lokasi</th>
                              <th>Latitude</th>
                              <th>Longitude</th>
                              <th>Kategori</th>
                              {isAdmin && <th className="w-24">Aksi</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredBuildings?.map((dataSimpang, i) => (
                              <tr key={`simpang-${i}`} className="text-xs hover:bg-base-200">
                                <td className="text-center">{i + 1}</td>
                                <td className="font-medium text-left">{dataSimpang.Nama_Simpang}</td>
                                <td className="text-center">{dataSimpang?.latitude || '-'}</td>
                                <td className="text-center">{dataSimpang?.longitude || '-'}</td>
                                <td className="text-center capitalize">
                                  <span className="badge badge-sm badge-outline">{dataSimpang?.kategori || '-'}</span>
                                </td>
                                {isAdmin && (
                                  <td className="text-center">
                                    <div className="flex gap-2 justify-center">
                                      <button
                                        className="btn btn-xs btn-ghost text-green-600 hover:bg-green-50"
                                        onClick={() => handleSelectCameras(dataSimpang.id, 'edit_maps', dataSimpang)}
                                        title="Edit Lokasi"
                                      >
                                        <FaPencil />
                                      </button>
                                      <button
                                        className="btn btn-xs btn-ghost text-red-600 hover:bg-red-50"
                                        onClick={() => handleSelectCameras(dataSimpang.id, 'delete_maps')}
                                        title="Hapus Lokasi"
                                      >
                                        <FaTrashCan />
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                            {filteredBuildings?.length === 0 && (
                              <tr>
                                <td colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-gray-500">
                                  Tidak ada data lokasi
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Tabel Daftar Kamera */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="bg-stone-800 px-4 py-3">
                        <h3 className="text-white font-semibold text-sm">Daftar Kamera</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="table table-sm w-full">
                          <thead className="bg-stone-800 text-white text-xs">
                            <tr className="text-center">
                              <th className="w-12">No</th>
                              <th className="text-left">Nama Kamera</th>
                              <th className="text-left">Lokasi</th>
                              <th>Socket Event</th>
                              <th>Resolution</th>
                              <th>Status</th>
                              {isEditor && <th className="w-24">Aksi</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              let rowNumber = 1;
                              const allCameras = filteredBuildings?.flatMap((dataSimpang) => {
                                const cameras = Array.isArray(dataSimpang.camera) ? dataSimpang.camera : [];
                                return cameras.map(cam => ({
                                  ...cam,
                                  simpangName: dataSimpang.Nama_Simpang,
                                  simpangId: dataSimpang.id
                                }));
                              }) || [];

                              return allCameras.map((cam, idx) => (
                                <tr key={`camera-${idx}`} className="text-xs hover:bg-base-200">
                                  <td className="text-center">{rowNumber++}</td>
                                  <td className="font-medium text-left">{cam.name}</td>
                                  <td className="text-left">{cam.simpangName}</td>
                                  <td className="text-center">
                                    {cam.socket_event && cam.socket_event !== "not_yet_assign" ? (
                                      <span className="badge badge-sm badge-info">{cam.socket_event}</span>
                                    ) : (
                                      <span className="badge badge-sm badge-ghost">URL Video</span>
                                    )}
                                  </td>
                                  <td className="text-center">{cam.resolution || '-'}</td>
                                  <td className="text-center">
                                    <input
                                      type="checkbox"
                                      className={`toggle ${cam.status ? 'toggle-success' : 'toggle-error'} toggle-sm`}
                                      checked={cam.status}
                                      onChange={(e) => handleToggle(cam.id, cam, e.target.checked)}
                                    />
                                  </td>
                                  {isEditor && (
                                    <td className="text-center">
                                      <div className="flex gap-2 justify-center">
                                        <button
                                          className="btn btn-xs btn-ghost text-green-600 hover:bg-green-50"
                                          onClick={() => handleSelectCameras(cam.id, 'edit_cameras', cam)}
                                          title="Edit Kamera"
                                        >
                                          <FaPencil />
                                        </button>
                                        {isAdmin && (
                                          <button
                                            className={`btn btn-xs btn-ghost ${cam.socket_event === "not_yet_assign" ? 'text-red-600 hover:bg-red-50' : 'btn-disabled text-gray-400'}`}
                                            onClick={() => {
                                              if (cam.socket_event !== "not_yet_assign") return;
                                              handleSelectCameras(cam.id, 'delete_cameras');
                                            }}
                                            disabled={cam.socket_event !== "not_yet_assign"}
                                            title={cam.socket_event !== "not_yet_assign" ? "Kamera dengan socket event tidak dapat dihapus" : "Hapus Kamera"}
                                          >
                                            <FaTrashCan />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              ));
                            })()}
                            {(() => {
                              const allCameras = filteredBuildings?.flatMap((dataSimpang) => {
                                const cameras = Array.isArray(dataSimpang.camera) ? dataSimpang.camera : [];
                                return cameras;
                              }) || [];
                              
                              if (allCameras.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan={isEditor ? 7 : 6} className="text-center py-8 text-gray-500">
                                      Tidak ada data kamera
                                    </td>
                                  </tr>
                                );
                              }
                              return null;
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-5 w-full">
                    {
                      filteredBuildings?.filter(fB => fB.camera?.some(d => d.socket_event !== "not_yet_assign")).map((dataCamera, index) => {
                        const firstCamera = dataCamera?.camera?.[0];
                        const cameraId = firstCamera?.id;
                        const stream = cameraId ? streamData[cameraId] : null;
                        return (
                          <div className="w-full relative bg-black" key={index}>
                            <CCTVStream
                              heightCamera
                              customLarge={'h-[90px]'}
                              data={stream}
                              title={
                                (firstCamera?.name && dataCamera?.Nama_Simpang)
                                  ? `${firstCamera.name} - ${dataCamera.Nama_Simpang}`
                                  : `CCTV Camera ${index + 1}`
                              }
                              onClick={() => handleClickCamera(dataCamera)}
                            />
                            {isEditor && (
                              <input
                                type="checkbox"
                                className={`toggle absolute bg-white/50 bottom-2.5 right-2 ${firstCamera?.status ? 'toggle-success' : 'toggle-error'} toggle-xs`}
                                checked={firstCamera?.status}
                                onChange={(e) => handleToggle(firstCamera.id, dataCamera, e.target.checked)}
                              />
                            )}
                          </div>
                        );
                      })
                    }
                    {
                      filteredBuildings
                        ?.flatMap(b => b.camera || [])
                        .filter(d => d.socket_event === "not_yet_assign")
                        .map((item, i) => {
                          return (
                            <div className="w-full relative bg-black" key={i}>
                              <AdaptiveVideoPlayer
                                videoUrl={item.url}
                                title={`Video ${item.name}`}
                                onClick={() => console.log(`Clicked on ${item.name}`)}
                              />
                              {isEditor && (
                                <input
                                  type="checkbox"
                                  className={`toggle absolute bg-white/50 bottom-2.5 right-2 ${item.status ? 'toggle-success' : 'toggle-error'} toggle-xs`}
                                  checked={item.status}
                                  onChange={(e) => handleToggle(item.id, item, e.target.checked)}
                                />
                              )}
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
          <RecentVehicle allData={filteredBuildings} streamData={streamData} />
        </div>

        {/* Calendar Management Section */}
        <div>
          {/* File Upload Section */}
          {isAdmin && (
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
          )}

          {/* Upload Status */}
          {status && (
            <div className={`alert ${status.includes('Sukses') ? 'alert-success' : status.includes('Gagal') ? 'alert-error' : 'alert-info'} mt-2`}>
              <span>{status}</span>
            </div>
          )}

          {/* Calendar Table */}
          <div className="overflow-x-auto w-full bg-base-200 mt-5">
            <table className="table border-2 table-sm">
              <thead className="bg-stone-900/90 text-white">
                <tr className="text-center font-normal">
                  <th>No</th>
                  <th>Tanggal</th>
                  <th>Events</th>
                  <th>Keterangan</th>
                  {isAdmin && (
                    <th>Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoadingCalendar ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 border-2">
                      <span className="loading loading-spinner loading-md"></span>
                      <div>Memuat data kalender...</div>
                    </td>
                  </tr>
                ) : dataKalender?.length > 0 ? (
                  dataKalender.map((dataK, i) => (
                    <tr key={i} className="text-medium font-normal text-center">
                      <td className="border-2">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                      <td className="border-2">{dataK.tanggal}</td>
                      <td className="border-2">{dataK.events}</td>
                      <td className="border-2">{dataK.keterangan}</td>
                      {isAdmin && (
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
                      )}
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
