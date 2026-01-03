
import React from 'react';
import { CreditCard, Transaction } from '../types';
import { calculateUsedLimit, formatCurrency, getInvoiceStatus } from '../utils/finance';
import { Trash2, Edit, AlertCircle, CreditCard as CardIcon } from 'lucide-react';

interface CardItemProps {
  card: CreditCard;
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (card: CreditCard) => void;
  isPrivate: boolean;
}

const CardItem: React.FC<CardItemProps> = ({ card, transactions, onDelete, onEdit, isPrivate }) => {
  const usedLimit = calculateUsedLimit(card.id, transactions);
  const usagePercent = (usedLimit / card.totalLimit) * 100;
  const isHighUsage = usagePercent >= 80;
  const invoiceStatus = getInvoiceStatus(card.closingDay);

  return (
    <div className={`group relative overflow-hidden rounded-[24px] p-6 text-white shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-blue-500/10 bg-gradient-to-br ${card.color} border border-white/10`}>
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
               <div className={`w-1.5 h-1.5 rounded-full ${invoiceStatus.color}`} />
               <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70">Fatura {invoiceStatus.label}</span>
            </div>
            <h3 className="text-lg font-extrabold tracking-tight">{card.name}</h3>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button 
              type="button"
              onClick={() => onEdit(card)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-md transition-all"
            >
              <Edit size={14} />
            </button>
            <button 
              type="button"
              onClick={() => onDelete(card.id)}
              className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-xl backdrop-blur-md transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-[10px] font-medium uppercase tracking-widest opacity-60 mb-1">Saldo Utilizado</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${isPrivate ? 'blur-md select-none' : ''}`}>
              {formatCurrency(usedLimit, isPrivate)}
            </span>
            <span className="text-[10px] opacity-50">/ {formatCurrency(card.totalLimit, isPrivate)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${isHighUsage ? 'bg-amber-400' : 'bg-white'}`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold uppercase opacity-50">Vencimento</span>
              <span className="text-xs font-mono font-medium">DIA {card.dueDay.toString().padStart(2, '0')}</span>
            </div>
            <CardIcon size={24} className="opacity-20" />
          </div>
        </div>
      </div>
      
      {/* Glossy Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
    </div>
  );
};

export default CardItem;
