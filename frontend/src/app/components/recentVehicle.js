"use client";

import { useEffect, useState } from "react";

export default function RecentVehicle () {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm ,setSearchTerm] = useState('');
  const recentEvents = [
    {
      id: 1,
      channel: "Patuk",
      time: "04/02/2025 11:08:23",
      triggerName: "Exit",
      type: "Crossed line",
      origin: "Vehicle car",
      objectId: "500"
    },
    {
      id: 2,
      channel: "Patuk",
      time: "04/02/2025 11:08:23",
      triggerName: "Exit",
      type: "Crossed line",
      origin: "Vehicle car",
      objectId: "500"
    },
    {
      id: 3,
      channel: "Patuk",
      time: "04/02/2025 11:08:23",
      triggerName: "Exit",
      type: "Crossed line",
      origin: "Vehicle car",
      objectId: "500"
    },
    {
      id: 4,
      channel: "Patuk",
      time: "04/02/2025 11:08:23",
      triggerName: "Exit",
      type: "Crossed line",
      origin: "Vehicle car",
      objectId: "500"
    },
    {
      id: 5,
      channel: "Patuk",
      time: "04/02/2025 11:08:23",
      triggerName: "Exit",
      type: "Crossed line",
      origin: "Vehicle car",
      objectId: "500"
    },
    {
      id: 6,
      channel: "Patuk",
      time: "04/02/2025 11:08:23",
      triggerName: "Exit",
      type: "Crossed line",
      origin: "Vehicle car",
      objectId: "500"
    }
  ];
  const fetchVehicles = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/vehicle/recent");
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to load recent vehicles. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetchVehicles();
  }, []);

  return (
    <div className="bg-[#314385]/10 p-4 rounded-xl text-sm xl:max-w-3xl">
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {/* <button className="btn bg-[#314385]/90 text-white">Snapshot</button> */}
      <div title="snapshot" className="bg-[#314385]/90 text-white p-3 font-semibold rounded-xl inline-block text-center content-center">Snapshot</div>
      <div title="Channel Time Trigger Name" className="bg-[#314385]/90 text-white p-3 font-semibold rounded-xl inline-block text-center content-center truncate">Channel Time Trigger Name</div>
      <div title="Type Origin Object ID" className="bg-[#314385]/90 text-white p-3 font-semibold rounded-xl inline-block text-center content-center truncate">Type Origin Object ID</div>
    </div>
    <div className="flex gap-2 my-2 items-center">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search recent events"
          className="w-full border rounded-md input input-md bg-transparent" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* <Search className="absolute right-3 top-2 text-gray-400" size={20} /> */}
      </div>
      <button className="bg-gray-800 text-white btn btn-md rounded-md">
        Clear
      </button>
    </div>
    
    <div className="overflow-y-auto max-h-80 pr-2">
      {recentEvents.map(event => (
        <div key={event.id} className="flex flex-row gap-4 max-h-20">
          <div className="w-1/3">
            {event.image && (
              <img 
              src={event.image} 
              alt="Event snapshot" 
              className="w-full h-24 object-cover"
            />  
            ) || (
              <div className="w-full h-24 bg-base-300 flex items-center justify-center">
                No image
              </div>
            )}
            
          </div>
          <div className="w-1/3 p-2">
            <div className="font-medium">{event.channel}</div>
            <div className="text-sm">{event.time}</div>
            <div className="text-sm">{event.triggerName}</div>
          </div>
          <div className="w-1/3 p-2">
            <div className="font-medium">{event.type}</div>
            <div className="text-sm">{event.origin}</div>
            <div className="text-sm">{event.objectId}</div>
          </div>
        </div>
      ))}
    </div>
  </div>  )
}