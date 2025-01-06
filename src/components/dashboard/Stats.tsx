import { useEffect, useState } from 'react';
import { Users, Building2, FileText, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../auth/AuthContext';

export function Stats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    projects: 0,
    totalBudget: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: employeesCount },
        { count: departmentsCount },
        { count: projectsCount },
        { data: departments },
      ] = await Promise.all([
        supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('municipality_id', user?.id),
        supabase
          .from('departments')
          .select('*', { count: 'exact', head: true })
          .eq('municipality_id', user?.id),
        supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('municipality_id', user?.id),
        supabase
          .from('departments')
          .select('budget')
          .eq('municipality_id', user?.id),
      ]);

      const totalBudget = departments?.reduce((sum, dept) => sum + dept.budget, 0) || 0;

      setStats({
        employees: employeesCount || 0,
        departments: departmentsCount || 0,
        projects: projectsCount || 0,
        totalBudget,
      });
      setLoading(false);
    };

    fetchStats();
  }, [user]);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total de Funcionários"
        value={stats.employees.toString()}
        icon={Users}
      />
      <StatCard
        label="Departamentos"
        value={stats.departments.toString()}
        icon={Building2}
      />
      <StatCard
        label="Projetos Ativos"
        value={stats.projects.toString()}
        icon={FileText}
      />
      <StatCard
        label="Orçamento Total"
        value={`R$ ${stats.totalBudget.toLocaleString('pt-BR')}`}
        icon={TrendingUp}
      />
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className="p-3 bg-gray-100 rounded-full">
          <Icon className="h-6 w-6 text-gray-700" />
        </div>
      </div>
    </div>
  );
}