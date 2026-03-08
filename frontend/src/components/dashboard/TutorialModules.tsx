import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Loader2, Sparkles, Youtube, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

const TutorialModules = () => {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  // Chat State
  const [activeTab, setActiveTab] = useState<'summary' | 'chat'>('summary');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  // Extract YouTube video ID from various URL formats
  const extractVideoId = (inputUrl: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = inputUrl.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const handlePasteUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    
    // Automatically extract ID and set it if valid
    const extractedId = extractVideoId(inputUrl);
    if (extractedId) {
      setVideoId(extractedId);
    } else {
      setVideoId(null);
    }
  };

  const handleAnalyze = async () => {
    if (!videoId) return;
    
    setIsAnalyzing(true);
    setSummary(null);

    try {
      // In a real app, you'd fetch video metadata here or send the URL to backend
      const response = await fetch("/api/tutorial-modules/analyze-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl: url }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze video");
      }

      const data = await response.json();
      setSummary(data.summary);
      setActiveTab('summary'); // Reset to summary when a new analysis completes
      setChatHistory([
        { role: 'ai', content: "Hi! I've analyzed this video for you. What specific questions do you have about the content?" }
      ]);
    } catch (error) {
      console.error(error);
      setSummary("Error: Could not generate a summary. Please ensure the backend is running and the OpenAI exact API key is set.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskQuestion = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || !videoId) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput.trim() };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput("");
    setIsChatting(true);

    try {
      const response = await fetch("/api/tutorial-modules/ask-video-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          videoUrl: url, 
          question: userMessage.content,
          chatHistory: chatHistory // Send context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'ai', content: data.answer }]);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: 'ai', content: "Sorry, I had trouble connecting to the backend to answer that." }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-full flex flex-col gap-4 overflow-hidden pt-2 pb-4">
      <div className="flex flex-col space-y-1 shrink-0">
        <h1 className="text-3xl font-display font-bold">Tutorial Modules</h1>
        <p className="text-muted-foreground text-sm">
          Import any YouTube programming tutorial to extract concepts, generate summaries, and build a learning roadmap.
        </p>
      </div>

      {/* Input Section */}
      <div className="glass-strong rounded-xl p-4 border border-border/50 shadow-sm relative z-10 shrink-0">
        <label className="text-sm font-semibold mb-2 block text-foreground/90">
          Paste YouTube Link
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Link2 size={18} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            className="w-full bg-secondary/50 border border-border/50 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={handlePasteUrl}
          />
        </div>
      </div>

      {/* Video Preview & Analysis Section */}
      <AnimatePresence mode="wait">
        {videoId && (
          <motion.div
            key="video-preview"
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="flex flex-col gap-4 flex-1 min-h-0"
          >
            {/* Video Wrapper */}
            <div className="relative w-full max-w-2xl mx-auto aspect-video rounded-xl overflow-hidden shadow-lg border border-border/50 bg-black shrink-0">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Analyze Button */}
            <div className="flex justify-end shrink-0">
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-6 flex items-center gap-2 transition-all hover:scale-105"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Analyzing Content...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Analyze with AI
                  </>
                )}
              </Button>
            </div>

            {/* Analysis Result / Chat Interface */}
            {summary && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-xl overflow-hidden border border-primary/20 bg-primary/5 shadow-inner flex flex-col flex-1 min-h-0"
              >
                {/* Tabs */}
                <div className="flex items-center gap-4 px-6 pt-4 pb-0 border-b border-primary/10">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`pb-4 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                      activeTab === 'summary' 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Sparkles size={16} /> AI Summary
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`pb-4 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                      activeTab === 'chat' 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <MessageSquare size={16} /> Ask AI
                  </button>
                </div>

                {/* Tab Content Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {/* Summary Tab */}
                  {activeTab === 'summary' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-foreground/90 leading-relaxed max-w-none prose prose-invert prose-headings:font-display prose-headings:text-primary prose-a:text-primary prose-strong:text-white prose-code:bg-secondary/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-secondary/50 prose-pre:p-4"
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
                    </motion.div>
                  )}

                  {/* Chat Tab */}
                  {activeTab === 'chat' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col h-full"
                    >
                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pb-2 pr-2" style={{ maxHeight: '400px' }}>
                        {chatHistory.map((msg, index) => (
                          <div 
                            key={index} 
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                              msg.role === 'user' 
                                ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                : 'bg-secondary text-foreground/90 rounded-tl-none border border-border/50'
                            }`}>
                              {msg.role === 'user' ? (
                                msg.content
                              ) : (
                                <div className="text-sm leading-relaxed max-w-none prose prose-invert prose-p:my-1 prose-strong:text-white prose-code:bg-background/50 prose-code:px-1 prose-pre:bg-background/50">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {isChatting && (
                          <div className="flex justify-start">
                            <div className="max-w-[80%] rounded-2xl rounded-tl-none px-4 py-3 bg-secondary border border-border/50 flex items-center gap-2">
                              <Loader2 size={14} className="animate-spin text-primary" />
                              <span className="text-sm text-muted-foreground animate-pulse">Thinking...</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chat Input */}
                      <div className="pt-4 border-t border-primary/10 mt-auto">
                        <form onSubmit={handleAskQuestion} className="relative flex items-center gap-2">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask a question about this video..."
                            className="flex-1 bg-background/50 border border-border/50 focus:border-primary/50 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                            disabled={isChatting}
                          />
                          <Button 
                            type="submit" 
                            disabled={!chatInput.trim() || isChatting}
                            size="icon"
                            className="absolute right-1.5 h-9 w-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-transform active:scale-95"
                          >
                            <Send size={16} className={isChatting ? 'opacity-50' : ''} />
                          </Button>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TutorialModules;
