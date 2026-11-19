import { motion as m } from 'motion/react';
import type { ReactNode } from 'react';
import { useGame } from '../app/Store';
export default function ScreenTransition({ children }: { children: ReactNode }) {
  const { motion } = useGame();
  return (
    <m.div
      className="screen-transition"
      initial={motion ? { opacity: 0, scale: 1.04, filter: 'blur(10px)' } : false}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={
        motion
          ? { opacity: 0, scale: 0.97, filter: 'blur(8px)', transition: { duration: 0.22 } }
          : { opacity: 0, transition: { duration: 0 } }
      }
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </m.div>
  );
}
