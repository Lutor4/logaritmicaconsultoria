import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { mes: 'Jan', receitas: 800000, despesas: 750000 },
  { mes: 'Fev', receitas: 850000, despesas: 780000 },
  { mes: 'Mar', receitas: 900000, despesas: 850000 },
  { mes: 'Abr', receitas: 870000, despesas: 820000 },
  { mes: 'Mai', receitas: 920000, despesas: 880000 },
  { mes: 'Jun', receitas: 950000, despesas: 900000 },
];

export function Charts() {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Balanço Financeiro</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip 
              formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
            />
            <Bar dataKey="receitas" name="Receitas" fill="#4ade80" />
            <Bar dataKey="despesas" name="Despesas" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}