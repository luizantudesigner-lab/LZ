import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card } from './ui/Card';
import { Transaction, IncomeCategory, ExpenseCategory } from '../types';
import { getTransactions, addTransaction, removeTransaction, getFinancialSummary } from '../services/storageService';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, formatCurrency, getCurrentMonthKey } from '../constants';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const FinanceModule: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, monthlyGoal: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');

  // Form State
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('');

  const currentMonth = getCurrentMonthKey();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = getTransactions(currentMonth);
    setTransactions(data.reverse()); // Newest first
    setSummary(getFinancialSummary(currentMonth));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc || !category) return;

    const newTx: Transaction = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      description: desc,
      type,
      category,
      date: new Date().toISOString().split('T')[0],
      month: currentMonth
    };

    addTransaction(newTx);
    loadData();
    setAmount('');
    setDesc('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apagar este lançamento financeiro? Esta ação não pode ser desfeita.')) {
      removeTransaction(id);
      loadData();
    }
  };

  const handleExport = () => {
    alert("Simulando geração de PDF Mensal...");
    // In a real app, use jsPDF here
  };

  // Chart Data
  const pieData = [
    { name: 'Receita', value: summary.totalIncome },
    { name: 'Despesa', value: summary.totalExpense }
  ];
  const PIE_COLORS = ['#D4AF37', '#7f1d1d'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl text-white font-serif">Controle Financeiro</h2>
          <p className="text-zinc-500 text-sm">Mês atual: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 text-sm text-yellow-500 hover:text-yellow-400">
           <Download size={16} /> Exportar PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-l-4 border-emerald-500">
          <div className="flex justify-between items-start">
            <div>
               <p className="text-zinc-400 text-xs uppercase">Entradas</p>
               <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(summary.totalIncome)}</p>
            </div>
            <div className="p-2 bg-emerald-900/20 rounded-full"><TrendingUp className="text-emerald-500" size={20} /></div>
          </div>
        </Card>
        <Card className="bg-zinc-900 border-l-4 border-red-500">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-zinc-400 text-xs uppercase">Saídas</p>
               <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(summary.totalExpense)}</p>
             </div>
             <div className="p-2 bg-red-900/20 rounded-full"><TrendingDown className="text-red-500" size={20} /></div>
          </div>
        </Card>
        <Card className="bg-zinc-900 border-l-4 border-yellow-500">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-zinc-400 text-xs uppercase">Balanço</p>
               <p className={`text-2xl font-bold mt-1 ${summary.balance >= 0 ? 'text-white' : 'text-red-500'}`}>
                 {formatCurrency(summary.balance)}
               </p>
             </div>
             <div className="p-2 bg-yellow-900/20 rounded-full"><DollarSign className="text-yellow-500" size={20} /></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
             <h3 className="text-white font-medium mb-4">Novo Lançamento</h3>
             <form onSubmit={handleSubmit} className="space-y-4">
               <div className="flex gap-2 bg-black/30 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${type === 'income' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${type === 'expense' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Despesa
                  </button>
               </div>

               <div>
                 <label className="text-xs text-zinc-500 uppercase">Descrição</label>
                 <input 
                    value={desc} onChange={e => setDesc(e.target.value)}
                    className="w-full bg-black/50 border border-zinc-700 rounded p-2 text-white focus:border-yellow-500 outline-none"
                    placeholder="Ex: Pagamento Cliente X"
                 />
               </div>

               <div>
                 <label className="text-xs text-zinc-500 uppercase">Valor (R$)</label>
                 <input 
                    type="number" step="0.01"
                    value={amount} onChange={e => setAmount(e.target.value)}
                    className="w-full bg-black/50 border border-zinc-700 rounded p-2 text-white focus:border-yellow-500 outline-none"
                    placeholder="0,00"
                 />
               </div>

               <div>
                 <label className="text-xs text-zinc-500 uppercase">Categoria</label>
                 <select 
                    value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full bg-black/50 border border-zinc-700 rounded p-2 text-white focus:border-yellow-500 outline-none"
                 >
                    <option value="">Selecione...</option>
                    {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                 </select>
               </div>

               <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg mt-2">
                 Registrar
               </button>
             </form>
          </Card>
          
          <Card className="h-64">
             <h3 className="text-white font-medium mb-2 text-center">Proporção</h3>
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
             </ResponsiveContainer>
          </Card>
        </div>

        {/* Right: Transaction List */}
        <div className="lg:col-span-2">
          <Card className="h-full min-h-[500px]">
             <h3 className="text-white font-medium mb-4">Histórico Mensal</h3>
             <div className="overflow-y-auto max-h-[500px] pr-2 space-y-2">
                {transactions.length === 0 ? (
                  <div className="text-center text-zinc-500 py-12">Nenhum lançamento neste mês.</div>
                ) : (
                  transactions.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-lg hover:border-white/10 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className={`w-2 h-10 rounded-full ${t.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <div>
                            <p className="text-white font-medium">{t.description}</p>
                            <p className="text-zinc-500 text-sm">{t.category} • {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className={`font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                          </span>
                          <button 
                            onClick={() => handleDelete(t.id)}
                            className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinanceModule;