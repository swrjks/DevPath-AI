import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Flame, TrendingUp, AlertTriangle, Target } from "lucide-react";

const skills = [
  { name: "Variables", value: 95 },
  { name: "Functions", value: 88 },
  { name: "OOP", value: 65 },
  { name: "Data Structures", value: 72 },
  { name: "Algorithms", value: 45 },
  { name: "Design Patterns", value: 30 },
];

const DashboardPreview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="dashboard" className="relative py-20">
      <div
        className="gradient-orb w-[500px] h-[500px] -left-40 top-1/2 opacity-8"
        style={{
          background: 'radial-gradient(circle, rgba(96,165,250,0.4), rgba(37,99,235,0.3))',
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Your Learning{" "}
            <span className="text-gradient-glow">Dashboard</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Beautiful analytics to track your developer growth.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="max-w-5xl mx-auto glass-strong rounded-2xl p-6 md:p-8 glow-primary"
        >
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Flame, label: "Learning Streak", value: "14 days", color: "text-accent" },
              { icon: Target, label: "Concepts Mastered", value: "47", color: "text-primary" },
              { icon: TrendingUp, label: "Weekly Progress", value: "+23%", color: "text-accent" },
              { icon: AlertTriangle, label: "Weak Areas", value: "3", color: "text-destructive/70" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4">
                <stat.icon size={18} className={stat.color} />
                <div className={`font-display font-bold text-xl mt-2 ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Skill radar (simplified as bars) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-5">
              <div className="font-display font-semibold text-sm mb-4">Skill Mastery</div>
              <div className="space-y-3">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{skill.name}</span>
                      <span className="text-foreground">{skill.value}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${skill.value}%` } : {}}
                        transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: skill.value > 70 ? "var(--gradient-primary)" : `hsl(var(--primary) / 0.5)` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Concept graph mock */}
            <div className="glass rounded-xl p-5">
              <div className="font-display font-semibold text-sm mb-4">Concept Graph</div>
              <div className="relative h-48 flex items-center justify-center">
                {/* Simplified node graph */}
                <svg viewBox="0 0 200 150" className="w-full h-full">
                  {/* Lines */}
                  <line x1="100" y1="30" x2="50" y2="75" stroke="hsl(252, 80%, 65%)" strokeWidth="1" opacity="0.3" />
                  <line x1="100" y1="30" x2="150" y2="75" stroke="hsl(252, 80%, 65%)" strokeWidth="1" opacity="0.3" />
                  <line x1="50" y1="75" x2="30" y2="120" stroke="hsl(192, 95%, 55%)" strokeWidth="1" opacity="0.3" />
                  <line x1="50" y1="75" x2="80" y2="120" stroke="hsl(192, 95%, 55%)" strokeWidth="1" opacity="0.3" />
                  <line x1="150" y1="75" x2="130" y2="120" stroke="hsl(192, 95%, 55%)" strokeWidth="1" opacity="0.3" />
                  <line x1="150" y1="75" x2="170" y2="120" stroke="hsl(252, 80%, 65%)" strokeWidth="1" opacity="0.3" />
                  {/* Nodes */}
                  <circle cx="100" cy="30" r="8" fill="hsl(252, 80%, 65%)" opacity="0.8" />
                  <circle cx="50" cy="75" r="6" fill="hsl(192, 95%, 55%)" opacity="0.7" />
                  <circle cx="150" cy="75" r="6" fill="hsl(192, 95%, 55%)" opacity="0.7" />
                  <circle cx="30" cy="120" r="5" fill="hsl(252, 80%, 65%)" opacity="0.4" />
                  <circle cx="80" cy="120" r="5" fill="hsl(192, 95%, 55%)" opacity="0.5" />
                  <circle cx="130" cy="120" r="5" fill="hsl(252, 80%, 65%)" opacity="0.5" />
                  <circle cx="170" cy="120" r="5" fill="hsl(252, 80%, 65%)" opacity="0.3" />
                  {/* Labels */}
                  <text x="100" y="18" textAnchor="middle" fill="hsl(210, 40%, 96%)" fontSize="7" fontFamily="Space Grotesk">Python</text>
                  <text x="50" y="65" textAnchor="middle" fill="hsl(210, 40%, 96%)" fontSize="6" fontFamily="Space Grotesk">OOP</text>
                  <text x="150" y="65" textAnchor="middle" fill="hsl(210, 40%, 96%)" fontSize="6" fontFamily="Space Grotesk">Data</text>
                  <text x="30" y="135" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="5" fontFamily="Space Grotesk">Inherit</text>
                  <text x="80" y="135" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="5" fontFamily="Space Grotesk">Poly</text>
                  <text x="130" y="135" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="5" fontFamily="Space Grotesk">Lists</text>
                  <text x="170" y="135" textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize="5" fontFamily="Space Grotesk">Dicts</text>
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
