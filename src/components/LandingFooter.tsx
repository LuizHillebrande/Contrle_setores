import React from 'react';

export default function LandingFooter() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold">Levita Móveis Hospitalares</h3>
            <p className="text-gray-400">R. Topázio, 64 - Jd. Cristal, Cambé/PR</p>
          </div>
          <div className="mb-4 md:mb-0">
            <h4 className="font-semibold">Contato</h4>
            <p className="text-gray-400">(43) 3154-4455 / (43) 3035-8750</p>
            <p className="text-gray-400">comercial@levitamoveis.com.br</p>
          </div>
          <div>
            <h4 className="font-semibold">Horário de Atendimento</h4>
            <p className="text-gray-400">Segunda a Sexta, das 8h às 18h</p>
          </div>
        </div>
        <div className="text-center text-gray-500 border-t border-gray-700 mt-8 pt-6">
          <p>Copyright © 2024 LEVITA Móveis Hospitalares - Todos os direitos reservados.</p>
          <p className="text-sm mt-1">Sistema de Controle de Setores</p>
        </div>
      </div>
    </footer>
  );
} 