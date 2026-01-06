
import React, { useState, useEffect } from 'react';
import { CreditCard, Transaction } from '../types';
import { RefreshCw, Trash2, X } from 'lucide-react';

interface TransactionFormProps {
  cards: CreditCard[];
  onSave: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  editData?: Transaction | null;
}

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

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
    if (!formData.cardId) return alert('Selecione um cartão.');
    
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

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 w-full md:max-w-md rounded-t-[32px] md:rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 duration-500 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {editData ? 'Editar Compra' : 'Nova Compra'}
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">O que você comprou?</label>
            <input
              required
              type="text"
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 dark:text-white text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Jantar, Amazon..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Valor</label>
              <input
                required
                type="number"
                step="0.01"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 dark:text-white text-lg font-bold outline-none"
                placeholder="R$ 0,00"
                value={formData.value}
                onChange={e => setFormData({ ...formData, value: e.target.value })}
              />
            </div>
            {!formData.isRecurring && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Parcelas</label>
                <select
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 dark:text-white text-lg font-bold outline-none"
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

          <div className="flex items-center gap-3 p-4 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl cursor-pointer" onClick={() => setFormData({...formData, isRecurring: !formData.isRecurring})}>
            <input type="checkbox" checked={formData.isRecurring} readOnly className="w-5 h-5 rounded-lg text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-bold flex items-center gap-2">
                <RefreshCw size={14} className={formData.isRecurring ? 'animate-spin-slow text-blue-600' : ''} />
                Compra Recorrente
              </p>
              <p className="text-[10px] text-slate-500 font-bold">Cobrar automaticamente todos os meses.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Data da Compra</label>
            <input
              required
              type="date"
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 font-bold outline-none"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Qual Cartão?</label>
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
              {cards.map(card => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, cardId: card.id })}
                  className={`px-6 py-3 rounded-2xl border-2 transition-all whitespace-nowrap font-bold text-sm snap-center ${formData.cardId === card.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-500'}`}
                >
                  {card.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/30"
            >
              Confirmar
            </button>
            {editData && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(editData.id)}
                className="w-full py-4 text-red-600 font-bold flex items-center justify-center gap-2"
              >
                <Trash2 size={18} /> Excluir Compra
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
