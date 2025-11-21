import React, { useState } from 'react';
import { Lock, ChevronRight } from 'lucide-react';
import { ACCESS_CODE } from '../constants';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ACCESS_CODE) {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black z-0"></div>
      
      <div className="z-10 w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl shadow-yellow-900/20">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-yellow-500/30">
            <Lock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <h1 className="text-3xl text-center font-serif mb-2 text-white">Bem-vindo, Luiz</h1>
        <p className="text-center text-zinc-400 mb-8 text-sm uppercase tracking-widest">Acesso Restrito</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código de Acesso"
              className={`w-full bg-black/50 border ${error ? 'border-red-500' : 'border-yellow-500/30 focus:border-yellow-500'} rounded-lg px-4 py-3 text-center text-white outline-none transition-all duration-300 placeholder-zinc-600`}
            />
          </div>

          {error && (
            <p className="text-center text-red-400 text-sm animate-pulse">Código incorreto</p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-yellow-900/20"
          >
            <span>Acessar Dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>
      
      <div className="mt-8 text-zinc-600 text-xs z-10">
        &copy; {new Date().getFullYear()} Luiz Designer System
      </div>
    </div>
  );
};

export default LoginScreen;