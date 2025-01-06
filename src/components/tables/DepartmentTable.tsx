import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Department } from '../../services/departments';

interface DepartmentWithUser extends Department {
  user_email?: string;
}

const columnHelper = createColumnHelper<DepartmentWithUser>();

interface DepartmentTableProps {
  data: Department[];
}

export function DepartmentTable({ data }: DepartmentTableProps) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [departmentsWithUsers, setDepartmentsWithUsers] = useState<DepartmentWithUser[]>([]);

  useEffect(() => {
    const fetchUserEmails = async () => {
      const enrichedDepartments = await Promise.all(
        data.map(async (dept) => {
          if (!dept.user_id) return { ...dept };

          const { data: userData } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', dept.user_id)
            .single();

          return {
            ...dept,
            user_email: userData?.email,
          };
        })
      );

      setDepartmentsWithUsers(enrichedDepartments);
    };

    fetchUserEmails();
  }, [data]);

  const columns = [
    columnHelper.accessor('name', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
    }),
    columnHelper.accessor('user_email', {
      header: 'Login',
      cell: info => info.getValue() || '-',
    }),
    columnHelper.accessor('budget', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Orçamento
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: info => `R$ ${info.getValue().toLocaleString('pt-BR')}`,
    }),
    columnHelper.accessor('created_at', {
      header: 'Data de Criação',
      cell: info => new Date(info.getValue()).toLocaleDateString('pt-BR'),
    }),
  ];

  const table = useReactTable({
    data: departmentsWithUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="rounded-md border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map(row => (
            <tr 
              key={row.original.id}
              onClick={() => navigate(`/departments/${row.original.id}`)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
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