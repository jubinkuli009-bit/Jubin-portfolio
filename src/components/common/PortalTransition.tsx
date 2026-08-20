import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PortalTransitionProps {
  isActive: boolean;
}

export const PortalTransition: React.FC<PortalTransitionProps> = ({ isActive }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          id="jubin-portal-warp"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-slate-950/90 backdrop-blur-xl"
        >
          {/* Concentric Warp Rings */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.1, opacity: 0.8, rotate: 0 }}
                animate={{
                  scale: [0.1, 4 + i * 2],
                  opacity: [0.8, 1, 0],
                  rotate: i % 2 === 0 ? 360 : -360
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeIn'
                }}
                className="absolute w-96 h-96 rounded-full border border-cyan-400/80 shadow-[0_0_50px_rgba(0,240,255,0.8)]"
                style={{
                  borderWidth: `${2 + i}px`,
                  filter: `blur(${i * 0.5}px)`
                }}
              />
            ))}

            {/* Central Event Horizon */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: [0.2, 1.8, 2.5], opacity: [0, 1, 0] }}
              transition={{ duration: 1.0, ease: 'easeInOut' }}
              className="relative z-10 text-center"
            >
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-tr from-cyan-500 via-teal-300 to-sky-400 blur-md animate-pulse" />
              <p className="mt-6 text-xl md:text-2xl font-bold tracking-widest text-cyan-300 uppercase font-mono drop-shadow-[0_0_15px_#00f0ff]">
                ENTERING DIGITAL UNIVERSE...
              </p>
              <p className="mt-1 text-xs text-teal-200/70 font-mono tracking-widest">
                SYNCHRONIZING QUANTUM TELEMETRY
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
