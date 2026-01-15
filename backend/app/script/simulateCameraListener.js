const { io } = require('socket.io-client');
const axios = require('axios');

// Konfigurasi
const CAMERA_ID = 3;
const SOCKET_ROOM = `result_detection_${CAMERA_ID}`;
const BACKEND_API = 'http://localhost:3000/api/cameras/status-log'; // ganti sesuai endpoint kamu

// Koneksi ke WebSocket
const socket = io('https://sxe-data.layanancerdas.id', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log(`Connected to WebSocket. Listening to room: ${SOCKET_ROOM}`);
});

socket.on(SOCKET_ROOM, async (data) => {
  console.log(`📡 Received event from ${SOCKET_ROOM}`);

  try {
    await axios.post(BACKEND_API, {
      camera_id: CAMERA_ID,
      status: 1
    });

    console.log(`Status 1 sent to backend for camera ${CAMERA_ID}`);
  } catch (err) {
    console.error(`❌ Error posting to backend:`, err.message);
  }
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from WebSocket');
});
