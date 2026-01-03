
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CreditCard, Transaction, MonthlyProjection, ProjectionDetail } from './types';
import { calculate12MonthProjection, formatCurrency, getMonthlyDetails } from './utils/finance';
import CardItem from './components/CardItem';
import CardForm from './components/CardForm';
import TransactionForm from './components/TransactionForm';
import { CardSkeleton, TableSkeleton } from './components/Skeleton';
import { 
  Plus, 
  CreditCard as CardIcon, 
  ListOrdered, 
  BarChart3, 
  Moon, 
  Sun,
  Search,
  Filter,
  Trash2,
  Calendar,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  Edit2,
  AlertCircle,
  ChevronRight,
  Wallet,
  ArrowUpRight
} from 'lucide-react';

const App: React.FC = () => {
  const summaryRef = useRef<HTMLElement>(null);
  const historyRef = useRef<HTMLElement>(null);

  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('intellicard_theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [cards, setCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialTheme);
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
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

  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const scrollTo = (ref: React.RefObject<HTMLElement>) => ref.current?.scrollIntoView({ behavior: 'smooth' });

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
    showToast('Dados do cartão salvos!');
    setShowCardForm(false);
    setEditingCard(null);
  };

  const requestDeleteCard = (id: string) => {
    const card = cards.find(c => c.id === id);
    setConfirmModal({ isOpen: true, type: 'card', id, title: `Excluir o cartão "${card?.name}"?` });
  };

  const saveTransaction = (trans: Transaction) => {
    setTransactions(prev => {
      const exists = prev.find(t => t.id === trans.id);
      return exists ? prev.map(t => t.id === trans.id ? trans : t) : [...prev, trans];
    });
    showToast('Transação registrada!');
    setShowTransForm(false);
    setEditingTrans(null);
  };

  const requestDeleteTransaction = (id: string) => {
    const trans = transactions.find(t => t.id === id);
    setConfirmModal({ isOpen: true, type: 'transaction', id, title: `Excluir registro de "${trans?.description}"?` });
  };

  const handleConfirmDelete = () => {
    if (!confirmModal) return;
    if (confirmModal.type === 'card') {
      setCards(prev => prev.filter(c => c.id !== confirmModal.id));
      setTransactions(prev => prev.filter(t => t.cardId !== confirmModal.id));
    } else {
      setTransactions(prev => prev.filter(t => t.id !== confirmModal.id));
    }
    showToast('Registro excluído.');
    setConfirmModal(null);
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => (filterCardId ? t.cardId === filterCardId : true))
      .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterCardId, searchTerm]);

  return (
    <div className="min-h-screen pb-24 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 transition-colors duration-500">
      {/* Toast & Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-sm p-8 shadow-2xl border dark:border-zinc-800">
            <h3 className="text-xl font-bold mb-2">Confirmar</h3>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed">{confirmModal.title}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)} className="flex-1 py-3 px-4 rounded-2xl border dark:border-zinc-800 font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all">Voltar</button>
              <button onClick={handleConfirmDelete} className="flex-1 py-3 px-4 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border-b dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-[14px] text-white shadow-lg shadow-blue-500/20">
              <Wallet size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">IntelliCard</h1>
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1">Gestão Patrimonial</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsPrivateMode(!isPrivateMode)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl transition-all">
              {isPrivateMode ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <button onClick={toggleTheme} className="p-2.5 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl transition-all">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tighter">Dashboard</h2>
            <p className="text-slate-500 dark:text-zinc-400 font-medium">Bem-vindo de volta ao seu controle financeiro inteligente.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setEditingCard(null); setShowCardForm(true); }} className="px-6 py-3 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all">
              <Plus size={18} /> Adicionar Cartão
            </button>
            <button onClick={() => { setEditingTrans(null); setShowTransForm(true); }} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
              <ArrowUpRight size={18} /> Registrar Compra
            </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cards Section (8 cols) */}
          <div className="lg:col-span-12 xl:col-span-8 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? [1,2].map(i => <CardSkeleton key={i} />) : cards.length === 0 ? (
                <div className="col-span-full h-48 border-2 border-dashed dark:border-zinc-800 rounded-[32px] flex items-center justify-center text-slate-400">Nenhum cartão ativo</div>
              ) : cards.map(card => (
                <CardItem key={card.id} card={card} transactions={transactions} onDelete={requestDeleteCard} onEdit={(c) => { setEditingCard(c); setShowCardForm(true); }} isPrivate={isPrivateMode} />
              ))}
            </div>

            {/* Projection Heatmap Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] border dark:border-zinc-800 overflow-hidden shadow-sm">
              <div className="p-8 border-b dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="text-blue-500" size={20} /> Projeção Dinâmica
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                      <th className="px-8 py-5 text-left bg-slate-50/50 dark:bg-zinc-950/50">Mês</th>
                      {cards.map(c => <th key={c.id} className="px-6 py-5 text-center">{c.name}</th>)}
                      <th className="px-8 py-5 text-right bg-slate-50/50 dark:bg-zinc-950/50">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-zinc-800">
                    {projectionData.map((proj, idx) => (
                      <tr key={idx} onClick={() => setSelectedMonthIndex(idx)} className={`group transition-all cursor-pointer ${selectedMonthIndex === idx ? 'bg-blue-50/30 dark:bg-blue-500/5' : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'}`}>
                        <td className="px-8 py-5 text-sm font-bold">{proj.month}</td>
                        {cards.map(c => {
                          const val = proj[c.id] || 0;
                          const intensity = Math.min(val / (c.totalLimit / 5), 1); // Heatmap logic
                          return (
                            <td key={c.id} className="px-6 py-5 text-center">
                              <span style={{ opacity: val > 0 ? 0.4 + (intensity * 0.6) : 0.2 }} className={`text-xs font-mono font-medium ${val > 0 ? 'text-slate-900 dark:text-zinc-100' : 'text-slate-300 dark:text-zinc-700'}`}>
                                {val > 0 ? formatCurrency(val, isPrivateMode) : '—'}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-8 py-5 text-right font-black text-sm">{formatCurrency(proj.total, isPrivateMode)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Details Section (4 cols) */}
          <div className="lg:col-span-12 xl:col-span-4 space-y-8">
            {/* Selected Month Detail Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 border dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-bold text-lg">Detalhes: {projectionData[selectedMonthIndex]?.month}</h3>
                 <Calendar className="text-slate-400" size={20} />
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {selectedMonthDetails.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-sm">Sem gastos projetados</div>
                ) : selectedMonthDetails.map((detail, i) => (
                  <div key={i} className="flex justify-between items-center group">
                    <div className="flex gap-3">
                      <div className={`w-1 h-10 rounded-full bg-gradient-to-b ${detail.cardColor}`}></div>
                      <div>
                        <p className="text-sm font-bold leading-tight">{detail.description}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{detail.cardName} • {detail.installmentNumber}/{detail.totalInstallments}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black">{formatCurrency(detail.value, isPrivateMode)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t dark:border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total do Mês</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(projectionData[selectedMonthIndex]?.total || 0, isPrivateMode)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full History Section (Bento wide block) */}
        <section className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 border dark:border-zinc-800 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <ListOrdered className="text-emerald-500" /> Fluxo de Caixa
            </h2>
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-none outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all" />
              </div>
              <select value={filterCardId} onChange={e => setFilterCardId(e.target.value)} className="px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-none outline-none text-sm font-bold cursor-pointer">
                <option value="">Todos</option>
                {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto -mx-8 px-8">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 border-b dark:border-zinc-800">
                  <th className="pb-6 px-4">Data</th>
                  <th className="pb-6 px-4">Descrição</th>
                  <th className="pb-6 px-4">Cartão</th>
                  <th className="pb-6 px-4 text-center">Parcelas</th>
                  <th className="pb-6 px-4 text-right">Valor</th>
                  <th className="pb-6 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-zinc-800">
                {filteredTransactions.map(t => {
                  const card = cards.find(c => c.id === t.cardId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group">
                      <td className="py-6 px-4 text-xs font-medium text-slate-400">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{t.description}</span>
                          {t.isRecurring && <RefreshCw size={12} className="text-blue-500" />}
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg text-white bg-gradient-to-r ${card?.color || 'from-zinc-500 to-zinc-700'}`}>
                          {card?.name}
                        </span>
                      </td>
                      <td className="py-6 px-4 text-center text-xs font-mono">{t.isRecurring ? '—' : `${t.installments}x`}</td>
                      <td className="py-6 px-4 text-right text-sm font-black">{formatCurrency(t.value, isPrivateMode)}</td>
                      <td className="py-6 px-4 text-right">
                         <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => { setEditingTrans(t); setShowTransForm(true); }} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 rounded-xl transition-all"><Edit2 size={16} /></button>
                           <button onClick={() => requestDeleteTransaction(t.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-xl transition-all"><Trash2 size={16} /></button>
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Floating Action Menu for Mobile */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl px-8 py-4 rounded-[28px] border dark:border-zinc-800 shadow-2xl z-50 sm:hidden">
          <button onClick={() => scrollTo(summaryRef)} className="text-slate-400 hover:text-blue-500 transition-all"><BarChart3 size={24} /></button>
          <button onClick={() => { setEditingTrans(null); setShowTransForm(true); }} className="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/40 -mt-12 border-4 border-[#fcfcfd] dark:border-[#09090b]"><Plus size={32} /></button>
          <button onClick={() => scrollTo(historyRef)} className="text-slate-400 hover:text-blue-500 transition-all"><ListOrdered size={24} /></button>
      </div>

      {showCardForm && <CardForm onSave={saveCard} onClose={() => setShowCardForm(false)} editData={editingCard} />}
      {showTransForm && <TransactionForm cards={cards} onSave={saveTransaction} onDelete={requestDeleteTransaction} onClose={() => setShowTransForm(false)} editData={editingTrans} />}
    </div>
  );
};

export default App;
