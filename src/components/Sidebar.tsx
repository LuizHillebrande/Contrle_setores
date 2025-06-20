import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../assets/logo-.png';

const sectors = [
  { name: 'Comercial', path: '/comercial' },
  { name: 'Compras', path: '/compras' },
  { name: 'Montagem', path: '/montagem' },
  { name: 'Produção', path: '/producao' },
  { name: 'Expedição', path: '/expedicao' },
  { name: 'Faturamento', path: '/faturamento' },
];

interface SidebarProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setOpen }: SidebarProps) {
  const { userRole, logout } = useAuth();
  const activeLinkClass = "bg-[#63C6DA] text-white";
  const inactiveLinkClass = "text-gray-300 hover:bg-gray-700 hover:text-white";
  
  // Classes para controlar a visibilidade e transição
  const baseClasses = "bg-gray-800 text-white flex flex-col transition-all duration-300 ease-in-out";
  const sidebarOpenClasses = "w-64";
  const sidebarClosedClasses = "w-0";
  const mobileOverlayClasses = "fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    }
  };

  return (
    <>
      {/* Overlay para fechar o menu em telas pequenas */}
      {isOpen && <div onClick={() => setOpen(false)} className={mobileOverlayClasses}></div>}
      
      <div className={`h-full ${baseClasses} ${isOpen ? sidebarOpenClasses : sidebarClosedClasses} lg:relative fixed z-20 overflow-x-hidden`}>
        <div className="h-16 flex-shrink-0 flex items-center justify-center p-2">
          {isOpen && <img src={Logo} alt="Levita Logo" className="h-10" />}
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {sectors.map((sector) => (
            <NavLink key={sector.name} to={sector.path} className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? activeLinkClass : inactiveLinkClass}`}>
              {sector.name}
            </NavLink>
          ))}

          {userRole === 'administrador' && (
            <div className="pt-4 mt-4 border-t border-gray-700">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Administração</h3>
              <div className="mt-2 space-y-1">
                <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                  Controle de Usuários
                </Link>
                <Link to="/admin/funcionarios" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                  Funcionários
                </Link>
              </div>
            </div>
          )}
        </nav>

        <div className="flex-shrink-0 p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="w-full flex items-center justify-center p-2 rounded-md text-red-300 hover:bg-red-600 hover:text-white">
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>
    </>
  );
} 