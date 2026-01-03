
import React, { useState, useEffect } from 'react';
import { CreditCard, Transaction } from '../types';
import { RefreshCw, Trash2 } from 'lucide-react';

interface TransactionFormProps {
  cards: CreditCard[];
  onSave: (transaction: Transaction) => void;
  onDelete?: (id: string) => void; // Prop opcional para exclusão
  onClose: () => void;
  editData?: Transaction | null;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

const TransactionForm: React.FC<TransactionFormProps> = ({ cards, onSave, onDelete, onClose, editData }) => {
  const [formData, setFormData] = useState({
    description: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
    cardId: cards[0]?.id || '',
    installments: '1',
    isRecurring: false
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        description: editData.description,
        value: editData.value.toString(),
        date: new Date(editData.date).toISOString().split('T')[0],
        cardId: editData.cardId,
        installments: editData.installments.toString(),
        isRecurring: editData.isRecurring || false
      });
    }
  }, [editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cardId) return alert('Por favor, selecione um cartão de crédito.');
    if (parseFloat(formData.value) <= 0) return alert('O valor da compra deve ser maior que zero.');

    const transaction: Transaction = {
      id: editData?.id || generateId(),
      description: formData.description,
      value: parseFloat(formData.value),
      date: new Date(formData.date).toISOString(),
      cardId: formData.cardId,
      installments: formData.isRecurring ? 1 : parseInt(formData.installments),
      isRecurring: formData.isRecurring
    };

    onSave(transaction);
  };

  const handleDelete = () => {
    if (editData && onDelete) {
      onDelete(editData.id);
      onClose();
    }
  };

  const installmentValue = parseFloat(formData.value) / parseInt(formData.installments);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {editData ? 'Detalhes da Compra' : 'Novo Registro'}
          </h2>
          {editData && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
              title="Excluir este registro permanentemente"
            >
              <Trash2 size={16} /> Excluir
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
            <input
              required
              type="text"
              className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ex: Netflix, Supermercado..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl cursor-pointer select-none" onClick={() => setFormData({...formData, isRecurring: !formData.isRecurring})}>
            <input 
              type="checkbox" 
              checked={formData.isRecurring} 
              onChange={() => {}} 
              className="w-4 h-4 rounded text-blue-600"
            />
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <RefreshCw size={14} className={formData.isRecurring ? 'animate-spin-slow text-blue-500' : ''} />
                Gasto Recorrente (Assinatura)
              </p>
              <p className="text-[10px] text-slate-500">Repete automaticamente todos os meses.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor Total (R$)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0,00"
                value={formData.value}
                onChange={e => setFormData({ ...formData, value: e.target.value })}
              />
            </div>
            {!formData.isRecurring && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Parcelas</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.installments}
                  onChange={e => setFormData({ ...formData, installments: e.target.value })}
                >
                  {[...Array(24)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}x</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Início</label>
            <input
              required
              type="date"
              className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cartão Utilizado</label>
            <select
              required
              className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.cardId}
              onChange={e => setFormData({ ...formData, cardId: e.target.value })}
            >
              <option value="">Selecione um cartão</option>
              {cards.map(card => (
                <option key={card.id} value={card.id}>{card.name}</option>
              ))}
            </select>
          </div>

          {!formData.isRecurring && parseInt(formData.installments) > 1 && !isNaN(installmentValue) && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
              Cada parcela será de aproximadamente <strong>R$ {installmentValue.toFixed(2)}</strong>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-blue-500/30"
            >
              {editData ? 'Salvar Alterações' : 'Confirmar Compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
