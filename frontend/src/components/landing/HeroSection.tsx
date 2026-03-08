import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingCard = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8 + delay, duration: 0.6 }}
    className={`glass rounded-xl p-3 text-xs font-mono ${className}`}
  >
    {children}
  </motion.div>
);

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="gradient-orb w-[600px] h-[600px] -top-40 -right-40 opacity-15" />
      <div className="gradient-orb w-[400px] h-[400px] bottom-20 -left-20 opacity-10" />

      <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
            <span className="text-xs text-muted-foreground">AI-Powered Learning Architecture</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-bold text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-6"
          >
            Stop Watching.
            <br />
            <span className="text-gradient-glow">Start Building.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            DevPath AI transforms passive YouTube tutorials into personalized,
            interactive developer learning journeys powered by AI.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary px-8 h-12 text-base">
              Get Started Free
              <ArrowRight className="ml-2" size={18} />
            </Button>
            <Button size="lg" variant="outline" className="border-border/60 text-foreground hover:bg-secondary h-12 px-8 text-base">
              <Play className="mr-2" size={16} />
              Watch Demo
            </Button>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="relative mt-20 max-w-3xl mx-auto hidden md:block">
          {/* Main mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="glass-strong rounded-2xl p-6 glow-primary"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-accent/40" />
              <div className="w-3 h-3 rounded-full bg-primary/40" />
              <span className="ml-3 text-xs text-muted-foreground font-mono">devpath-ai — learning-pipeline</span>
            </div>

            {/* Pipeline visualization */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "YouTube Tutorial", icon: "📺", color: "border-destructive/30" },
                { label: "AI Processing", icon: "🧠", color: "border-primary/50" },
                { label: "Learning Roadmap", icon: "🗺️", color: "border-accent/50" },
                { label: "Coding Practice", icon: "💻", color: "border-accent/30" },
              ].map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.15 }}
                  className={`rounded-xl border ${step.color} bg-secondary/30 p-4 text-center`}
                >
                  <div className="text-2xl mb-2">{step.icon}</div>
                  <div className="text-xs text-muted-foreground">{step.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Arrow connectors */}
            <div className="flex justify-around mt-2 text-muted-foreground/30">
              {[1, 2, 3].map((i) => (
                <span key={i} className="text-lg">→</span>
              ))}
            </div>
          </motion.div>

          {/* Floating cards */}
          <FloatingCard className="absolute -left-16 top-8 animate-float" delay={0.2}>
            <span className="text-accent">def</span> learn(topic):
          </FloatingCard>
          <FloatingCard className="absolute -right-12 top-16 animate-float-slow" delay={0.4}>
            <span className="text-primary">✓</span> 12 concepts mastered
          </FloatingCard>
          <FloatingCard className="absolute -right-8 bottom-4 animate-float" delay={0.6}>
            <span className="text-accent">⚡</span> 95% skill score
          </FloatingCard>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
