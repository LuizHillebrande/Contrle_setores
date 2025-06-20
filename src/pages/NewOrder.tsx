import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

interface OrderItem {
  modelo: string;
  codigo: string;
  descricao: string;
  quantidade: number;
  cor: string;
  destino: string;
}

export default function NewOrder() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [numeroPedido, setNumeroPedido] = useState('');
  const [orgaoComprador, setOrgaoComprador] = useState('');
  const [items, setItems] = useState<OrderItem[]>([
    { modelo: '', codigo: '', descricao: '', quantidade: 1, cor: '', destino: '' }
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { modelo: '', codigo: '', descricao: '', quantidade: 1, cor: '', destino: '' }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Você precisa estar logado para criar um pedido.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Etapa 1: Crie o documento sem o campo 'historico'
      const docRef = await addDoc(collection(db, 'pedidos'), {
        numeroPedido,
        orgaoComprador,
        items,
        setorAtual: 'Comercial',
        status: 'Pendente',
        criadoEm: serverTimestamp(),
        criadoPor: currentUser.uid,
      });

      // Etapa 2: Atualize o documento para adicionar o campo 'historico' com a primeira entrada
      await updateDoc(docRef, {
        historico: [{
            timestamp: new Date(),
            usuario: currentUser.email,
            acao: 'Pedido criado no setor Comercial.'
        }]
      });

      navigate('/comercial');
    } catch (err) {
      console.error('Erro detalhado ao criar pedido:', err);
      setError(`Falha ao criar o pedido: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Cadastrar Nova Ordem de Compra</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="numeroPedido" className="block text-sm font-medium text-gray-700">Número do Pedido</label>
            <input type="text" id="numeroPedido" value={numeroPedido} onChange={(e) => setNumeroPedido(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div>
            <label htmlFor="orgaoComprador" className="block text-sm font-medium text-gray-700">Órgão Comprador</label>
            <input type="text" id="orgaoComprador" value={orgaoComprador} onChange={(e) => setOrgaoComprador(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
          </div>
        </div>

        <h3 className="text-xl font-semibold border-t pt-4 mt-6">Itens do Pedido</h3>
        {items.map((item, index) => (
          <div key={index} className="p-4 border rounded-md space-y-4 relative">
             <button type="button" onClick={() => removeItem(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Modelo" value={item.modelo} onChange={(e) => handleItemChange(index, 'modelo', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm" />
              <input type="text" placeholder="Código" value={item.codigo} onChange={(e) => handleItemChange(index, 'codigo', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm" />
              <input type="number" placeholder="Quantidade" value={item.quantidade} onChange={(e) => handleItemChange(index, 'quantidade', parseInt(e.target.value, 10))} className="block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <textarea placeholder="Descrição Técnica" value={item.descricao} onChange={(e) => handleItemChange(index, 'descricao', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Cor/Acabamento" value={item.cor} onChange={(e) => handleItemChange(index, 'cor', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm" />
              <input type="text" placeholder="Destino (Cliente Final)" value={item.destino} onChange={(e) => handleItemChange(index, 'destino', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
          </div>
        ))}

        <button type="button" onClick={addItem} className="text-blue-600 hover:text-blue-800 font-medium">+ Adicionar outro item</button>

        {error && <p className="text-red-500">{error}</p>}
        
        <div className="border-t pt-4 flex justify-end">
          <button type="submit" disabled={loading} className="py-2 px-6 bg-[#63C6DA] text-white font-bold rounded-md hover:bg-opacity-90 disabled:bg-gray-400">
            {loading ? 'Salvando...' : 'Salvar Pedido'}
          </button>
        </div>
      </form>
    </div>
  );
} 