"use client";
import { useState } from 'react';

export default function CCTVStream({ data, title, large = false, onClick }) {
  const [imageError, setImageError] = useState(false);

  if (!data) {
    return (
      <div 
        className={`flex flex-col ${large ? 'h-96' : 'h-48'} ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className="bg-base-200 text-white p-2">
          <h3 className="font-medium">{title}</h3>
        </div>
        <div className="flex-grow bg-black flex items-center justify-center text-white">
          Waiting for data...
        </div>
      </div>
    );
  }

  const { message } = data;
  const { image_url, timestamp, fps, id_simpang, count } = message;

  return (
    <div 
      className={`flex flex-col ${large ? 'h-96' : 'h-48'} ${onClick ? 'cursor-pointer' : ''}`} 
      onClick={onClick}
    >
      <div className="bg-black text-white p-3 flex justify-between items-center">
        <h3 className="font-medium">{title}</h3>
        <span className="text-xs bg-green-500 px-2 py-1 rounded-full">{fps.toFixed(1)} FPS</span>
      </div>
      
      <div className="flex-grow bg-gray-900 relative overflow-hidden">
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Failed to load image
          </div>
        ) : (
          <img 
            src={image_url} 
            alt={`CCTV Stream ${id_simpang}`} 
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-3 text-xs">
          <div className="flex justify-between">
            <span>ID: {id_simpang}</span>
            <span>Frame: {count}</span>
          </div>
          <div className="mt-1">
            {timestamp && new Date(timestamp).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}