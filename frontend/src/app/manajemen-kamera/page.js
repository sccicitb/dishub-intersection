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
  const [streamData, setStreamData] = useState({
    detection1: null,
  });

    useEffect(() => {
    const fetchCameras = async () => {
      try {
        const res = await maps.getAll();
        // console.log("Hasil getAll:", res); 
        const detectedCameras = res.data.buildings;
        setDataSimpang(detectedCameras);
      } catch (err) {
        console.error("Failed to fetch cameras:", err);
      }
    };

    fetchCameras();
  }, []);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const handleToggle = (index, checked) => {
    const updated = [...dataSimpang];
    updated[index].model_detection = checked;
    setDataSimpang(updated); // ✅ Tetap array
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
 
  useEffect(() => {
  const socket = io('https://sxe-data.layanancerdas.id');

  socket.on('connect', () => setSocketConnected(true));
  socket.on('disconnect', () => setSocketConnected(false));

  return () => {
    socket.disconnect();
  };
}, []);

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


  const [inputValue, setInputValue] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dataKalender, setDataKalender] = useState([]);
  const changeInputSearch = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddNewCamera = () => {
    setShowDialog(true); // munculkan popup
  };

  const closeDialog = () => {
    setShowDialog(false);
  };

  useEffect(() => {
    console.log(inputValue)
  }, [inputValue])

  useEffect(() => {
    import("@/data/DataKalender.json").then((data) => {
      setDataKalender(data.holidays)
    })
  }, [])

  // filter search
  const filteredBuildings = dataSimpang.filter((buildings) => buildings.name.toLowerCase().includes(inputValue.toLowerCase()))
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dataKalender.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(dataKalender.length / itemsPerPage);

  return (
    <div className='w-[95%] py-10 mx-auto'>
      <Suspense fallback={<div className="text-center font-medium m-auto w-full">Loading Data...</div>}>
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
        <div className={`grid ${fullSize ? 'grid-cols-1' : 'xl:grid-cols-3 grid-cols-1'} h-fit gap-4`}>
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
            <CameraActive onOptionChange={handleCameraSelect} inputSearch={changeInputSearch}
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
                        {/* row 1 */}
                        {filteredBuildings?.map((dataSimpang, i) => {
                          return (
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
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5 w-full">
                    {filteredBuildings?.map((dataCamera, index) => {
                      return (
                        <div className="w-full" key={index}>
                          <CCTVStream
                            heightCamera
                            customLarge={'h-[90px]'}
                            data={streamData[dataCamera.camera.id] ? streamData[dataCamera.camera.id] : null}
                            title={dataCamera.name || `CCTV Camera ${index + 1}`}
                            onClick={() => handleClickCamera(dataCamera)}
                          />
                        </div>
                      )}
                    )}
                  </div>
                )}
              </div>
            </CameraActive>
          </div>
          {!fullSize && (
            <RecentVehicle customCSS={'h-[500px] xl:h-[1000px] max-h-full'} />
          )}
        </div>
        <div>
          <div className="flex gap-2 w-full justify-end mt-5">
            <button className="btn btn-md rounded-md bg-[#314385]/80 text-white capitalize"><FiDownload />Impor Data</button>
            <button className="btn btn-md rounded-md bg-[#314385]/80 text-white capitalize"><IoIosAdd className="text-xl" />Tambah Data</button>
          </div>
          <div className="overflow-x-auto w-full bg-base-200 mt-5">
            <table className="table">
              <thead className="bg-stone-900/90 text-white">
                <tr className="text-center">
                  <th rowSpan={2}>No</th>
                  <th rowSpan={2}>Tanggal</th>
                  <th rowSpan={2}>Events</th>
                  <th rowSpan={2}>Keterangan</th>
                  <th rowSpan={2}>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Display only current page items */}
                {currentItems?.map((dataK, i) => {
                  return (
                    <tr key={i} className="text-medium font-normal text-center">
                      <td>{indexOfFirstItem + i + 1}</td>
                      <td>{dataK.tanggal}</td>
                      <td>{dataK.events}</td>
                      <td>{dataK.keterangan}</td>
                      <td>
                        <div className="flex gap-2 justify-center">
                          <button className="p-1 hover:bg-transparent focus:outline-none cursor-pointer">
                            <FaPencil className="text-green-300 text-lg" />
                          </button>
                          <button className="p-1 hover:bg-transparent focus:outline-none cursor-pointer">
                            <FaTrashCan className="text-red-300 text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination Component */}
            <div className="flex justify-start m-4">
              <div className="join">
                {/* Previous button */}
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  «
                </button>

                {/* Page buttons */}
                {[...Array(totalPages).keys()].map(number => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`join-item btn btn-sm ${currentPage === number + 1 ? 'btn-active' : ''}`}
                  >
                    {number + 1}
                  </button>
                ))}

                {/* Next button */}
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  »
                </button>
              </div>
            </div>

            {/* Data info */}
            <div className="text-start text-sm text-gray-600 m-4">
              Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, dataKalender.length)} dari {dataKalender.length} data
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
};


export default ManajemenKamera;
