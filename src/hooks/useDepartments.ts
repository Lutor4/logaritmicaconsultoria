import { useState, useEffect } from 'react';
import { departmentService } from '../services/departments';
import type { Department } from '../services/departments';

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const data = await departmentService.list();
        setDepartments(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Erro ao carregar departamentos');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return {
    departments,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
    }
  };
}