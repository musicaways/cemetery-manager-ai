
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeTab } from "@/components/settings/ThemeTab";
import { AITab } from "@/components/settings/AITab";
import { APIKeysTab } from "@/components/settings/APIKeysTab";
import { Layout } from "@/components/Layout";
import { Palette, Bot, Key, Database, Wifi, Shield } from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("theme");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Impostazioni</h1>
          <p className="text-gray-400">Gestisci le preferenze dell'applicazione e le API</p>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <Tabs 
            defaultValue="theme" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full bg-[#191D29] p-1 rounded-lg">
              <TabsTrigger 
                value="theme" 
                className="data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-white"
              >
                <Palette className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Tema</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-white"
              >
                <Bot className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">AI</span>
              </TabsTrigger>
              <TabsTrigger 
                value="keys" 
                className="data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-white"
              >
                <Key className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">API Keys</span>
              </TabsTrigger>
              <TabsTrigger 
                value="data" 
                className="data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-white hidden md:flex"
              >
                <Database className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Dati</span>
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-white hidden md:flex"
              >
                <Shield className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="theme" className="space-y-6 animate-fade-in">
              <ThemeTab onSave={() => {}} />
            </TabsContent>

            <TabsContent value="ai" className="space-y-6 animate-fade-in">
              <AITab onSave={() => {}} />
            </TabsContent>

            <TabsContent value="keys" className="space-y-6 animate-fade-in">
              <APIKeysTab onSave={() => {}} />
            </TabsContent>

            <TabsContent value="data" className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Gestione Dati</h3>
                <p className="text-sm text-gray-400">
                  Gestisci le impostazioni relative ai dati locali e remoti dell'applicazione.
                </p>
                
                <div className="space-y-6 mt-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Cache Locale</h4>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-md">
                        <div>
                          <p className="text-sm font-medium">Cimiteri</p>
                          <p className="text-xs text-gray-400">Dati dei cimiteri memorizzati localmente</p>
                        </div>
                        <button className="px-3 py-1 text-xs rounded-md bg-[var(--primary-color)]/10 text-[var(--primary-color)] hover:bg-[var(--primary-color)]/20 transition-colors">
                          Pulisci
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-md">
                        <div>
                          <p className="text-sm font-medium">Immagini</p>
                          <p className="text-xs text-gray-400">Immagini e media memorizzati localmente</p>
                        </div>
                        <button className="px-3 py-1 text-xs rounded-md bg-[var(--primary-color)]/10 text-[var(--primary-color)] hover:bg-[var(--primary-color)]/20 transition-colors">
                          Pulisci
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-md">
                        <div>
                          <p className="text-sm font-medium">Modello AI</p>
                          <p className="text-xs text-gray-400">Modello AI locale per funzionamento offline</p>
                        </div>
                        <button className="px-3 py-1 text-xs rounded-md bg-[var(--primary-color)]/10 text-[var(--primary-color)] hover:bg-[var(--primary-color)]/20 transition-colors">
                          Ricarica
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Sincronizzazione</h4>
                    <div className="flex justify-between items-center py-3 px-4 border border-white/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-[var(--primary-color)]/10">
                          <Wifi className="w-4 h-4 text-[var(--primary-color)]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Sincronizzazione Automatica</p>
                          <p className="text-xs text-gray-400">Sincronizza i dati quando torni online</p>
                        </div>
                      </div>
                      <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-[var(--primary-color)]">
                        <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Privacy e Sicurezza</h3>
                <p className="text-sm text-gray-400">
                  Gestisci le impostazioni relative alla privacy e alla sicurezza dell'applicazione.
                </p>
                
                <div className="space-y-6 mt-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Dati di Utilizzo</h4>
                    <div className="flex justify-between items-center py-3 px-4 border border-white/10 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Analisi Anonima</p>
                        <p className="text-xs text-gray-400">Condividi dati anonimi per migliorare l'app</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-gray-600">
                        <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Cancellazione Dati</h4>
                    <div className="p-4 border border-red-900/30 bg-red-900/10 rounded-lg">
                      <p className="text-sm font-medium text-red-400">Cancella tutti i dati</p>
                      <p className="text-xs text-gray-400 mt-1 mb-3">
                        Questa azione cancellerà tutti i dati locali e non può essere annullata.
                      </p>
                      <button className="px-3 py-1.5 text-xs rounded-md bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors">
                        Cancella Dati
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
