import React from 'react';
import { LayoutDashboard, CheckSquare, DollarSign, LogOut, FolderOpen, FileText, ExternalLink, Bot, Image as ImageIcon, Zap } from 'lucide-react';
import { ViewState } from '../types';
import { DRIVE_FOLDER_URL } from '../constants';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tarefas & Agenda', icon: CheckSquare },
    { id: 'finance', label: 'Financeiro', icon: DollarSign },
    { id: 'notes', label: 'Notas & Arquivos', icon: FileText },
  ];

  const aiLinks = [
    { name: 'ChatGPT', url: 'https://chat.openai.com', icon: Bot },
    { name: 'Gemini', url: 'https://gemini.google.com', icon: Zap },
    { name: 'DeepSeek', url: 'https://chat.deepseek.com', icon: Bot },
  ];

  const imageLinks = [
    { name: 'Freepik', url: 'https://www.freepik.com', icon: ImageIcon },
    { name: 'Designi', url: 'https://www.designi.com.br', icon: ImageIcon },
    { name: 'Pinterest', url: 'https://www.pinterest.com', icon: ImageIcon },
  ];

  return (
    <aside className="fixed bottom-0 w-full md:w-64 md:relative md:min-h-screen bg-black border-t md:border-t-0 md:border-r border-zinc-800 z-40 flex flex-col justify-between transition-all">
      <div className="flex flex-col h-full p-4 overflow-y-auto custom-scrollbar">
        {/* Logo Area */}
        <div className="hidden md:flex items-center gap-3 mb-8 px-2">
           <div className="w-10 h-10 bg-gradient-to-tr from-yellow-600 to-yellow-300 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-900/20">
             <span className="font-serif text-black font-bold text-xl">L</span>
           </div>
           <div>
             <h1 className="font-serif text-white font-bold tracking-wide">LUIZ</h1>
             <p className="text-[10px] text-yellow-500 tracking-[0.2em] uppercase">Premium Design</p>
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex md:flex-col justify-around md:justify-start w-full gap-1 md:gap-2 mb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id as ViewState)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'text-yellow-400 bg-yellow-900/10' 
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {isActive && <div className="absolute left-0 h-full w-1 bg-yellow-500 rounded-r-full hidden md:block" />}
                <Icon size={20} className={isActive ? 'drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]' : ''} />
                <span className="hidden md:block font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Links Section (Desktop Only for space) */}
        <div className="hidden md:block mb-6 border-t border-zinc-800 pt-4">
          <h3 className="text-xs text-zinc-600 uppercase tracking-wider mb-3 px-2 font-semibold">Acesso Rápido</h3>
          
          <div className="space-y-4">
            {/* AI Tools */}
            <div className="space-y-1">
              <p className="px-2 text-[10px] text-yellow-500/70 uppercase mb-1">Inteligência Artificial</p>
              {aiLinks.map(link => (
                <a 
                  key={link.name} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg text-sm transition-colors"
                >
                  <link.icon size={14} />
                  {link.name}
                  <ExternalLink size={10} className="ml-auto opacity-50" />
                </a>
              ))}
            </div>

            {/* Image Banks */}
            <div className="space-y-1">
              <p className="px-2 text-[10px] text-yellow-500/70 uppercase mb-1">Banco de Imagens</p>
              {imageLinks.map(link => (
                <a 
                  key={link.name} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg text-sm transition-colors"
                >
                  <link.icon size={14} />
                  {link.name}
                  <ExternalLink size={10} className="ml-auto opacity-50" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="hidden md:block space-y-2 mt-auto border-t border-zinc-800 pt-4">
          <button 
            onClick={() => window.open(DRIVE_FOLDER_URL, '_blank')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
          >
            <FolderOpen size={20} />
            <span>Drive</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-900/70 hover:text-red-500 hover:bg-red-950/30 transition-all"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;