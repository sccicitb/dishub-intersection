const mqtt = require('mqtt');
const { io } = require("socket.io-client");
const dbMain = require('./app/config/db.js');

class UniversalListener {
  constructor() {
    this.clients = new Map();
    this.ioServer = null; // Instance Socket.io Server (untuk emit ke dashboard)

    this.configs = [
      {
        id: 'PRIMARY',
        enabled: process.env.MQTT_PRIMARY_ENABLED !== 'false',
        type: process.env.MQTT_PRIMARY_TYPE || 'mqtt', // 'mqtt' atau 'socketio'
        url: process.env.MQTT_BROKER_PRIMARY,
        topics: (process.env.MQTT_TOPIC_PRIMARY || '').split(','),
        auth: { username: process.env.MQTT_USERNAME_PRIMARY, password: process.env.MQTT_PASSWORD_PRIMARY }
      },
      {
        id: 'SECONDARY',
        enabled: process.env.MQTT_SECONDARY_ENABLED === 'true',
        type: process.env.MQTT_SECONDARY_TYPE || 'mqtt',
        url: process.env.MQTT_BROKER_SECONDARY,
        topics: (process.env.MQTT_TOPIC_SECONDARY || '').split(','),
        auth: { username: process.env.MQTT_USERNAME_SECONDARY, password: process.env.MQTT_PASSWORD_SECONDARY }
      }
    ];
  }

  setSocketServer (ioInstance) {
    this.ioServer = ioInstance;
  }

  connect () {
    this.configs.filter(c => c.enabled && c.url).forEach(conf => {
      if (conf.type === 'socketio') {
        this._initSocketIO(conf);
      } else {
        this._initMQTT(conf);
      }
    });
  }

  /**
   * Handler untuk Protokol Socket.io
   */
  _initSocketIO (conf) {
    console.log(`[Socket.io] [${conf.id}] Connecting to: ${conf.url}`);
    const socket = io(conf.url, {
      transports: ['websocket'],
      reconnection: true,
      rejectUnauthorized: false
    });

    socket.on('connect', () => {
      console.log(`[Socket.io] [${conf.id}] ✓ Connected`);
      conf.topics.forEach(topic => {
        socket.on(topic.trim(), (data) => this._processDatabaseBulk(data, conf.id, topic));
      });
    });

    socket.on('error', (err) => console.error(`[Socket.io] [${conf.id}] ✗ Error:`, err.message));
    this.clients.set(conf.id, socket);
  }

  /**
   * Handler untuk Protokol MQTT
   */
  _initMQTT (conf) {
    let brokerUrl = conf.url;
    // Auto-fix protocol jika masih pakai http/https untuk MQTT
    brokerUrl = brokerUrl.replace('https://', 'wss://').replace('http://', 'ws://');
    if (!brokerUrl.includes('://')) brokerUrl = 'mqtt://' + brokerUrl;

    const mqttOptions = {
      clientId: `mobility_${conf.id.toLowerCase()}_${Math.random().toString(16).slice(2, 6)}`,
      reconnectPeriod: 1000,
      rejectUnauthorized: false
    };

    if (conf.auth?.username?.trim()) {
      mqttOptions.username = conf.auth.username;
      mqttOptions.password = conf.auth.password;
    }

    console.log(`[MQTT] [${conf.id}] Connecting to: ${brokerUrl}`);
    const client = mqtt.connect(brokerUrl, mqttOptions);

    client.on('connect', () => {
      console.log(`[MQTT] [${conf.id}] ✓ Connected`);
      conf.topics.forEach(topic => client.subscribe(topic.trim()));
    });

    client.on('message', (topic, msg) => {
      try {
        this._processDatabaseBulk(JSON.parse(msg.toString()), conf.id, topic);
      } catch (e) {
        console.error(`[MQTT] [${conf.id}] ✗ JSON Error:`, e.message);
      }
    });

    client.on('error', (err) => console.error(`[MQTT] [${conf.id}] ✗ Error:`, err.message));
    this.clients.set(conf.id, client);
  }

