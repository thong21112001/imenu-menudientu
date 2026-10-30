'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ==========================================
// 1. Tilt3DCard
// Pointer-tracked 3D perspective card with glare
// ==========================================
export interface Tilt3DCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number; // degrees
  perspective?: number; // px
  glare?: boolean;
  glareColor?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Tilt3DCard: React.FC<Tilt3DCardProps> = ({
  children,
  maxTilt = 10,
  perspective = 1100,
  glare = true,
  glareColor = 'rgba(223, 160, 53, 0.14)',
  disabled = false,
  className = '',
  style = {},
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>('perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;

      const rotateY = ((x / rect.width) - 0.5) * (maxTilt * 2);
      const rotateX = -(((y / rect.height) - 0.5) * (maxTilt * 2));

      setTransform(
        `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
      );
      setGlarePosition({
        x: xPercent,
        y: yPercent,
        opacity: 1,
      });
    },
    [disabled, maxTilt, perspective]
  );

  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    setIsHovered(true);
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTransform(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  }, [perspective]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative transform-gpu will-change-transform ${className}`}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        transition: isHovered
          ? 'transform 0.1s ease-out'
          : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
      {...props}
    >
      {children}

      {/* Dynamic radial spotlight glare overlay */}
      {glare && !disabled && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300 z-30"
          style={{
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle 380px at ${glarePosition.x}% ${glarePosition.y}%, ${glareColor} 0%, rgba(223, 160, 53, 0.04) 40%, transparent 80%)`,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

// ==========================================
// 2. CinematicSection
// Scroll-triggered 3D reveal wrapper
// ==========================================
export interface CinematicSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  sceneBadge?: string;
  sceneTitle?: string;
  sceneSubtitle?: string;
  className?: string;
  threshold?: number;
  once?: boolean;
}

export const CinematicSection: React.FC<CinematicSectionProps> = ({
  children,
  sceneBadge,
  sceneTitle,
  sceneSubtitle,
  className = '',
  threshold = 0.12,
  once = true,
  style = {},
  ...props
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return (
    <section
      ref={sectionRef}
      className={`relative transition-all duration-700 ease-out will-change-transform ${className}`}
      style={{
        transform: isVisible
          ? 'perspective(1200px) rotateX(0deg) translateY(0) scale(1)'
          : 'perspective(1200px) rotateX(4deg) translateY(28px) scale(0.985)',
        opacity: isVisible ? 1 : 0.08,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
      {...props}
    >
      {(sceneBadge || sceneTitle || sceneSubtitle) && (
        <div className="mb-6 flex flex-col items-start gap-1.5">
          {sceneBadge && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#dfa035]/15 text-[#dfa035] border border-[#dfa035]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dfa035] animate-pulse" />
              {sceneBadge}
            </span>
          )}
          {sceneTitle && (
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-current">
              {sceneTitle}
            </h2>
          )}
          {sceneSubtitle && (
            <p className="text-xs sm:text-sm text-current opacity-70 max-w-2xl">
              {sceneSubtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

// ==========================================
// 3. CinematicScrollProgress
// Fixed top 3px gradient progress bar + scene index
// ==========================================
export interface SceneItem {
  id: string;
  label: string;
  badge?: string;
}

export interface CinematicScrollProgressProps {
  scenes?: SceneItem[];
  activeSceneId?: string;
  onSceneClick?: (id: string) => void;
  className?: string;
}

export const CinematicScrollProgress: React.FC<CinematicScrollProgressProps> = ({
  scenes = [],
  activeSceneId,
  onSceneClick,
  className = '',
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const p = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
        setProgress(p);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* 3px Gradient Progress Bar at top */}
      <div
        className={`fixed top-0 left-0 right-0 h-[3px] z-[999] pointer-events-none bg-black/20 ${className}`}
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-[#2e9e73] via-[#dfa035] to-[#c85a32] transition-[width] duration-75 ease-out shadow-[0_0_12px_rgba(223,160,53,0.6)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating Desktop Scene Index on xl screens */}
      {scenes.length > 0 && (
        <nav
          aria-label="Scene Index"
          className="hidden xl:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 flex-col gap-2 p-2 rounded-2xl bg-[#0e1613]/80 backdrop-blur-md border border-[#23352c]/80 shadow-xl"
        >
          {scenes.map((scene, idx) => {
            const isActive = activeSceneId === scene.id;
            return (
              <button
                key={scene.id}
                onClick={() => {
                  if (onSceneClick) {
                    onSceneClick(scene.id);
                  } else {
                    const el = document.getElementById(scene.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#dfa035]/15 text-[#dfa035] border border-[#dfa035]/40 font-semibold'
                    : 'text-[#98a69e] hover:text-[#ede7da] hover:bg-white/5 border border-transparent'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full transition-all ${
                    isActive ? 'bg-[#dfa035] scale-125' : 'bg-[#3b4e44] group-hover:bg-[#dfa035]/70'
                  }`}
                />
                <span className="text-[11px] whitespace-nowrap tracking-tight">
                  {scene.badge || `CẢNH ${String(idx + 1).padStart(2, '0')}`} · {scene.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
};

// ==========================================
// 4. AmbientCinematicStage
// Fixed ambient stage with warm lantern amber, jade & terracotta orbs + 56px perspective grid
// ==========================================
export interface AmbientCinematicStageProps {
  variant?: 'dark' | 'muted';
  className?: string;
}

export const AmbientCinematicStage: React.FC<AmbientCinematicStageProps> = ({
  variant = 'dark',
  className = '',
}) => {
  const isDark = variant === 'dark';

  return (
    <div
      className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden ${
        isDark ? 'bg-[#0a0f0d]' : 'bg-[#e4dfd4]'
      } ${className}`}
      aria-hidden="true"
    >
      {/* 56px Perspective Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(to right, #dfa035 1px, transparent 1px), linear-gradient(to bottom, #dfa035 1px, transparent 1px)`
            : `linear-gradient(to right, #1b2620 1px, transparent 1px), linear-gradient(to bottom, #1b2620 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
        }}
      />

      {/* Warm Lantern-Amber Blurred Orb (Top Right / Center) */}
      <div
        className="absolute -top-32 right-1/4 w-[540px] h-[540px] rounded-full blur-[140px] opacity-25 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #dfa035 0%, rgba(223, 160, 53, 0.2) 60%, transparent 100%)',
        }}
      />

      {/* Deep Jade Blurred Orb (Bottom Left) */}
      <div
        className="absolute -bottom-36 -left-20 w-[620px] h-[620px] rounded-full blur-[160px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #245846 0%, rgba(36, 88, 70, 0.3) 60%, transparent 100%)',
        }}
      />

      {/* Ember-Terracotta Blurred Orb (Center Right / Ambient Depth) */}
      <div
        className="absolute top-1/2 -right-40 -translate-y-1/2 w-[460px] h-[460px] rounded-full blur-[150px] opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #c85a32 0%, rgba(200, 90, 50, 0.2) 60%, transparent 100%)',
        }}
      />

      {/* Subtle Vignette Gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle at center, transparent 40%, rgba(7, 11, 9, 0.6) 100%)'
            : 'radial-gradient(circle at center, transparent 50%, rgba(198, 191, 178, 0.35) 100%)',
        }}
      />
    </div>
  );
};
