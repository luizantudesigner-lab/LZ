import React, { useEffect, useState } from 'react';
import { Folder, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Task, FinancialSummary } from '../types';
import { getTasks, getFinancialSummary, saveTask } from '../services/storageService';
import { formatCurrency, getTodayDateString, getCurrentMonthKey, DRIVE_FOLDER_URL } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#D4AF37', '#333'];

const Dashboard: React.FC = () => {
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [financials, setFinancials] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = getTodayDateString();
    const allTasks = getTasks();
    const todays = allTasks.filter(t => t.date === today && !t.completed).sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    setTodayTasks(todays);

    const fin = getFinancialSummary(getCurrentMonthKey());
    setFinancials(fin);
    setLoading(false);
  }, []);

  const handleCompleteTask = (task: Task) => {
    const updated = { ...task, completed: true };
    saveTask(updated);
    setTodayTasks(prev => prev.filter(t => t.id !== task.id));
  };

  if (loading) return <div className="p-8 text-gold">Carregando dashboard...</div>;

  const progress = financials ? Math.min(100, (financials.totalIncome / financials.monthlyGoal) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-l-2 border-l-yellow-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ArrowUpRight size={48} className="text-yellow-500" />
          </div>
          <h3 className="text-zinc-400 text-sm uppercase tracking-wider">Receita (Mês)</h3>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(financials?.totalIncome || 0)}</p>
          <div className="mt-2 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
             <div className="h-full bg-yellow-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-xs text-zinc-500 mt-1">{Math.round(progress)}% da meta</p>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-l-2 border-l-red-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ArrowDownRight size={48} className="text-red-500" />
          </div>
          <h3 className="text-zinc-400 text-sm uppercase tracking-wider">Despesas</h3>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(financials?.totalExpense || 0)}</p>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-l-2 border-l-emerald-900/50">
          <h3 className="text-zinc-400 text-sm uppercase tracking-wider">Saldo Líquido</h3>
          <p className={`text-2xl font-bold mt-1 ${ (financials?.balance || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(financials?.balance || 0)}
          </p>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Today's Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xl text-white font-semibold flex items-center gap-2">
               <CalendarIcon className="text-yellow-500" size={20} />
               Tarefas Prioritárias de Hoje
             </h2>
          </div>

          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <Card className="py-8 text-center border-dashed border-zinc-700">
                <p className="text-zinc-500">Nenhuma tarefa pendente para hoje. Ótimo trabalho!</p>
              </Card>
            ) : (
              todayTasks.map(task => (
                <div key={task.id} className="group bg-zinc-900/50 border border-white/5 hover:border-yellow-500/30 p-4 rounded-lg flex items-center justify-between transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleCompleteTask(task)}
                      className="text-zinc-600 hover:text-yellow-500 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-zinc-600 group-hover:border-yellow-500 flex items-center justify-center">
                         <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                    <div>
                      <h4 className="text-white font-medium">{task.title}</h4>
                      <div className="flex gap-2 mt-1 text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${
                          task.priority === 'high' ? 'bg-red-900/30 text-red-400 border border-red-900/50' :
                          task.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-900/50' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {task.priority === 'high' ? 'Alta Prioridade' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                        <span className="bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400 border border-white/5">
                          {task.project}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Actions & Mini Calendar Placeholder */}
        <div className="space-y-6">
           <Card className="text-center group cursor-pointer hover:border-yellow-500/50 transition-all" >
              <div onClick={() => window.open(DRIVE_FOLDER_URL, '_blank')} className="flex flex-col items-center justify-center py-4">
                 <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-yellow-900/20 transition-colors">
                    <Folder className="text-yellow-500 w-8 h-8" />
                 </div>
                 <h3 className="text-lg font-semibold text-white">Arquivos Drive</h3>
                 <p className="text-zinc-500 text-sm mt-1">Acessar nuvem segura</p>
              </div>
           </Card>

           <Card>
             <h3 className="text-white mb-4 font-medium">Resumo de Projetos</h3>
             {/* Simple mock chart visualization */}
             <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Remaining', value: 100 - progress },
                        { name: 'Done', value: progress },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell key="cell-0" fill="#27272a" />
                      <Cell key="cell-1" fill="#D4AF37" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="text-center -mt-28 mb-12">
               <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
               <p className="text-xs text-zinc-500">Meta Mensal</p>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;