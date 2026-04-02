'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Hash, Loader2, X, Command, User, ArrowRight } from 'lucide-react';
import { InputText } from 'primereact/inputtext';
import { motion, AnimatePresence } from 'motion/react';
import { debounce } from 'lodash-es';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

type SearchMode = 'name' | 'code';

interface ClientResult {
  clientID: number;
  clientCode: string;
  name: string;
  clientType: string;
  address: string;
}

export default function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('name');
  const [results, setResults] = useState<ClientResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        containerRef.current?.querySelector('input')?.focus();
      }
      if (e.key === 'Escape') {
        setIsFocused(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const performSearch = useCallback(
    debounce(async (searchQuery: string, searchMode: SearchMode) => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        if (searchMode === 'name') {
          // Name search returns an array
          const response = await api.get(`/api/Client/search?seacrchItem=${searchQuery}`);
          setResults(Array.isArray(response.data) ? response.data : []);
        } else {
          // Code search returns a single object or empty
          const response = await api.get(`/api/Client/byCode?code=${searchQuery}`);
          // Normalize single object to array for the list
          setResults(response.data ? [response.data] : []);
        }
      } catch (error) {
        console.error('Search failed', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400),
    []
  );

  useEffect(() => {
    performSearch(query, mode);
  }, [query, mode, performSearch]);

  const handleSelect = (client: ClientResult) => {
    window.dispatchEvent(new Event('navigation-start'));
    router.push(`/clients/${client.clientCode}/manage?name=${encodeURIComponent(client.name)}`);
    setIsFocused(false);
    setQuery('');
  };

  const toggleMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMode(m => m === 'name' ? 'code' : 'name');
    setQuery('');
    setResults([]);
  };

  return (
    <div ref={containerRef} className={cn("flex-1 max-w-xl relative group transition-all duration-300", isFocused ? "z-[70]" : "z-10")}>
        {/* Backdrop Focus Overlay */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFocused(false)}
              className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xl z-[-1]"
            />
          )}
        </AnimatePresence>

        <div className={cn(
          "relative flex items-center transition-all duration-300 z-[70]",
          isFocused ? "scale-105" : ""
        )}>
          <Search className={cn(
            "absolute left-4 w-4 h-4 transition-colors",
            isFocused ? "text-[var(--sidebar-bg)]" : "text-zinc-400"
          )} />
          
          <InputText
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search Clients..."
            className={cn(
              "!pl-14 pr-12 w-full rounded-2xl bg-white border-transparent shadow-sm transition-all h-14 text-sm font-medium",
              "focus:ring-4 focus:ring-emerald-500/10 focus:border-[#4a907a]",
              isFocused ? "shadow-2xl" : "hover:bg-zinc-50"
            )}
          />

          <div className="absolute right-4 flex items-center gap-2">
            {query && (
              <button 
                onClick={() => { setQuery(''); setResults([]); }}
                className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results Dropdown */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-3xl overflow-hidden pointer-events-auto z-[80]"
            >
              {/* Mode Switcher */}
              <div className="p-3 border-b border-zinc-100 bg-zinc-50/50">
                <div className="flex p-1.5 bg-zinc-100/50 rounded-[20px]">
                  <button
                    onClick={(e) => { e.preventDefault(); setMode('name'); setQuery(''); setResults([]); }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-3 py-3 rounded-[16px] text-xs font-black uppercase tracking-widest transition-all",
                      mode === 'name' 
                        ? "bg-white text-emerald-700 shadow-md transform scale-[1.02]" 
                        : "text-zinc-400 hover:text-zinc-600 hover:bg-white/40"
                    )}
                  >
                    <User className="w-4 h-4" />
                    Search By Name
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); setMode('code'); setQuery(''); setResults([]); }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-3 py-3 rounded-[16px] text-xs font-black uppercase tracking-widest transition-all",
                      mode === 'code' 
                        ? "bg-white text-emerald-700 shadow-md transform scale-[1.02]" 
                        : "text-zinc-400 hover:text-zinc-600 hover:bg-white/40"
                    )}
                  >
                    <Hash className="w-4 h-4" />
                    Search By Code
                  </button>
                </div>
              </div>

              <div className="p-3">
                {(query.length >= 2 || isLoading) ? (
                  <>
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-400">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Scanning Client Registry...</span>
                      </div>
                    ) : results.length > 0 ? (
                      <div className="flex flex-col">
                        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             Verified Results ({results.length})
                          </span>
                        </div>
                        <div className="max-h-[50vh] overflow-y-auto no-scrollbar py-2">
                          {results.map((client) => (
                            <button
                              key={`${client.clientCode}-${client.clientID}`}
                              onClick={() => handleSelect(client)}
                              className="w-full text-left px-6 py-5 hover:bg-emerald-50/60 flex items-center justify-between group transition-all"
                            >
                              <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-600 font-black text-sm group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                                  {client.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <p className="text-[15px] font-bold text-zinc-900 leading-tight group-hover:text-emerald-700 transition-colors">{client.name}</p>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">#{client.clientCode}</span>
                                    <span className="h-1 w-1 rounded-full bg-zinc-200" />
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                      {client.clientType}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="w-10 h-10 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all transform group-hover:translate-x-2">
                                 <ArrowRight className="w-5 h-5" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 gap-5 text-zinc-500">
                        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center border border-dashed border-zinc-200">
                          <Search className="w-8 h-8 text-zinc-300" />
                        </div>
                        <div className="text-center">
                           <p className="text-xs font-black uppercase tracking-widest text-zinc-900">No Match Found</p>
                           <p className="text-[10px] font-medium text-zinc-400 mt-2 uppercase tracking-tight max-w-[200px] leading-relaxed mx-auto italic">
                             Double check the name or switch to "By Code" for exact IDs
                           </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-24 flex flex-col items-center justify-center text-zinc-400">
                     <div className="w-20 h-20 rounded-full bg-zinc-50/50 flex items-center justify-center mb-6 text-zinc-200">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 3 }}
                        >
                          <Search className="w-10 h-10" />
                        </motion.div>
                     </div>
                     <p className="text-[11px] font-black uppercase tracking-[0.3em] text-center max-w-[250px] leading-relaxed opacity-60">
                        Global Registry Access
                     </p>
                     <p className="text-[10px] font-medium text-zinc-400 mt-3 uppercase tracking-tight">
                        Awaiting input for discovery
                     </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
