
import React, { useState, useEffect } from 'react';
import { CreditCard } from '../types';

interface CardFormProps {
  onSave: (card: CreditCard) => void;
  onClose: () => void;
  editData?: CreditCard | null;
}

const COLORS = [
  'from-slate-800 to-slate-900',
  'from-blue-600 to-indigo-700',
  'from-emerald-500 to-teal-700',
  'from-rose-500 to-pink-600',
  'from-purple-600 to-violet-800',
  'from-orange-500 to-amber-600',
];

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

const CardForm: React.FC<CardFormProps> = ({ onSave, onClose, editData }) => {
  const [formData, setFormData] = useState({
    name: '',
    totalLimit: '',
    closingDay: '5',
    dueDay: '10',
    color: COLORS[0]
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        totalLimit: editData.totalLimit.toString(),
        closingDay: editData.closingDay.toString(),
        dueDay: editData.dueDay.toString(),
        color: editData.color
      });
    }
  }, [editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const card: CreditCard = {
      id: editData?.id || generateId(),
      name: formData.name,
      totalLimit: parseFloat(formData.totalLimit),
      closingDay: parseInt(formData.closingDay),
      dueDay: parseInt(formData.dueDay),
      color: formData.color
    };
    onSave(card);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
          {editData ? 'Editar Cartão' : 'Novo Cartão'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Cartão</label>
            <input
              required
              type="text"
              className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: Nubank, Visa..."
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Limite Total</label>
            <input
              required
              type="number"
              step="0.01"
              className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0,00"
              value={formData.totalLimit}
              onChange={e => setFormData({ ...formData, totalLimit: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dia de Fechamento</label>
              <input
                required
                type="number"
                min="1"
                max="31"
                className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.closingDay}
                onChange={e => setFormData({ ...formData, closingDay: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dia de Vencimento</label>
              <input
                required
                type="number"
                min="1"
                max="31"
                className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.dueDay}
                onChange={e => setFormData({ ...formData, dueDay: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cor do Cartão</label>
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c })}
                  className={`h-8 w-8 rounded-full bg-gradient-to-br ${c} border-2 ${formData.color === c ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent'} transition-all`}
                />
              ))}
            </div>
          </div>

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
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardForm;
