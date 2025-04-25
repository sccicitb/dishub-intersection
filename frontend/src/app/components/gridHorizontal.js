// "use client"
// import React from 'react';

// export default function GridHorizontal({position}) {
//   return (
//       <div className="h-48 justify-evenly flex flex-col bg-gray-200 ">
//         {/* Row 1 */}
//         <div className={`flex items-center ${!position ? ' flex-row-reverse ': ' flex-row ' }`}>
//           <div className="grid grid-cols-4 flex-grow">
//             {Array(4).fill().map((_, index) => (
//               <div key={index} className="p-3 text-center font-mono">
//                 ####
//               </div>
//             ))}
//           </div>
//           <div className="px-4">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
//             </svg>
//           </div>
//         </div>
        
//         {/* Row 2 */}
//         <div className={`flex items-center ${!position ? ' flex-row-reverse ': ' flex-row ' }`}>
//           <div className="grid grid-cols-4 flex-grow">
//             {Array(4).fill().map((_, index) => (
//               <div key={index} className="px-4 py-2 text-center font-mono">
//                 ####
//               </div>
//             ))}
//           </div>
//           <div className="px-4">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//             </svg>
//           </div>
//         </div>
        
//         {/* Row 3 */}
//         <div className={`flex items-center ${!position ? ' flex-row-reverse ': ' flex-row ' }`}>
//           <div className="grid grid-cols-4 flex-grow">
//             {Array(4).fill().map((_, index) => (
//               <div key={index} className="px-4 py-2 text-center font-mono">
//                 ####
//               </div>
//             ))}
//           </div>
//           <div className="px-4">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//             </svg>
//           </div>
//         </div>
//     </div>
//   );
// }

"use client"
import React, { useState, useEffect } from 'react';

// Data sampel untuk setiap baris
const sampleData = {
  row1: [
    { id: 'r1-1', content: "Data 1" },
    { id: 'r1-2', content: "Data 2" },
    { id: 'r1-3', content: "Data 3" },
    { id: 'r1-4', content: "Data 4" }
  ],
  row2: [
    { id: 'r2-1', content: "Info A" },
    { id: 'r2-2', content: "Info B" },
    { id: 'r2-3', content: "Info C" },
    { id: 'r2-4', content: "Info D" }
  ],
  row3: [
    { id: 'r3-1', content: "Item W" },
    { id: 'r3-2', content: "Item X" },
    { id: 'r3-3', content: "Item Y" },
    { id: 'r3-4', content: "Item Z" }
  ]
};

export default function GridHorizontal({ position, jsonData = sampleData }) {
  // State untuk menyimpan data yang akan ditampilkan
  const [displayData, setDisplayData] = useState({
    row1: [],
    row2: [],
    row3: []
  });
  
  const itemsPerPage = 4;
  
  // Menyiapkan data yang akan ditampilkan
  useEffect(() => {
    const prepareRowData = (data) => {
      const rowData = data ? data.slice(0, itemsPerPage) : [];
      
      // Jika data tidak cukup, tambahkan item kosong
      if (rowData.length < itemsPerPage) {
        const emptyItems = Array(itemsPerPage - rowData.length).fill().map((_, i) => ({
          id: `empty-${i}`,
          content: "---"
        }));
        return [...rowData, ...emptyItems];
      }
      
      return rowData;
    };

    setDisplayData({
      row1: prepareRowData(jsonData.row1),
      row2: prepareRowData(jsonData.row2),
      row3: prepareRowData(jsonData.row3)
    });
  }, [jsonData]);

  return (
    <div className="h-48 justify-evenly flex flex-col bg-gray-100">
      {/* Row 1 - Up Arrow */}
      <div className={`flex items-center ${!position ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="grid grid-cols-4 flex-grow">
          {displayData.row1.map((item) => (
            <div key={item.id} className="p-3 text-center text-sm overflow-hidden">
              {item.content}
            </div>
          ))}
        </div>
        <div className="px-4">
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Row 2 - Right Arrow */}
      <div className={`flex items-center ${!position ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="grid grid-cols-4 flex-grow">
          {displayData.row2.map((item) => (
            <div key={item.id} className="px-4 py-2 text-center text-sm overflow-hidden">
              {item.content}
            </div>
          ))}
        </div>
        <div className="px-4">
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Row 3 - Down Arrow */}
      <div className={`flex items-center ${!position ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="grid grid-cols-4 flex-grow">
          {displayData.row3.map((item) => (
            <div key={item.id} className="px-4 py-2 text-center text-sm overflow-hidden">
              {item.content}
            </div>
          ))}
        </div>
        <div className="px-4">
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}