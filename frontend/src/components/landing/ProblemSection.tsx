import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Shuffle, Eye, Copy, BarChart3 } from "lucide-react";

const problems = [
  { icon: Shuffle, title: "Tutorials Are Unstructured", desc: "Jumping between random videos with no clear learning path." },
  { icon: Eye, title: "Learning Is Passive", desc: "Watching without doing leads to zero retention." },
  { icon: Copy, title: "Copy-Paste Coding", desc: "Copying code without understanding the underlying concepts." },
  { icon: BarChart3, title: "No Visibility Into Skill Gaps", desc: "No way to track what you actually know vs. what you think you know." },
];

const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      <div className="gradient-orb w-[500px] h-[500px] top-0 left-1/2 -translate-x-1/2 opacity-5" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Developers Learn{" "}
            <span className="text-gradient">the Hard Way</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            The traditional tutorial approach is fundamentally broken.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-4 group-hover:bg-destructive/20 transition-colors">
                <problem.icon size={20} className="text-destructive/70" />
              </div>
              <h3 className="font-display font-semibold text-base mb-2">{problem.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{problem.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex glass-strong rounded-2xl px-8 py-6 glow-primary">
            <div>
              <div className="font-display font-bold text-4xl text-gradient-glow mb-1">80%</div>
              <div className="text-sm text-muted-foreground">of tutorial knowledge is forgotten within 48 hours</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;
