import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X, Minus } from "lucide-react";

const features = [
  "Structured Learning Paths",
  "Adaptive Skill Tracking",
  "Interactive Coding Practice",
  "Concept Dependency Graphs",
  "Spaced Repetition Quizzes",
  "YouTube Tutorial Integration",
  "AI-Powered Personalization",
];

const platforms: Record<string, Record<string, "yes" | "no" | "partial">> = {
  "DevPath AI": {
    "Structured Learning Paths": "yes",
    "Adaptive Skill Tracking": "yes",
    "Interactive Coding Practice": "yes",
    "Concept Dependency Graphs": "yes",
    "Spaced Repetition Quizzes": "yes",
    "YouTube Tutorial Integration": "yes",
    "AI-Powered Personalization": "yes",
  },
  ChatGPT: {
    "Structured Learning Paths": "partial",
    "Adaptive Skill Tracking": "no",
    "Interactive Coding Practice": "partial",
    "Concept Dependency Graphs": "no",
    "Spaced Repetition Quizzes": "no",
    "YouTube Tutorial Integration": "no",
    "AI-Powered Personalization": "partial",
  },
  LeetCode: {
    "Structured Learning Paths": "partial",
    "Adaptive Skill Tracking": "partial",
    "Interactive Coding Practice": "yes",
    "Concept Dependency Graphs": "no",
    "Spaced Repetition Quizzes": "no",
    "YouTube Tutorial Integration": "no",
    "AI-Powered Personalization": "no",
  },
  Udemy: {
    "Structured Learning Paths": "yes",
    "Adaptive Skill Tracking": "no",
    "Interactive Coding Practice": "partial",
    "Concept Dependency Graphs": "no",
    "Spaced Repetition Quizzes": "no",
    "YouTube Tutorial Integration": "no",
    "AI-Powered Personalization": "no",
  },
  YouTube: {
    "Structured Learning Paths": "no",
    "Adaptive Skill Tracking": "no",
    "Interactive Coding Practice": "no",
    "Concept Dependency Graphs": "no",
    "Spaced Repetition Quizzes": "no",
    "YouTube Tutorial Integration": "yes",
    "AI-Powered Personalization": "no",
  },
};

const StatusIcon = ({ status }: { status: "yes" | "no" | "partial" }) => {
  if (status === "yes") return <Check size={16} className="text-accent" />;
  if (status === "partial") return <Minus size={16} className="text-muted-foreground" />;
  return <X size={16} className="text-destructive/50" />;
};

const CompareSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const platformNames = Object.keys(platforms);

  return (
    <section ref={ref} id="compare" className="relative py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Why <span className="text-gradient">DevPath AI</span> Is Different
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            We focus on learning architecture, not just answers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="glass-strong rounded-2xl overflow-x-auto"
        >
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-sm font-display font-semibold">Feature</th>
                {platformNames.map((name) => (
                  <th
                    key={name}
                    className={`p-4 text-sm font-display font-semibold text-center ${
                      name === "DevPath AI" ? "text-gradient" : "text-muted-foreground"
                    }`}
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <tr key={feature} className={`border-b border-border/20 ${i % 2 === 0 ? "bg-secondary/10" : ""}`}>
                  <td className="p-4 text-sm text-foreground/80">{feature}</td>
                  {platformNames.map((platform) => (
                    <td key={platform} className={`p-4 text-center ${platform === "DevPath AI" ? "bg-primary/5" : ""}`}>
                      <div className="flex justify-center">
                        <StatusIcon status={platforms[platform][feature]} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
};

export default CompareSection;
