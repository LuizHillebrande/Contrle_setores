import React, { useState } from 'react';
import { DocumentData, doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { SECTOR_ORDER } from '../config/sectors';

const getNextSector = (currentSector: string): string | null => {
  const currentIndex = SECTOR_ORDER.indexOf(currentSector);
  if (currentIndex === -1 || currentIndex === SECTOR_ORDER.length - 1) {
    return null; // This is the last sector or not found
  }
  return SECTOR_ORDER[currentIndex + 1];
};

interface OrderCardProps {
    order: DocumentData;
    onViewDetails: (order: DocumentData) => void;
}

const OrderCard = ({ order, onViewDetails }: OrderCardProps) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleForwardOrder = async () => {
        if (!currentUser) return;
        
        const nextSector = getNextSector(order.setorAtual);
        if (!nextSector) {
            alert("Este é o último setor do fluxo.");
            return;
        }

        setLoading(true);
        const orderDocRef = doc(db, 'pedidos', order.id);

        try {
            await updateDoc(orderDocRef, {
                setorAtual: nextSector,
                status: 'Em andamento',
                historico: arrayUnion({
                    timestamp: new Date(),
                    usuario: currentUser.email,
                    acao: `Movido do setor ${order.setorAtual} para ${nextSector}.`
                })
            });
        } catch (error) {
            console.error("Erro ao encaminhar pedido:", error);
            alert("Falha ao encaminhar o pedido.");
        } finally {
            setLoading(false);
        }
    };
    
    const isLastSector = SECTOR_ORDER.indexOf(order.setorAtual) === SECTOR_ORDER.length - 1;

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
                <h4 className="text-lg font-bold text-gray-800">Pedido #{order.numeroPedido}</h4>
                <p className="text-sm text-gray-600">{order.orgaoComprador}</p>
                <div className="mt-2 text-xs">
                    {order.items.map((item: any, index: number) => (
                        <span key={index} className="inline-block bg-gray-200 rounded-full px-2 py-1 mr-1 mb-1">
                            {item.quantidade}x {item.modelo}
                        </span>
                    ))}
                </div>
            </div>
            <div className="mt-4 border-t pt-3 flex justify-end space-x-2">
                <button 
                    onClick={() => onViewDetails(order)}
                    className="text-sm bg-gray-200 text-gray-800 font-bold py-1 px-3 rounded-md hover:bg-gray-300">
                    Ver Detalhes
                </button>
                <button 
                    onClick={handleForwardOrder}
                    disabled={loading || isLastSector}
                    className="text-sm bg-[#63C6DA] text-white font-bold py-1 px-3 rounded-md hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? '...' : (isLastSector ? 'Finalizado' : 'Concluir e Encaminhar')}
                </button>
            </div>
        </div>
    );
};

export default OrderCard; 