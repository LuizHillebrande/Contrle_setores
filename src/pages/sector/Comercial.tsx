import React from 'react';
import { Link } from 'react-router-dom';
import SectorPage from './SectorPage';

export default function Comercial() {
  const HeaderActions = () => (
    <Link to="/pedidos/novo">
      <button className="bg-[#63C6DA] text-white font-bold py-2 px-4 rounded-md hover:bg-opacity-90">
        + Nova Ordem de Compra
      </button>
    </Link>
  );

  return <SectorPage sectorName="Comercial" HeaderActionsComponent={HeaderActions} />;
} 