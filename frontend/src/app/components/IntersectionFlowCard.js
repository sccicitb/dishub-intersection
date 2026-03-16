import { useEffect, useState } from 'react';
import { intersection } from '@/lib/apiAccess';

const IntersectionFlowCard = ({ simpangId, activeFilter, startDate, endDate }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalVolume, setTotalVolume] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!simpangId) return;

      setLoading(true);
      try {
        const response = await intersection.getFlowByDirection(simpangId, activeFilter, startDate, endDate);
        // Check for valid response structure (Axios response)
        if (response?.status === 200 && response?.data?.status === 'success') {
          setData(response.data.data);

          // Calculate total intersection volume
          const total = response.data.data.reduce((acc, curr) => acc + (parseInt(curr.total_IN) || 0) + (parseInt(curr.total_OUT) || 0), 0);
          setTotalVolume(total);
        }
      } catch (error) {
        console.error("Error fetching intersection flow data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [simpangId, activeFilter, startDate, endDate]);

  if (!simpangId) return null;

  return (
    <div className="bg-base-200/90 p-4 lg:gap-2 rounded-3xl backdrop-blur-sm shadow-gray-200">
      <div className="w-full flex flex-col p-6 rounded-2xl bg-white shadow-sm border border-gray-100 gap-6">
        <div className="flex justify-between items-center align-baseline">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Arus Lalu Lintas per Arah Simpang</h3>
            <h4 className="text-md font-bold text-gray-700">Keluar Masuk Simpang</h4>
          </div>
          <span className="text-md px-3 py-1 bg-blue-50 text-[#232f61] rounded-full font-semibold">
            Total Kendaraan: {totalVolume.toLocaleString('id-ID')}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className="loading loading-spinner loading-md text-primary"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.map((item, index) => {
              const inVal = parseInt(item.total_IN);
              const outVal = parseInt(item.total_OUT);
              const subTotal = inVal + outVal;
              // Avoid division by zero
              const inPercent = subTotal > 0 ? (inVal / subTotal) * 100 : 0;
              const outPercent = subTotal > 0 ? (outVal / subTotal) * 100 : 0;

              const contribution = totalVolume > 0 ? ((subTotal / totalVolume) * 100).toFixed(1) : 0;

              return (
                <div key={index} className="flex flex-col p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                  {/* Decorative background circle */}
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-100 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="flex justify-between items-center mb-4 z-10">
                    <div className="font-bold text-lg text-gray-800 uppercase tracking-wide">{item.arah}</div>
                    <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {contribution}% Load
                    </div>
                  </div>

                  {/* Visualization Bar */}
                  <div className="w-full h-3 flex rounded-full overflow-hidden mb-5 bg-gray-200 shadow-inner z-10">
                    <div
                      style={{ width: `${inPercent}%` }}
                      className="h-full bg-[#4ADE80]"
                      title={`Masuk: ${inPercent.toFixed(1)}%`}
                    ></div>
                    <div
                      style={{ width: `${outPercent}%` }}
                      className="h-full bg-[#BF3D3D]"
                      title={`Keluar: ${outPercent.toFixed(1)}%`}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 z-10">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Masuk (IN)</span>
                      <span className="text-xl font-extrabold text-[#4ADE80]">{Number(inVal).toLocaleString('id-ID')}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{inPercent.toFixed(0)}%</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Keluar (OUT)</span>
                      <span className="text-xl font-extrabold text-[#BF3D3D]">{Number(outVal).toLocaleString('id-ID')}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{outPercent.toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Subtotal footer */}
                  <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center z-10">
                    <span className="text-xs text-gray-400 font-medium">Total Kendaraan</span>
                    <span className="text-sm font-bold text-gray-600">{subTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default IntersectionFlowCard;
