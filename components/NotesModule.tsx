import React, { useState, useEffect } from 'react';
import { Folder, FileText, Plus, Trash2, Upload, X, ChevronRight, File } from 'lucide-react';
import { Card } from './ui/Card';
import { Folder as FolderType, FileItem } from '../types';
import { getFolders, saveFolder, deleteFolder, getFiles, saveFile, deleteFile } from '../services/storageService';

const NotesModule: React.FC = () => {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  // Modal States
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Note Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setFolders(getFolders());
    setFiles(getFiles());
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName) return;
    saveFolder({ id: Date.now().toString(), name: newFolderName, createdAt: Date.now() });
    setNewFolderName('');
    setIsFolderModalOpen(false);
    loadData();
  };

  const handleDeleteFolder = (id: string) => {
    if (window.confirm('Apagar pasta e todo seu conteúdo?')) {
      deleteFolder(id);
      if (selectedFolderId === id) setSelectedFolderId(null);
      loadData();
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle) return;
    
    const newFile: FileItem = {
      id: selectedFile ? selectedFile.id : Date.now().toString(),
      folderId: selectedFolderId || 'root',
      title: noteTitle,
      content: noteContent,
      type: 'note',
      createdAt: selectedFile ? selectedFile.createdAt : Date.now()
    };
    
    saveFile(newFile);
    closeNoteModal();
    loadData();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mock upload behavior
    const newFile: FileItem = {
      id: Date.now().toString(),
      folderId: selectedFolderId || 'root',
      title: file.name,
      content: `Simulação de arquivo (${(file.size / 1024).toFixed(1)} KB). Em produção, isso seria um link de download.`,
      type: 'document',
      createdAt: Date.now()
    };
    saveFile(newFile);
    loadData();
  };

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Apagar arquivo?')) {
      deleteFile(id);
      if (selectedFile?.id === id) setSelectedFile(null);
      loadData();
    }
  };

  const openNote = (file: FileItem) => {
    if (file.type === 'note') {
      setSelectedFile(file);
      setNoteTitle(file.title);
      setNoteContent(file.content);
      setIsNoteModalOpen(true);
    } else {
      alert(`Documento: ${file.title}\n\n${file.content}`);
    }
  };

  const closeNoteModal = () => {
    setIsNoteModalOpen(false);
    setSelectedFile(null);
    setNoteTitle('');
    setNoteContent('');
  };

  const filteredFiles = files.filter(f => f.folderId === (selectedFolderId || 'root'));

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <h2 className="text-2xl text-white font-serif mb-6">Notas & Arquivos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
        
        {/* Sidebar / Folders */}
        <div className="md:col-span-1 space-y-4">
           <div className="flex justify-between items-center">
             <h3 className="text-zinc-400 text-sm uppercase font-semibold">Pastas</h3>
             <button onClick={() => setIsFolderModalOpen(true)} className="text-yellow-500 hover:text-yellow-400 p-1"><Plus size={18} /></button>
           </div>
           
           <div className="space-y-1">
             <button 
               onClick={() => setSelectedFolderId(null)}
               className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${!selectedFolderId ? 'bg-yellow-900/20 text-yellow-500 border border-yellow-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
             >
               <Folder size={16} /> Geral / Raiz
             </button>
             {folders.map(f => (
               <div key={f.id} className="group relative flex items-center">
                 <button 
                   onClick={() => setSelectedFolderId(f.id)}
                   className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${selectedFolderId === f.id ? 'bg-yellow-900/20 text-yellow-500 border border-yellow-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
                 >
                   <Folder size={16} /> {f.name}
                 </button>
                 <button 
                   onClick={() => handleDeleteFolder(f.id)}
                   className="absolute right-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   <Trash2 size={14} />
                 </button>
               </div>
             ))}
           </div>
        </div>

        {/* Main Content / Files */}
        <div className="md:col-span-3 flex flex-col h-full min-h-[500px]">
           <Card className="flex-1 flex flex-col" noPadding>
              {/* Toolbar */}
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50 rounded-t-xl">
                 <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Folder size={16} />
                    <ChevronRight size={14} />
                    <span className="text-white font-medium">
                       {selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : 'Geral'}
                    </span>
                 </div>
                 <div className="flex gap-2">
                    <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                      <Upload size={16} /> Upload
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <button 
                       onClick={() => setIsNoteModalOpen(true)}
                       className="bg-yellow-600 hover:bg-yellow-500 text-black px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <Plus size={16} /> Nova Nota
                    </button>
                 </div>
              </div>

              {/* File Grid */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                 {filteredFiles.length === 0 && (
                    <p className="text-zinc-600 text-center col-span-full py-20">Esta pasta está vazia.</p>
                 )}
                 {filteredFiles.map(file => (
                    <div 
                      key={file.id} 
                      onClick={() => openNote(file)}
                      className="group bg-black/40 border border-zinc-800 hover:border-yellow-500/40 rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-1 shadow-lg"
                    >
                       <div className="flex justify-between items-start mb-3">
                          <div className={`p-2 rounded-lg ${file.type === 'note' ? 'bg-blue-900/20 text-blue-400' : 'bg-red-900/20 text-red-400'}`}>
                             {file.type === 'note' ? <FileText size={20} /> : <File size={20} />}
                          </div>
                          <button 
                             onClick={(e) => handleDeleteFile(file.id, e)}
                             className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                       <h4 className="text-white font-medium truncate mb-1">{file.title}</h4>
                       <p className="text-xs text-zinc-500">
                         {new Date(file.createdAt).toLocaleDateString('pt-BR')}
                       </p>
                       {file.type === 'note' && (
                          <p className="text-xs text-zinc-600 mt-2 line-clamp-2">{file.content}</p>
                       )}
                    </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>

      {/* New Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="bg-zinc-900 border border-yellow-500/30 w-full max-w-sm rounded-xl p-6">
              <h3 className="text-white font-medium mb-4">Nova Pasta</h3>
              <form onSubmit={handleCreateFolder}>
                 <input 
                   autoFocus
                   className="w-full bg-black/50 border border-zinc-700 rounded p-2 text-white focus:border-yellow-500 outline-none mb-4"
                   placeholder="Nome da pasta"
                   value={newFolderName}
                   onChange={e => setNewFolderName(e.target.value)}
                 />
                 <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsFolderModalOpen(false)} className="text-zinc-400 hover:text-white px-4 py-2">Cancelar</button>
                    <button type="submit" className="bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium">Criar</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Note Editor Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="bg-zinc-900 border border-yellow-500/30 w-full max-w-3xl h-[80vh] rounded-2xl shadow-2xl flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-white/5">
                 <input 
                    className="bg-transparent text-xl font-serif text-white placeholder-zinc-600 outline-none w-full"
                    placeholder="Título da Nota"
                    value={noteTitle}
                    onChange={e => setNoteTitle(e.target.value)}
                 />
                 <button onClick={closeNoteModal} className="text-zinc-400 hover:text-white ml-4"><X /></button>
              </div>
              <div className="flex-1 p-4">
                 <textarea 
                    className="w-full h-full bg-transparent text-zinc-300 resize-none outline-none leading-relaxed custom-scrollbar"
                    placeholder="Digite suas anotações aqui..."
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                 />
              </div>
              <div className="p-4 border-t border-white/5 flex justify-end">
                 <button onClick={handleSaveNote} className="bg-yellow-600 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-medium">
                    Salvar Nota
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default NotesModule;