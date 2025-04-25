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

// Contoh data JSON
const sampleData = [
  { id: 1, content: "Item 1" },
  { id: 2, content: "Item 2" },
  { id: 3, content: "Item 3" },
  { id: 4, content: "Data 4" },
  { id: 5, content: "Data 5" },
  { id: 6, content: "Data 6" },
  { id: 7, content: "Info 7" },
  { id: 8, content: "Info 8" },
  { id: 9, content: "Info 9" },
  { id: 10, content: "Text 10" },
  { id: 11, content: "Text 11" },
  { id: 12, content: "Text 12" }
];

export default function GridVertical({ position, jsonData = sampleData }) {
  const [currentData, setCurrentData] = useState([]);
  const itemsPerPage = 12;
  
  // Hanya mengambil 12 item pertama dari data
  useEffect(() => {
    const displayData = jsonData.slice(0, itemsPerPage);
    
    // Jika data kurang dari 12, tambahkan item kosong
    if (displayData.length < itemsPerPage) {
      const emptyItems = Array(itemsPerPage - displayData.length).fill().map((_, i) => ({
        id: `empty-${i}`,
        content: "---"
      }));
      setCurrentData([...displayData, ...emptyItems]);
    } else {
      setCurrentData(displayData);
    }
  }, [jsonData]);

  return (
    <div className={`flex bg-gray-100 mx-auto w-56 ${!position ? 'flex-col-reverse' : 'flex-col'}`}>   
      {/* Grid dengan data dinamis */}
      <div className="grid grid-cols-3">
        {currentData.map((item) => (
          <div key={item.id} className="bg-gray-100 py-5 px-2 text-center overflow-hidden text-sm truncate">
            {item.content}
          </div>
        ))}
      </div>
      
      {/* Navigation arrows (tidak berfungsi, hanya tampilan) */}
      <div className="flex justify-evenly">
        {/* Left arrow */}
        <button className="p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Middle arrow */}
        <button className="p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Right arrow */}
        <button className="p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}