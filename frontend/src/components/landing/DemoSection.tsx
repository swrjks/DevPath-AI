import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Link2, Loader2, CheckCircle2, ChevronRight } from "lucide-react";

const roadmapItems = [
  { topic: "Variables & Data Types", status: "completed" },
  { topic: "Functions & Scope", status: "completed" },
  { topic: "Classes & Objects", status: "active" },
  { topic: "OOP Principles", status: "locked" },
];

const DemoSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [step, setStep] = useState(0);

  return (
    <section ref={ref} className="relative py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
            See It <span className="text-gradient-glow">In Action</span>
          </h2>
          <p className="text-muted-foreground text-lg">Paste a link. Get a complete learning journey.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="max-w-4xl mx-auto glass-strong rounded-2xl overflow-hidden glow-primary"
        >
          {/* Top bar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border/50">
            <div className="w-3 h-3 rounded-full bg-destructive/50" />
            <div className="w-3 h-3 rounded-full bg-accent/30" />
            <div className="w-3 h-3 rounded-full bg-primary/30" />
            <span className="ml-3 text-xs text-muted-foreground font-mono">DevPath AI — Interactive Demo</span>
          </div>

          <div className="p-6 md:p-8">
            {/* Step tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {["Paste Link", "AI Roadmap", "Practice", "Progress"].map((label, i) => (
                <button
                  key={label}
                  onClick={() => setStep(i)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    step === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Step content */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-secondary/50 rounded-xl px-4 py-3 border border-border/30">
                  <Link2 size={18} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-mono">https://youtube.com/watch?v=python-oop-tutorial</span>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Loader2 size={14} className="animate-spin" />
                  Analyzing with AI...
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <div className="text-sm font-display font-semibold mb-4 text-accent">Generated Learning Roadmap</div>
                {roadmapItems.map((item, i) => (
                  <div
                    key={item.topic}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      item.status === "completed"
                        ? "border-accent/30 bg-accent/5"
                        : item.status === "active"
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/20 bg-secondary/20 opacity-50"
                    }`}
                  >
                    {item.status === "completed" ? (
                      <CheckCircle2 size={16} className="text-accent" />
                    ) : (
                      <ChevronRight size={16} className={item.status === "active" ? "text-primary" : "text-muted-foreground"} />
                    )}
                    <span className="text-sm">{item.topic}</span>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                      item.status === "completed" ? "bg-accent/10 text-accent" :
                      item.status === "active" ? "bg-primary/10 text-primary" :
                      "bg-secondary text-muted-foreground"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="text-sm font-display font-semibold mb-2">Coding Challenge: Classes & Objects</div>
                <div className="bg-secondary/50 rounded-xl p-4 font-mono text-xs leading-relaxed border border-border/30">
                  <div><span className="text-primary">class</span> <span className="text-accent">Developer</span>:</div>
                  <div className="pl-4"><span className="text-primary">def</span> <span className="text-accent">__init__</span>(self, name, skills):</div>
                  <div className="pl-8">self.name = name</div>
                  <div className="pl-8">self.skills = skills</div>
                  <div className="mt-2 pl-4"><span className="text-primary">def</span> <span className="text-accent">learn</span>(self, topic):</div>
                  <div className="pl-8 text-muted-foreground"># Your code here — add the topic to skills</div>
                  <div className="pl-8 text-muted-foreground/40">pass</div>
                </div>
                <div className="glass rounded-xl p-3 text-xs text-accent/80 border-accent/20">
                  💡 Hint: Use <code className="bg-secondary/50 px-1 rounded">self.skills.append(topic)</code> to add a new skill.
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="text-sm font-display font-semibold mb-4">Your Progress</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Concepts Learned", value: "12", color: "text-accent" },
                    { label: "Exercises Done", value: "8", color: "text-primary" },
                    { label: "Mastery Score", value: "85%", color: "text-gradient-glow" },
                  ].map((stat) => (
                    <div key={stat.label} className="glass rounded-xl p-4 text-center">
                      <div className={`font-display font-bold text-2xl ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
                {/* Mini progress bars */}
                <div className="space-y-3 mt-4">
                  {[
                    { label: "Variables", pct: 100 },
                    { label: "Functions", pct: 90 },
                    { label: "Classes", pct: 60 },
                    { label: "OOP", pct: 20 },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="text-foreground">{item.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${item.pct}%`, background: "var(--gradient-primary)" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoSection;
