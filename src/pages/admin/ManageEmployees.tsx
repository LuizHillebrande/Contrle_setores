import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { SECTOR_ORDER } from '../../config/sectors';
import { useAuth } from '../../contexts/AuthContext';

interface Funcionario {
  id: string; // ID do documento do Firestore
  chapa: string;
  nome: string;
  setores: string[];
  empresaContratante?: string;
}

const EMPRESAS = ['HOSPI BIO', 'JOMAR', 'BGF', 'LICITAMED', 'S/ REGISTRO'];

export default function ManageEmployees() {
  const { userRole } = useAuth();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  
  // State for the form
  const [chapa, setChapa] = useState('');
  const [nome, setNome] = useState('');
  const [setoresSelecionados, setSetoresSelecionados] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Campos de RH
  const [empresaContratante, setEmpresaContratante] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'funcionarios'), (snapshot) => {
      const funcionariosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Funcionario));
      setFuncionarios(funcionariosData.sort((a, b) => a.nome.localeCompare(b.nome)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSectorChange = (sector: string) => {
    setSetoresSelecionados(prev => 
      prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]
    );
  };

  const clearForm = () => {
    setChapa('');
    setNome('');
    setSetoresSelecionados([]);
    setEditingId(null);
    setEmpresaContratante('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapa || !nome) {
      alert('Por favor, preencha a chapa и o nome.');
      return;
    }
    setIsSubmitting(true);

    const employeeData: Omit<Funcionario, 'id' | 'salarioBruto' | 'adiantamentoSalarial' | 'descontos'> & { empresaContratante?: string } = { 
      chapa, 
      nome, 
      setores: setoresSelecionados,
      ...(userRole === 'administrador' && {
        empresaContratante,
      })
    };
    
    const docData: any = { chapa, nome, setores: setoresSelecionados };
    if (userRole === 'administrador') {
        docData.empresaContratante = empresaContratante;
    }

    try {
      if (editingId) {
        // Atualizar funcionário existente
        await setDoc(doc(db, 'funcionarios', editingId), docData, { merge: true });
      } else {
        // Adicionar novo funcionário - campos financeiros serão zerados
        docData.salarioBruto = 0;
        docData.adiantamentoSalarial = 0;
        docData.descontos = 0;
        await addDoc(collection(db, 'funcionarios'), docData);
      }
      clearForm();
    } catch (error) {
      console.error("Erro ao salvar funcionário: ", error);
      alert("Falha ao salvar funcionário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (func: Funcionario) => {
    setEditingId(func.id);
    setChapa(func.chapa);
    setNome(func.nome);
    setSetoresSelecionados(func.setores);
    if(userRole === 'administrador') {
      setEmpresaContratante(func.empresaContratante || '');
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este funcionário?")) {
      try {
        await deleteDoc(doc(db, 'funcionarios', id));
      } catch (error) {
        console.error("Erro ao excluir funcionário: ", error);
        alert("Falha ao excluir funcionário.");
      }
    }
  };

  const handleImportInitialData = async () => {
    setIsImporting(true);
    // A lista de funcionários será adicionada aqui depois
    const initialEmployees: Omit<Funcionario, 'id'>[] = [
      { chapa: '158', nome: 'ADRIANO PEREIRA DOS SANTOS', setores: [] },
      { chapa: '160', nome: 'CARLOS DOMINGOS DA CRUZ', setores: [] },
      { chapa: '240', nome: 'CELSO APARECIDO DA SILVA', setores: [] },
      { chapa: '224', nome: 'IZAIAS ROGER SANTOS RAMALHO', setores: [] },
      { chapa: '244', nome: 'JOSE APARECIDO DOS SANTOS', setores: [] },
      { chapa: '201', nome: 'JOSE NEWTON BATISTA DOS SANTOS', setores: [] },
      { chapa: '239', nome: 'SUELI MASACANI', setores: [] },
      { chapa: '181', nome: 'TIAGO PEREIRA MARCHI', setores: [] },
      { chapa: '220', nome: 'VITOR HENRIQUE FLORENTINO CARDOZO', setores: [] },
      { chapa: '3', nome: 'YURE HENRIQUE GALVAO MONTEIRO', setores: [] },
      { chapa: '901', nome: 'DALCEU GONSALVES FERREIRA', setores: [] },
      { chapa: '21', nome: 'CAIO ALEXANDRE CARVALHO MARCELINO', setores: [] },
      { chapa: '23', nome: 'ALEXANDRE DOS SANTOS', setores: [] },
      { chapa: '25', nome: 'LUIS FERNANDO BARBOSA CAETANO', setores: [] },
      { chapa: '26', nome: 'MARCOS PAULO ALVES DOS SANTOS', setores: [] },
      { chapa: '30', nome: 'SEBASTIAO DE JESUS MACENA', setores: [] },
      { chapa: '31', nome: 'REGINALDO ZICHINELI SOARES', setores: [] },
      { chapa: '32', nome: 'VICTOR GABRIEL BARROS DE SOUZA', setores: [] },
      { chapa: '34', nome: 'SERGIO APARECIDO ROSSI', setores: [] },
      { chapa: '35', nome: 'CLAITON DE JESUS MARCOLINO', setores: [] },
      { chapa: '900', nome: 'CLAUDIO JOSE HILLEBRANDE', setores: [] },
    ];

    try {
      for (const func of initialEmployees) {
        await addDoc(collection(db, 'funcionarios'), func);
      }
      alert('Funcionários iniciais importados com sucesso!');
    } catch (error) {
      console.error("Erro ao importar funcionários: ", error);
      alert("Falha na importação.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Gestão de Funcionários</h2>
      
      <div ref={formRef} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">{editingId ? 'Editando Funcionário' : 'Adicionar Novo Funcionário'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="chapa" className="block text-sm font-medium text-gray-700">Chapa</label>
              <input type="text" id="chapa" value={chapa} onChange={e => setChapa(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
            </div>
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome Completo</label>
              <input type="text" id="nome" value={nome} onChange={e => setNome(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
            </div>
          </div>
          {userRole === 'administrador' && (
            <div className="grid grid-cols-1 pt-4 border-t mt-4">
              <div>
                <label htmlFor="empresaContratante" className="block text-sm font-medium text-gray-700">Empresa Contratante</label>
                <select id="empresaContratante" value={empresaContratante} onChange={e => setEmpresaContratante(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                  <option value="">Selecione...</option>
                  {EMPRESAS.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                </select>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Setores</label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {SECTOR_ORDER.map(sector => (
                <label key={sector} className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={setoresSelecionados.includes(sector)} 
                    onChange={() => handleSectorChange(sector)}
                    className="rounded border-gray-300 text-[#63C6DA] focus:ring-[#63C6DA]"
                  />
                  <span>{sector}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            {editingId && (
              <button type="button" onClick={clearForm} className="py-2 px-4 bg-gray-200 text-gray-800 font-bold rounded-md hover:bg-gray-300">
                Cancelar Edição
              </button>
            )}
            <button type="submit" disabled={isSubmitting} className="py-2 px-6 bg-[#63C6DA] text-white font-bold rounded-md hover:bg-opacity-90 disabled:bg-gray-400">
              {isSubmitting ? 'Salvando...' : (editingId ? 'Salvar Alterações' : 'Adicionar Funcionário')}
            </button>
          </div>
        </form>
      </div>

      {/* Botão de Importação */}
      {funcionarios.length === 0 && !loading && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-lg shadow-md">
            <h4 className="font-bold">Primeiro acesso?</h4>
            <p>Clique no botão abaixo para cadastrar a lista inicial de 21 funcionários.</p>
            <button
                onClick={handleImportInitialData}
                disabled={isImporting}
                className="mt-3 py-2 px-4 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
                {isImporting ? 'Importando...' : 'Importar Dados Iniciais'}
            </button>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Funcionários Cadastrados</h3>
        {loading ? <p>Carregando...</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chapa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setores</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {funcionarios.map(func => (
                  <tr key={func.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">{func.chapa}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{func.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {func.setores && func.setores.length > 0 ? 
                        func.setores.map(s => <span key={s} className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-1 mb-1">{s}</span>) : 
                        <span className="text-gray-400 text-xs">Nenhum setor</span>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(func)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                      <button onClick={() => handleDelete(func.id)} className="text-red-600 hover:text-red-900 ml-4">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 