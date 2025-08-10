'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';

const Game = dynamic(() => import('@/game/Game'), { ssr: false });

export default function Page() {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="w-screen h-screen relative">
      {!started && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-br from-[#0b0d13] via-[#0b0d13]/95 to-[#0b0d13]">
          <div className="w-full max-w-xl p-8 rounded-2xl bg-panel/70 backdrop-blur border border-white/5 shadow-[0_0_120px_rgba(122,162,247,0.15)]">
            <h1 className="text-3xl font-bold mb-2 tracking-wide">Neon Souls</h1>
            <p className="text-white/70 mb-6">Prova de conceito 3D em Three.js + R3F. W/A/S/D mover, Espaço pular, Clique atacar.</p>
            <div className="flex gap-3">
              <button
                disabled={loading}
                onClick={() => setStarted(true)}
                className="neon-button disabled:opacity-50"
              >{loading ? 'Carregando...' : 'Iniciar'}</button>
              <a href="https://github.com/julienschmah" target="_blank" className="neon-button">Repo</a>
            </div>
          </div>
        </div>
      )}
      <Game started={started} onError={setError} />
      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 text-sm text-red-300 bg-red-900/30 border border-red-500/30 px-3 py-2 rounded">
          {error}
        </div>
      )}
    </main>
  );
}
