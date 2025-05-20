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

// "use client"
// import React, { useState, useEffect } from 'react';
// import { IoIosArrowUp, IoIosArrowDown, IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

// Data sampel untuk setiap baris
// const sampleData = {
//   row1: [
//     { id: 'r1-1', content: "Data 1" },
//     { id: 'r1-2', content: "Data 2" },
//     { id: 'r1-3', content: "Data 3" },
//     { id: 'r1-4', content: "Data 4" }
//   ],
//   row2: [
//     { id: 'r2-1', content: "Info A" },
//     { id: 'r2-2', content: "Info B" },
//     { id: 'r2-3', content: "Info C" },
//     { id: 'r2-4', content: "Info D" }
//   ],
//   row3: [
//     { id: 'r3-1', content: "Item W" },
//     { id: 'r3-2', content: "Item X" },
//     { id: 'r3-3', content: "Item Y" },
//     { id: 'r3-4', content: "Item Z" }
//   ]
// };

// export default function GridHorizontal({ position, jsonData = sampleData }) {
//   // State untuk menyimpan data yang akan ditampilkan
//   const [displayData, setDisplayData] = useState({
//     row1: [],
//     row2: [],
//     row3: []
//   });

//   const itemsPerPage = 4;

//   // Menyiapkan data yang akan ditampilkan
//   useEffect(() => {
//     const prepareRowData = (data) => {
//       const rowData = data ? data.slice(0, itemsPerPage) : [];

//       // Jika data tidak cukup, tambahkan item kosong
//       if (rowData.length < itemsPerPage) {
//         const emptyItems = Array(itemsPerPage - rowData.length).fill().map((_, i) => ({
//           id: `empty-${i}`,
//           content: "---"
//         }));
//         return [...rowData, ...emptyItems];
//       }

//       return rowData;
//     };

//     setDisplayData({
//       row1: prepareRowData(jsonData.row1),
//       row2: prepareRowData(jsonData.row2),
//       row3: prepareRowData(jsonData.row3)
//     });
//   }, [jsonData]);

//   return (
//     <div className="h-34 w-52 justify-evenly flex flex-col bg-stone-300 text-xs">
//       {/* Row 1 - Up Arrow */}
//       {/* position true for above false for top */}
//       <div className={`flex items-center ${!position ? 'flex-row-reverse' : 'flex-row'}`}>
//         <div className="grid grid-cols-4 flex-grow">
//           {displayData.row1.map((item) => (
//             <div key={item.id} className="p-2 text-center text-xs overflow-hidden truncate">
//               {item.content}
//             </div>
//           ))}
//         </div>
//         <div className="p-1">
//           <IoIosArrowUp className="text-lg" />
//         </div>
//       </div>

//       {/* Row 2 - Right Arrow */}
//       <div className={`items-center flex ${!position ? 'flex-row-reverse' : 'flex-row'}`}>
//         <div className="grid grid-cols-4 flex-grow">
//           {displayData.row2.map((item) => (
//             <div key={item.id} className="p-2 text-center text-xs overflow-hidden truncate">
//               {item.content}
//             </div>
//           ))}
//         </div>
//         <div className={`p-1 items-center flex ${!position ? ' transform rotate-180 ' : '  '}`}>
//           <IoIosArrowForward className="text-lg"/>
//         </div>
//       </div>

//       {/* Row 3 - Down Arrow */}
//       <div className={`items-center flex ${!position ? 'flex-row-reverse' : 'flex-row'}`}>
//         <div className="grid grid-cols-4 flex-grow">
//           {displayData.row3.map((item) => (
//             <div key={item.id} className="px-4 py-2 text-center text-xs overflow-hidden truncate">
//               {item.content}
//             </div>
//           ))}
//         </div>
//         <div className="p-1 items-center">
//             <IoIosArrowDown className="text-lg"/>
//           </div>
//       </div>
//     </div>
//   );
// }


"use client"
import React, { useState, useEffect } from 'react';
import { HiMiniArrowTurnRightUp, HiMiniArrowTurnRightDown, HiArrowLongRight  } from "react-icons/hi2";

// GridHorizontal Component for East-West routes
const GridHorizontal = ({ position, data }) => {
  const [displayData, setDisplayData] = useState({
    row1: [],
    row2: [],
    row3: []
  });

  const itemsPerPage = 4;
  const typeVehicle = {
    type: ["sm", "mp", "ks", "ktb"]
  };
  useEffect(() => {
    const prepareRowData = (rowData) => {
      const processedData = rowData ? rowData.slice(0, itemsPerPage) : [];

      if (processedData.length < itemsPerPage) {
        const emptyItems = Array(itemsPerPage - processedData.length).fill().map((_, i) => ({
          id: `empty-${i}`,
          content: "---"
        }));
        return [...processedData, ...emptyItems];
      }

      return processedData;
    };

    setDisplayData({
      row1: prepareRowData(data?.row1 || []),
      row2: prepareRowData(data?.row2 || []),
      row3: prepareRowData(data?.row3 || [])
    });
  }, [data]);

  return (
    <div className="h-34 w-40 justify-evenly flex flex-col bg-stone-300 text-xs relative">
      {/* Row 1 - Up Arrow */}
      <div className={`flex items-center ${!position ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="grid grid-cols-4 flex-grow">
          {displayData.row1.map((item) => (
            <div key={item.id} className="p-2 text-center text-xs overflow-hidden truncate">
              {item.content}
            </div>
          ))}
        </div>
        <div className="p-1">
          <HiMiniArrowTurnRightUp className={`text-lg ${!position ? 'transform rotate-180 scale-y-[-1]': ''}`} />
        </div>
      </div>

      {/* Row 2 - Right Arrow */}
      <div className={`items-center flex ${!position ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="grid grid-cols-4 flex-grow">
          {displayData.row2.map((item) => (
            <div key={item.id} className="p-2 text-center text-xs overflow-hidden truncate">
              {item.content}
            </div>
          ))}
        </div>
        <div className={`p-1 items-center flex ${!position ? 'transform rotate-180' : ''}`}>
          <HiArrowLongRight className="text-lg" />
        </div>
      </div>

      {/* Row 3 - Down Arrow */}
      <div className={`items-center flex ${!position ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="grid grid-cols-4 flex-grow">
          {displayData.row3.map((item) => (
            <div key={item.id} className="p-2 text-center text-xs overflow-hidden truncate">
              {item.content}
            </div>
          ))}
        </div>
        <div className="p-1 items-center">
          <HiMiniArrowTurnRightDown className={`text-lg ${!position ? 'transform rotate-180 scale-y-[-1]': ''}`} />
        </div>
      </div>
      {typeVehicle.type.map((item, index) => (
        <div
          key={index}
          className={`absolute -top-5 uppercase ${position ? 'mr-8' : 'ml-8'}`}
          style={{
            [!position ? 'left' : 'right']: `${index * 30}px`
          }}
        >
          {item}
        </div>
      ))}
      <div className={`absolute -bottom-10 text-right uppercase ${position ? 'ml-8' : 'ml-10'}`}>
        Jl. ({position ? "T" : "B"})
      </div>
    </div>
  );
}

export default GridHorizontal;