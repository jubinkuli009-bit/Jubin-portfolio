import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailing, setTrailing] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Disable on mobile / touch devices
    const checkMobile = () => {
      const mobile = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (isMobile) return;

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, input, textarea, select, [role="button"], .interactive-node, .hologram-card');
        setIsHovered(!!interactive);
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // Trailing dot physics loop
    let rafId: number;
    const updateTrail = () => {
      setTrailing(prev => ({
        x: prev.x + (position.x - prev.x) * 0.22,
        y: prev.y + (position.y - prev.y) * 0.22
      }));
      rafId = requestAnimationFrame(updateTrail);
    };
    rafId = requestAnimationFrame(updateTrail);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, [position.x, position.y, isMobile]);

  if (isMobile) return null;

  return (
    <div id="jubin-custom-cursor" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Outer Halo */}
      <div
        className={`fixed rounded-full border border-cyan-400/60 transition-transform duration-100 ease-out pointer-events-none -translate-x-1/2 -translate-y-1/2 ${
          isHovered
            ? 'w-12 h-12 bg-cyan-500/15 border-cyan-300 scale-125 shadow-[0_0_20px_rgba(0,240,255,0.6)]'
            : isClicking
            ? 'w-8 h-8 scale-90 bg-cyan-400/30 border-cyan-200'
            : 'w-8 h-8'
        }`}
        style={{
          left: `${trailing.x}px`,
          top: `${trailing.y}px`
        }}
      />
      {/* Center Pinpoint */}
      <div
        className={`fixed rounded-full bg-cyan-300 transition-all duration-75 pointer-events-none -translate-x-1/2 -translate-y-1/2 ${
          isClicking ? 'w-2 h-2 scale-150 shadow-[0_0_12px_#00f0ff]' : 'w-1.5 h-1.5'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
      />
    </div>
  );
};
