import React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

type Departamento = {
  nome: string;
  orcamento: number;
  funcionarios: number;
  projetos: number;
};

const data: Departamento[] = [
  { nome: 'Saúde', orcamento: 1500000, funcionarios: 250, projetos: 12 },
  { nome: 'Educação', orcamento: 2000000, funcionarios: 450, projetos: 8 },
  { nome: 'Infraestrutura', orcamento: 800000, funcionarios: 120, projetos: 15 },
  { nome: 'Assistência Social', orcamento: 500000, funcionarios: 80, projetos: 6 },
];

const columnHelper = createColumnHelper<Departamento>();

const columns = [
  columnHelper.accessor('nome', {
    header: 'Departamento',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('orcamento', {
    header: 'Orçamento (R$)',
    cell: info => info.getValue().toLocaleString('pt-BR'),
  }),
  columnHelper.accessor('funcionarios', {
    header: 'Funcionários',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('projetos', {
    header: 'Projetos Ativos',
    cell: info => info.getValue(),
  }),
];

export function DataTable() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-600"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="border-t border-gray-200">
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="px-6 py-4 text-sm text-gray-800"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}