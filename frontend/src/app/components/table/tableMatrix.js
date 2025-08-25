'use client';
const TableMatrix = ({ categories, asalTujuan, arahPergerakan }) => (
  <div className="space-y-6 flex flex-col gap-2 w-full">
    {/* Tabel Asal-Tujuan */}
    <div className="bg-white px-8 py-5 rounded-lg w-full">
      <h2 className="font-semibold text-lg mb-2 ">
        Matriks Asal - Tujuan (kendaraan)
      </h2>
      <table className="table table-auto w-full text-center">
        <thead>
          <tr>
            <th className="p-2 bg-neutral-50">ke_arah</th>
            {categories.map((c) => (
              <th key={c} className="p-2 bg-neutral-50">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(asalTujuan).map((from) => (
            <tr key={from}>
              <td className="border border-neutral-100 p-2 font-medium">{from}</td>
              {categories.map((to) => (
                <td key={to} className="border border-neutral-100 p-2">
                  {asalTujuan[from][to] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Tabel Arah Pergerakan */}
    <div className="bg-white px-8 py-5 rounded-lg">
      <h2 className="font-semibold text-lg mb-2">
        Matriks Arah Pergerakan (kendaraan)
      </h2>
      <table className="table table-auto w-full text-center">
        <thead>
          <tr>
            <th className="p-2 bg-neutral-50">arah_pergerakan</th>
            {categories.map((c) => (
              <th key={c} className="p-2 bg-neutral-50">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(arahPergerakan).map((arah) => (
            <tr key={arah}>
              <td className="p-2 font-medium border border-neutral-100">{arah}</td>
              {categories.map((to) => (
                <td key={to} className="p-2 border border-neutral-100">
                  {arahPergerakan[arah][to] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default TableMatrix;