  /**
   * Logika Database (Unstacking arah_per_kelas)
   * 
   */async _processDatabase (data, source, topicName) {
    // Gunakan dbMain secara langsung (pool.query) agar otomatis release koneksi
    try {
      const payload = data.message ? data.message : data;
      const { ID_Simpang, tipe_pendekat, arah_per_kelas, waktu } = payload;

      if (!arah_per_kelas || typeof arah_per_kelas !== 'object') {
        console.warn(`[${source}] [${topicName}] Skip: arah_per_kelas tidak ditemukan.`);
        return;
      }

      // Kelompok arah unik
      const uniqueDirs = new Set();
      Object.values(arah_per_kelas).forEach(vTypeObj => {
        if (vTypeObj && typeof vTypeObj === 'object') {
          Object.keys(vTypeObj).forEach(dir => uniqueDirs.add(dir));
        }
      });

      if (uniqueDirs.size === 0) return;

      // Loop sesuai uniqueDirs dan simpan ke DB
      for (const fullDir of uniqueDirs) {
        const [dari_arah, ke_arah] = fullDir.split('_to_');
        const flow = { SM: 0, MP: 0, AUP: 0, TR: 0, BS: 0, TS: 0, TB: 0, BB: 0, GANDENG: 0, KTB: 0 };

        // Map data ke objek flow
        Object.keys(flow).forEach(vType => {
          if (arah_per_kelas[vType] && arah_per_kelas[vType][fullDir]) {
            flow[vType] = arah_per_kelas[vType][fullDir];
          }
        });

        const query = `
          INSERT INTO arus (
            ID_Simpang, tipe_pendekat, dari_arah, ke_arah, 
            SM, MP, AUP, TR, BS, TS, TB, BB, GANDENG, KTB, 
            waktu, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        // Simpan parameter ke variabel agar bisa dipanggil di console.log tanpa error
        const queryParams = [
          ID_Simpang, tipe_pendekat, dari_arah, ke_arah,
          flow.SM, flow.MP, flow.AUP, flow.TR, flow.BS, flow.TS, flow.TB, flow.BB, flow.GANDENG, flow.KTB,
          waktu
        ];

        // Langsung gunakan pool agar management koneksi otomatis
        await dbMain.query(query, queryParams);

        // Debug data yang disimpan menggunakan variabel queryParams
        console.log(`[${source}] [${topicName}] ✓ Saved: Simpang ${ID_Simpang} (${dari_arah} → ${ke_arah})`);
        const vehicleData = Object.keys(flow).map((vType, i) => `${vType}:${queryParams[i + 4]}`).join(', ');
        console.log(`[${source}] [${topicName}] ⮕ Data: ${vehicleData}`);
      }

      if (this.io) {
        this.io.emit('flow_update', { ...payload, source, topic: topicName });
      }

    } catch (error) {
      console.error(`[MQTT] [${source}] ✗ Error:`, error.message);
    }
    // Tidak perlu block finally/release jika menggunakan dbMain.query() secara langsung
  }
  async _processDatabaseBulk (data, source, topicName) {
    try {
      const payload = data.message ? data.message : data;
      const { ID_Simpang, tipe_pendekat, arah_per_kelas, waktu } = payload;

      if (!arah_per_kelas || typeof arah_per_kelas !== 'object') {
        console.warn(`[${source}] [${topicName}] Skip: arah_per_kelas tidak ditemukan.`);
        return;
      }

      const uniqueDirs = new Set();
      Object.values(arah_per_kelas).forEach(vTypeObj => {
        if (vTypeObj && typeof vTypeObj === 'object') {
          Object.keys(vTypeObj).forEach(dir => uniqueDirs.add(dir));
        }
      });

      if (uniqueDirs.size === 0) return;

      // array penampungan semua baris (Bulk)
      const allRows = [];

      for (const fullDir of uniqueDirs) {
        const [dari_arah, ke_arah] = fullDir.split('_to_');
        const flow = { SM: 0, MP: 0, AUP: 0, TR: 0, BS: 0, TS: 0, TB: 0, BB: 0, GANDENG: 0, KTB: 0 };

        Object.keys(flow).forEach(vType => {
          if (arah_per_kelas[vType] && arah_per_kelas[vType][fullDir]) {
            flow[vType] = arah_per_kelas[vType][fullDir];
          }
        });

        // Data untuk satu baris (Urutan harus sesuai kolom di query INSERT)
        const row = [
          ID_Simpang, tipe_pendekat, dari_arah, ke_arah,
          flow.SM, flow.MP, flow.AUP, flow.TR, flow.BS, flow.TS, flow.TB, flow.BB, flow.GANDENG, flow.KTB,
          waktu, new Date(), new Date()
        ];

        allRows.push(row);

        console.log(`[${source}] [${topicName}] ✓ Prepared: Simpang ${ID_Simpang} (${dari_arah} → ${ke_arah})`);
        const vehicleData = Object.keys(flow).map(vType => `${vType}:${flow[vType]}`).join(', ');
        console.log(`[${source}] [${topicName}] ⮕ Data: ${vehicleData}`);
      }

      // Eksekusi Bulk Insert
      if (allRows.length > 0) {
        const query = `
          INSERT INTO arus_copy (
            ID_Simpang, tipe_pendekat, dari_arah, ke_arah, 
            SM, MP, AUP, TR, BS, TS, TB, BB, GANDENG, KTB, 
            waktu, created_at, updated_at
          ) VALUES ?`;

        // Pada library mysql/mysql2, bulk insert menggunakan [ [ [row1], [row2] ] ]
        await dbMain.query(query, [allRows]);
        console.log(`[${source}] [${topicName}] 🚀 Bulk Insert Success Arus Copy: ${allRows.length} rows saved to MariaDB.`);
      }

      // if (allRows.length > 0) {
      //   const query = `
      //     INSERT INTO arus (
      //       ID_Simpang, tipe_pendekat, dari_arah, ke_arah, 
      //       SM, MP, AUP, TR, BS, TS, TB, BB, GANDENG, KTB, 
      //       waktu, created_at, updated_at
      //     ) VALUES ?`;

      //   // Pada library mysql/mysql2, bulk insert menggunakan [ [ [row1], [row2] ] ]
      //   await dbMain.query(query, [allRows]);
      //   console.log(`[${source}] [${topicName}] 🚀 Bulk Insert Success Arus: ${allRows.length} rows saved to MariaDB.`);
      // }

      if (this.ioServer) {
        this.ioServer.emit('flow_update', { ...payload, source, topic: topicName });
      }

    } catch (error) {
      console.error(`[DATABASE ERROR] [${source}] [${topicName}] ✗:`, error.message);
    }
  }
}

module.exports = new UniversalListener();