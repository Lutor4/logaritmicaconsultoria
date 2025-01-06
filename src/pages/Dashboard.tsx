import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { Stats } from '../components/dashboard/Stats';
import { MetricsSelector } from '../components/dashboard/MetricsSelector';
import { BudgetChart } from '../components/charts/BudgetChart';
import { EmployeesChart } from '../components/charts/EmployeesChart';
import { ProjectStatusChart } from '../components/charts/ProjectStatusChart';
import { FormsChart } from '../components/charts/FormsChart';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function DashboardPage() {
  const { profile, loading } = useProfile();
  const [selectedMetric, setSelectedMetric] = useState('budget');

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderChart = () => {
    switch (selectedMetric) {
      case 'budget':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Orçamento por Departamento</h3>
            <BudgetChart />
          </div>
        );
      case 'employees':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Funcionários por Departamento</h3>
            <EmployeesChart />
          </div>
        );
      case 'projects':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Status dos Projetos</h3>
            <ProjectStatusChart />
          </div>
        );
      case 'forms':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Formulários Respondidos</h3>
            <FormsChart />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        {profile?.role === 'admin' && (
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
            Administrador
          </span>
        )}
      </div>
      
      <Stats />
      
      <MetricsSelector 
        selected={selectedMetric}
        onSelect={setSelectedMetric}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderChart()}
        
        {profile?.role === 'admin' ? (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Visão Geral</h3>
            <ProjectStatusChart />
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Seus Formulários Pendentes</h3>
            {/* TODO: Adicionar lista de formulários pendentes */}
          </div>
        )}
      </div>
    </div>
  );
}