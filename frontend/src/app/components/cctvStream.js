"use client";
import { useState, useEffect } from "react";

export default function CCTVStream({ data, title, customLarge, large = false, onClick }) {
  const [imageError, setImageError] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { message } = data || {};
  const {
    image_url = "",
    timestamp = "",
    fps = 0,
    id_simpang = "",
    count = 0,
  } = message || {};  

  useEffect(() => {
    setImageError(false);
  }, [image_url]);

  if (!data) {
    return (
      <div 
        className={`flex flex-col w-full ${customLarge} h-full min-h-[420px] ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className="bg-black text-white p-2">
          <h3 className="font-medium">{title}</h3>
        </div>
        <div className="flex flex-grow bg-black items-center justify-center text-white text-center w-full">
          <span className="text-sm w-full flex justify-center">Waiting for connect...</span>
        </div>
      </div>
    );
  }


  return (
    <>
      <div
        className={`flex flex-col ${large ? "h-fit" : "h-fit"} ${
          onClick ? "cursor-pointer" : ""
        }`}
        onClick={onClick}
      >
        <div className="bg-black text-white p-3 flex justify-between items-center">
          <h3 className="font-medium">{title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-500 px-2 py-1 rounded-full">
              {fps.toFixed(1)} FPS
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFullScreen(true);
              }}
              title="View Fullscreen"
              className="text-xs bg-white text-black px-2 py-1 rounded hover:bg-gray-200"
            >
              Fullscreen
            </button>
          </div>
        </div>

        <div className="flex-grow bg-black relative overflow-hidden min-h-[420px] max-h-[420px]">
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Failed to load image
            </div>
          ) : (
            <img
              src={image_url}
              alt={`CCTV Stream ${id_simpang}`}
              className="w-full min-w-[100%] h-full object-contain"
              onError={() => setImageError(true)}
            />
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-3 text-xs">
            <div className="flex justify-between">
              <span>ID: {id_simpang}</span>
              <span>Frame: {count}</span>
            </div>
            <div className="mt-1">{timestamp && new Date(timestamp).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={image_url}
              alt="Fullscreen CCTV"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setIsFullScreen(false)}
              className="btn btn-sm absolute top-4 right-4 bg-white text-black px-3 py-1 rounded hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
