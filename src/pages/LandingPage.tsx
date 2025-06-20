import React from 'react';
import { Link } from 'react-router-dom';
import landingLogo from '../assets/logo-landing.png';

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section 
        className="relative bg-white py-32 bg-cover bg-center"
        style={{ backgroundImage: `url(${landingLogo})` }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-60"></div>
        <div className="relative container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight">
            Sistema de Controle de Setores
          </h1>
          <p className="text-lg text-gray-700 font-medium mt-4 max-w-2xl mx-auto">
            Otimize o fluxo de trabalho e acompanhe cada etapa dos pedidos da Levita Móveis Hospitalares, do setor Comercial ao Faturamento.
          </p>
          <Link to="/login" className="mt-8 inline-block bg-[#63C6DA] text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-opacity-90 transition-colors shadow-lg">
            Acessar o Sistema
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Funcionalidades Principais</h2>
            <p className="text-gray-600 mt-2">Tecnologia e eficiência para a gestão da produção.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">Visão por Setor</h3>
              <p>Acompanhe os pedidos em cada fase do processo: Comercial, Compras, Produção, Montagem, Expedição e Faturamento.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">Gestão de Tarefas</h3>
              <p>Crie e atribua tarefas específicas para cada pedido dentro de seu respectivo setor, com acompanhamento de status.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">Controle de Acesso</h3>
              <p>Perfis de usuário (Operador, Gerente, Administrador) com permissões específicas para cada funcionalidade do sistema.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 