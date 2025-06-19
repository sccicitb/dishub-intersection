"use client";

import { useEffect, useState } from "react";
import { FixedSizeList as List } from "react-window";


const Row = ({ index, style, data }) => {
  const event = data[index];
  return (
    <div style={style} className="flex gap-1 items-center content-center">
      <div className="w-1/3">
        {event.image && (
          <img
            src={event.image}
            alt="Event snapshot"
            className="w-full h-24 object-cover"
          />
        ) || (
            <div className="w-full h-20 bg-black/90 text-white flex items-center justify-center">
              No image
            </div>
          )}

      </div>
      <div className="w-1/3 p-2">
        <div className="font-medium">{event.channel}</div>
        <div className="text-xs">{event.time}</div>
        <div className="text-xs">{event.triggerName}</div>
      </div>
      <div className="w-1/3 p-2">
        <div className="font-medium">{event.type}</div>
        <div className="text-xs">{event.origin}</div>
        <div className="text-xs">{event.objectId}</div>
      </div>
    </div>
  );
};

export default function RecentVehicle ({ hg }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dataVehicle, setDataVehicle] = useState([]);

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
    import("@/data/DataHistory.json").then((data) => setDataVehicle(data.default || []))
    // fetchVehicles();
  }, []);

  return (
    <div className="bg-[#314385]/10 h-full p-4 rounded-xl text-xs xl:max-w-3xl">

      <div className="grid grid-cols-3 gap-2">
        {/* <button className="btn bg-[#314385]/90 text-white">Snapshot</button> */}
        <div title="snapshot" className="bg-[#314385]/90 text-white p-2 font-semibold rounded-xl inline-block text-center content-center">Snapshot</div>
        <div title="Channel Time Trigger Name" className="bg-[#314385]/90 text-white p-2 font-semibold rounded-xl inline-block text-center content-center truncate">Channel Time Trigger Name</div>
        <div title="Type Origin Object ID" className="bg-[#314385]/90 text-white p-2 font-semibold rounded-xl inline-block text-center content-center truncate">Type Origin Object ID</div>
      </div>
      <div className="flex gap-2 my-2 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search recent events"
            className="w-full border rounded-md input input-sm bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* <Search className="absolute right-3 top-2 text-gray-400" size={20} /> */}
        </div>
        <button className="bg-gray-800 text-white btn btn-sm rounded-md">
          Clear
        </button>
      </div>

      <div className={`mt-[5%] overflow-y-auto`}>
        <List
          height={hg ? hg : 350} // tinggi container
          itemCount={Array.isArray(dataVehicle) ? dataVehicle.length : 0}
          itemSize={80} // tinggi tiap item (px)
          width={"100%"}
          itemData={dataVehicle}
        >
          {Row}
        </List>
      </div>
      {/* {dataVehicle?.map(event => (
        <div key={event.id} className="flex flex-row gap-4 h-fit">
          <div className="w-1/3">
            {event.image && (
              <img
                src={event.image}
                alt="Event snapshot"
                className="w-full h-24 object-cover"
              />
            ) || (
                <div className="w-full h-24 bg-black/90 text-white flex items-center justify-center">
                  No image
                </div>
              )}

          </div>
          <div className="w-1/3 p-2">
            <div className="font-medium">{event.channel}</div>
            <div className="text-xs">{event.time}</div>
            <div className="text-xs">{event.triggerName}</div>
          </div>
          <div className="w-1/3 p-2">
            <div className="font-medium">{event.type}</div>
            <div className="text-xs">{event.origin}</div>
            <div className="text-xs">{event.objectId}</div>
          </div>
        </div>
      ))} */}
    </div >)
}