
import React, { useState, useEffect } from 'react';
import { ToolType, SubToolType } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import Downloader from './components/Downloader.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import Tutorials from './components/Tutorials.tsx';
import Splash from './components/Splash.tsx';
import IntelligenceHub from './components/IntelligenceHub.tsx';
import Community from './components/Community.tsx';
import Contact from './components/Contact.tsx';
import PrivacyPolicy from './components/PrivacyPolicy.tsx';
import TermsOfService from './components/TermsOfService.tsx';
import TrendingFeed from './components/TrendingFeed.tsx';
import ViralHits from './components/ViralHits.tsx';
import { 
  LayoutDashboard, 
  Box,
  MonitorPlay,
  Settings,
  Zap,
  Users,
  Mail,
  Menu,
  X,
  ShieldCheck,
  Gavel,
  Radio,
  Flame
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.DASHBOARD);
  const [activeSubTool, setActiveSubTool] = useState<SubToolType>(SubToolType.IDEAS);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { id: ToolType.DASHBOARD, label: 'Panel Principal', icon: LayoutDashboard },
    { id: ToolType.TRENDING, label: 'Radar Viral', icon: Radio },
    { id: ToolType.VIRAL_HITS, label: 'Top Hits', icon: Flame },
    { id: ToolType.TUTORIALS, label: 'Bóveda Contenido', icon: MonitorPlay },
    { id: ToolType.INTELLIGENCE, label: 'Estrategia Richacks', icon: Zap, hasSub: true },
    { id: ToolType.DOWNLOADER, label: 'Deep Vault', icon: Box },
    { id: ToolType.COMMUNITY, label: 'Comunidad Elite', icon: Users },
    { id: ToolType.CONTACT, label: 'Contacto Directo', icon: Mail },
    { id: ToolType.ADMIN, label: 'Panel Maestro', icon: Settings },
  ];

  if (showSplash) return <Splash />;

  const renderContent = () => {
    switch (activeTool) {
      case ToolType.DASHBOARD: return <Dashboard onSelectTool={setActiveTool} />;
      case ToolType.TRENDING: return <TrendingFeed />;
      case ToolType.VIRAL_HITS: return <ViralHits />;
      case ToolType.INTELLIGENCE: return <IntelligenceHub activeSub={activeSubTool} onSubChange={setActiveSubTool} />;
      case ToolType.DOWNLOADER: return <Downloader />;
      case ToolType.ADMIN: return <AdminPanel />;
      case ToolType.TUTORIALS: return <Tutorials />;
      case ToolType.COMMUNITY: return <Community />;
      case ToolType.CONTACT: return <Contact />;
      case ToolType.PRIVACY: return <PrivacyPolicy />;
      case ToolType.TERMS: return <TermsOfService />;
      default: return <Dashboard onSelectTool={setActiveTool} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#030305] text-slate-200 font-sans">
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[110] w-80 bg-[#050507] border-r border-white/5 p-8 transform transition-all duration-500
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <span className="text-black font-black text-2xl italic">R</span>
            </div>
            <span className="font-black text-xl uppercase italic text-white">Richacks</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white"><X size={24}/></button>
        </div>

        <nav className="space-y-1 h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
          {navItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => { setActiveTool(item.id); if (!item.hasSub) setSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all ${
                  activeTool === item.id ? 'bg-white text-black' : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={18} />
                <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
              </button>
              {item.hasSub && activeTool === item.id && (
                <div className="ml-10 mt-2 space-y-1 border-l border-white/5 pl-4">
                  {Object.values(SubToolType).map(sub => (
                    <button 
                      key={sub}
                      onClick={() => setActiveSubTool(sub)} 
                      className={`w-full text-left py-2 text-[9px] font-black uppercase tracking-widest ${activeSubTool === sub ? 'text-blue-500' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-12">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed top-6 right-6 z-[120] bg-white text-black p-4 rounded-2xl"><Menu size={20}/></button>
    </div>
  );
};

export default App;
