import { useState } from 'react';
import { BarChart2, Users, FileText, Wallet } from 'lucide-react';

const metrics = [
  { id: 'budget', label: 'Orçamento', icon: Wallet },
  { id: 'employees', label: 'Funcionários', icon: Users },
  { id: 'projects', label: 'Projetos', icon: BarChart2 },
  { id: 'forms', label: 'Formulários', icon: FileText },
];

interface MetricsSelectorProps {
  onSelect: (metricId: string) => void;
  selected: string;
}

export function MetricsSelector({ onSelect, selected }: MetricsSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const isSelected = selected === metric.id;
        
        return (
          <button
            key={metric.id}
            onClick={() => onSelect(metric.id)}
            className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
              isSelected 
                ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                : 'bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            <Icon className="h-6 w-6" />
            <span className="text-sm font-medium">{metric.label}</span>
          </button>
        );
      })}
    </div>
  );
}