import React, { useState, useRef } from 'react'
import { Image as ImageIcon, Mic, Sparkles, Loader2, UploadCloud, X, Download } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'https://unified-ai-backend.aa6154332.workers.dev';

const SPEAKERS = [
  "amalthea", "andromeda", "apollo", "arcas", "aries", "asteria", "athena", "atlas", 
  "aurora", "callista", "cora", "cordelia", "delia", "draco", "electra", "harmonia", 
  "helena", "hera", "hermes", "hyperion", "iris", "janus", "juno", "jupiter", "luna", 
  "mars", "minerva", "neptune", "odysseus", "ophelia", "orion", "orpheus", "pandora", 
  "phoebe", "pluto", "saturn", "thalia", "theia", "vesta", "zeus"
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'image' | 'tts'>('image')

  // TTS State
  const [ttsText, setTtsText] = useState('')
  const [ttsLoading, setTtsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [voice, setVoice] = useState('asteria')

  // Image State
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imagePrompt, setImagePrompt] = useState<string>('')
  const [imageLoading, setImageLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleGenerateAudio = async () => {
    if (!ttsText) return;
    setTtsLoading(true);
    setAudioUrl(null);
    try {
      const res = await fetch(`${API_BASE}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ttsText, speaker: voice })
      });
      if (!res.ok) throw new Error("Failed to generate audio");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (e) {
      console.error(e);
      alert("Error generating audio. Make sure backend is running.");
    } finally {
      setTtsLoading(false);
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImagePrompt('');
    }
  }

  const handleAnalyzeImage = async () => {
    if (!imageFile) return;
    setImageLoading(true);
    setImagePrompt('');
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const res = await fetch(`${API_BASE}/api/image-to-text`, {
         method: 'POST',
         body: formData
      });
      if (!res.ok) throw new Error("Failed to analyze image");
      const data = await res.json();
      setImagePrompt(data.description || data.response || "No description generated.");
    } catch (e) {
      console.error(e);
      alert("Error analyzing image. Make sure backend is running.");
    } finally {
      setImageLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[var(--color-glaido-bg)] text-white font-sans flex flex-col items-center selection:bg-[var(--color-glaido-accent)] selection:text-black">
      
      {/* Header & Nav */}
      <header className="w-full max-w-4xl pt-16 pb-12 flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-glaido-accent)] flex items-center justify-center text-black shadow-[0_0_20px_rgba(188,243,102,0.3)]">
            <Sparkles size={20} />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter">OmniAI</h1>
        </div>
        
        <div className="flex bg-[var(--color-glaido-card)] p-1.5 rounded-full border border-[var(--color-glaido-border)] shadow-xl relative z-10 w-fit">
          <button 
            onClick={() => setActiveTab('image')}
            className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'image' ? 'bg-[var(--color-glaido-accent)] text-black shadow-md' : 'text-[var(--color-glaido-text-muted)] hover:text-white'}`}
          >
            <span className="flex items-center gap-2"><ImageIcon size={16}/> Image to Prompt</span>
          </button>
          <button 
            onClick={() => setActiveTab('tts')}
            className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'tts' ? 'bg-[var(--color-glaido-accent)] text-black shadow-md' : 'text-[var(--color-glaido-text-muted)] hover:text-white'}`}
          >
            <span className="flex items-center gap-2"><Mic size={16}/> Text to Speech</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-3xl px-6 pb-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-[var(--color-glaido-accent)]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        {activeTab === 'image' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-2xl font-semibold mb-6 text-center tracking-tight">Extract detailed prompts from your images</h2>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />

            {!imagePreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="bg-[var(--color-glaido-bg)] border-2 border-dashed border-[var(--color-glaido-border)] hover:border-[var(--color-glaido-accent)]/50 hover:bg-[var(--color-glaido-card)] transition-all duration-300 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[300px] cursor-pointer group shadow-lg"
              >
                <div className="w-16 h-16 rounded-full bg-[var(--color-glaido-card)] group-hover:bg-[var(--color-glaido-accent)]/10 text-[var(--color-glaido-text-muted)] group-hover:text-[var(--color-glaido-accent)] flex items-center justify-center mb-6 transition-colors shadow-inner">
                  <UploadCloud size={32} />
                </div>
                <p className="text-xl font-medium text-white mb-2">Click or drag image to upload</p>
                <p className="text-[var(--color-glaido-text-muted)]">Supports JPG, PNG, WEBP (Max 10MB)</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[var(--color-glaido-card)] border border-[var(--color-glaido-border)] rounded-2xl p-2 relative overflow-hidden shadow-xl">
                  <button 
                    onClick={() => setImagePreview(null)} 
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur transition-colors z-10"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                  <div className="flex justify-center bg-black/40 rounded-xl overflow-hidden min-h-[200px] max-h-[400px] items-center">
                    <img src={imagePreview} alt="Preview" className="object-contain w-full h-full max-h-[400px]" />
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button 
                    onClick={handleAnalyzeImage}
                    disabled={imageLoading}
                    className="bg-[var(--color-glaido-accent)] text-black font-bold text-lg px-10 py-4 rounded-xl shadow-[0_0_20px_rgba(188,243,102,0.2)] hover:shadow-[0_0_30px_rgba(188,243,102,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 min-w-[240px]"
                  >
                    {imageLoading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />} 
                    {imageLoading ? "Analyzing Magic..." : "Generate Prompt"}
                  </button>
                </div>

                {(imagePrompt || imageLoading) && (
                  <div className="bg-[var(--color-glaido-card)] border border-[var(--color-glaido-border)] rounded-2xl p-6 shadow-xl mt-8">
                    <h3 className="text-sm font-medium mb-4 text-[var(--color-glaido-accent)] uppercase tracking-wider flex items-center gap-2">
                       <Sparkles size={14} /> Analysis Result
                    </h3>
                    <div className="w-full text-white/90 text-lg leading-relaxed min-h-[80px]">
                      {imageLoading ? (
                        <div className="flex items-center gap-3 text-[var(--color-glaido-text-muted)] animate-pulse">
                          Waiting for AI...
                        </div>
                      ) : (
                        <p>{imagePrompt}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tts' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-2xl font-semibold mb-6 text-center tracking-tight">Convert text into lifelike audio instantly</h2>
            
            <div className="bg-[var(--color-glaido-card)] border border-[var(--color-glaido-border)] rounded-2xl shadow-xl overflow-hidden focus-within:border-[var(--color-glaido-accent)]/50 transition-colors duration-300">
              <div className="p-4 border-b border-[var(--color-glaido-border)] flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[var(--color-glaido-text-muted)]">Voice Model</span>
                  <select 
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="bg-transparent border-none text-white text-sm font-semibold focus:outline-none cursor-pointer"
                  >
                    {SPEAKERS.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <span className="text-xs text-[var(--color-glaido-text-muted)] font-mono bg-black/40 px-2 py-1 rounded">
                  {ttsText.length} chars
                </span>
              </div>
              
              <textarea 
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                className="w-full h-48 bg-transparent p-6 text-white text-lg focus:outline-none resize-none leading-relaxed placeholder:text-white/20"
                placeholder="Type your script here. The AI will convert these words into natural human speech using our ultra-fast Aura-2 engine..."
              />
            </div>
            
            <div className="flex justify-center mt-8">
              <button 
                onClick={handleGenerateAudio}
                disabled={ttsLoading || !ttsText.trim()}
                className="bg-[var(--color-glaido-accent)] text-black font-bold text-lg px-10 py-4 rounded-xl shadow-[0_0_20px_rgba(188,243,102,0.2)] hover:shadow-[0_0_30px_rgba(188,243,102,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 min-w-[240px]"
              >
                {ttsLoading ? <Loader2 className="animate-spin" size={24} /> : <Mic size={24} />} 
                {ttsLoading ? 'Synthesizing Audio...' : 'Generate Audio'}
              </button>
            </div>

            {audioUrl && (
              <div className="mt-10 bg-[var(--color-glaido-card)] p-6 rounded-2xl border border-[var(--color-glaido-border)] flex flex-col shadow-xl animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-[var(--color-glaido-accent)] uppercase tracking-wider flex items-center gap-2 m-0">
                      <Mic size={14} /> Output Audio
                  </h3>
                  <a 
                    href={audioUrl} 
                    download="generated-audio.mp3" 
                    className="flex justify-center items-center gap-2 text-xs font-bold bg-[var(--color-glaido-bg)] border border-[var(--color-glaido-border)] hover:bg-[var(--color-glaido-border)] hover:text-[var(--color-glaido-accent)] text-white px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download size={14} /> Download MP3
                  </a>
                </div>
                <audio src={audioUrl} controls className="w-full h-12" autoPlay />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
