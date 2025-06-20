import React, { useState, useEffect, useMemo } from 'react';
import { DocumentData, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, where, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

// --- Interfaces ---
interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  status: 'Pendente' | 'Em andamento' | 'Concluída';
  responsavelId?: string;
  responsavelNome?: string;
  setor: string;
}

interface Funcionario {
  id: string;
  nome: string;
}

// --- Sub-componente: Barra de Progresso ---
const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
    </div>
);

// --- Componente Principal ---
interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: DocumentData | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
    const { userRole, currentUser } = useAuth();
    const [tasks, setTasks] = useState<Tarefa[]>([]);
    const [employees, setEmployees] = useState<Funcionario[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(true);

    const [taskTitle, setTaskTitle] = useState('');
    const [taskDesc, setTaskDesc] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    const canManageTasks = userRole === 'administrador' || userRole === 'gerente';

    // Busca as tarefas do pedido e setor atual
    useEffect(() => {
        if (!isOpen || !order) return;
        setLoadingTasks(true);
        const tasksRef = collection(db, 'pedidos', order.id, 'tarefas');
        const q = query(tasksRef, where('setor', '==', order.setorAtual));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tarefa));
            setTasks(tasksData);
            setLoadingTasks(false);
        });
        return () => unsubscribe();
    }, [isOpen, order]);

    // Busca os funcionários que pertencem ao setor atual
    useEffect(() => {
        if (!isOpen || !order) return;
        const employeesRef = collection(db, 'funcionarios');
        const q = query(employeesRef, where('setores', 'array-contains', order.setorAtual));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const empData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Funcionario));
            setEmployees(empData);
        });
        return () => unsubscribe();
    }, [isOpen, order]);
    
    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskTitle || !order) return;

        const assignedEmployee = employees.find(emp => emp.id === assignedTo);

        await addDoc(collection(db, 'pedidos', order.id, 'tarefas'), {
            titulo: taskTitle,
            descricao: taskDesc,
            status: 'Pendente',
            setor: order.setorAtual,
            responsavelId: assignedTo || null,
            responsavelNome: assignedEmployee?.nome || 'Ninguém',
            criadoEm: serverTimestamp(),
            criadoPor: currentUser?.email,
        });

        setTaskTitle('');
        setTaskDesc('');
        setAssignedTo('');
    };
    
    const handleUpdateTaskStatus = async (taskId: string, newStatus: Tarefa['status']) => {
        if(!order) return;
        const taskRef = doc(db, 'pedidos', order.id, 'tarefas', taskId);
        await updateDoc(taskRef, { status: newStatus });
    };

    const progress = useMemo(() => {
        if (tasks.length === 0) return 0;
        const completed = tasks.filter(t => t.status === 'Concluída').length;
        return (completed / tasks.length) * 100;
    }, [tasks]);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Data pendente';
        if (timestamp.toDate) return timestamp.toDate().toLocaleString('pt-BR');
        return new Date(timestamp).toLocaleString('pt-BR');
    };

    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-3xl m-4 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold text-gray-800">Detalhes do Pedido #{order.numeroPedido}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                    </div>
                    <div className="mt-4 border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><strong className="font-semibold text-gray-700">Órgão Comprador:</strong> {order.orgaoComprador}</div>
                            <div><strong className="font-semibold text-gray-700">Setor Atual:</strong> <span className="font-mono bg-gray-200 text-gray-800 px-2 py-1 rounded">{order.setorAtual}</span></div>
                            <div><strong className="font-semibold text-gray-700">Data do Pedido:</strong> {formatDate(order.criadoEm)}</div>
                            <div><strong className="font-semibold text-gray-700">Status:</strong> {order.status}</div>
                        </div>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 space-y-6 mt-6">
                    {/* Itens do Pedido */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Itens do Pedido</h3>
                        <ul className="list-disc list-inside bg-gray-50 p-3 rounded-md">
                            {order.items.map((item: any, index: number) => (
                                <li key={index} className="text-gray-700">{item.quantidade}x {item.modelo} - {item.descricao}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Tarefas do Setor */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Tarefas do Setor: {order.setorAtual}</h3>
                        <div className="flex items-center mb-4">
                            <span className="text-sm font-medium text-gray-700 mr-2">{Math.round(progress)}% Concluído</span>
                            <ProgressBar value={progress} />
                        </div>
                        
                        <div className="space-y-3">
                            {loadingTasks ? <p>Carregando tarefas...</p> : tasks.map(task => (
                                <div key={task.id} className="bg-gray-50 p-3 rounded-md border">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">{task.titulo}</p>
                                            <p className="text-sm text-gray-600">{task.descricao}</p>
                                            <p className="text-xs text-gray-500 mt-1">Responsável: {task.responsavelNome}</p>
                                        </div>
                                        {canManageTasks && (
                                            <select value={task.status} onChange={e => handleUpdateTaskStatus(task.id, e.target.value as Tarefa['status'])} className="text-sm rounded-md border-gray-300">
                                                <option value="Pendente">Pendente</option>
                                                <option value="Em andamento">Em andamento</option>
                                                <option value="Concluída">Concluída</option>
                                            </select>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {tasks.length === 0 && !loadingTasks && <p className="text-sm text-gray-500">Nenhuma tarefa para este setor.</p>}
                        </div>

                        {canManageTasks && (
                            <form onSubmit={handleAddTask} className="mt-6 pt-4 border-t">
                                <h4 className="font-semibold mb-2">Adicionar Nova Tarefa</h4>
                                <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Título da tarefa" className="w-full p-2 border rounded-md mb-2" required />
                                <textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Descrição" className="w-full p-2 border rounded-md mb-2"></textarea>
                                <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full p-2 border rounded-md mb-2">
                                    <option value="">Designar a (opcional)</option>
                                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}
                                </select>
                                <button type="submit" className="px-4 py-2 bg-[#63C6DA] text-white font-bold rounded-md hover:bg-opacity-90">Adicionar Tarefa</button>
                            </form>
                        )}
                    </div>

                    {/* Histórico de Movimentações */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Histórico de Movimentações</h3>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-3 bg-gray-50">
                            {order.historico && order.historico.length > 0 ? (
                                order.historico.slice().reverse().map((entry: any, index: number) => (
                                    <div key={index} className="text-sm border-b last:border-b-0 py-2">
                                        <p className="font-semibold">{entry.acao}</p>
                                        <p className="text-xs text-gray-500">{formatDate(entry.timestamp)} por {entry.usuario}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">Nenhuma movimentação registrada.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 mt-6 text-right">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal; 