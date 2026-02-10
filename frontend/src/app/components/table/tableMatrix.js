'use client';

const TableMatrix = ({ 
  categories, 
  asalTujuan, 
  arahPergerakan, 
  loading = false, 
  error = null
}) => {
  const renderLoadingState = () => (
    <div className="bg-white px-8 py-5 rounded-lg w-full flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-gray-800 border-blue-500"></div>
        <p className="text-sm text-gray-500">Memuat data matriks...</p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-red-50 px-8 py-5 rounded-lg w-full border border-gray-800">
      <div className="flex items-center gap-2">
        <span className="text-red-500 font-semibold">Error:</span>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="bg-yellow-50 px-8 py-5 rounded-lg w-full border border-gray-800">
      <p className="text-sm text-yellow-700">Tidak ada data matriks yang tersedia.</p>
    </div>
  );

  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  const hasData = asalTujuan && Object.keys(asalTujuan).length > 0 && arahPergerakan && Object.keys(arahPergerakan).length > 0;

  if (!hasData) {
    return renderEmptyState();
  }

  return (
    <div className="space-y-6 flex flex-col gap-5 w-full p-5">
      
      {/* Tabel Asal-Tujuan */}
      <div className="w-full">
        <h3 className="font-semibold text-base mb-3 text-gray-700 flex items-center gap-2">
          <span className="text-lg"></span> Matriks Asal - Tujuan (kendaraan)
        </h3>
        <div className="overflow-x-auto ">
          <table className="table table-auto w-full text-center text-sm my-2">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50
              to-blue-100 ">
                <th className="p-3 border border-gray-800 font-semibold text-gray-700 text-left">dari  ke</th>
                {categories.map((c) => (
                  <th key={c} className="p-3 font-semibold text-gray-700 capitalize border border-gray-800">{c}</th>
                ))}
                <th className="p-3 font-semibold text-gray-700 border border-gray-800">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(asalTujuan).map((from, idx) => (
                <tr key={from} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-800 p-3 font-semibold text-gray-700 text-left capitalize">{from}</td>
                  {categories.map((to) => (
                    <td key={to} className="border border-gray-800 p-3 text-gray-600">
                      <span className="inline-block bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium">
                        {asalTujuan[from][to] ? Number(asalTujuan[from][to]).toLocaleString('id-ID') : '-'}
                      </span>
                    </td>
                  ))}
                  <td className="border border-gray-800 p-3 text-gray-600">
                    <span className="inline-block bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium">
                      {asalTujuan[from]['Total'] ? Number(asalTujuan[from]['Total']).toLocaleString('id-ID') : '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabel Arah Pergerakan */}
      <div className="w-full">
        <h3 className="font-semibold text-base mb-3 text-gray-700 flex items-center gap-2">
          <span className="text-lg"></span> Matriks Arah Pergerakan (kendaraan)
        </h3>
        <div className="overflow-x-auto">
          <table className="table table-auto w-full text-center text-sm">
            <thead>
              <tr className="bg-gradient-to-r border from-green-50 to-green-100 border-gray-800">
                <th className="p-3 border border-gray-800 font-semibold text-gray-700 text-left">arah pergerakan</th>
                {categories.map((c) => (
                  <th key={c} className="p-3 border border-gray-800 font-semibold text-gray-700 capitalize">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(arahPergerakan).map((arah, idx) => (
                <tr key={arah} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'+ ' border border-gray-800'}>
                  <td className="border border-gray-800 p-3 font-semibold text-gray-700 text-left capitalize">{arah}</td>
                  {categories.map((to) => (
                    <td key={to} className="border border-gray-800 p-3 text-gray-600">
                      <span className="inline-block bg-green-100 px-2 py-1 rounded text-green-800 font-medium">
                        {arahPergerakan[arah][to] ? Number(arahPergerakan[arah][to]).toLocaleString('id-ID') : '-'}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableMatrix;
