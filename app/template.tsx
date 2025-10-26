// app/template.tsx
'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      // 1. Start invisible AND 20px *below* its final position
      initial={{ opacity: 0, y: 20 }} 
      // 2. Animate to fully visible AND its original position (y: 0)
      animate={{ opacity: 1, y: 0 }} 
      // 3. Make the animation a little faster and smoother
      transition={{ ease: 'easeInOut', duration: 0.75 }}
    >
      {children}
    </motion.div>
  );
}