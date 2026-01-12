'use client';

import GridHorizontalV2 from './gridHorizontalV2';
import GridVerticalV2 from './gridVerticalV2';

const SimpangVisualization = ({ data }) => {
  if (!data || !data.arahPergerakan) {
    return <div>Data tidak tersedia</div>;
  }

  const getMovementData = (direction) => {
    return {
      row1: [
        { id: 'bk', content: data.arahPergerakan['Belok Kiri']?.[direction]?.Total || 0 }
      ],
      row2: [
        { id: 'lurus', content: data.arahPergerakan['Lurus']?.[direction]?.Total || 0 }
      ],
      row3: [
        { id: 'bkanan', content: data.arahPergerakan['Belok Kanan']?.[direction]?.Total || 0 }
      ]
    };
  };

  return (
    <div className="flex items-center justify-center p-8 bg-white rounded-lg shadow w-full">
      <div className="relative flex flex-col items-center gap-6" style={{ minWidth: '600px' }}>

        {/* Top - Utara */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-gray-600 mb-2">UTARA</span>
          <GridVerticalV2 data={getMovementData('utara')} position={true} />
        </div>

        {/* Middle Row - Barat and Timur */}
        <div className="flex justify-center items-center gap-6">
          {/* Left - Barat */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-gray-600 mb-1">BARAT</span>
            <GridHorizontalV2 data={getMovementData('barat')} position={true} />
          </div>

          {/* Center - Simpang */}
          <div className="h-25 w-25 bg-purple-100 border-4 mx-5 border-purple-800/90 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-gray-700 text-sm text-center">SIMPANG</span>
          </div>

          {/* Right - Timur */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-gray-600 mb-1">TIMUR</span>
            <GridHorizontalV2 data={getMovementData('timur')} position={false} />
          </div>
        </div>

        {/* Bottom - Selatan */}
        <div className="flex flex-col items-center">
          <GridVerticalV2 data={getMovementData('selatan')} position={false} />
          <span className="text-xs font-bold text-gray-600 mt-2">SELATAN</span>
        </div>

      </div>
    </div>
  );
};

export default SimpangVisualization;
