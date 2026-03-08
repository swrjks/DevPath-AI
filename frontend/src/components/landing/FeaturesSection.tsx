import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BookOpen, GitBranch, Code2, Network, Lightbulb, Brain, BarChart3 } from "lucide-react";

const features = [
  { icon: BookOpen, title: "YouTube → Learning Modules", desc: "Automatically converts any tutorial into structured, bite-sized learning modules." },
  { icon: GitBranch, title: "AI Concept Roadmap", desc: "Generates a visual dependency graph of concepts to learn in the right order." },
  { icon: Code2, title: "Build-With-Me Coding Engine", desc: "Step-by-step guided coding that adapts to your pace and skill level." },
  { icon: Network, title: "Concept Dependency Graph", desc: "Visualize how programming concepts connect and build upon each other." },
  { icon: Lightbulb, title: "Code Evaluation + Hints", desc: "Intelligent feedback on your code with contextual hints, not just answers." },
  { icon: Brain, title: "Adaptive Quiz + Spaced Repetition", desc: "AI-driven quizzes that optimize for long-term retention using proven techniques." },
];

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="features" className="relative py-20">
      <div className="gradient-orb w-[600px] h-[600px] -right-60 top-1/4 opacity-8" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Everything You Need to{" "}
            <span className="text-gradient">Learn Smarter</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Powerful features designed for developers who want to actually learn, not just watch.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="glass rounded-2xl p-6 hover:border-primary/30 hover:glow-primary transition-all duration-500 group cursor-default"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon size={20} className="text-primary" />
              </div>
              <h3 className="font-display font-semibold text-base mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
