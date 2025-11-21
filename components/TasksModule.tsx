import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar as CalIcon, List, CheckSquare, X, Pencil } from 'lucide-react';
import { Card } from './ui/Card';
import { Task, Priority } from '../types';
import { getTasks, saveTask, deleteTask } from '../services/storageService';

const TasksModule: React.FC = () => {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  const handleEdit = (task: Task) => {
    setTitle(task.title);
    setProject(task.project);
    setDate(task.date);
    setPriority(task.priority);
    setEditingId(task.id);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: editingId || Date.now().toString(),
      title,
      project: project || 'Geral',
      date: date || new Date().toISOString().split('T')[0],
      priority,
      completed: editingId ? tasks.find(t => t.id === editingId)?.completed || false : false,
      createdAt: editingId ? tasks.find(t => t.id === editingId)?.createdAt || Date.now() : Date.now()
    };
    saveTask(newTask);
    setTasks(getTasks()); // Refresh
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTask(id);
      setTasks(getTasks());
    }
  };

  const toggleComplete = (task: Task) => {
    const updated = { ...task, completed: !task.completed };
    saveTask(updated);
    setTasks(getTasks());
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setProject('');
    setDate('');
    setPriority('medium');
  };

  // Organize tasks for calendar view (simple list by date for now)
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl text-white font-serif">Gestão de Tarefas</h2>
        
        <div className="flex gap-2">
          <div className="flex bg-zinc-900 rounded-lg p-1 border border-white/10">
            <button 
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-zinc-800 text-yellow-500' : 'text-zinc-500 hover:text-white'}`}
            >
              <List size={20} />
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={`p-2 rounded ${view === 'calendar' ? 'bg-zinc-800 text-yellow-500' : 'text-zinc-500 hover:text-white'}`}
            >
              <CalIcon size={20} />
            </button>
          </div>
          
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={18} /> Nova Tarefa
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="grid gap-4">
          {sortedTasks.map(task => (
             <div key={task.id} className={`bg-zinc-900/40 border ${task.completed ? 'border-zinc-800 opacity-60' : 'border-white/10'} p-4 rounded-xl flex items-center justify-between group hover:border-yellow-500/30 transition-all`}>
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleComplete(task)} className={`text-zinc-400 hover:text-yellow-500 transition-colors`}>
                    {task.completed ? <CheckSquare className="text-yellow-500" /> : <div className="w-6 h-6 border-2 border-zinc-600 rounded bg-transparent" />}
                  </button>
                  
                  <div>
                    <h3 className={`font-medium ${task.completed ? 'line-through text-zinc-500' : 'text-white'}`}>{task.title}</h3>
                    <div className="flex items-center gap-3 text-sm mt-1 text-zinc-500">
                      <span>{new Date(task.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</span>
                      <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                      <span className={`${task.priority === 'high' ? 'text-red-400' : task.priority === 'medium' ? 'text-yellow-500' : 'text-blue-400'}`}>
                         {task.priority === 'high' ? '!!! Alta' : task.priority === 'medium' ? '!! Média' : '! Baixa'}
                      </span>
                      <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                      <span className="text-zinc-400">{task.project}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(task)}
                    className="text-zinc-600 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(task.id)}
                    className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
             </div>
          ))}
          {sortedTasks.length === 0 && <p className="text-zinc-500 text-center py-10">Nenhuma tarefa encontrada.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {/* Simple "Card Calendar" View - Grouping tasks by date visually */}
           {Array.from(new Set(sortedTasks.map(t => t.date))).map(date => (
             <Card key={date} className="border-t-4 border-t-yellow-500/50">
                <h3 className="text-lg font-bold text-white mb-3 border-b border-white/5 pb-2">
                  {new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' })}
                </h3>
                <div className="space-y-2">
                  {sortedTasks.filter(t => t.date === date).map(t => (
                    <div key={t.id} className={`text-sm p-2 rounded bg-zinc-800/50 flex justify-between items-center ${t.completed ? 'opacity-50' : ''}`}>
                       <span className="text-zinc-300 truncate flex-1 mr-2">{t.title}</span>
                       <button onClick={() => handleEdit(t)} className="text-zinc-500 hover:text-white mr-2"><Pencil size={12}/></button>
                       <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                    </div>
                  ))}
                </div>
             </Card>
           ))}
           {sortedTasks.length === 0 && <p className="text-zinc-500 text-center col-span-3">Calendário vazio.</p>}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="bg-zinc-900 border border-yellow-500/30 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif text-white">{editingId ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
                <button onClick={closeModal} className="text-zinc-400 hover:text-white"><X /></button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-4">
                 <div>
                   <label className="block text-xs text-zinc-400 uppercase mb-1">O que precisa ser feito?</label>
                   <input 
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full bg-black/50 border border-zinc-700 focus:border-yellow-500 rounded px-3 py-2 text-white outline-none"
                      placeholder="Ex: Criar landing page cliente X"
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-400 uppercase mb-1">Projeto / Cliente</label>
                      <input 
                          value={project}
                          onChange={e => setProject(e.target.value)}
                          className="w-full bg-black/50 border border-zinc-700 focus:border-yellow-500 rounded px-3 py-2 text-white outline-none"
                          placeholder="Ex: Campanha Black Friday"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 uppercase mb-1">Data</label>
                      <input 
                          type="date"
                          required
                          value={date}
                          onChange={e => setDate(e.target.value)}
                          className="w-full bg-black/50 border border-zinc-700 focus:border-yellow-500 rounded px-3 py-2 text-white outline-none"
                      />
                    </div>
                 </div>
                 <div>
                   <label className="block text-xs text-zinc-400 uppercase mb-1">Prioridade</label>
                   <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as Priority[]).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 py-2 rounded border capitalize text-sm transition-all ${
                            priority === p 
                              ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' 
                              : 'bg-zinc-800 border-transparent text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          {p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa'}
                        </button>
                      ))}
                   </div>
                 </div>
                 <div className="pt-4">
                   <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg">
                     {editingId ? 'Atualizar Tarefa' : 'Adicionar Tarefa'}
                   </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default TasksModule;