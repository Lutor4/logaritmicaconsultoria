import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../auth/AuthContext';

const COLORS = ['#4ade80', '#fbbf24', '#f87171'];

export function FormsChart() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: responses } = await supabase
        .from('form_responses')
        .select(`
          template:form_templates(title)
        `)
        .eq('department_id', user?.id);

      if (responses) {
        const formCounts = responses.reduce((acc, response) => {
          const title = response.template.title;
          acc[title] = (acc[title] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.entries(formCounts).map(([name, value]) => ({
          name,
          value,
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
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}