import { useState, useEffect } from 'react';
import { survey, maps, cameras } from '@/lib/apiService';
import { getCuacaJogja } from '@/lib/weatherAccess';
import DataKMTabelFallback from '@/data/DataKMTabel.json';

export const useSurveyData = (activeSimpangId, dateInput, activeInterval, activePendekatan, activeDirection, activeClassification, submitCounter) => {
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [dataKM, setDataKM] = useState([]);
  const [intersectionData, setIntersectionData] = useState({});
  const [loadingKM, setLoadingKM] = useState(false);
  const [errorKM, setErrorKM] = useState(null);

  const formatDateToAPI = (dateStr) => dateStr.replace(/-/g, '/');

  const fetchSurveyProporsi = async (cameraId, category, date) => {
    if (!cameraId || !category || !date) return;
    setLoading(true);
    try {
      const res = await survey.getProporsi(cameraId, category, date);
      setIntersectionData(res?.data || {});
    } catch (err) {
      console.error('Error fetching survey proporsi:', err);
      setIntersectionData({});
    } finally {
      setLoading(false);
    }
  };

  const fetchSurvey = async () => {
    if (loading || !activeSimpangId) return;

    const baseParams = {
      camera_id: activeSimpangId,
      date: formatDateToAPI(dateInput),
      interval: activeInterval || '',
      approach: activePendekatan?.toLowerCase() || '',
      classification: "",
      reportType: 'hourly'
    };

    try {
      if (activeDirection === 'Semua') {
        const directions = ['timur', 'barat', 'utara', 'selatan'];
        const promises = directions.map(direction =>
          survey.getAll(...Object.values(baseParams), direction)
        );
        const responses = await Promise.all(promises);
        const combinedData = directions.reduce((acc, dir, idx) => {
          acc[dir] = responses[idx]?.data?.vehicleData || responses[idx]?.data || [];
          return acc;
        }, {});
        setVehicleData(combinedData);
      } else {
        const res = await survey.getAll(...Object.values(baseParams), activeDirection);
        setVehicleData(res?.data?.vehicleData || res?.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveyKM = async () => {
    if (loading || !activeSimpangId) return;

    const base = {
      camera_id: activeSimpangId,
      date: dateInput,
      interval: activeInterval || '',
      approach: activePendekatan?.toLowerCase() || '',
    };

    try {
      setLoadingKM(true);
      setErrorKM(null);
      const data = await survey.getAllKM(...Object.values(base));
      setDataKM(data?.data?.data?.vehicleData || []);
    } catch (err) {
      console.error('Error fetching KM:', err);
      setErrorKM(err?.response?.data?.message || err?.message || 'Gagal mengambil data Keluar-Masuk');
      setDataKM(DataKMTabelFallback || []);
    } finally {
      setLoadingKM(false);
    }
  };

  useEffect(() => {
    if (submitCounter > 0) {
      fetchSurvey();
      fetchSurveyKM();
      fetchSurveyProporsi(activeSimpangId, activeClassification, formatDateToAPI(dateInput));
    }
  }, [submitCounter]);

  return {
    loading,
    vehicleData,
    dataKM,
    intersectionData,
    loadingKM,
    errorKM,
    fetchSurvey,
    fetchSurveyKM,
    fetchSurveyProporsi
  };
};

export const useInitialData = () => {
  const [activeSimpangId, setActiveSimpangId] = useState(0);
  const [activeSimpang, setActiveSimpang] = useState("");
  const [activeCamera, setActiveCamera] = useState(1);
  const [activeSID, setActiveSID] = useState();
  const [Cuaca, setCuaca] = useState("");
  const [fetchStatus, setFetchStatus] = useState(false);
  const [simpangModel, setSimpangModel] = useState([]);

  useEffect(() => {
    const fetchSimpangData = async () => {
      try {
        const [simpangRes, cameraRes] = await Promise.all([maps.getAllSimpang(), cameras.getAll()]);
        const simpangData = Array.isArray(simpangRes?.data?.simpang) ? simpangRes.data.simpang : [];
        const cameraData = Array.isArray(cameraRes?.data?.cameras) ? cameraRes.data.cameras : [];

        setSimpangModel(cameraData.filter(item => item.socket_event !== "not_yet_assign").map(d => d.ID_Simpang));

        if (simpangData.length > 0 && simpangData[0]?.id) {
          const cuaca = await getCuacaJogja(simpangData[0].latitude, simpangData[0].longitude);
          setCuaca(cuaca);

          const firstSimpangId = simpangData[0].id;
          const matchedCamera = cameraData.find(cam => cam.ID_Simpang === firstSimpangId);

          if (matchedCamera && matchedCamera.id) {
            setActiveSimpangId(firstSimpangId);
            setActiveSID(matchedCamera.id);
            setActiveCamera(matchedCamera.id);
            setActiveSimpang(matchedCamera.name || '');
          } else if (cameraData.length > 0 && cameraData[0]?.id) {
            setActiveSimpangId(cameraData[0].ID_Simpang);
            setActiveSID(cameraData[0].id);
            setActiveCamera(cameraData[0].id);
            setActiveSimpang(cameraData[0].name || '');
          }
        }
        setFetchStatus(true);
      } catch (err) {
        console.error('Error fetching simpang data:', err);
      }
    };
    fetchSimpangData();
  }, []);

  return {
    activeSimpangId, setActiveSimpangId,
    activeSimpang, setActiveSimpang,
    activeCamera, setActiveCamera,
    activeSID, setActiveSID,
    Cuaca, fetchStatus, simpangModel
  };
};
