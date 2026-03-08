import { useState, useEffect } from 'react';
import {
    CheckCircle, XCircle, Clock, ArrowRight, RotateCcw,
    Trophy, AlertCircle, ChevronLeft, Brain, Zap, ChevronDown, ChevronRight, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type QuizState = 'dashboard' | 'intro' | 'taking' | 'results';

interface Answer {
    questionId: string;
    selected: number | null;
}

export default function QuizView({ moduleId, onBack }: { moduleId: string | null, onBack?: () => void }) {
    const [quizState, setQuizState] = useState<QuizState>(moduleId ? 'intro' : 'dashboard');
    const [currentModuleId, setCurrentModuleId] = useState<string | null>(moduleId);
    const [dashboardModules, setDashboardModules] = useState<any[]>([]);
    const [dashboardAttempts, setDashboardAttempts] = useState<any[]>([]);
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);

    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);
    const [quiz, setQuiz] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(!!moduleId);
    const [selectedCount, setSelectedCount] = useState<number | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    useEffect(() => {
        if (moduleId) {
            setCurrentModuleId(moduleId);
            setQuizState('intro');
        } else {
            setCurrentModuleId(null);
            setQuizState('dashboard');
        }
    }, [moduleId]);

    useEffect(() => {
        if (currentModuleId) {
            setIsLoading(true);
            fetch(`/api/tutorial-modules/${currentModuleId}/quiz`)
                .then(res => res.json())
                .then(data => {
                    setQuiz(data);
                    setTimeLeft(data.timeLimit || 300);
                })
                .catch(err => {
                    console.error("Failed to load quiz", err);
                })
                .finally(() => setIsLoading(false));
        }
    }, [currentModuleId]);

    useEffect(() => {
        let timer: any;
        if (quizState === 'taking' && timeLeft > 0 && !showExplanation) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [quizState, timeLeft, showExplanation]);

    useEffect(() => {
        if (quizState === 'dashboard') {
            setIsDashboardLoading(true);
            Promise.all([
                fetch('/api/tutorial-modules').then(res => res.json()),
                fetch('/api/tutorial-modules/quiz/attempts').then(res => res.json())
            ]).then(([mods, atts]) => {
                setDashboardModules(mods || []);
                setDashboardAttempts(atts || []);
            }).catch(console.error).finally(() => setIsDashboardLoading(false));
        }
    }, [quizState]);

    if (!currentModuleId && quizState !== 'dashboard') return null;

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground h-full min-h-[500px]">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
                <p>Generating interactive AI quiz based on module content...</p>
                <p className="text-xs opacity-70 mt-2 text-center max-w-sm">This can take up to 10 seconds as the AI reads the entire transcript to generate challenging multiple choice questions.</p>
            </div>
        );
    }

    if (quizState !== 'dashboard' && (!quiz || !quiz.questions || quiz.questions.length === 0)) {
        return <div className="p-8 text-center text-sm text-muted-foreground mt-20">Failed to generate quiz for this module. Retrying might help.</div>;
    }

    const allQuestions = quiz?.questions || [];
    const availableCounts = [
        ...(allQuestions.length >= 3 ? [3] : []),
        ...(allQuestions.length >= 5 ? [5] : []),
        ...(allQuestions.length >= 10 ? [10] : []),
    ];
    const activeCount = selectedCount && selectedCount <= allQuestions.length ? selectedCount : allQuestions.length;
    const activeQuestions = allQuestions.slice(0, activeCount);

    const question = activeQuestions[currentQ];
    const isLastQuestion = currentQ === activeQuestions.length - 1;

    const handleSelect = (index: number) => {
        if (showExplanation) return;
        setSelectedOption(index);
    };

    const handleConfirm = () => {
        if (selectedOption === null) return;
        setShowExplanation(true);
    };

    const handleNext = () => {
        const newAnswers = [...answers, { questionId: question.id, selected: selectedOption }];
        setAnswers(newAnswers);

        if (isLastQuestion) {
            setQuizState('results');

            // Save attempt to backend
            const scoreCalc = newAnswers.filter((a, i) => a.selected === activeQuestions[i]?.correctAnswer).length;
            const scorePercentCalc = Math.round((scoreCalc / activeQuestions.length) * 100);

            fetch(`/api/tutorial-modules/${currentModuleId}/quiz/attempt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    score: scoreCalc,
                    totalQuestions: activeQuestions.length,
                    passed: scorePercentCalc >= 70
                })
            }).catch(console.error);

        } else {
            setCurrentQ(q => q + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        }
    };

    const handleRestart = () => {
        setQuizState('intro');
        setCurrentQ(0);
        setAnswers([]);
        setSelectedOption(null);
        setShowExplanation(false);
        setSelectedCount(null);
        setTimeLeft(quiz.timeLimit || 300);
    };

    const score = answers.filter(
        (a, i) => a.selected === activeQuestions[i]?.correctAnswer
    ).length;
    const scorePercent = Math.round((score / activeQuestions.length) * 100);
    const passed = scorePercent >= 70;

    const btnClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
    const btnPrimary = `${btnClasses} bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-2xl`;
    const btnSecondary = `${btnClasses} bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 rounded-2xl`;

    // ── DASHBOARD ────────────────────────────────────────────────────────
    if (quizState === 'dashboard') {
        if (isDashboardLoading) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground h-full min-h-[500px]">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
                    <p>Loading your Quiz Dashboard...</p>
                </div>
            );
        }

        const totalTaken = dashboardAttempts.length;
        const avgScore = totalTaken > 0
            ? Math.round(dashboardAttempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions * 100), 0) / totalTaken)
            : 0;
        const totalPassed = dashboardAttempts.filter(a => a.passed).length;

        return (
            <div className="max-w-6xl mx-auto w-full fade-in h-full flex flex-col pb-20 pt-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button 
                                onClick={onBack}
                                className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all flex items-center justify-center border border-border/50 shadow-sm shrink-0"
                                title="Back to Learn"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        <div>
                            <h1 className="text-3xl font-display font-bold text-foreground">Quiz Dashboard</h1>
                            <p className="text-sm text-muted-foreground mt-1">Track your practice history and start new challenges.</p>
                        </div>
                    </div>

                </div>

                {/* Header Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center glow-primary">
                        <Trophy size={24} className="text-primary mb-2" />
                        <p className="text-3xl font-bold font-mono text-foreground">{totalTaken}</p>
                        <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-wider">Quizzes Taken</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center">
                        <Zap size={24} className="text-emerald-500 mb-2" />
                        <p className="text-3xl font-bold font-mono text-foreground">{avgScore}%</p>
                        <p className="text-[10px] text-emerald-500 font-bold mt-1 uppercase tracking-wider">Average Score</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col items-center justify-center">
                        <CheckCircle size={24} className="text-cyan-500 mb-2" />
                        <p className="text-3xl font-bold font-mono text-foreground">{totalPassed}</p>
                        <p className="text-[10px] text-cyan-500 font-bold mt-1 uppercase tracking-wider">Quizzes Passed</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-secondary/10 border border-border/50 flex flex-col justify-center h-full min-h-[100px]">
                        <div className="flex items-center gap-1 mb-1 ml-1 text-primary">
                            <TrendingUp size={14} />
                            <p className="text-[10px] font-bold uppercase tracking-wider">Progress</p>
                        </div>
                        <div className="flex-1 w-full relative">
                            {(() => {
                                const hasData = dashboardAttempts.length >= 2;
                                const chartData = hasData 
                                    ? dashboardAttempts.slice().sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(a => ({
                                        date: new Date(a.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                                        score: Math.round(a.score / a.totalQuestions * 100)
                                    }))
                                    : [
                                        { date: '1', score: 40 },
                                        { date: '2', score: 55 },
                                        { date: '3', score: 50 },
                                        { date: '4', score: 75 },
                                        { date: '5', score: 85 }
                                    ];

                                return (
                                    <div className="relative w-full h-full">
                                        {!hasData && (
                                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-xl border border-border/50">
                                                <p className="text-xs font-semibold text-foreground">Not Enough Data</p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">Take 2+ quizzes to track</p>
                                            </div>
                                        )}
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={chartData}
                                                margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                                            >
                                                <XAxis dataKey="date" hide />
                                                <YAxis hide domain={[0, 100]} />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px 8px', fontSize: '10px' }}
                                                    itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                                                    cursor={hasData ? true : false}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="score" 
                                                    stroke={hasData ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} 
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={hasData ? { r: 4, fill: 'hsl(var(--primary))' } : false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-foreground"><Brain size={18} className="text-primary" /> Project Quizzes</h3>
                    <div className="flex flex-col gap-3 pb-8 w-full">
                        <div className="bg-black/20 backdrop-blur-[2px] border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                        {(() => {
                            const modulesByCategory: Record<string, any[]> = {
                                "React Hook Tutorial": [],
                                "Tic Tac Toe": []
                            };

                            dashboardModules.forEach((mod, idx) => {
                                if (mod.title.toLowerCase().includes('react')) {
                                    modulesByCategory["React Hook Tutorial"].push(mod);
                                } else if (mod.title.toLowerCase().includes('tic tac toe') || mod.title.toLowerCase().includes('game')) {
                                    modulesByCategory["Tic Tac Toe"].push(mod);
                                } else {
                                    // Fallback demo split
                                    if (idx % 2 === 0) {
                                        modulesByCategory["React Hook Tutorial"].push(mod);
                                    } else {
                                        modulesByCategory["Tic Tac Toe"].push(mod);
                                    }
                                }
                            });

                            if (Object.keys(modulesByCategory).length === 0) {
                                return <p className="text-sm text-muted-foreground w-full py-10 text-center border border-border/50 rounded-3xl bg-secondary/10">No projects available. Extract a YouTube video first!</p>;
                            }

                            return Object.entries(modulesByCategory).map(([category, mods]: [string, any[]]) => {
                                const attemptedCount = mods.filter((m: any) => dashboardAttempts.some(a => a.moduleId === m.id)).length;
                                const isExpanded = expandedCategory === category;

                                return (
                                    <div key={category} className="bg-transparent flex flex-col">
                                        <button
                                            className={`flex items-center justify-between px-4 py-3 transition-all text-left rounded-xl ${isExpanded ? 'bg-black/30 backdrop-blur-md shadow-sm' : 'hover:bg-black/20'}`}
                                            onClick={() => setExpandedCategory(isExpanded ? null : category)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`font-medium ${isExpanded ? 'text-foreground' : 'text-muted-foreground'} group-hover:text-foreground transition-colors text-base line-clamp-1`}>
                                                    {category}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="text-[10px] font-bold text-muted-foreground/80 bg-background/50 px-2 py-0.5 rounded-full border border-border/30">
                                                    {attemptedCount}/{mods.length}
                                                </div>
                                                <motion.div
                                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <ChevronDown size={16} className={isExpanded ? "text-foreground" : "text-muted-foreground"} />
                                                </motion.div>
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                                    className="flex flex-col ml-3 mt-1 pl-3 border-l-2 border-border/30 overflow-hidden"
                                                >
                                                    {mods.map(mod => {
                                                        const hasAttempted = dashboardAttempts.some(a => a.moduleId === mod.id);
                                                        return (
                                                            <div key={mod.id}
                                                                className="flex items-center justify-between py-2 px-3 my-0.5 rounded-lg hover:bg-secondary/40 transition-colors group cursor-pointer"
                                                                onClick={() => {
                                                                    setCurrentModuleId(mod.id);
                                                                    setQuizState('intro');
                                                                }}
                                                            >
                                                                <div>
                                                                    <span className="font-medium text-sm text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">{mod.title}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    {hasAttempted && <CheckCircle size={16} className="text-emerald-500" />}
                                                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                                        <ArrowRight size={14} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            });
                        })()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── INTRO ────────────────────────────────────────────────────────────
    if (quizState === 'intro') {
        return (
            <div className="w-full max-w-6xl mx-auto fade-in h-full flex flex-col pb-8 pt-2">
                <div className="flex justify-start mb-8 w-full">
                    <button 
                        onClick={() => {
                            if (moduleId && onBack) {
                                onBack();
                            } else {
                                setQuizState('dashboard');
                                setCurrentModuleId(null);
                            }
                        }}
                        className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all flex items-center justify-center border border-border/50 shadow-sm shrink-0"
                        title={moduleId && onBack ? "Back" : "Back to Quiz Dashboard"}
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>
                
                <div className="max-w-4xl mx-auto flex flex-col items-center justify-center w-full flex-1">
                    <div
                    className="flex items-center justify-center rounded-3xl mx-auto mb-6 shrink-0 shadow-sm border border-indigo-500/20"
                    style={{ width: 80, height: 80, background: 'rgba(99,102,241,0.1)' }}
                >
                    <Brain size={40} style={{ color: '#818cf8' }} />
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground shrink-0" style={{ lineHeight: 1.3 }}>
                    {quiz.title}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center gap-3 mb-8 text-xs font-semibold shrink-0">
                    <span className="px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 uppercase tracking-wider shadow-sm">
                        {quiz.difficulty}
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider shadow-sm">
                        {allQuestions.length} questions
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center uppercase tracking-wider shadow-sm">
                        <Clock size={14} className="mr-1.5" /> {Math.round(quiz.timeLimit / 60)} min
                    </span>
                </div>

                {/* Question count selector */}
                <div className="mb-6 p-6 rounded-3xl bg-secondary/20 shadow-sm w-full max-w-3xl shrink-0 border border-border/50 backdrop-blur-sm">
                    <p className="text-lg font-medium mb-4 text-foreground">Select Quiz Length</p>
                    <div className="flex gap-3 justify-center flex-wrap">
                        {availableCounts.map(count => (
                            <button
                                key={count}
                                onClick={() => setSelectedCount(count)}
                                className={selectedCount === count ? `${btnPrimary} px-6 py-2.5 text-sm` : `${btnSecondary} px-6 py-2.5 text-sm border border-border/50 hover:bg-secondary/60`}
                            >
                                {count === 3 ? '⚡ Quick' : count === 5 ? '📋 Standard' : '🔥 Deep Dive'} — {count} Qs
                            </button>
                        ))}
                        <button
                            onClick={() => setSelectedCount(null)}
                            className={selectedCount === null ? `${btnPrimary} px-6 py-2.5 text-sm` : `${btnSecondary} px-6 py-2.5 text-sm border border-border/50 hover:bg-secondary/60`}
                        >
                            🎯 Full Quiz — {allQuestions.length} Qs
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full max-w-3xl shrink-0">
                    {[
                        { emoji: '📋', label: `${activeCount} Questions` },
                        { emoji: '⏱️', label: `~${Math.ceil(activeCount * 2)} Minutes` },
                        { emoji: '🎯', label: '70% to Pass' },
                    ].map(item => (
                        <div key={item.label} className="p-4 rounded-2xl bg-secondary/20 border border-border/50 shadow-sm flex flex-col items-center justify-center backdrop-blur-sm">
                            <div className="text-3xl mb-2">{item.emoji}</div>
                            <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => {
                        setTimeLeft(activeCount * 120); // 2 min per question
                        setQuizState('taking');
                    }}
                    className={`${btnPrimary} px-12 py-3.5 text-lg mx-auto w-fit shadow-md hover:shadow-lg transition-all shrink-0 hover:-translate-y-0.5 mt-2`}
                >
                    <Zap size={20} className="mr-2" /> Start Quiz
                </button>
                </div>
            </div>
        );
    }

    // ── RESULTS ──────────────────────────────────────────────────────────
    if (quizState === 'results') {
        return (
            <div className="w-full max-w-6xl mx-auto fade-in h-full flex flex-col pb-20 pt-2">
                <div className="flex justify-start mb-8 w-full">
                    <button 
                        onClick={() => {
                            if (moduleId && onBack) {
                                onBack();
                            } else {
                                setQuizState('dashboard');
                                setCurrentModuleId(null);
                            }
                        }}
                        className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all flex items-center justify-center border border-border/50 shadow-sm shrink-0"
                        title={moduleId && onBack ? "Back" : "Back to Quiz Dashboard"}
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>

                <div className="max-w-4xl mx-auto w-full">
                    {/* Score card */}
                    <div className="text-center mb-8 py-10 shadow-lg rounded-3xl" style={{ background: 'hsl(var(--card))', border: '1px solid var(--border)' }}>
                        <div
                        className="flex items-center justify-center rounded-2xl mx-auto mb-4"
                        style={{
                            width: 80, height: 80,
                            background: passed ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                        }}
                    >
                        {passed
                            ? <Trophy size={40} style={{ color: '#10b981' }} />
                            : <AlertCircle size={40} style={{ color: '#f43f5e' }} />
                        }
                    </div>

                    <h2 className="text-2xl font-bold mb-1 text-foreground">
                        {passed ? '🎉 Quiz Passed!' : '📚 Keep Practicing'}
                    </h2>
                    <p className="text-sm mb-6 text-muted-foreground">
                        {passed
                            ? 'Great job! Your knowledge is being updated.'
                            : "You'll do better next time! Review the explanations below."}
                    </p>

                    <div
                        className="text-6xl font-bold mb-2"
                        style={{ color: passed ? '#10b981' : '#f43f5e' }}
                    >
                        {scorePercent}%
                    </div>
                    <p className="text-sm mb-6 text-muted-foreground">
                        {score} / {activeQuestions.length} correct
                    </p>

                    <div className="w-64 h-3 rounded-full mx-auto mb-6 bg-secondary overflow-hidden">
                        <div
                            className="h-full"
                            style={{
                                width: `${scorePercent}%`,
                                background: passed ? '#10b981' : '#f43f5e',
                            }}
                        />
                    </div>

                    <div className="flex gap-3 justify-center">
                        <button onClick={() => {
                            setCurrentModuleId(null);
                            setQuizState('dashboard');
                        }} className="bg-secondary text-foreground px-6 py-3 rounded-xl hover:bg-secondary/80 flex items-center gap-2 font-medium">
                            <ChevronLeft size={16} /> Back to Dashboard
                        </button>
                        <button onClick={handleRestart} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 flex items-center gap-2 font-medium">
                            <RotateCcw size={16} /> Retry Quiz
                        </button>
                    </div>
                </div>

                {/* Answer review */}
                <div className="shadow-sm p-8 rounded-3xl" style={{ background: 'hsl(var(--card))', border: '1px solid var(--border)' }}>
                    <h3 className="text-xl font-semibold mb-6 text-foreground">
                        Review Answers
                    </h3>
                    <div className="space-y-6">
                        {activeQuestions.map((q: any, i: number) => {
                            const userAnswer = answers[i]?.selected;
                            const isCorrect = userAnswer === q.correctAnswer;
                            return (
                                <div
                                    key={q.id}
                                    className="p-4 rounded-xl"
                                    style={{
                                        background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
                                        border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
                                    }}
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        {isCorrect
                                            ? <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
                                            : <XCircle size={16} style={{ color: '#f43f5e', flexShrink: 0, marginTop: 2 }} />
                                        }
                                        <p className="text-sm font-medium text-foreground">
                                            Q{i + 1}. {q.question.split('\\n')[0]}
                                        </p>
                                    </div>
                                    {!isCorrect && (
                                        <div className="text-xs mb-2 pl-7">
                                            <span className="text-muted-foreground tracking-wide">YOUR ANSWER: </span>
                                            <span style={{ color: '#fb7185' }}>
                                                {userAnswer !== null && userAnswer !== undefined ? q.options[userAnswer] : 'Not answered'}
                                            </span>
                                            <br />
                                            <span className="text-muted-foreground tracking-wide">CORRECT: </span>
                                            <span style={{ color: '#34d399' }}>{q.options[q.correctAnswer]}</span>
                                        </div>
                                    )}
                                    <p className="text-xs pl-7 mt-2" style={{ color: 'var(--text-muted)' }}>
                                        💡 {q.explanation}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
        );
    }

    // ── TAKING QUIZ ──────────────────────────────────────────────────────
    const progress = ((currentQ + (showExplanation ? 1 : 0)) / activeQuestions.length) * 100;

    return (
        <div className="w-full fade-in flex flex-col gap-3 pb-8 pt-2 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-1 w-full max-w-6xl">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => {
                            if (moduleId && onBack) {
                                onBack();
                            } else {
                                setQuizState('dashboard');
                                setCurrentModuleId(null);
                            }
                        }}
                        className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all flex items-center justify-center border border-border/50 shadow-sm shrink-0"
                        title={moduleId && onBack ? "Back" : "Back to Quiz Dashboard"}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex flex-col gap-1">
                        <p className="text-lg font-bold text-foreground leading-none">
                            Question {currentQ + 1} of {activeQuestions.length}
                        </p>
                        <p className="text-sm font-medium text-muted-foreground">
                            {quiz.title}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 items-center">

                    <div className="flex items-center gap-3 text-base font-medium px-4 py-1.5 border border-border/50 rounded-lg bg-secondary/30 text-foreground">
                        <Clock size={16} className="text-primary" />
                        <span className="font-mono">
                            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full mb-4 bg-secondary/50 overflow-hidden w-full max-w-6xl">
                <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>

            {/* Question Container */}
            <div className="flex flex-col w-full max-w-4xl">
                {/* Question Type Label */}
                <div className="flex items-center gap-3 mb-4 shrink-0">
                    <span
                        className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded text-primary bg-primary/10 border border-primary/20"
                    >
                        {question.type ? question.type.replace('_', ' ') : 'MULTIPLE CHOICE'}
                    </span>
                </div>

                <div className="text-base font-medium text-foreground shrink-0 mb-4" style={{ lineHeight: 1.5 }}>
                    {(() => {
                        const parts = question.question.split('\`\`\`');
                        if (parts.length === 1) {
                            return <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{parts[0]}</p>;
                        }

                        return parts.map((part: string, idx: number) => {
                            if (idx % 2 === 0) {
                                return part.trim() ? <p key={idx} className="mb-4" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{part.trim()}</p> : null;
                            } else {
                                const codeLines = part.trim().split('\\n');
                                const firstLine = codeLines[0].trim();
                                const hasLang = firstLine.length > 0 && !firstLine.includes(' ');
                                const lang = hasLang ? firstLine : '';
                                const code = hasLang ? codeLines.slice(1).join('\\n') : part.trim();

                                return (
                                    <div key={idx} className="my-8 rounded-2xl overflow-hidden shadow-2xl w-full border border-border/50 bg-[#1e1e1e]">
                                        <div className="flex items-center px-5 py-4 border-b border-white/10 relative bg-[#2d2d2d]">
                                            <div className="flex gap-2">
                                                <div className="w-3.5 h-3.5 rounded-full" style={{ background: '#ff5f56' }}></div>
                                                <div className="w-3.5 h-3.5 rounded-full" style={{ background: '#ffbd2e' }}></div>
                                                <div className="w-3.5 h-3.5 rounded-full" style={{ background: '#27c93f' }}></div>
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                {lang && <span className="text-sm font-mono tracking-wider uppercase font-bold text-white/40">{lang}</span>}
                                            </div>
                                        </div>
                                        <div className="p-8 overflow-x-auto text-left">
                                            <pre className="m-0 bg-transparent p-0">
                                                <code className="font-mono text-sm leading-relaxed text-[#e2e8f0]" style={{ whiteSpace: 'pre' }}>
                                                    {code}
                                                </code>
                                            </pre>
                                        </div>
                                    </div>
                                );
                            }
                        });
                    })()}
                </div>

                {/* Options */}
                <div className="space-y-2.5 mt-4">
                    {question.options.map((option: any, i: number) => {
                        let borderColor = 'var(--border)';
                        let bg = 'transparent';
                        let textColor = 'var(--muted-foreground)';

                        if (showExplanation) {
                            if (i === question.correctAnswer) {
                                borderColor = 'rgba(16,185,129,0.5)';
                                bg = 'rgba(16,185,129,0.1)';
                                textColor = '#34d399';
                            } else if (i === selectedOption && i !== question.correctAnswer) {
                                borderColor = 'rgba(244,63,94,0.5)';
                                bg = 'rgba(244,63,94,0.1)';
                                textColor = '#fb7185';
                            }
                        } else if (i === selectedOption) {
                            borderColor = 'rgba(99,102,241,0.6)';
                            bg = 'rgba(99,102,241,0.15)';
                            textColor = '#818cf8';
                        }

                        return (
                            <button
                                key={i}
                                onClick={() => handleSelect(i)}
                                className="w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-4 group hover:-translate-y-0.5 shadow-sm"
                                style={{
                                    background: bg !== 'transparent' ? bg : 'hsl(var(--card))',
                                    border: `1px solid ${borderColor}`,
                                    color: textColor,
                                    cursor: showExplanation ? 'default' : 'pointer',
                                }}
                            >
                                <span
                                    className="flex-shrink-0 flex items-center justify-center rounded-lg text-sm font-bold shadow-sm border border-border/50"
                                    style={{
                                        width: 32, height: 32,
                                        background: i === selectedOption && !showExplanation ? 'rgba(99,102,241,0.15)' : 'hsl(var(--secondary)/0.5)',
                                    }}
                                >
                                    {['A', 'B', 'C', 'D'][i]}
                                </span>
                                <span className="text-base flex-1 font-medium text-foreground" style={{ lineHeight: 1.4 }}>{option}</span>
                                {showExplanation && i === question.correctAnswer && (
                                    <CheckCircle size={20} className="ml-auto flex-shrink-0" style={{ color: '#10b981' }} />
                                )}
                                {showExplanation && i === selectedOption && i !== question.correctAnswer && (
                                    <XCircle size={20} className="ml-auto flex-shrink-0" style={{ color: '#f43f5e' }} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Explanation */}
            {showExplanation && (
                <div
                    className="p-4 rounded-xl mt-6 shadow-sm w-full max-w-4xl fade-in"
                    style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.25)' }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Brain size={16} style={{ color: '#818cf8' }} />
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#818cf8' }}>AI Explanation</p>
                    </div>
                    <p className="text-sm font-medium text-foreground" style={{ lineHeight: 1.5 }}>{question.explanation}</p>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-4 justify-end mt-6 w-full max-w-6xl">
                {!showExplanation ? (
                    <button
                        onClick={handleConfirm}
                        disabled={selectedOption === null}
                        className={`${btnPrimary} px-8 py-3 text-base shadow-md hover:-translate-y-0.5 transition-all`}
                        style={{ minWidth: '180px' }}
                    >
                        Confirm Answer
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className={`${btnPrimary} px-8 py-3 text-base shadow-md hover:-translate-y-0.5 transition-all`}
                        style={{ minWidth: '180px' }}
                    >
                        {isLastQuestion ? 'See Results' : 'Next Question'}
                        <ArrowRight size={18} className="ml-2" />
                    </button>
                )}
            </div>
        </div>
    );
}
