// src/hooks/useApi.js
import { useState, useEffect, useCallback } from 'react';

export const useApi = (apiFunc) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunc();
      setData(response.data);
    } catch (err) {
      setError(err);
      console.error("API call failed", err);
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, setData, refetch: fetchData };
};