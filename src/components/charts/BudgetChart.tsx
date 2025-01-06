import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../auth/AuthContext';

export function BudgetChart() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: departments } = await supabase
        .from('departments')
        .select('name, budget')
        .eq('municipality_id', user?.id);

      if (departments) {
        setData(departments);
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
          <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
          <Bar dataKey="budget" fill="#4ade80" name="Orçamento" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}