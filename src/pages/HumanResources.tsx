import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Funcionario {
  id: string;
  nome: string;
  empresaContratante?: string;
  salarioBruto?: number;
  adiantamentoSalarial?: number;
  descontos?: number;
}

interface FinancialInputData {
    [employeeId: string]: {
        salarioBruto: string;
        adiantamentoSalarial: string;
        descontos: string;
    }
}

interface GroupedEmployees {
  [key: string]: Funcionario[];
}

const formatCurrency = (value: number | undefined) => {
    if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const HumanResources: React.FC = () => {
  const [groupedEmployees, setGroupedEmployees] = useState<GroupedEmployees>({});
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialInputData>({});

  const fetchEmployees = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, 'funcionarios'));
    const employees = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Funcionario));
    
    const initialFinancialData: FinancialInputData = {};
    employees.forEach(emp => {
        initialFinancialData[emp.id] = {
            salarioBruto: String(emp.salarioBruto || 0),
            adiantamentoSalarial: String(emp.adiantamentoSalarial || 0),
            descontos: String(emp.descontos || 0),
        };
    });
    setFinancialData(initialFinancialData);

    const grouped = employees.reduce((acc, employee) => {
      const key = employee.empresaContratante || 'S/ REGISTRO';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(employee);
      return acc;
    }, {} as GroupedEmployees);

    setGroupedEmployees(grouped);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (employeeId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFinancialData(prev => ({
        ...prev,
        [employeeId]: {
            ...prev[employeeId],
            [name]: value,
        }
    }));
  };

  const handleSave = async (employeeId: string) => {
    const employeeRef = doc(db, 'funcionarios', employeeId);
    const dataToSave = financialData[employeeId];
    try {
        await updateDoc(employeeRef, {
            salarioBruto: parseFloat(dataToSave.salarioBruto) || 0,
            adiantamentoSalarial: parseFloat(dataToSave.adiantamentoSalarial) || 0,
            descontos: parseFloat(dataToSave.descontos) || 0,
        });
        alert('Funcionário atualizado com sucesso!');
        fetchEmployees(); // Re-fetch to show updated data and recalculate totals
    } catch (error) {
        console.error("Erro ao atualizar funcionário: ", error);
        alert("Falha ao salvar.");
    }
  };

  const exportToExcel = () => {
    const worksheetData: any[][] = [];
    
    sortedGroupKeys.forEach(groupName => {
        worksheetData.push([groupName]);
        worksheetData.push(['NOME', 'SALÁRIO BRUTO', 'ADIANT. DE SALÁRIO', 'DESCONTOS', 'PAG. LÍQUIDO']);
        
        const employees = groupedEmployees[groupName];
        employees.forEach(emp => {
            const liquido = (emp.salarioBruto || 0) - (emp.adiantamentoSalarial || 0) - (emp.descontos || 0);
            worksheetData.push([
                emp.nome,
                emp.salarioBruto || 0,
                emp.adiantamentoSalarial || 0,
                emp.descontos || 0,
                liquido
            ]);
        });
        // Add total row for the group
        const totalSalario = employees.reduce((sum, emp) => sum + (emp.salarioBruto || 0), 0);
        const totalAdiantamento = employees.reduce((sum, emp) => sum + (emp.adiantamentoSalarial || 0), 0);
        const totalDescontos = employees.reduce((sum, emp) => sum + (emp.descontos || 0), 0);
        const totalLiquido = totalSalario - totalAdiantamento - totalDescontos;
        worksheetData.push(['TOTAL', totalSalario, totalAdiantamento, totalDescontos, totalLiquido]);
        worksheetData.push([]); // Empty row for spacing
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Folha de Pagamento");
    XLSX.writeFile(wb, "folha_de_pagamento.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableData: any[] = [];
    
    sortedGroupKeys.forEach(groupName => {
        const employees = groupedEmployees[groupName];
        const groupRows = employees.map(emp => {
            const liquido = (emp.salarioBruto || 0) - (emp.adiantamentoSalarial || 0) - (emp.descontos || 0);
            return [emp.nome, formatCurrency(emp.salarioBruto), formatCurrency(emp.adiantamentoSalarial), formatCurrency(emp.descontos), formatCurrency(liquido)];
        });

        (doc as any).autoTable({
            head: [[{ content: groupName, colSpan: 5, styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } }]],
            body: groupRows,
            theme: 'grid',
            headStyles: { fillColor: [211, 211, 211] },
        });
    });
    
    doc.save("folha_de_pagamento.pdf");
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  const renderTableForGroup = (groupName: string, employees: Funcionario[]) => {
    const totalSalario = employees.reduce((sum, emp) => sum + (emp.salarioBruto || 0), 0);
    const totalAdiantamento = employees.reduce((sum, emp) => sum + (emp.adiantamentoSalarial || 0), 0);
    const totalDescontos = employees.reduce((sum, emp) => sum + (emp.descontos || 0), 0);
    const totalLiquido = totalSalario - totalAdiantamento - totalDescontos;

    return (
      <div key={groupName} className="mb-8">
        <h2 className="text-xl font-bold bg-gray-200 p-2 rounded-t-lg">{groupName}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-b-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-2 px-4 w-1/4">NOME</th>
                <th className="text-right py-2 px-4">SALÁRIO BRUTO</th>
                <th className="text-right py-2 px-4">ADIANT. DE SALÁRIO</th>
                <th className="text-right py-2 px-4">DESCONTOS</th>
                <th className="text-right py-2 px-4">PAG. LÍQUIDO</th>
                <th className="text-center py-2 px-4">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const currentData = financialData[emp.id] || { salarioBruto: '0', adiantamentoSalarial: '0', descontos: '0' };
                const liquido = (parseFloat(currentData.salarioBruto) || 0) - 
                                (parseFloat(currentData.adiantamentoSalarial) || 0) - 
                                (parseFloat(currentData.descontos) || 0);

                return (
                  <tr key={emp.id} className="border-b">
                    <td className="py-2 px-4">{emp.nome}</td>
                    <td className="py-1 px-2">
                        <input type="number" name="salarioBruto" value={currentData.salarioBruto} onChange={(e) => handleInputChange(emp.id, e)} className="w-full text-right p-1 border rounded"/>
                    </td>
                    <td className="py-1 px-2">
                        <input type="number" name="adiantamentoSalarial" value={currentData.adiantamentoSalarial} onChange={(e) => handleInputChange(emp.id, e)} className="w-full text-right p-1 border rounded"/>
                    </td>
                    <td className="py-1 px-2">
                        <input type="number" name="descontos" value={currentData.descontos} onChange={(e) => handleInputChange(emp.id, e)} className="w-full text-right p-1 border rounded"/>
                    </td>
                    <td className="text-right py-2 px-4 font-bold">{formatCurrency(liquido)}</td>
                    <td className="text-center py-2 px-4">
                        <button onClick={() => handleSave(emp.id)} className="bg-blue-600 text-white font-bold py-1 px-3 rounded hover:bg-blue-700">
                            Salvar
                        </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-gray-100">
                <td className="text-left py-2 px-4">TOTAL</td>
                <td className="text-right py-2 px-4">{formatCurrency(totalSalario)}</td>
                <td className="text-right py-2 px-4">{formatCurrency(totalAdiantamento)}</td>
                <td className="text-right py-2 px-4">{formatCurrency(totalDescontos)}</td>
                <td className="text-right py-2 px-4">{formatCurrency(totalLiquido)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };
  
  const companyOrder = ['HOSPI BIO', 'JOMAR', 'BGF', 'LICITAMED', 'S/ REGISTRO'];
  const sortedGroupKeys = Object.keys(groupedEmployees).sort((a, b) => {
    const indexA = companyOrder.indexOf(a);
    const indexB = companyOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const grandTotal = Object.values(groupedEmployees).flat().reduce((acc, emp) => {
      acc.salario += emp.salarioBruto || 0;
      acc.adiantamento += emp.adiantamentoSalarial || 0;
      acc.descontos += emp.descontos || 0;
      return acc;
  }, { salario: 0, adiantamento: 0, descontos: 0 });

  const grandTotalLiquido = grandTotal.salario - grandTotal.adiantamento - grandTotal.descontos;


  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Folha de Pagamento</h1>
        <div className="flex space-x-2">
            <button onClick={exportToExcel} className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700">Exportar para Excel</button>
            <button onClick={exportToPDF} className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700">Exportar para PDF</button>
        </div>
      </div>
      {sortedGroupKeys.map(groupName => renderTableForGroup(groupName, groupedEmployees[groupName]))}

      <div className="mt-8 pt-4 border-t-2 border-gray-400">
        <h2 className="text-2xl font-bold mb-2">Total Geral</h2>
        <div className="flex justify-end">
            <table className="w-1/2">
                <tbody>
                    <tr className="text-right">
                        <td className="font-bold py-1 pr-4">Salário Bruto Total:</td>
                        <td>{formatCurrency(grandTotal.salario)}</td>
                    </tr>
                    <tr className="text-right">
                        <td className="font-bold py-1 pr-4">Adiantamento Total:</td>
                        <td>{formatCurrency(grandTotal.adiantamento)}</td>
                    </tr>
                    <tr className="text-right">
                        <td className="font-bold py-1 pr-4">Descontos Totais:</td>
                        <td>{formatCurrency(grandTotal.descontos)}</td>
                    </tr>
                    <tr className="text-right text-lg font-bold border-t mt-2 pt-2">
                        <td className="py-2 pr-4">Pagamento Líquido Total:</td>
                        <td>{formatCurrency(grandTotalLiquido)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default HumanResources; 