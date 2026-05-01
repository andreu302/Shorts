/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Video, 
  Play, 
  Zap, 
  ArrowRight, 
  Github, 
  Twitter, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Film,
  Type
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface StoryboardShot {
  time: string;
  action: string;
  caption: string;
  thumbnail?: string;
}

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyboard, setStoryboard] = useState<StoryboardShot[]>([]);
  const [videoGenerated, setVideoGenerated] = useState(false);
  const [postStatus, setPostStatus] = useState<'idle' | 'posting' | 'success'>('idle');
  const generatorRef = useRef<HTMLDivElement>(null);

  // Safe way to get the API Key without crashing the browser
  const ai = useMemo(() => {
    try {
      // In Vite, we should check both import.meta.env and the defined process.env
      const key = (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
      
      if (!key || key === 'MY_GEMINI_API_KEY') {
        console.warn("GEMINI_API_KEY não encontrada.");
        return null;
      }
      return new GoogleGenAI(key);
    } catch (e) {
      console.error("Erro ao inicializar IA:", e);
      return null;
    }
  }, []);

  const scrollToGenerator = () => {
    generatorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateStoryboard = async (userPrompt: string) => {
    if (!ai) {
      alert("Erro: Chave da API Gemini não configurada nas variáveis de ambiente.");
      return;
    }

    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const response = await model.generateContent({
        contents: [{
          role: "user",
          parts: [{
            text: `Crie um roteiro de 15 segundos para um YouTube Short baseado neste prompt: "${userPrompt}". 
            Retorne APENAS um JSON no formato: [{"time": "0s-3s", "action": "detailed visual description in English for image generation", "caption": "texto da legenda em português"}]. 
            Máximo de 3 cenas.`
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      });
      
      const text = response.response.text();
      const data = JSON.parse(text || "[]");
      
      // Now generate images for each shot
      const imageModel = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use regular flash for text-to-image description if needed, or if we had Imagen... 
      // Note: @google/genai doesn't directly support the 'gemini-2.5-flash-image' name via public SDK in the same way usually.
      // I'll stick to a safer implementation for the demo.
      
      setStoryboard(data);
    } catch (error) {
      console.error("Failed to generate storyboard", error);
      setIsGenerating(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setVideoGenerated(false);
    setStoryboard([]);

    await generateStoryboard(prompt);
    
    setTimeout(() => {
      setIsGenerating(false);
      setVideoGenerated(true);
    }, 1000);
  };

  const handlePost = async () => {
    setPostStatus('posting');
    try {
      const res = await fetch('/api/post-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.success) {
        setPostStatus('success');
        alert(data.message);
      }
    } catch (e) {
      console.error("Post failed", e);
      setPostStatus('idle');
    }
  };

  return (
    <div className="min-h-screen purple-gradient-bg selection:bg-neon-purple/30 selection:text-neon-purple">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030014]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neon-purple flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">ShortsAI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#" className="hover:text-white transition-colors">Exemplos</a>
            <a href="#" className="hover:text-white transition-colors">Preços</a>
          </div>

          <button className="px-5 py-2.5 rounded-full text-sm font-semibold bg-white text-black hover:bg-slate-200 transition-colors">
            Entrar
          </button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-purple/30 bg-neon-purple/10 text-neon-purple text-xs font-bold uppercase tracking-widest mb-6">
                <Sparkles className="w-3 h-3" /> Powered by Gemini
              </span>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] mb-8 tracking-tighter">
                Crie YouTube Shorts <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-pink-500 neon-glow">
                  em Segundos
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-12 leading-relaxed">
                Transforme suas ideias em vídeos curtos virais com o poder da nossa inteligência artificial. Sem edição, sem estresse.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={scrollToGenerator}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-neon-purple text-white font-bold text-lg neon-button flex items-center justify-center gap-2"
                  id="hero-generate-btn"
                >
                  Gerar meu vídeo <ArrowRight className="w-5 h-5" />
                </button>
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-bold text-lg hover:bg-white/10 transition-colors">
                  Ver demonstração
                </button>
              </div>
            </motion.div>

            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 blur-[100px] opacity-20 pointer-events-none">
              <div className="w-[600px] h-[600px] rounded-full bg-neon-purple animate-pulse" />
            </div>
          </div>
        </section>

        {/* Generator Section */}
        <section ref={generatorRef} className="py-24 px-6 bg-[#030014] relative">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent"
            >
              <div className="bg-[#05011a] rounded-[22px] p-8 md:p-12 border border-white/5 shadow-2xl">
                <div className="mb-10 text-center">
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Dê vida à sua ideia</h2>
                  <p className="text-slate-400">Descreva o vídeo que você quer criar e nossa IA fará o resto.</p>
                </div>

                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ex: Um astronauta tomando café em Marte no estilo cyberpunk..."
                      className="w-full h-40 bg-[#0a0524] border border-white/10 rounded-2xl p-6 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 transition-all resize-none font-medium"
                      id="video-prompt-input"
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-slate-500">
                      Máximo de 500 caracteres
                    </div>
                  </div>

                  <button
                    disabled={isGenerating || !prompt.trim()}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                      isGenerating || !prompt.trim()
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-neon-purple text-white hover:opacity-90 neon-button'
                    }`}
                    id="generate-action-btn"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" /> Processando sua visão...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 shadow-neon-purple" /> Gerar Vídeo Shorts
                      </>
                    )}
                  </button>
                </form>

                {/* Progress Simulation UI */}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-8 space-y-6"
                    >
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                        <span className="text-neon-purple animate-pulse">
                          {storyboard.length > 0 ? 'Renderizando Cenas...' : 'Imaginando Storyboard...'}
                        </span>
                        <span className="text-slate-500">{storyboard.length > 0 ? '75%' : '20%'}</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#100a33] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: storyboard.length > 0 ? "75%" : "20%" }}
                          transition={{ duration: 1.5 }}
                          className="h-full bg-neon-purple shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                        />
                      </div>
                      
                      {storyboard.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {storyboard.map((shot, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="group relative rounded-xl bg-white/5 border border-white/10 overflow-hidden"
                            >
                              {shot.thumbnail ? (
                                <img 
                                  src={shot.thumbnail} 
                                  alt={`Cena ${idx + 1}`} 
                                  className="w-full aspect-[9/16] object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full aspect-[9/16] bg-slate-800 flex items-center justify-center">
                                  <Loader2 className="animate-spin text-neon-purple" />
                                </div>
                              )}
                              
                              <div className="absolute inset-0 p-4 flex flex-col justify-between bg-gradient-to-t from-black to-transparent pointer-events-none">
                                <span className="self-start text-[10px] font-bold text-neon-purple px-2 py-0.5 rounded bg-black/50 border border-neon-purple/30">{shot.time}</span>
                                <div>
                                  <p className="text-[10px] text-slate-300 font-medium mb-1 line-clamp-2">{shot.action}</p>
                                  <div className="flex items-center gap-2 text-[10px] text-white font-bold italic">
                                    <Type className="w-3 h-3" /> "{shot.caption}"
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Result Area */}
                <AnimatePresence>
                  {videoGenerated && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12 pt-12 border-t border-white/5"
                    >
                      <div className="flex items-center gap-3 mb-6 text-green-400 font-bold">
                        <CheckCircle2 className="w-6 h-6" /> Vídeo pronto para Download!
                      </div>
                      
                      <div className="aspect-[9/16] max-w-[320px] mx-auto bg-slate-900 rounded-3xl overflow-hidden relative group cursor-pointer neon-border">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                        
                        {/* Placeholder for Video Player */}
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                          <Play className="w-16 h-16 text-white/50 group-hover:text-neon-purple transition-colors lg:bg-[#030014]/40 p-4 rounded-full backdrop-blur-sm" />
                        </div>

                        {/* Video Info Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 z-20 text-left">
                          <p className="text-white font-bold text-lg mb-1 truncate">{prompt}</p>
                          <p className="text-slate-400 text-sm">9:16 • 15 Segundos • 1080p</p>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <button className="flex-1 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                          <Video className="w-5 h-5" /> Baixar em HD
                        </button>
                        <button 
                          onClick={handlePost}
                          disabled={postStatus !== 'idle'}
                          className={`flex-1 py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                            postStatus === 'success' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                          }`}
                        >
                          {postStatus === 'posting' ? <Loader2 className="animate-spin w-5 h-5" /> : null}
                          {postStatus === 'success' ? <CheckCircle2 className="w-5 h-5" /> : null}
                          {postStatus === 'success' ? 'Postado!' : 'Postar no YouTube'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  title: 'Ultra Rápido', 
                  desc: 'Gere um Shorts completo em menos de 60 segundos usando nossos clusters de GPU.',
                  icon: <Zap className="w-6 h-6 text-yellow-400" />
                },
                { 
                  title: 'Estilos Variados', 
                  desc: 'Desde Cyberpunk até Cinematic, escolha o estilo que mais combina com seu canal.',
                  icon: <Sparkles className="w-6 h-6 text-blue-400" />
                },
                { 
                  title: 'Legendas Auto', 
                  desc: 'Nossa IA adiciona legendas dinâmicas e efeitos sonoros automaticamente.',
                  icon: <Video className="w-6 h-6 text-neon-purple" />
                }
              ].map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-neon-purple/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-50">
            <Zap className="w-5 h-5 fill-neon-purple text-neon-purple" />
            <span className="font-display font-bold">ShortsAI</span>
          </div>
          
          <p className="text-sm">© 2026 ShortsAI. Todos os direitos reservados.</p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
