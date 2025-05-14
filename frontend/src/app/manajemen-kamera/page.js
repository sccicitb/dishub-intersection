"use client";

import { io } from 'socket.io-client'
import { useState, useEffect, lazy, Suspense } from 'react'
import CCTVStream from '../components/cctvStream';

const RecentVehicle = lazy(() => import('../components/recentVehicle'));
const MapComponent = lazy(() => import('../components/map'));

export const CameraCard = ({ C = '' }) => {
  const isFullWidth = C.includes('col-span-2');
  return (
    <div className={`rounded-md bg-[#314385]/80 min-h-[40px] ${isFullWidth ? 'w-full' : 'w-[80px]'} ${C}`}>
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

export const CameraPosition = ({ layout }) => {
  const [socketConnected, setSocketConnected] = useState(false);
  const [streamData, setStreamData] = useState({
    detection3: null,
    detection4: null,
    detection5: null,
    detection1: null
  });

  useEffect(() => {
    const socket = io('https://sxe-data.layanancerdas.id');
    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));

    socket.on('result_detection_3', (data) => {
      setStreamData(prev => ({ ...prev, detection3: data }));
    });
    socket.on('result_detection', (data) => {
      setStreamData(prev => ({ ...prev, detection1: data }));
    });
    socket.on('result_detection_4', (data) => {
      setStreamData(prev => ({ ...prev, detection4: data }));
    });
    socket.on('result_detection_5', (data) => {
      setStreamData(prev => ({ ...prev, detection5: data }));
    });

    return () => socket.disconnect();
  }, []);

  const streams = [
    streamData.detection,
    streamData.detection3,
    streamData.detection4,
    streamData.detection5
  ];

  const { cols = 1, J = 2, bc = 0, rows = 0 } = layout;

  return (
    <div className={`grid ${cols ? 'grid-cols-' + cols : ''} gap-2 py-5 min-h-[800px]`}>
      {Array.from({ length: bc }).map((_, i) => (
        <div key={`bc-${i}`} className={`col-span-2 ${rows ? `row-span-${rows}` : ''}`}>
          <CCTVStream
            data={streams[i % streams.length]}
            customLarge="min-h-[470px] h-full"
            title={`CCTV Camera ${i + 1}`}
          />
        </div>
      ))}
      {Array.from({ length: J }).map((_, i) => (
        <CCTVStream
          key={`j-${i}`}
          data={streams[(i + bc) % streams.length]}
          customLarge="min-h-[470px] h-full"
          title={`CCTV Camera ${i + 1 + bc}`}
        />
      ))}
    </div>
  );
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

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
  const [activeTitle, setActiveTitle] = useState('Kamera Aktif')
  const [layout, setLayout] = useState({ cols: 2, J: 4, bc: 0, rows: 0 });
  const [fullSize, setFullSize] = useState(false);
  const isMobile = useIsMobile();
  const handleClick = (layoutData) => {
    setLayout(layoutData);
  };
  useEffect(() => {
    if (isMobile) {
      handleClick({ cols: 1, J: 4, bc: 0, rows: 0 });
      setFullSize(false);
    }
  }, [isMobile]);

  function handleClickCamera (T) {
    const replace = T.name.toLowerCase();
    console.log('clicked : ' + JSON.stringify(T));
    switch (replace) {
      case 'simpang piyungan':
        setSelectOption('detection4');
        // setActiveTitle('Simpang Piyungan');
        break;
      case 'simpang demen glagah':
        setSelectOption('detection3');
        // setActiveTitle('Simpang Demen Glagah');
        break;
      case 'simpang tempel':
        setSelectOption('detection5');
        // setActiveTitle('Simpang Tempel');
        break;
      case 'simpang prambanan':
        setSelectOption('detection1');
        // setActiveTitle('Simpang Prambanan');
        break;
    }
  }
  return (
    <div className='w-[95%] py-10 mx-auto'>
      <Suspense fallback={<div className="text-center font-medium m-auto w-full">Loading Data...</div>}>
        <div className={`grid ${fullSize ? 'grid-cols-1' : 'xl:grid-cols-3 grid-cols-1'} gap-4`}>
          <div className={`w-full ${fullSize ? 'col-span-1' : 'xl:col-span-2'} bg-[#314385]/10 rounded-xl p-4 h-fit flex flex-col gap-5`}>
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
            <div className='overflow-y-auto lg:max-h-[480px]'>
              <CameraPosition layout={layout} />
            </div>
              <MapComponent title={activeTitle} onClick={handleClickCamera} />
          </div>

          {!fullSize && (
            <div className='h-fit lg:max-h-[1130px]'>
              <RecentVehicle customCSS={'h-[500px] lg:h-[1120px] max-h-full'} />
            </div>
          )}
        </div>
        <div>
        </div>
      </Suspense>
    </div>
  );
};


export default ManajemenKamera;
