import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo-.png';

export default function LandingHeader() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="h-10">
          <img src={Logo} alt="Levita Móveis Hospitalares" className="h-full" />
        </div>
        <nav>
          <Link to="/login" className="bg-[#63C6DA] text-white font-bold py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors">
            Acessar Sistema
          </Link>
        </nav>
      </div>
    </header>
  );
} 