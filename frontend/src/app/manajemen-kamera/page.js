"use client";

import { io } from 'socket.io-client'
import { useState, useEffect, lazy, Suspense } from 'react'
import CCTVStream from '../components/cctvStream';
import CameraActive from '../components/cameraActive';
// import DataSimpang from '@/data/DataSimpang.json'
import { FaRegEye, FaRegEyeSlash, FaPencil, FaTrashCan } from "react-icons/fa6";
import { FiDownload } from "react-icons/fi";
import { IoIosAdd } from "react-icons/io";
import { maps } from "@/lib/apiAccess"
import { calendar } from "@/lib/apiService"
import { IoChevronBackSharp, IoChevronForwardSharp } from "react-icons/io5";

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

export const CameraPosition = ({ layout, streamData }) => {
  const streams = Object.values(streamData).filter(Boolean);

  const { cols = 1, J = 2, bc = 0, rows = 0 } = layout;

  const totalSlots = bc + J;

  return (
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
  const [selectOption, setSelectOption] = useState('detection4');
  const [activeTitle, setActiveTitle] = useState('Kamera Aktif');
  const [layout, setLayout] = useState({ cols: 2, J: 4, bc: 0, rows: 0 });
  const [fullSize, setFullSize] = useState(false);
  const isMobile = useIsMobile();
  const [optionCamera, setOptionCamera] = useState('peta');
  const [dataSimpang, setDataSimpang] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
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
  const [mode, setMode] = useState("append");
  const [kalenderForm, setKalenderForm] = useState({
    id: 0,
    date: "",
    event_type: "",
    description: "",
    rawDate: "",
  });
  const [statusDialogKalender, setStatusDialogKalender] = useState(false)
  // Fetch calendar data with proper pagination
  const fetchCalendar = async (page = 1, limit = 5) => {
    setIsLoadingCalendar(true);
    try {
      const res = await calendar.getAll(page, limit);
      console.log("Calendar API Response:", res);

      if (res?.data?.holidays) {
        setDataKalender(res.data.holidays);
        // Since BE doesn't provide total count, we use the array length
        // For proper pagination, BE should return total count
      }
    } catch (err) {
      console.error("Failed to fetch calendar:", err);
      setDataKalender([]);
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  // Fetch cameras data
  const fetchCameras = async () => {
    try {
      const res = await maps.getAll();
      const detectedCameras = res.data.buildings;
      setDataSimpang(detectedCameras);
    } catch (err) {
      console.error("Failed to fetch cameras:", err);
    }
  };

  const fetchCalendarTotal = async () => {
    try {
      const res = await calendar.getAll(1, 999999); // Large limit to get all data
      if (res?.data?.holidays) {
        setTotalItems(res.data.holidays.length);
      }
    } catch (err) {
      console.error("Failed to fetch calendar total:", err);
      setTotalItems(0);
    }
  };
  const updateCalendar = async (data) => {
    try {
      if (!data) return console.log("data tidak sesuai cek kembali!")
      const pushData = {
        date: data.tanggal,
        event_type: data.events,
        description: data.deskripsi
      }
      const res = await calendar.updateById(data.id, pushData)
      if (!res.status === 201) {
        console.log('data gagal dirubah!')
      }
    } catch (error) {
      console.error("Failed to fetch create new data calendar: ", err)
    }
  }
  const deleteDataKalender = async (id) => {
    try {
      if (!id) return console.log("data tidak sesuai cek kembali!")
      const res = await calendar.deleteById(id)
      fetchCalendar(1, itemsPerPage);
      if (!res.status === 201) {
        console.log('data gagal dirubah!')
      }
    } catch (error) {
      console.error("Failed to fetch create new data calendar: ", err)
    }
  }
  const createCalendar = async (data) => {
    try {
      if (!data) return console.log("data tidak sesuai cek kembali!")
      const push = {
        date: data.tanggal,
        event_type: data.events,
        description: data.deskripsi
      }
      const res = await calendar.createData(push)
      if (!res.status === 201) {
        console.log("data gagal dibuat!")
      }
      console.log("data sukses terbuat")
    } catch (err) {
      console.error("Failed to fetch create new data calendar: ", err)
    }
  }
  // Initialize data on component mount
  useEffect(() => {
    fetchCameras();
    fetchCalendar(1, itemsPerPage);
    fetchCalendarTotal();
  }, []);

  // Refetch calendar when page or items per page changes
  useEffect(() => {
    fetchCalendar(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const handleToggle = (index, checked) => {
    const updated = [...dataSimpang];
    updated[index].model_detection = checked;
    setDataSimpang(updated);
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

  const handleClickCamera = (T) => {
    const replace = T.name.toLowerCase();
    switch (replace) {
      case 'simpang piyungan':
        setSelectOption('detection3');
        break;
      case 'simpang demen glagah':
        setSelectOption('detection4');
        break;
      case 'simpang tempel':
        setSelectOption('detection5');
        break;
      case 'simpang prambanan':
        setSelectOption('detection1');
        break;
    }
  };

  // Socket connection for real-time data
  useEffect(() => {
    const socket = io('https://sxe-data.layanancerdas.id');

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));

    return () => {
      socket.disconnect();
    };
  }, []);

  // Socket listeners for camera streams
  useEffect(() => {
    const socket = io('https://sxe-data.layanancerdas.id');

    dataSimpang.forEach((building) => {
      if (!building?.camera?.socketEvent || !building?.camera?.id) return;

      socket.on(building.camera.socketEvent, (data) => {
        setStreamData((prev) => ({
          ...prev,
          [building.camera.id]: data,
        }));
      });
    });

    return () => {
      dataSimpang.forEach((building) => {
        if (building?.camera?.socketEvent) {
          socket.off(building.camera.socketEvent);
        }
      });
    };
  }, [dataSimpang]);

  const changeInputSearch = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddNewCamera = () => {
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
  };

  // Filter search for cameras
  const filteredBuildings = dataSimpang.filter((buildings) =>
    buildings.name.toLowerCase().includes(inputValue.toLowerCase())
  );

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
      const response = await calendar.uploadFile(file, mode);
      setStatus(`Sukses upload: ${response.data.processsed} data`);
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
  useEffect(() => {
    console.log("Updated kalenderForm:", kalenderForm);
  }, [kalenderForm]);

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
  return (
    <div className='w-[95%] py-10 mx-auto'>
      <Suspense fallback={<div className="text-center font-medium m-auto w-full">Loading Data...</div>}>
        {/* Add Camera Dialog */}
        {showDialog && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-md shadow-md w-[300px]">
              <h2 className="text-lg font-semibold mb-4">Tambah Kamera</h2>
              <div className="mb-4">
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Nama kamera (kosong boleh)"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button className="btn btn-sm" onClick={closeDialog}>Batal</button>
                <button className="btn btn-sm btn-primary" onClick={closeDialog}>Simpan</button>
              </div>
            </div>
          </div>
        )}
        {showDialogKalender && (
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
                    updateCalendar({
                      id: kalenderForm.id,
                      tanggal: kalenderForm.date,
                      events: kalenderForm.event_type,
                      deskripsi: kalenderForm.description
                    })
                  } else {
                    // Kirim ke API
                    await createCalendar({
                      tanggal: kalenderForm.date,
                      events: kalenderForm.event_type,
                      deskripsi: kalenderForm.description
                    });
                  }

                  // Tutup dialog dan reset form
                  setShowDialogKalender(false);
                  setStatusDialogKalender(false)
                  setKalenderForm({ id: 0, date: "", event_type: "", description: "" });

                  // Refresh data kalender
                  fetchCalendar(currentPage, itemsPerPage);
                  fetchCalendarTotal();
                }}>
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Main Content Grid */}
        <div className={`grid ${fullSize ? 'grid-cols-1' : 'xl:grid-cols-3 grid-cols-1'} h-fit gap-4`}>
          {/* Camera Management Section */}
          <div className={`w-full ${fullSize ? 'col-span-1' : 'xl:col-span-2'} bg-[#314385]/10 rounded-xl p-4 h-full flex flex-col gap-5`}>
            <h3 className='text-lg font-medium mb-2'>Select Layout</h3>
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
              <CameraPosition layout={layout} streamData={streamData} />
            </div>

            <CameraActive
              onOptionChange={handleCameraSelect}
              inputSearch={changeInputSearch}
              searchValue={inputValue}
              addNewCamera={handleAddNewCamera}
            >
              <div className="h-[40vh] overflow-y-auto my-5">
                {optionCamera === "peta" ? (
                  <MapComponent onClick={handleClickCamera} sizeHeight={"35vh"} />
                ) : optionCamera === "daftar" ? (
                  <div className="overflow-x-auto w-full bg-base-200 mt-5">
                    <table className="table">
                      <thead className="bg-stone-900/90 text-white">
                        <tr className="text-center">
                          <th rowSpan={2}>No</th>
                          <th rowSpan={2}>Kamera</th>
                          <th rowSpan={2}>Tautan</th>
                          <th colSpan={2}>Koordinat</th>
                          <th rowSpan={2}>Resolusi</th>
                          <th rowSpan={2}>Frame Rate</th>
                          <th rowSpan={2}>Model Deteksi</th>
                          <th rowSpan={2}>Action</th>
                        </tr>
                        <tr>
                          <td>Latitude</td>
                          <td>Longitude</td>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBuildings?.map((dataSimpang, i) => (
                          <tr key={i} className="text-medium font-normal text-center">
                            <td>{i + 1}</td>
                            <td>{dataSimpang.name}</td>
                            <td>-</td>
                            <td>{dataSimpang.location.latitude}</td>
                            <td>{dataSimpang.location.longitude}</td>
                            <td>-</td>
                            <td>-</td>
                            <td>
                              <input
                                type="checkbox"
                                className={`toggle ${dataSimpang.model_detection ? 'checked:toggle-success' : 'toggle-error'} toggle-sm`}
                                checked={dataSimpang.model_detection}
                                onChange={(e) => handleToggle(i, e.target.checked)}
                              />
                            </td>
                            <td>
                              <div className="flex gap-2 justify-center">
                                <button className="p-1 hover:bg-transparent focus:outline-none cursor-pointer">
                                  <FaRegEye className="text-yellow-300 text-lg" />
                                </button>
                                <button className="p-1 hover:bg-transparent focus:outline-none cursor-pointer">
                                  <FaPencil className="text-green-300 text-lg" />
                                </button>
                                <button className="p-1 hover:bg-transparent focus:outline-none cursor-pointer">
                                  <FaTrashCan className="text-red-300 text-lg" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5 w-full">
                    {filteredBuildings?.map((dataCamera, index) => (
                      <div className="w-full" key={index}>
                        <CCTVStream
                          heightCamera
                          customLarge={'h-[90px]'}
                          data={streamData[dataCamera.camera.id] ? streamData[dataCamera.camera.id] : null}
                          title={dataCamera.name || `CCTV Camera ${index + 1}`}
                          onClick={() => handleClickCamera(dataCamera)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CameraActive>
          </div>

          {/* Recent Vehicle Section */}
          {!fullSize && (
            <RecentVehicle customCSS={'h-[500px] xl:h-[1000px] max-h-full'} />
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
            <table className="table">
              <thead className="bg-stone-900/90 text-white">
                <tr className="text-center">
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
                <span className="text-sm">Tampilkan:</span>
                <select
                  className="select select-sm select-bordered"
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <span className="text-sm">data per halaman</span>
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

              <div className="text-sm text-gray-600">
                Halaman {currentPage} dari {totalPages}
                {totalItems > 0 && ` (${totalItems} total data)`}
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
};

export default ManajemenKamera;
