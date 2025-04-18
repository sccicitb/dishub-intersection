// // components/StatCards.jsx
// import React from 'react';
// import { IoCameraSharp, IoPeople, IoPerson } from "react-icons/io5";
// const StatCard = ({ icon, title, value, percentage = null }) => {
//   return (
//     <div className="flex items-center bg-base-100 p-4 rounded-lg mb-4">
//       <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-50/20 mr-4">
//         {icon}
//       </div>
//       <div>
//         <p className="text-gray-400 text-sm">{title}</p>
//         <div className="flex items-center">
//           <p className="text-3xl font-bold mr-2">{value}</p>
//           {percentage && (
//             <span className={`text-sm font-medium ${percentage.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
//               {percentage.includes('+') ? '↑' : '↓'} {percentage.replace('+', '')}
//             </span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// const StatCards = () => {
//   return (
//     <div className="flex flex-col p-6 min-w-fit max-w-xl mx-auto h-full bg-base-200/90 backdrop-blur-lg shadow-xs rounded-xl">
//       <StatCard 
//         icon={<IoPeople className="text-xl text-red-900" />}
//         title="Today's"
//         value="42"
//         percentage="+16%"
//       />
//       <StatCard 
//         icon={<IoCameraSharp className="text-xl text-red-900" />}
//         title="Total Camera"
//         value="10"
//       />
//       <StatCard 
//         icon={<IoPerson className="text-xl text-red-900" />}
//         title="People Integration"
//         value="100"
//       />
//     </div>
//   );
// };

// export default StatCards;
// components/StatCards.jsx
import React from 'react';

const StatCard = ({ icon, title, value, percentage = null }) => {
  return (
    <div className="flex items-center bg-base-100 p-4 h-full rounded-lg mb-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-700/10 mr-4">
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <div className="flex items-center">
          <p className="text-3xl font-bold mr-2">{value}</p>
          {percentage && (
            <span className={`text-sm font-medium ${percentage.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
              {percentage.includes('+') ? '↑' : '↓'} {percentage.replace('+', '')}
            </span>
          )}
        </div>
      </div>
      
    </div>
  );
};

const StatCards = ({ stats }) => {
  return (
    <div className="flex flex-col p-6 w-full mx-auto h-full bg-base-300/90 backdrop-blur-lg shadow-xs rounded-lg">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          title={stat.title}
          value={stat.value}
          percentage={stat.percentage}
        />
      ))}
    </div>
  );
};

export default StatCards;
