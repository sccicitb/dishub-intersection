"use client";

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import CCTVStream from '../components/cctvStream';

export default function Home() {
  const [socketConnected, setSocketConnected] = useState(false);
  const [streamData, setStreamData] = useState({
    detection3: null,
    detection4: null,
    detection5: null
  });
  const [activeCamera, setActiveCamera] = useState('detection4');

  useEffect(() => {
    // Connect to Socket.IO server
    const socket = io('https://sxe-data.layanancerdas.id');

    socket.on('connect', () => {
      console.log('Socket connected');
      setSocketConnected(true);
    });
    

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });

    // Subscribe to the three detection topics
    socket.on('result_detection_3', (data) => {
      setStreamData(prev => ({ ...prev, detection3: data }));
    });

    socket.on('result_detection_4', (data) => {
      setStreamData(prev => ({ ...prev, detection4: data }));
    });

    socket.on('result_detection_5', (data) => {
      setStreamData(prev => ({ ...prev, detection5: data }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">CCTV Monitoring System</h1>
        
        {/* Connection Status */}
        <div className="mb-6 flex justify-center items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{socketConnected ? 'Connected to server' : 'Disconnected from server'}</span>
        </div>

        {/* Camera Selection */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 flex gap-4">
            <button
              onClick={() => setActiveCamera('detection3')}
              className={`px-4 py-2 rounded-md ${activeCamera === 'detection3' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Camera 3
            </button>
            <button
              onClick={() => setActiveCamera('detection4')}
              className={`px-4 py-2 rounded-md ${activeCamera === 'detection4' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Camera 4
            </button>
            <button
              onClick={() => setActiveCamera('detection5')}
              className={`px-4 py-2 rounded-md ${activeCamera === 'detection5' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Camera 5
            </button>
          </div>
        </div>

        {/* Main CCTV Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main active camera */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            <CCTVStream 
              data={streamData[activeCamera]} 
              title={`CCTV Camera ${activeCamera.replace('detection', '')}`} 
              large={true}
            />
          </div>

          {/* Sidebar with all cameras */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <CCTVStream 
                data={streamData.detection3} 
                title="CCTV Camera 3" 
                onClick={() => setActiveCamera('detection3')}
              />
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <CCTVStream 
                data={streamData.detection4} 
                title="CCTV Camera 4" 
                onClick={() => setActiveCamera('detection4')}
              />
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <CCTVStream 
                data={streamData.detection5} 
                title="CCTV Camera 5" 
                onClick={() => setActiveCamera('detection5')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}