import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../auth/AuthContext';

export function EmployeesChart() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: departments } = await supabase
        .from('departments')
        .select(`
          name,
          employees:employees(count)
        `)
        .eq('municipality_id', user?.id);

      if (departments) {
        const chartData = departments.map(dept => ({
          name: dept.name,
          total: dept.employees.length
        }));
        setData(chartData);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" name="Funcionários" fill="#818cf8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}