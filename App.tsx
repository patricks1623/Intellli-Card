
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CreditCard, Transaction, MonthlyProjection, ProjectionDetail } from './types';
import { calculate12MonthProjection, formatCurrency, getMonthlyDetails } from './utils/finance';
import CardItem from './components/CardItem';
import CardForm from './components/CardForm';
import TransactionForm from './components/TransactionForm';
import { CardSkeleton } from './components/Skeleton';
import { 
  Plus, 
  ListOrdered, 
  LayoutDashboard, 
  Moon, 
  Sun,
  Search,
  Trash2,
  Calendar,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw,
  Edit2,
  Wallet,
  ArrowUpRight,
  CreditCard as CreditCardIcon,
  ChevronRight
} from 'lucide-react';

type Tab = 'dashboard' | 'history' | 'projection' | 'cards';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('intellicard_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isPrivateMode, setIsPrivateMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(0);
  
  const [showCardForm, setShowCardForm] = useState(false);
  const [showTransForm, setShowTransForm] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; type: 'card' | 'transaction'; id: string; title: string } | null>(null);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [editingTrans, setEditingTrans] = useState<Transaction | null>(null);
  const [filterCardId, setFilterCardId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('intellicard_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const savedCards = localStorage.getItem('intellicard_cards');
    const savedTrans = localStorage.getItem('intellicard_transactions');
    if (savedCards) setCards(JSON.parse(savedCards));
    if (savedTrans) setTransactions(JSON.parse(savedTrans));
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('intellicard_cards', JSON.stringify(cards));
      localStorage.setItem('intellicard_transactions', JSON.stringify(transactions));
    }
  }, [cards, transactions, isLoading]);

  const projectionData = useMemo(() => calculate12MonthProjection(cards, transactions), [cards, transactions]);
  
  const selectedMonthDetails = useMemo(() => {
    if (!projectionData[selectedMonthIndex]) return [];
    return getMonthlyDetails(projectionData[selectedMonthIndex].fullDate, cards, transactions);
  }, [selectedMonthIndex, projectionData, cards, transactions]);

  const saveCard = (card: CreditCard) => {
    setCards(prev => {
      const exists = prev.find(c => c.id === card.id);
      return exists ? prev.map(c => c.id === card.id ? card : c) : [...prev, card];
    });
    setShowCardForm(false);
    setEditingCard(null);
  };

  const saveTransaction = (trans: Transaction) => {
    setTransactions(prev => {
      const exists = prev.find(t => t.id === trans.id);
      return exists ? prev.map(t => t.id === trans.id ? trans : t) : [...prev, trans];
    });
    setShowTransForm(false);
    setEditingTrans(null);
  };

  const handleConfirmDelete = () => {
    if (!confirmModal) return;
    if (confirmModal.type === 'card') {
      setCards(prev => prev.filter(c => c.id !== confirmModal.id));
      setTransactions(prev => prev.filter(t => t.cardId !== confirmModal.id));
    } else {
      setTransactions(prev => prev.filter(t => t.id !== confirmModal.id));
    }
    setConfirmModal(null);
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => (filterCardId ? t.cardId === filterCardId : true))
      .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterCardId, searchTerm]);

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 pb-28 md:pb-10 transition-colors duration-500">
      
      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] w-full max-w-sm p-8 shadow-2xl border dark:border-zinc-800">
            <h3 className="text-xl font-bold mb-2">Excluir Registro?</h3>
            <p className="text-slate-600 dark:text-zinc-400 text-sm mb-8">{confirmModal.title}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)} className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 dark:border-zinc-800 font-bold">Voltar</button>
              <button onClick={handleConfirmDelete} className="flex-1 py-3 px-4 rounded-2xl bg-red-600 text-white font-bold">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Mobile Minimal / Desktop Full */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Wallet size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-lg font-black tracking-tight leading-none">IntelliCard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsPrivateMode(!isPrivateMode)} className="p-2 text-slate-600 dark:text-zinc-400"><Eye size={20} /></button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-600 dark:text-zinc-400">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Resumo</h2>
                <p className="text-slate-500 text-sm font-medium">Gasto total projetado para este mês</p>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total em {projectionData[0]?.month}</span>
              <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mt-2">
                {formatCurrency(projectionData[0]?.total || 0, isPrivateMode)}
              </div>
              <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <TrendingUp size={16} /> 
                <span>Dentro do limite previsto</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2 px-2"><CreditCardIcon size={18}/> Meus Cartões</h3>
              <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x hide-scrollbar">
                {isLoading ? [1,2].map(i => <div key={i} className="min-w-[280px] snap-center"><CardSkeleton /></div>) : 
                cards.map(card => (
                  <div key={card.id} className="min-w-[280px] snap-center">
                    <CardItem 
                      card={card} 
                      transactions={transactions} 
                      onDelete={(id) => setConfirmModal({ isOpen: true, type: 'card', id, title: `Excluir ${card.name}?` })} 
                      onEdit={(c) => { setEditingCard(c); setShowCardForm(true); }} 
                      isPrivate={isPrivateMode} 
                    />
                  </div>
                ))}
                <button onClick={() => { setEditingCard(null); setShowCardForm(true); }} className="min-w-[150px] border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[24px] flex flex-col items-center justify-center gap-2 text-slate-400 hover:bg-slate-50 transition-colors">
                  <Plus size={24} />
                  <span className="text-xs font-bold">Novo Cartão</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black tracking-tight">Extrato</h2>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar compras..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-3">
                {filteredTransactions.map(t => {
                  const card = cards.find(c => c.id === t.cardId);
                  return (
                    <div key={t.id} onClick={() => { setEditingTrans(t); setShowTransForm(true); }} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between active:scale-95 transition-transform">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card?.color || 'from-slate-200 to-slate-300'} flex items-center justify-center text-white`}>
                           {t.isRecurring ? <RefreshCw size={18} /> : <CreditCardIcon size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{t.description}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{card?.name} • {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm">{formatCurrency(t.value, isPrivateMode)}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{t.installments}x</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PROJECTION TAB */}
        {activeTab === 'projection' && (activeTab === 'projection' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black tracking-tight">Projeção</h2>
            
            {/* Monthly Selector Scroll */}
            <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 hide-scrollbar">
              {projectionData.map((proj, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedMonthIndex(idx)}
                  className={`px-6 py-3 rounded-2xl whitespace-nowrap font-bold text-sm transition-all ${selectedMonthIndex === idx ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800'}`}
                >
                  {proj.month}
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <span className="font-black text-lg">Total do Mês</span>
                <span className="text-xl font-black text-blue-600">{formatCurrency(projectionData[selectedMonthIndex]?.total || 0, isPrivateMode)}</span>
              </div>
              <div className="space-y-4">
                {selectedMonthDetails.map((detail, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-zinc-800 last:border-0">
                    <div className="flex gap-3">
                      <div className={`w-1 h-10 rounded-full bg-gradient-to-b ${detail.cardColor}`} />
                      <div>
                        <p className="text-sm font-bold">{detail.description}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{detail.cardName} • {detail.installmentNumber}/{detail.totalInstallments}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black">{formatCurrency(detail.value, isPrivateMode)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* FAB - Floating Action Button */}
      <button 
        onClick={() => { setEditingTrans(null); setShowTransForm(true); }}
        className="fixed right-6 bottom-24 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all md:hidden"
      >
        <Plus size={32} />
      </button>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border-t border-slate-200 dark:border-zinc-900 px-6 py-4 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-bold">Resumo</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400'}`}>
          <ListOrdered size={20} />
          <span className="text-[10px] font-bold">Extrato</span>
        </button>
        <button onClick={() => setActiveTab('projection')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'projection' ? 'text-blue-600' : 'text-slate-400'}`}>
          <TrendingUp size={20} />
          <span className="text-[10px] font-bold">Projeção</span>
        </button>
        <button onClick={() => { setEditingCard(null); setShowCardForm(true); }} className={`flex flex-col items-center gap-1 transition-colors text-slate-400`}>
          <CreditCardIcon size={20} />
          <span className="text-[10px] font-bold">Cartões</span>
        </button>
      </nav>

      {showCardForm && <CardForm onSave={saveCard} onClose={() => setShowCardForm(false)} editData={editingCard} />}
      {showTransForm && <TransactionForm cards={cards} onSave={saveTransaction} onDelete={(id) => setConfirmModal({ isOpen: true, type: 'transaction', id, title: `Excluir esta compra?` })} onClose={() => setShowTransForm(false)} editData={editingTrans} />}
    </div>
  );
};

export default App;
