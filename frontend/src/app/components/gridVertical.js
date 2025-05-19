// "use client"
// import React from 'react';

// export default function GridBottom({position}) {
//   return (
//     <div className={`flex bg-gray-200 mx-auto w-56 ${!position ? ' flex-col-reverse ' : ' flex-col '}`}>   
//         {/* Grid of hash symbols */}
//         <div className="grid grid-cols-3">
//           {Array(12).fill().map((_, index) => (
//             <div key={index} className="bg-gray-100 py-5 text-center font-mono">
//               ####
//             </div>
//           ))}
//         </div>

//         {/* Navigation arrows */}
//         <div className="flex justify-evenly">
//           {/* Left arrow */}
//           <button className="p-2">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//             </svg>
//           </button>

//           {/* Down arrow */}
//           <button className="p-2">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//             </svg>
//           </button>

//           {/* Right arrow */}
//           <button className="p-2">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//             </svg>
//           </button>
//         </div>
//       </div>
//   );
// }

"use client"
import React, { useState, useEffect } from 'react';
import { IoIosArrowUp, IoIosArrowDown, IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { HiMiniArrowTurnUpLeft, HiOutlineArrowTurnUpRight, HiMiniArrowLongUp  } from "react-icons/hi2";
// // Contoh data JSON
// const sampleData = [
//   { id: 1, content: "Item 1" },
//   { id: 2, content: "Item 2" },
//   { id: 3, content: "Item 3" },
//   { id: 4, content: "Data 4" },
//   { id: 5, content: "Data 5" },
//   { id: 6, content: "Data 6" },
//   { id: 7, content: "Info 7" },
//   { id: 8, content: "Info 8" },
//   { id: 9, content: "Info 9" },
//   { id: 10, content: "Text 10" },
//   { id: 11, content: "Text 11" },
//   { id: 12, content: "Text 12" }
// ];


// export default function GridVertical({ position, jsonData = sampleData }) {
//   const [currentData, setCurrentData] = useState([]);
//   const itemsPerPage = 12;

//   // Hanya mengambil 12 item pertama dari data
//   useEffect(() => {
//     const displayData = jsonData.slice(0, itemsPerPage);

//     // Jika data kurang dari 12, tambahkan item kosong
//     if (displayData.length < itemsPerPage) {
//       const emptyItems = Array(itemsPerPage - displayData.length).fill().map((_, i) => ({
//         id: `empty-${i}`,
//         content: "---"
//       }));
//       setCurrentData([...displayData, ...emptyItems]);
//     } else {
//       setCurrentData(displayData);
//     }
//   }, [jsonData]);

//   return (
//     <div className={`flex bg-stone-300 mx-auto w-38 ${!position ? 'flex-col-reverse' : 'flex-col'}`}>   
//       {/* Grid dengan data dinamis */}
//       <div className="grid grid-cols-3">
//         {currentData.map((item) => (
//           <div key={item.id} className="p-3 text-center overflow-hidden text-xs truncate">
//             {item.content}
//           </div>
//         ))}
//       </div>

//       {/* Navigation arrows (tidak berfungsi, hanya tampilan) */}
//       <div className={`justify-evenly items-center flex ${!position ? ' transform rotate-180 ' : '  '}`}>
//       {/* Left arrow */}
//        <IoIosArrowBack className="text-lg"/>

//         {/* Middle arrow */}
//        <IoIosArrowDown className="text-lg"/>

//         {/* Right arrow */}
//        <IoIosArrowForward className="text-lg"/>
//       </div>
//     </div>
//   );
// }

const GridVertical = ({ position, data }) => {
  const [displayData, setDisplayData] = useState({
    row1: [],
    row2: [],
    row3: []
  });

  const itemsPerPage = 4;

  useEffect(() => {
    const prepareColumnData = (colData) => {
      const processedData = colData ? colData.slice(0, itemsPerPage) : [];

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
      row1: prepareColumnData(data?.row1 || []),
      row2: prepareColumnData(data?.row2 || []),
      row3: prepareColumnData(data?.row3 || [])
    });
  }, [data]);

  const typeVehicle = {
    type: ["sm", "mp", "ks", "ktb"]
  };
  return (
    <div className="flex w-40 h-fit bg-stone-300 justify-evenly items-center text-xs relative">
      {/* Row 1 - Arrow Up */}
      <div className={`flex ${!position ? "flex-col-reverse" : "flex-col"} items-center`}>
        <div className="grid grid-rows-4">
          {displayData.row1.map((item) => (
            <div key={item.id} className="p-2 text-center truncate">
              {item.content}
            </div>
          ))}
        </div>
        <HiMiniArrowTurnUpLeft className={`text-xl m-auto p-0.5 ${position ? 'tranform rotate-180 scale-x-[-1] ': '' }`} />
      </div>

      {/* Row 2 - Arrow Back */}
      <div className={`flex ${!position ? "flex-col-reverse" : "flex-col"} items-center`}>
        <div className="grid grid-rows-4">
          {displayData.row2.map((item) => (
            <div key={item.id} className="p-2 text-center truncate">
              {item.content}
            </div>
          ))}
        </div>
        <HiMiniArrowLongUp className={`text-xl m-auto p-0.5 ${position ? 'transform rotate-180' : ''}`} />
      </div>

      {/* Row 3 - Arrow Down */}
      <div className={`flex ${!position ? "flex-col-reverse" : "flex-col"} items-center`}>
        <div className="grid grid-rows-4">
          {displayData.row3.map((item) => (
            <div key={item.id} className="p-2 text-center truncate">
              {item.content}
            </div>
          ))}
        </div>
        <HiOutlineArrowTurnUpRight className={`text-xl m-auto p-0.5 ${position ? ' transform scale-x-[-1] rotate-180' : ''}`} />
      </div>
      {typeVehicle.type.map((item, index) => (
        <div
          key={index}
          className={`absolute -left-8 uppercase ${position ? 'mb-8' : 'mt-8'}`}
          style={{
            [!position ? 'top' : 'bottom']: `${index * 30}px`
          }}
        >
          {item}
        </div>
      ))}
      <div className={`absolute -right-15 uppercase ${position ? 'mb-8' : 'mt-8'}`}>
        Jl. ({position ? "U" : "S"})
      </div>
    </div>
  );
};

export default GridVertical;
