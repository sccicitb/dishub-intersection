'use client';

const TableMatrix = ({ 
  categories, 
  asalTujuan, 
  arahPergerakan, 
  loading = false, 
  error = null
}) => {
  if (loading) return (
    <div className="w-full flex items-center justify-center min-h-[160px]">
      <p className="text-sm text-slate-400 italic">Memuat data matriks...</p>
    </div>
  );

  if (error) return (
    <div className="w-full rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>
  );

  const hasData = asalTujuan && Object.keys(asalTujuan).length > 0 && arahPergerakan && Object.keys(arahPergerakan).length > 0;

  if (!hasData) return (
    <div className="w-full rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-600 italic">
      Tidak ada data matriks yang tersedia.
    </div>
  );

  const thBase = "px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide border border-slate-200 whitespace-nowrap";
  const tdBase = "px-2 py-1 text-sm border border-slate-100 text-center";

  return (
    <div className="flex flex-col gap-5 w-full">

      {/* Asal-Tujuan */}
      <div className="w-full">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#232f61]" />
          <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">Matriks Asal – Tujuan</p>
          <span className="text-[10px] text-slate-400 font-medium">(kendaraan)</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-[#232f61] text-white">
                <th className={`${thBase} text-left text-white border-[#1a2347]`}>dari ↘ ke</th>
                {categories.map((c) => (
                  <th key={c} className={`${thBase} text-white border-[#1a2347] capitalize`}>{c}</th>
                ))}
                <th className={`${thBase} text-white border-[#1a2347]`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(asalTujuan).map((from, idx) => (
                <tr key={from} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className={`${tdBase} text-left font-semibold text-slate-700 capitalize bg-slate-50`}>{from}</td>
                  {categories.map((to) => (
                    <td key={to} className={tdBase}>
                      {asalTujuan[from][to]
                        ? <span className="inline-block bg-blue-50 text-[#232f61] font-semibold px-1.5 py-0.5 rounded text-[11px]">
                            {Number(asalTujuan[from][to]).toLocaleString('id-ID')}
                          </span>
                        : <span className="text-slate-300">–</span>}
                    </td>
                  ))}
                  <td className={tdBase}>
                    {asalTujuan[from]['Total']
                      ? <span className="inline-block bg-[#232f61] text-white font-bold px-1.5 py-0.5 rounded text-[11px]">
                          {Number(asalTujuan[from]['Total']).toLocaleString('id-ID')}
                        </span>
                      : <span className="text-slate-300">–</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Arah Pergerakan */}
      <div className="w-full">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#4ADE80]" />
          <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">Matriks Arah Pergerakan</p>
          <span className="text-[10px] text-slate-400 font-medium">(kendaraan)</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-emerald-700 text-white">
                <th className={`${thBase} text-left text-white border-emerald-800`}>arah pergerakan</th>
                {categories.map((c) => (
                  <th key={c} className={`${thBase} text-white border-emerald-800 capitalize`}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(arahPergerakan).map((arah, idx) => (
                <tr key={arah} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className={`${tdBase} text-left font-semibold text-slate-700 capitalize bg-slate-50`}>{arah}</td>
                  {categories.map((to) => (
                    <td key={to} className={tdBase}>
                      {arahPergerakan[arah][to]
                        ? <span className="inline-block bg-green-50 text-emerald-800 font-semibold px-1.5 py-0.5 rounded text-[11px]">
                            {Number(arahPergerakan[arah][to]).toLocaleString('id-ID')}
                          </span>
                        : <span className="text-slate-300">–</span>}
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

