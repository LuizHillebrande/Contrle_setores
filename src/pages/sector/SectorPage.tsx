import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../../firebase/config';
import OrderCard from '../../components/OrderCard';
import OrderDetailsModal from '../../components/OrderDetailsModal';

interface SectorPageProps {
  sectorName: string;
  HeaderActionsComponent?: React.ComponentType;
}

export default function SectorPage({ sectorName, HeaderActionsComponent }: SectorPageProps) {
    const [orders, setOrders] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<DocumentData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        const ordersRef = collection(db, 'pedidos');
        const q = query(ordersRef, where('setorAtual', '==', sectorName));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(ordersData);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar pedidos: ", error);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [sectorName]);

    const handleViewDetails = (order: DocumentData) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">{sectorName}</h2>
                {HeaderActionsComponent && <HeaderActionsComponent />}
            </div>
            
            {loading ? (
                <p>Carregando pedidos...</p>
            ) : orders.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-xl font-semibold mb-4">Nenhum pedido neste setor</h3>
                    <p className="text-gray-500">Quando um pedido for encaminhado para {sectorName}, ele aparecerá aqui.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orders.map(order => (
                        <OrderCard key={order.id} order={order} onViewDetails={handleViewDetails} />
                    ))}
                </div>
            )}

            <OrderDetailsModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                order={selectedOrder}
            />
        </div>
    );
} 