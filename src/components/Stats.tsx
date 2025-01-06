import React from 'react';
import { Users, Building, FileText, TrendingUp } from 'lucide-react';

const stats = [
  {
    label: 'Total de Funcionários',
    value: '1.234',
    icon: Users,
    change: '+5.2%',
    changeType: 'increase',
  },
  {
    label: 'Departamentos',
    value: '12',
    icon: Building,
    change: '0%',
    changeType: 'neutral',
  },
  {
    label: 'Projetos Ativos',
    value: '48',
    icon: FileText,
    change: '+12.3%',
    changeType: 'increase',
  },
  {
    label: 'Orçamento Mensal',
    value: 'R$ 4.5M',
    icon: TrendingUp,
    change: '+3.1%',
    changeType: 'increase',
  },
];

export function Stats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white p-6 rounded-lg shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-semibold mt-1">{stat.value}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <stat.icon className="h-6 w-6 text-gray-700" />
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-sm ${
              stat.changeType === 'increase' 
                ? 'text-green-600' 
                : stat.changeType === 'decrease' 
                ? 'text-red-600' 
                : 'text-gray-600'
            }`}>
              {stat.change} em relação ao mês anterior
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}