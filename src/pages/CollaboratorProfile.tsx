import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

interface Employee {
  id: string;
  nome: string;
  setores: string[];
}

interface SectorData {
  name: string;
  'Número de Funcionários': number;
}

const CollaboratorProfile: React.FC = () => {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [sectorData, setSectorData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'funcionarios'));
        const employees = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
        
        setTotalEmployees(employees.length);

        const sectorCount: { [key: string]: number } = {};
        employees.forEach(employee => {
          employee.setores.forEach(sector => {
            if (sectorCount[sector]) {
              sectorCount[sector]++;
            } else {
              sectorCount[sector] = 1;
            }
          });
        });

        const formattedSectorData = Object.keys(sectorCount).map(sector => ({
          name: sector,
          'Número de Funcionários': sectorCount[sector],
        }));

        setSectorData(formattedSectorData);
      } catch (error) {
        console.error("Erro ao buscar dados dos funcionários:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  if (loading) {
    return <div className="p-8">Carregando dados...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Perfil dos Colaboradores</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Número de Funcionários</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalEmployees}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow col-span-2">
          <h2 className="text-lg font-semibold text-gray-700">Gênero</h2>
          <div className="flex items-center mt-2">
            <div className="flex items-center mr-8">
              {/* Placeholder for female icon */}
              <span className="text-3xl mr-2">♀</span> 
              <div>
                <p className="text-xl font-bold">N/A</p>
                <p className="text-sm text-gray-600">Mulheres</p>
              </div>
            </div>
            <div className="flex items-center">
              {/* Placeholder for male icon */}
              <span className="text-3xl mr-2">♂</span>
              <div>
                <p className="text-xl font-bold">N/A</p>
                <p className="text-sm text-gray-600">Homens</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Funcionários por Setor</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            layout="vertical"
            data={sectorData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Número de Funcionários" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CollaboratorProfile; 