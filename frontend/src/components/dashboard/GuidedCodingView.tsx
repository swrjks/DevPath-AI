import { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
    Lightbulb, CheckCircle, ChevronRight, ChevronLeft,
    Code2, MessageSquare, Loader, Send, Play
} from 'lucide-react';

interface GuidedCodingViewProps {
    moduleId: string | null;
    onBack: () => void;
}

const mockEvaluateStep = async (code: string, scaffold: string): Promise<{ passed: boolean; feedback: string }> => {
    await new Promise(r => setTimeout(r, 1200));
    const hasContent = code.length > 20 && !code.includes('pass\n') && code !== scaffold;
    return {
        passed: hasContent,
        feedback: hasContent
            ? `✅ Looks good! Your implementation passes the basic static checks.`
            : `❌ Your code still has unimplemented parts. Please complete the implementation and try again.`,
    };
};

export default function GuidedCodingView({ moduleId, onBack }: GuidedCodingViewProps) {
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [currentStep, setCurrentStep] = useState(0);
    const [code, setCode] = useState('');
    const [hintLevel, setHintLevel] = useState(0);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [stepPassed, setStepPassed] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [userInput, setUserInput] = useState('');
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    useEffect(() => {
        if (!moduleId) return;
        setIsLoading(true);
        fetch(`/api/tutorial-modules/${moduleId}`)
            .then(res => res.json())
            .then(mod => {
                const rawTasks = mod.content?.practice_tasks || [];
                
                const dynamicSession = {
                    project: `Practice: ${mod.title}`,
                    description: mod.description || "Guided practice tasks for this module.",
                    totalSteps: rawTasks.length > 0 ? rawTasks.length : 1,
                    steps: rawTasks.length > 0 ? rawTasks.map((pt: any, i: number) => ({
                        id: i + 1,
                        title: pt.title || `Objective ${i + 1}`,
                        description: pt.description,
                        requirements: pt.requirements || [],
                        scaffold: pt.starter_code || '# Write your code here\n',
                        hints: pt.hints || ['Think carefully about the concepts.']
                    })) : [{
                        id: 1,
                        title: "Exploratory Coding",
                        description: "Practice the concepts you've learned.",
                        requirements: ["Implement something based on the summary"],
                        scaffold: "# Start coding here\n",
                        hints: ["No hints for free text coding."]
                    }]
                };

                setSession(dynamicSession);
                setCode(dynamicSession.steps[0].scaffold);
                setMessages([{
                    role: 'assistant',
                    content: `Welcome to the guided practice! 🚀\n\nWe'll work on **${mod.title}**.\n\nRead the requirements on the left and begin filling in your code.`,
                }]);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [moduleId]);

    if (isLoading || !session) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground h-full min-h-[500px]">
                <Loader size={32} className="animate-spin mb-4 text-primary" />
                <p>Loading interactive coding environment...</p>
                <p className="text-xs opacity-70 mt-2 max-w-sm text-center">Configuring the terminal and loading your AI-generated practice tasks.</p>
            </div>
        );
    }

    const step = session.steps[currentStep];

    const requestHint = () => {
        if (hintLevel < step.hints.length) {
            const newHintIdx = hintLevel;
            setHintLevel(h => Math.min(h + 1, step.hints.length));
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: `💡 **Hint ${newHintIdx + 1}:**\n\n${step.hints[newHintIdx]}` },
            ]);
        }
    };

    const handleSubmit = async () => {
        setIsEvaluating(true);
        const result = await mockEvaluateStep(code, step.scaffold);
        setIsEvaluating(false);
        setFeedback(result.feedback);
        if (result.passed) {
            setStepPassed(true);
            setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: result.feedback + `\n\n${currentStep < session.steps.length - 1 ? "Click **Next Step** when you're ready to continue." : "🎉 You've completed all tasks! Excellent work!"}` },
            ]);
        } else {
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: result.feedback },
            ]);
        }
    };

    const goToStep = (idx: number) => {
        setCurrentStep(idx);
        setCode(session.steps[idx].scaffold);
        setHintLevel(0);
        setStepPassed(completedSteps.includes(idx));
        setFeedback('');
    };

    const handleNextStep = () => {
        if (currentStep < session.steps.length - 1) {
            const nextIdx = currentStep + 1;
            goToStep(nextIdx);
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: `Great! Moving to **Task ${nextIdx + 1}: ${session.steps[nextIdx].title}**.\n\n${session.steps[nextIdx].description}` },
            ]);
        }
    };

    const handleSendMessage = () => {
        if (!userInput.trim()) return;
        const msg = userInput.trim();
        setUserInput('');
        setMessages(prev => [
            ...prev,
            { role: 'user', content: msg },
            { role: 'assistant', content: `I see you're asking about: "${msg}". For Task ${step.id}, remember to focus on: ${step.requirements[0] || 'the main objective'}. Try requesting a hint if you're blocked!` },
        ]);
    };

    const totalProgress = (completedSteps.length / session.steps.length) * 100;
    const btnClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

    return (
        <div className="flex flex-col h-full gap-4 fade-in min-h-[500px] w-full max-w-7xl mx-auto pl-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all flex items-center justify-center border border-border/50 shadow-sm shrink-0"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold font-display text-foreground">
                            {session.project}
                        </h1>
                        <p className="text-xs mt-0.5 text-muted-foreground">{session.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-xs font-semibold text-muted-foreground">
                        {completedSteps.length}/{session.totalSteps} tasks
                    </div>
                    <div className="w-32 h-2 rounded-full bg-secondary/50 overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${totalProgress}%` }} />
                    </div>
                </div>
            </div>

            {/* Step navigation */}
            <div className="flex gap-2 flex-shrink-0 overflow-x-auto pb-2 scrollbar-none">
                {session.steps.map((s: any, i: number) => (
                    <button
                        key={s.id}
                        onClick={() => goToStep(i)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                        style={{
                            background: i === currentStep
                                ? 'hsl(var(--primary) / 0.1)'
                                : completedSteps.includes(i)
                                    ? 'rgba(16,185,129,0.1)'
                                    : 'hsl(var(--secondary) / 0.5)',
                            border: '1px solid',
                            borderColor: i === currentStep
                                ? 'hsl(var(--primary) / 0.3)'
                                : completedSteps.includes(i)
                                    ? 'rgba(16,185,129,0.3)'
                                    : 'var(--border)',
                            color: i === currentStep
                                ? 'hsl(var(--primary))'
                                : completedSteps.includes(i)
                                    ? '#34d399'
                                    : 'hsl(var(--muted-foreground))',
                        }}
                    >
                        {completedSteps.includes(i) ? <CheckCircle size={11} /> : <span>{i + 1}</span>}
                        <span className="truncate max-w-[120px]">{s.title}</span>
                    </button>
                ))}
            </div>

            {/* Main layout */}
            <div className="flex gap-4 flex-1 min-h-[500px]">
                {/* Left: Editor */}
                <div className="flex-1 flex flex-col gap-3 min-w-0">
                    {/* Step info */}
                    <div className="bg-secondary/20 border border-border/50 rounded-xl p-4 flex-shrink-0 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary">Task {step.id}</span>
                                </div>
                                <h2 className="font-semibold text-foreground text-lg">{step.title}</h2>
                                <p className="text-sm mt-1 text-muted-foreground">{step.description}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {step.requirements.map((r: string, i: number) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg bg-background border border-border/50 text-muted-foreground"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    {r}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 rounded-xl overflow-hidden flex flex-col border border-border/50 shadow-sm pt-4" style={{ backgroundColor: '#1e1e1e' }}>
                        <div className="flex items-center justify-between px-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <div className="flex items-center gap-2 opacity-70">
                                <Code2 size={13} className="text-white" />
                                <span className="text-xs font-mono text-white">main.py</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={requestHint}
                                    disabled={hintLevel >= step.hints.length}
                                    className="px-2 py-1 flex items-center gap-1.5 text-xs rounded-md bg-white/5 hover:bg-white/10 text-white/80 transition-colors disabled:opacity-50"
                                >
                                    <Lightbulb size={12} style={{ color: '#f59e0b' }} />
                                    Hint ({hintLevel}/{step.hints.length})
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isEvaluating || stepPassed}
                                    className="px-3 py-1 flex items-center gap-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
                                >
                                    {isEvaluating
                                        ? <><Loader size={11} className="animate-spin" /> Checking...</>
                                        : stepPassed
                                            ? <><CheckCircle size={11} /> Passed!</>
                                            : <><Play size={11} /> Check Step</>
                                    }
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 w-full bg-[#1e1e1e] pt-2 relative">
                            <Editor
                                height="100%"
                                width="100%"
                                language="python"
                                value={code}
                                onChange={v => { setCode(v || ''); setStepPassed(false); setFeedback(''); }}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    fontFamily: 'JetBrains Mono, monospace',
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    padding: { top: 12 },
                                    wordWrap: 'on',
                                }}
                            />
                        </div>
                    </div>

                    {/* Feedback */}
                    {feedback && (
                        <div
                            className="p-3 rounded-xl text-sm fade-in flex-shrink-0 font-medium"
                            style={{
                                background: stepPassed ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                                border: `1px solid ${stepPassed ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
                                color: stepPassed ? '#34d399' : '#fb7185',
                            }}
                        >
                            {feedback}
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between flex-shrink-0 items-center">
                        <button
                            onClick={() => currentStep > 0 && goToStep(currentStep - 1)}
                            disabled={currentStep === 0}
                            className={`${btnClasses} bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 opacity-80 hover:opacity-100 disabled:opacity-30 flex items-center gap-1`}
                        >
                            <ChevronLeft size={14} /> Previous
                        </button>
                        <button
                            onClick={handleNextStep}
                            disabled={!stepPassed || currentStep === session.steps.length - 1}
                            className={`${btnClasses} bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 font-semibold flex items-center gap-1 disabled:opacity-50`}
                        >
                            Next Step <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Right: AI Chat */}
                <div className="w-80 flex flex-col flex-shrink-0">
                    <div className="flex-1 rounded-2xl flex flex-col overflow-hidden bg-card border border-border shadow-md">
                        {/* Chat header */}
                        <div className="px-4 py-3 flex items-center gap-3 bg-secondary/30 border-b border-border">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <MessageSquare size={14} className="text-primary-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground leading-tight">AI Mentor</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Socratic Guide</p>
                            </div>
                            <div className="ml-auto w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, i) => (
                                <div key={i} className={`fade-in ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                                    <div
                                        className="max-w-[90%] rounded-2xl p-3.5 text-sm shadow-sm"
                                        style={{
                                            background: msg.role === 'assistant' ? 'var(--secondary)' : 'hsl(var(--primary) / 0.15)',
                                            border: '1px solid',
                                            borderColor: msg.role === 'assistant' ? 'var(--border)' : 'hsl(var(--primary) / 0.3)',
                                            color: msg.role === 'assistant' ? 'hsl(var(--foreground))' : 'hsl(var(--primary))',
                                            whiteSpace: 'pre-wrap',
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-border bg-secondary/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={e => setUserInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Need help with this step?"
                                    className="flex-1 bg-background border border-border/50 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary shadow-inner"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="bg-primary text-primary-foreground p-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
