import { useState, useCallback } from 'react';
import { survey } from '@/lib/apiService';

export const useTrafficMatrix = () => {
  const [dataChord, setDataChord] = useState({});
  const [dataMatrix, setDataMatrix] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = ["barat", "selatan", "timur", "utara"];

  const transformMatrixData = useCallback((data) => {
    if (!data || !data.asalTujuan) {
      return [];
    }
    
    const asalTujuan = data.asalTujuan;
    const data_matrix = categories.map(from => {
      return categories.map(to => asalTujuan[from]?.[to] ?? 0);
    });
    
    return data_matrix;
  }, []);

  const fetchTrafficMatrix = useCallback(async (simpang_id, startDate, endDate, filter = 'customrange') => {
    setLoading(true);
    setError(null);
    
    try {
      if (!simpang_id) {
        throw new Error('simpang_id is required');
      }
      
      // For customrange filter, dates are required
      if (filter === 'customrange' && (!startDate || !endDate)) {
        throw new Error('startDate and endDate are required for customrange filter');
      }

      const response = await survey.getTrafficMatrix(simpang_id, startDate, endDate, filter);
      
      if (response.status === 200 && response.data?.data) {
        const matrixData = response.data.data;
        setDataChord(matrixData);
        
        const transformedMatrix = transformMatrixData(matrixData);
        setDataMatrix(transformedMatrix);
        
        return matrixData;
      } else if (response.status === 200 && (!response.data?.data || Object.keys(response.data.data).length === 0)) {
        // Jika data kosong, load default
        throw new Error('Data tidak tersedia dari API');
      } else {
        throw new Error('Gagal mengambil data traffic matrix');
      }
    } catch (err) {
      const errorMessage = err.message || 'Gagal mengambil data traffic matrix';
      setError(errorMessage);
      console.error('Error fetching traffic matrix:', err);
      
      // Fallback ke default matrix jika error
      try {
        const data = await import("@/data/contohmatrix.json");
        const defaultData = data.default.data;
        setDataChord(defaultData);
        const transformedMatrix = transformMatrixData(defaultData);
        setDataMatrix(transformedMatrix);
      } catch (fallbackErr) {
        console.error('Gagal memuat matrix fallback:', fallbackErr);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [transformMatrixData]);

  const loadDefaultMatrix = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await import("@/data/contohmatrix.json");
      const defaultData = data.default.data;
      
      setDataChord(defaultData);
      const transformedMatrix = transformMatrixData(defaultData);
      setDataMatrix(transformedMatrix);
      
      return defaultData;
    } catch (err) {
      const errorMessage = 'Failed to load default matrix';
      setError(errorMessage);
      console.error(errorMessage, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [transformMatrixData]);

  return {
    dataChord,
    dataMatrix,
    categories,
    loading,
    error,
    fetchTrafficMatrix,
    loadDefaultMatrix
  };
};
