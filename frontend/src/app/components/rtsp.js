"use client";

import { useEffect, useRef, useState } from "react";
import JSMpeg from "@cycjimmy/jsmpeg-player";
// import * as faceapi from "face-api.js";
import * as faceapi from '@vladmandic/face-api';

const RTSPPlayerWithFaceRecognition = () => {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const faceCheckIntervalRef = useRef(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [labeledFaceDescriptors, setLabeledFaceDescriptors] = useState([]);
  const [detectedFaces, setDetectedFaces] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log("🔄 Loading face-api models...");
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models")
        ]);
        console.log("✅ Face-api models loaded successfully!");
        setIsModelLoaded(true);
        loadLabeledImages();
      } catch (error) {
        console.error("❌ Error loading face-api models:", error);
      }
    };

    loadModels();
  }, []);

  // Load labeled images from public/capture/ directory
  const loadLabeledImages = async () => {
    try {
      console.log("🔄 Loading labeled face images...");
      
      // This would typically be fetched from an API
      // For the sake of this example, let's assume we have a mapping of names to image paths
      const labels = ["adit", "amar", "James", "nadif"]; // Example names
      
      const labeledDescriptors = await Promise.all(
        labels.map(async (label) => {
          try {
            // These would be your captured images
            const imgPath = `/capture/${label}.png`;
            const img = await faceapi.fetchImage(imgPath);
            
            // Detect the face and get the descriptor
            const detections = await faceapi.detectSingleFace(img)
              .withFaceLandmarks()
              .withFaceDescriptor();
            
            if (!detections) {
              console.warn(`⚠️ No face detected in ${imgPath}`);
              return null;
            }
            
            return new faceapi.LabeledFaceDescriptors(label, [detections.descriptor]);
          } catch (err) {
            console.error(`❌ Error processing ${label}:`, err);
            return null;
          }
        })
      );
      
      const validDescriptors = labeledDescriptors.filter(desc => desc !== null);
      setLabeledFaceDescriptors(validDescriptors);
      console.log(`✅ Loaded ${validDescriptors.length} labeled faces`);
    } catch (error) {
      console.error("❌ Error loading labeled images:", error);
    }
  };

  // Initialize JSMpeg player
  useEffect(() => {
    if (!videoRef.current) {
      console.warn("❌ Canvas belum tersedia! Menunggu...");
      return;
    }

    console.log("🔄 Connecting to WebSocket...");
        
    try {
      playerRef.current = new JSMpeg.Player("ws://localhost:2020", {
        canvas: videoRef.current,
        disableGl: true,
        progressive: true,
        chunkSize: 1024 * 16,
        decodeFirstFrame: true,
        onSourceEstablished: () => {
          console.log("✅ JSMpeg Source Established!");
          setIsPlayerReady(true);
          startInterval();
          startFaceDetection();
          
          // Set dimensions for overlay
          if (videoRef.current) {
            setDimensions({
              width: videoRef.current.width,
              height: videoRef.current.height
            });
          }
        },
        onError: (error) => {
          console.error("❌ JSMpeg connection error:", error);
          setIsPlayerReady(false);
        }
      });
      
      console.log("🎥 JSMpeg initialized:", playerRef.current);
      
      // Force canvas refresh to avoid rendering bugs
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.width += 1;
          videoRef.current.width -= 1;
          
          // Set dimensions for overlay
          setDimensions({
            width: videoRef.current.width,
            height: videoRef.current.height
          });
        }
      }, 100);
    } catch (err) {
      console.error("❌ Failed to initialize JSMpeg:", err);
      setIsPlayerReady(false);
    }

    return () => {
      console.log("🧹 Cleaning up RTSP Player...");
            
      // Clear intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (faceCheckIntervalRef.current) {
        clearInterval(faceCheckIntervalRef.current);
        faceCheckIntervalRef.current = null;
      }
        
      const player = playerRef.current;
      
      if (playerRef.current) {
        playerRef.current = null; // Remove reference before destroy
      }
      
      // Clean up player with better error handling
      if (player) {
        try {
          setTimeout(() => {
            try {
              if (player && typeof player.destroy === 'function') {
                player.destroy();
                console.log("✅ Player destroyed.");
              }
            } catch (error) {
              console.error("❌ Error during delayed destroy:", error);
            }
          }, 100);
        } catch (error) {
          console.error("❌ Error scheduling player destruction:", error);
        }
      }
    };
  }, []);

  // Start regular player status interval
  const startInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) {
        console.warn("⚠️ Player tidak tersedia!");
        clearInterval(intervalRef.current);
        return;
      }
      console.log("📡 JSMpeg Stats:", player.currentTime || 0);
    }, 60000);
  };

  // Start face detection interval
  const startFaceDetection = () => {
    if (faceCheckIntervalRef.current) {
      clearInterval(faceCheckIntervalRef.current);
    }
    
    faceCheckIntervalRef.current = setInterval(async () => {
      if (!isPlayerReady || !isModelLoaded || labeledFaceDescriptors.length === 0 || isProcessing) {
        return;
      }
      
      checkForFaces();
    }, 1000); // Check for faces every 1 second
  };

  // Process canvas for face detection
  const checkForFaces = async () => {
    try {
      if (!videoRef.current || isProcessing) return;
      
      setIsProcessing(true);
      
      // Get current canvas image data
      const canvas = videoRef.current;
      
      // Create a temporary canvas to properly process the image data
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
      
      // Update dimensions if needed
      if (dimensions.width !== canvas.width || dimensions.height !== canvas.height) {
        setDimensions({
          width: canvas.width,
          height: canvas.height
        });
      }
      
      // Detect faces in the canvas
      const detections = await faceapi.detectAllFaces(tempCanvas)
        .withFaceLandmarks()
        .withFaceDescriptors();
      
      if (detections.length === 0) {
        console.log("👤 No faces detected");
        setDetectedFaces([]);
        setIsProcessing(false);
        return;
      }
      
      console.log(`👥 Detected ${detections.length} face(s)`);
      
      // Create face matcher with labeled descriptors
      const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
      
      // Match each detected face
      const results = detections.map(detection => {
        const match = faceMatcher.findBestMatch(detection.descriptor);
        return {
          detection: detection,
          box: detection.detection.box,
          label: match.label,
          distance: match.distance
        };
      });
      
      // Store results for rendering
      setDetectedFaces(results);
      
    } catch (error) {
      console.error("❌ Error during face detection:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Draw bounding boxes and labels on overlay canvas
  useEffect(() => {
    if (!overlayRef.current || detectedFaces.length === 0) return;
    
    const ctx = overlayRef.current.getContext('2d');
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    
    detectedFaces.forEach(face => {
      const { box, label } = face;
      const confidence = ((1 - face.distance) * 100).toFixed(0);
      const displayLabel = label !== 'unknown' 
        ? `${label} (${confidence}%)` 
        : 'Unknown';
      
      // Draw bounding box
      ctx.lineWidth = 3;
      ctx.strokeStyle = label !== 'unknown' ? '#00FF00' : '#FF0000';
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      
      // Draw label background
      ctx.fillStyle = label !== 'unknown' ? 'rgba(0, 200, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)';
      ctx.fillRect(box.x, box.y - 30, box.width, 30);
      
      // Draw label text
      ctx.font = '16px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(displayLabel, box.x + 5, box.y - 10);
    });
  }, [detectedFaces, dimensions]);

  return (
    <div className="relative w-full">
      {/* Video canvas */}
      <canvas
        ref={videoRef}
        style={{
          width: "100%",
          height: "auto",
          backgroundColor: isPlayerReady ? "black" : "red",
        }}
      />
      
      {/* Overlay canvas for face detection boxes */}
      <canvas
        ref={overlayRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "auto",
          pointerEvents: "none",
        }}
      />
      
      {/* Status indicators */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className={`px-3 py-1 rounded-full text-sm ${isPlayerReady ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          Stream: {isPlayerReady ? 'Connected' : 'Disconnected'}
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${isModelLoaded ? 'bg-green-500' : 'bg-yellow-500'} text-white`}>
          Face Models: {isModelLoaded ? 'Loaded' : 'Loading...'}
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${detectedFaces.length > 0 ? 'bg-blue-500' : 'bg-gray-500'} text-white`}>
          Faces: {detectedFaces.length}
        </div>
      </div>
    </div>
  );
};

export default RTSPPlayerWithFaceRecognition;

// "use client";
// import { useEffect, useRef, useState } from "react";
// import JSMpeg from "@cycjimmy/jsmpeg-player";

// const RTSPPlayer = () => {
//   const videoRef = useRef(null);
//   const playerRef = useRef(null);
//   const intervalRef = useRef(null);
//   const [isPlayerReady, setIsPlayerReady] = useState(false);

//   useEffect(() => {
//     if (!videoRef.current) {
//       console.warn("❌ Canvas belum tersedia! Menunggu...");
//       return;
//     }

//     console.log("🔄 Connecting to WebSocket...");
    
//     try {
//       playerRef.current = new JSMpeg.Player("ws://localhost:2020", {
//         canvas: videoRef.current,
//         disableGl: true,
//         progressive: true,
//         chunkSize: 1024 * 16,
//         decodeFirstFrame: true,
//         onSourceEstablished: () => {
//           console.log("✅ JSMpeg Source Established!");
//           setIsPlayerReady(true);
//           startInterval();
//         },
//         onError: (error) => {
//           console.error("❌ JSMpeg connection error:", error);
//           setIsPlayerReady(false);
//         }
//       });

//       console.log("🎥 JSMpeg initialized:", playerRef.current);

//       // Paksa refresh canvas untuk menghindari bug rendering
//       setTimeout(() => {
//         if (videoRef.current) {
//           videoRef.current.width += 1;
//           videoRef.current.width -= 1;
//         }
//       }, 100);
//     } catch (err) {
//       console.error("❌ Failed to initialize JSMpeg:", err);
//       setIsPlayerReady(false);
//     }

//     return () => {
//       console.log("🧹 Cleaning up RTSP Player...");
      
//       // Membersihkan interval
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }

//         const player = playerRef.current;
//         if (playerRef.current) {
//           playerRef.current = null; // Hapus referensi sebelum destroy
//       }
//       // Membersihkan player dengan penanganan error yang lebih baik
//       if (player) {
//         // Simpan referensi ke variabel lokal
//         // lalu hapus referensi global sebelum memanggil destroy
//         playerRef.current = null;
        
//         try {
//           // Bungkus dalam setTimeout untuk memastikan eksekusi asinkron
//           // dan menghindari konflik dengan event loop
//           setTimeout(() => {
//             try {
//               if (player && typeof player.destroy === 'function') {
//                 player.destroy();
//                 console.log("✅ Player destroyed.");
//               }
//             } catch (error) {
//               console.error("❌ Error during delayed destroy:", error);
//             }
//           }, 100);
//         } catch (error) {
//           console.error("❌ Error scheduling player destruction:", error);
//         }
//       }
//     };
//   }, []);

//   const startInterval = () => {
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//     }
//     intervalRef.current = setInterval(() => {
//       const player = playerRef.current;
//       if (!player) {
//         console.warn("⚠️ Player tidak tersedia!");
//         clearInterval(intervalRef.current);
//         return;
//       }
//       console.log("📡 JSMpeg Stats:", player.currentTime || 0);
//     }, 60000);
//   };

//   return (
//     <canvas
//       ref={videoRef}
//       style={{
//         width: "100%",
//         height: "auto",
//         backgroundColor: isPlayerReady ? "black" : "red",
//       }}
//     />
//   );
// };

// export default RTSPPlayer;  
 