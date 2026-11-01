'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronUp, ListFilter, X } from 'lucide-react';

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
  alignHeader?: 'center' | 'start';
  threshold?: number;
  once?: boolean;
}

export const CinematicSection: React.FC<CinematicSectionProps> = ({
  children,
  sceneBadge,
  sceneTitle,
  sceneSubtitle,
  className = '',
  alignHeader = 'center',
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

  const isCentered = alignHeader === 'center';

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
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
          <div
            className={`flex flex-col gap-2.5 ${
              isCentered
                ? 'items-center text-center max-w-3xl mx-auto'
                : 'items-start text-left'
            }`}
          >
            {sceneBadge && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#dfa035]/15 text-[#dfa035] border border-[#dfa035]/30 shadow-xs mx-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfa035] animate-pulse" />
                {sceneBadge}
              </span>
            )}
            {sceneTitle && (
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#f5f1e8] text-center">
                {sceneTitle}
              </h2>
            )}
            {sceneSubtitle && (
              <p className="text-xs sm:text-sm text-[#98a69e] leading-relaxed max-w-2xl mx-auto text-center">
                {sceneSubtitle}
              </p>
            )}
          </div>
        </div>
      )}
      {children}
    </section>
  );
};

// ==========================================
// 3. CinematicScrollProgress
// Fixed top 3px gradient progress bar + non-intrusive scene index + Back to Top
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
  showBackToTopButton?: boolean;
}

export const CinematicScrollProgress: React.FC<CinematicScrollProgressProps> = ({
  scenes = [],
  activeSceneId,
  onSceneClick,
  className = '',
  showBackToTopButton = true,
}) => {
  const [progress, setProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentActiveScene, setCurrentActiveScene] = useState<string>(activeSceneId || '');

  // Track scroll progress and Back to Top visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const p = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
        setProgress(p);
      }
      setShowBackToTop(scrollY > 250);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scrollspy for scenes if activeSceneId not externally managed
  useEffect(() => {
    if (activeSceneId) {
      setCurrentActiveScene(activeSceneId);
      return;
    }
    if (scenes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentActiveScene(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0,
      }
    );

    scenes.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [scenes, activeSceneId]);

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

      {/* Non-intrusive Floating Desktop Scene Index on xl screens */}
      {scenes.length > 0 && (
        <nav
          aria-label="Scene Index"
          className={`hidden xl:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${
            isExpanded
              ? 'w-64 p-3 rounded-2xl bg-[#0e1613]/95 backdrop-blur-xl border border-[#263a30] shadow-2xl'
              : 'w-10 p-2 rounded-2xl bg-[#0e1613]/70 hover:bg-[#0e1613]/90 backdrop-blur-md border border-[#23352c]/80 shadow-lg'
          }`}
        >
          {isExpanded ? (
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#203027] text-xs">
                <span className="font-mono text-[10px] uppercase font-semibold text-[#dfa035] tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#dfa035] animate-pulse" />
                  Mục lục 3D Scenes
                </span>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-md text-[#8e9d94] hover:text-[#ede7da] hover:bg-white/5 transition-colors cursor-pointer"
                  title="Thu gọn khung cảnh"
                  aria-label="Thu gọn"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                {scenes.map((scene, idx) => {
                  const isActive = (currentActiveScene || activeSceneId) === scene.id;
                  return (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => {
                        if (onSceneClick) {
                          onSceneClick(scene.id);
                        } else {
                          const el = document.getElementById(scene.id);
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-[#dfa035]/15 text-[#dfa035] border border-[#dfa035]/40 font-semibold'
                          : 'text-[#98a69e] hover:text-[#ede7da] hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full transition-all shrink-0 ${
                          isActive
                            ? 'bg-[#dfa035] scale-125 shadow-[0_0_8px_#dfa035]'
                            : 'bg-[#3b4e44]'
                        }`}
                      />
                      <span className="text-[11px] truncate tracking-tight">
                        {scene.badge || `CẢNH ${String(idx + 1).padStart(2, '0')}`} · {scene.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1 w-full">
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="p-1 rounded-md text-[#8e9d94] hover:text-[#dfa035] transition-colors cursor-pointer mb-1"
                title="Mở rộng danh mục cảnh"
                aria-label="Mở rộng danh mục cảnh"
              >
                <ListFilter className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center gap-2.5">
                {scenes.map((scene, idx) => {
                  const isActive = (currentActiveScene || activeSceneId) === scene.id;
                  return (
                    <div key={scene.id} className="relative group flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (onSceneClick) {
                            onSceneClick(scene.id);
                          } else {
                            const el = document.getElementById(scene.id);
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className={`transition-all duration-200 cursor-pointer rounded-full ${
                          isActive
                            ? 'w-3 h-3 bg-[#dfa035] shadow-[0_0_8px_#dfa035]'
                            : 'w-1.5 h-1.5 bg-[#2a3c32] hover:bg-[#dfa035]/80 hover:scale-150'
                        }`}
                        aria-label={scene.label}
                      />
                      {/* Floating tooltip on hover */}
                      <div className="absolute right-full mr-3.5 px-2.5 py-1 rounded-md bg-[#0e1613]/95 backdrop-blur-md border border-[#23352c] text-[#ede7da] text-[11px] font-medium shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50">
                        {scene.badge || `CẢNH ${String(idx + 1).padStart(2, '0')}`} · {scene.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      )}

      {/* Floating Back to Top Button */}
      {showBackToTopButton && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Lên đầu trang"
          title="Lên đầu trang"
          className={`fixed right-4 sm:right-6 bottom-6 z-40 w-11 h-11 rounded-full bg-[#121c17]/90 hover:bg-[#1a2822] text-[#c5cfc9] hover:text-[#dfa035] border border-[#26382f] hover:border-[#dfa035]/60 shadow-xl backdrop-blur-md flex items-center justify-center transition-all duration-300 cursor-pointer group hover:scale-105 active:scale-95 ${
            showBackToTop
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <ChevronUp className="w-5 h-5 stroke-[2] group-hover:-translate-y-0.5 transition-transform duration-150" />
        </button>
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
