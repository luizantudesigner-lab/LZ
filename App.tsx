import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TasksModule from './components/TasksModule';
import FinanceModule from './components/FinanceModule';
import NotesModule from './components/NotesModule';
import { ViewState } from './types';
import { checkMonthlyReset, getTasks, syncFromCloud } from './services/storageService';
import { getTodayDateString } from './constants';
import { LogOut, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [formattedDate, setFormattedDate] = useState('');
  
  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('luiz_auth_session');
    if (auth === 'true') {
      handleLoginSuccess();
    }

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setFormattedDate(new Date().toLocaleDateString('pt-BR', options));

    checkMonthlyReset();
  }, []);

  // Logic executed upon login (fresh or persisted)
  const handleLoginSuccess = async () => {
    setIsAuthenticated(true);
    setIsSyncing(true);
    
    // Pull data from Google Sheets
    const success = await syncFromCloud();
    setIsOffline(!success);
    
    setIsSyncing(false);
    checkNotifications();
  };

  const checkNotifications = () => {
    if (!("Notification" in window)) return;

    const sendNotification = () => {
      const tasks = getTasks();
      const today = getTodayDateString();

      const dueTodayCount = tasks.filter(t => t.date === today && !t.completed).length;
      const overdueCount = tasks.filter(t => t.date < today && !t.completed).length;

      if (dueTodayCount === 0 && overdueCount === 0) return;

      let title = "Luiz Designer Dashboard";
      let body = "";

      if (overdueCount > 0) {
        title = "⚠️ Atenção: Tarefas Atrasadas";
        body = `Você possui ${overdueCount} tarefas atrasadas e ${dueTodayCount} para hoje.`;
      } else {
        title = "📅 Resumo do Dia";
        body = `Bom dia! Você tem ${dueTodayCount} tarefas prioritárias para hoje.`;
      }

      new Notification(title, {
        body,
        icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png', 
        silent: false
      });
    };

    if (Notification.permission === "granted") {
      sendNotification();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          sendNotification();
        }
      });
    }
  };

  const handleLogin = () => {
    localStorage.setItem('luiz_auth_session', 'true');
    handleLoginSuccess();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('luiz_auth_session');
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Loading Screen during initial Sync
  if (isSyncing) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-serif">
         <RefreshCw className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
         <h2 className="text-xl tracking-widest text-gold">SINCRONIZANDO DADOS</h2>
         <p className="text-zinc-500 text-sm mt-2">Conectando ao Banco de Dados Seguro...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-zinc-100 overflow-hidden font-sans">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        onLogout={handleLogout} 
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
         {/* Background Ambient Light */}
         <div className="absolute top-0 left-0 w-full h-96 bg-yellow-600/5 blur-[120px] pointer-events-none z-0" />

         {/* Header */}
         <header className="flex justify-between items-center p-6 z-10 border-b border-zinc-800/50 bg-black/50 backdrop-blur-sm">
            <div>
              <h2 className="text-xl md:text-2xl font-serif text-white">Bom dia, Luiz!</h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-zinc-500 text-xs capitalize">{formattedDate}</p>
                <span className="text-zinc-800 text-xs">•</span>
                <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border ${isOffline ? 'text-zinc-400 border-zinc-800 bg-zinc-900/50' : 'text-emerald-400 border-emerald-900/30 bg-emerald-900/10'}`}>
                   {isOffline ? <WifiOff size={10} /> : <Wifi size={10} />}
                   {isOffline ? 'Modo Offline' : 'Conectado'}
                </div>
              </div>
            </div>
            <div className="md:hidden">
               <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-white"><LogOut /></button>
            </div>
         </header>

         {/* Scrollable Content Area */}
         <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 pb-24 md:pb-8 scroll-smooth">
           <div className="max-w-7xl mx-auto h-full">
             {currentView === 'dashboard' && <Dashboard />}
             {currentView === 'tasks' && <TasksModule />}
             {currentView === 'finance' && <FinanceModule />}
             {currentView === 'notes' && <NotesModule />}
           </div>
         </div>
      </main>
    </div>
  );
};

export default App;