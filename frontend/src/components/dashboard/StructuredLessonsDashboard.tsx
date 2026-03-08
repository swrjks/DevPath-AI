import { useState, useEffect } from 'react';
import { BookOpen, Clock, ChevronRight, Search, Filter, Lock, CheckCircle, Brain, Zap, Terminal, ChevronLeft } from 'lucide-react';

const categoryColors: Record<string, string> = {
  JavaScript: '#f59e0b',
  React: '#06b6d4',
  Python: '#10b981',
  General: '#6366f1',
};

interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimated_time_minutes: number;
  category: string;
  source_video_id: string;
  content: {
    raw_markdown?: string;
    learning_objectives?: string[];
    key_concepts?: string[];
  };
}

export default function StructuredLessonsDashboard({
  mode = 'learn',
  onStartQuiz,
  onStartCodingTasks,
  onStartGuidedLearning,
  onBackToVideo
}: {
  mode?: 'learn' | 'practice';
  onStartQuiz: (id: string) => void;
  onStartCodingTasks: (id: string) => void;
  onStartGuidedLearning: (id: string) => void;
  onBackToVideo: () => void;
}) {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/tutorial-modules')
      .then(res => res.json())
      .then(data => {
        setModules(data || []);
      })
      .catch(err => {
        console.error('Failed to fetch modules', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this module?")) return;
    try {
      await fetch(`/api/tutorial-modules/${id}`, { method: 'DELETE' });
      setModules(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = modules.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) || 
    m.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in min-h-full flex flex-col max-w-7xl mx-auto w-full pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
              onClick={onBackToVideo}
              className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all flex items-center justify-center border border-border/50 shadow-sm shrink-0"
              title="Back"
          >
              <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">
              {mode === 'practice' ? 'Coding Tasks' : 'Structured Lessons'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading ? 'Loading...' : `${filtered.length} generated module${filtered.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-primary/90" onClick={onBackToVideo}>
          <Zap size={16} /> Process More Videos
        </button>
      </div>

      {modules.length > 0 && (
        <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-xl border border-border/50">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search lessons..."
              className="w-full bg-background border border-border/50 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
          <p>Loading your lessons...</p>
        </div>
      )}

      {!isLoading && modules.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-secondary/20 rounded-2xl border border-border/50 border-dashed">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Brain size={40} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No structured lessons yet</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Process a YouTube video in the Tutorial Modules tab to automatically generate AI-powered learning modules including quizzes and guided coding.
          </p>
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg glow-primary" onClick={onBackToVideo}>
            <Zap size={18} /> Generate Learning Module
          </button>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filtered.map(module => {
            const catColor = categoryColors[module.category] || categoryColors.General;
            
            return (
              <div key={module.id} className="min-h-[420px] bg-secondary/20 border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group relative flex flex-col">
                <div className="h-1 w-full" style={{ background: catColor }} />


                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex gap-2 mb-4">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md" style={{ background: `${catColor}20`, color: catColor }}>
                      {module.category}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-500">
                      {module.difficulty}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg mb-2 leading-tight">{module.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                    {module.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-6">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {module.estimated_time_minutes} min</span>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-background border border-border/50">
                      {module.content.learning_objectives?.length || 0} Objectives
                    </span>
                  </div>

                  <div className="space-y-2 mt-auto">
                    {mode === 'practice' ? (
                      <button 
                        onClick={() => onStartCodingTasks(module.id)}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground p-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        <Terminal size={16} /> Start Coding Task
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => onStartQuiz(module.id)}
                          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground p-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          Start Quiz Challenge <ChevronRight size={16} />
                        </button>
                        <button 
                          onClick={() => onStartGuidedLearning(module.id)}
                          className="w-full flex items-center justify-center gap-2 bg-secondary text-foreground p-2.5 rounded-xl text-sm font-medium hover:bg-secondary/80 border border-border/50 transition-colors"
                        >
                          <BookOpen size={16} /> Guided Learning
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
