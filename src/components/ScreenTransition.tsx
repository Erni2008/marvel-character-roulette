import { motion as m } from 'motion/react';
import type { ReactNode } from 'react';
import { useGame } from '../app/Store';
export default function ScreenTransition({ children }: { children: ReactNode }) {
  const { motion } = useGame();
  return (
    <m.div
      className="screen-transition"
      initial={motion ? { opacity: 0, x: 22, scale: 0.985 } : false}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={
        motion
          ? { opacity: 0, x: -16, transition: { duration: 0.15 } }
          : { opacity: 0, transition: { duration: 0 } }
      }
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
      {motion && (
        <m.div
          className="transition-light"
          initial={{ x: '-110%', opacity: 0.6 }}
          animate={{ x: '140%', opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          aria-hidden="true"
        />
      )}
    </m.div>
  );
}
