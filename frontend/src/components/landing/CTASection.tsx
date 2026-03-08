import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-20">
      <div className="gradient-orb w-[800px] h-[400px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />

      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8">
            <Sparkles size={14} className="text-accent" />
            <span className="text-xs text-muted-foreground">Ready to level up?</span>
          </div>

          <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight mb-6">
            Become a Developer Who{" "}
            <span className="text-gradient-glow">Thinks</span>, Not Just Copies Code
          </h2>

          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
            Join thousands of developers building real understanding with AI-powered structured learning.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary px-8 h-12 text-base">
              Start Learning Free
              <ArrowRight className="ml-2" size={18} />
            </Button>
            <Button size="lg" variant="outline" className="border-border/60 text-foreground hover:bg-secondary h-12 px-8 text-base">
              Try Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
