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

  const fetchTrafficMatrix = useCallback(async (simpang_id, startDate, endDate) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!simpang_id) {
        throw new Error('simpang_id is required');
      }
      
      if (!startDate || !endDate) {
        throw new Error('startDate and endDate are required');
      }

      const response = await survey.getTrafficMatrix(simpang_id, startDate, endDate);
      
      if (response.status === 200 && response.data?.data) {
        const matrixData = response.data.data;
        setDataChord(matrixData);
        
        const transformedMatrix = transformMatrixData(matrixData);
        setDataMatrix(transformedMatrix);
        
        return matrixData;
      } else if (response.status === 200 && (!response.data?.data || Object.keys(response.data.data).length === 0)) {
        // Jika data kosong, load default
        throw new Error('No data available for selected period');
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch traffic matrix';
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
        console.error('Failed to load fallback matrix:', fallbackErr);
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
