import React from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { LayoutDashboard, Folder, Settings, Plus } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background-base text-text-primary font-sans transition-colors duration-300">
      {/* Mini Sidebar Placeholder */}
      <aside className="w-full md:w-64 bg-background-surface border-b md:border-b-0 md:border-r border-border p-4 flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold">
            E
          </div>
          <h1 className="text-heading font-bold">EVM Tracker</h1>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-3 py-2 bg-accent-subtle text-accent rounded-md">
            <LayoutDashboard size={18} />
            <span className="text-body font-medium">Dashboard</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-text-secondary hover:bg-background-elevated rounded-md transition-colors cursor-pointer">
            <Folder size={18} />
            <span className="text-body">Proyectos</span>
          </div>
        </nav>

        <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
          <button className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
            <Settings size={18} />
            <span className="text-caption">Config</span>
          </button>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 flex flex-col gap-8">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-heading md:text-2xl font-bold">Resumen General</h2>
            <p className="text-text-secondary text-body">Cimientos del sistema de diseño establecidos.</p>
          </div>
          <button className="bg-accent text-white px-4 py-2 rounded-md flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus size={18} />
            <span>Nuevo Proyecto</span>
          </button>
        </header>

        {/* Demo Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-elevated">
            <h3 className="text-label text-text-secondary mb-2">SISTEMA DE TOKENS</h3>
            <p className="text-text-primary text-body">
              Las variables CSS permiten el cambio de tema instantáneo y el efecto Glassmorphism.
            </p>
          </div>
          
          <div className="card-elevated">
            <h3 className="text-label text-text-secondary mb-2">TIPOGRAFÍA</h3>
            <div className="flex flex-col gap-1">
              <p className="font-sans text-body">Interfaz: Geist Sans</p>
              <p className="font-mono text-kpi-sm text-health-green">Números: DM Mono 1.00</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl flex flex-col gap-2">
            <h3 className="text-label text-accent mb-1 uppercase tracking-wider">UI Elevada</h3>
            <p className="text-text-primary text-body">
              Este es un panel con Glassmorphism (blur + transparencia).
            </p>
            <div className="mt-2 h-2 w-full bg-background-elevated rounded-full overflow-hidden">
              <div className="h-full bg-accent w-2/3"></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
