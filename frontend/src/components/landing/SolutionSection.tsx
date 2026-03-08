import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Youtube, Brain, Map, Code, Trophy } from "lucide-react";

const steps = [
  { icon: Youtube, label: "YouTube Video", desc: "Paste any tutorial link" },
  { icon: Brain, label: "AI Extracts Concepts", desc: "Deep analysis of content" },
  { icon: Map, label: "Learning Roadmap", desc: "Structured path generated" },
  { icon: Code, label: "Coding Practice", desc: "Interactive exercises" },
  { icon: Trophy, label: "Skill Mastery", desc: "Track your progress" },
];

const SolutionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="how-it-works" className="relative py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Tutorials Into{" "}
            <span className="text-gradient-glow">Structured Learning</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            DevPath AI's intelligent pipeline transforms any tutorial into a complete learning experience.
          </p>
        </motion.div>

        {/* Pipeline */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="glass rounded-2xl p-6 text-center min-w-[160px] hover:border-primary/40 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <step.icon size={22} className="text-primary" />
                </div>
                <div className="font-display font-semibold text-sm mb-1">{step.label}</div>
                <div className="text-xs text-muted-foreground">{step.desc}</div>
              </motion.div>
              {i < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: i * 0.15 + 0.3 }}
                  className="hidden md:block text-accent/40 mx-2 text-xl"
                >
                  →
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
