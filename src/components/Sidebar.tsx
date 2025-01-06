import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Building2, Settings, LogOut, FormInput } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useProfile } from '../hooks/useProfile';

export function Sidebar() {
  const { signOut } = useAuth();
  const { profile } = useProfile();

  // Define menus baseado no tipo de usuário
  const menuItems = profile?.role === 'admin' 
    ? [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
        { icon: Building2, label: 'Departamentos', to: '/departments' },
        { icon: Users, label: 'Funcionários', to: '/employees' },
        { icon: FileText, label: 'Projetos', to: '/projects' },
        { icon: FormInput, label: 'Templates', to: '/forms' },
        { icon: Settings, label: 'Configurações', to: '/settings' },
      ]
    : [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
        { icon: Users, label: 'Funcionários', to: '/employees' },
        { icon: FileText, label: 'Projetos', to: '/projects' },
        { icon: FormInput, label: 'Formulários', to: '/forms' },
        { icon: Settings, label: 'Configurações', to: '/settings' },
      ];

  // Define o título baseado no tipo de usuário
  const title = profile?.role === 'admin'
    ? 'Gestão do Administrador'
    : profile?.department?.name || 'Carregando...';

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <Building2 className="h-8 w-8" />
        <span className="text-xl font-bold">{title}</span>
      </div>

      <nav className="flex-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={signOut}
        className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors mt-auto"
      >
        <LogOut className="h-5 w-5" />
        <span>Sair</span>
      </button>
    </div>
  );
}