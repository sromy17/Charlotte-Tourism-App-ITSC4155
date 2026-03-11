/**
 * Preloader — Studio-grade minimalist intro, Lusion.co inspired.
 *
 * Phase sequence:
 *   loading     → counter 0-100, single gold line grows
 *   contracting → line contracts, 3 dashes materialise
 *   folding     → dashes expand into C / L / T div-stroke letterforms
 *   holding     → CLT fully formed
 *   revealing   → 'ourism' slides in beside T
 *   exiting     → whole logo scales up + fades
 *   done        → onComplete()
 *
 * C, L, T are built from absolutely-positioned motion.div strokes inside
 * a fixed-size container — no SVG path-length math, no viewBox fragility.
 *
 * Palette:
 *   BG       #0B0C10   Deep slate
 *   GOLD     #D4AF37   Royal Gold
 *   WHITE    #FFFFFF   Pure White  (ourism)
 *   PLATINUM #DCDCCA   Soft Platinum (counter)
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// ─── Design tokens ─────────────────────────────────────────────────────────
const GOLD     = '#D4AF37';
const WHITE    = '#FFFFFF';
const PLATINUM = '#DCDCCA';

// Letter geometry (px)
const LH  = 88;   // letter height
const LW  = 62;   // letter width
const SW  =  8;   // stroke width
const GAP = 16;   // gap between letters

// Spring configs
const SPRING      = { type: 'spring' as const, stiffness: 180, damping: 22 };
const SPRING_SLOW = { type: 'spring' as const, stiffness: 120, damping: 20 };

type Phase = 'loading' | 'contracting' | 'folding' | 'holding' | 'revealing' | 'exiting' | 'done';

// ─── Stroke primitives ──────────────────────────────────────────────────────

/** Horizontal stroke — grows left → right */
const HStroke: React.FC<{
  top?: number; bottom?: number; left?: number;
  width: number; delay: number;
}> = ({ top, bottom, left = 0, width, delay }) => (
  <motion.div
    initial={{ scaleX: 0 }}
    animate={{ scaleX: 1 }}
    transition={{ ...SPRING, delay }}
    style={{
      position:        'absolute',
      top:             top    !== undefined ? top    : undefined,
      bottom:          bottom !== undefined ? bottom : undefined,
      left,
      width,
      height:          SW,
      background:      GOLD,
      transformOrigin: 'left center',
    }}
  />
);

/** Vertical stroke — grows top → bottom */
const VStroke: React.FC<{
  left: number; top?: number; height: number; delay: number;
}> = ({ left, top = 0, height, delay }) => (
  <motion.div
    initial={{ scaleY: 0 }}
    animate={{ scaleY: 1 }}
    transition={{ ...SPRING, delay }}
    style={{
      position:        'absolute',
      top,
      left,
      width:           SW,
      height,
      background:      GOLD,
      transformOrigin: 'top center',
    }}
  />
);

// ─── Letter components ───────────────────────────────────────────────────────

/** C — top bar + left bar + bottom bar */
const LetterC: React.FC<{ d: number }> = ({ d }) => (
  <div style={{ position: 'relative', width: LW, height: LH, flexShrink: 0 }}>
    <HStroke top={0}    width={LW} delay={d} />
    <VStroke left={0}   height={LH} delay={d + 0.06} />
    <HStroke bottom={0} width={LW} delay={d + 0.12} />
  </div>
);

/** L — left bar + bottom bar */
const LetterL: React.FC<{ d: number }> = ({ d }) => (
  <div style={{ position: 'relative', width: LW, height: LH, flexShrink: 0 }}>
    <VStroke left={0}   height={LH} delay={d} />
    <HStroke bottom={0} width={LW}  delay={d + 0.10} />
  </div>
);

/** T — top cap + center stem */
const LetterT: React.FC<{ d: number }> = ({ d }) => {
  const stemLeft = Math.round((LW - SW) / 2); // perfectly centred
  return (
    <div style={{ position: 'relative', width: LW, height: LH, flexShrink: 0 }}>
      <HStroke top={0}         width={LW} delay={d} />
      <VStroke left={stemLeft} height={LH} delay={d + 0.10} />
    </div>
  );
};

// ─── Types & Props ────────────────────────────────────────────────────────────
export interface PreloaderProps { onComplete: () => void; }

// ─── Main component ──────────────────────────────────────────────────────────

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>('loading');
  const [count, setCount] = useState(0);

  // Smooth counter 0 → 100 over ~2.5 s with ease-in-out quad
  useEffect(() => {
    if (phase !== 'loading') return;
    const DURATION = 2500;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const v = Math.floor(e * 100);
      setCount(v);
      if (v >= 100) { setPhase('contracting'); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // Phase cascade driven by setTimeout
  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, fn: () => void) => ts.push(setTimeout(fn, ms));
    if (phase === 'contracting') after(560,  () => setPhase('folding'));
    if (phase === 'folding')     after(1100, () => setPhase('holding'));
    if (phase === 'holding')     after(700,  () => setPhase('revealing'));
    if (phase === 'revealing')   after(900,  () => setPhase('exiting'));
    if (phase === 'exiting')     after(650,  () => { setPhase('done'); onComplete(); });
    return () => ts.forEach(clearTimeout);
  }, [phase, onComplete]);

  const showLine    = phase === 'loading';
  const showDashes  = phase === 'contracting';
  const showLetters = ['folding','holding','revealing','exiting'].includes(phase);
  const showOurism  = ['revealing','exiting'].includes(phase);
  const showCounter = phase === 'loading' || phase === 'contracting';
  const isExiting   = phase === 'exiting';

  // Line width tracks the counter live
  const lineW = Math.max(4, (count / 100) * Math.min(
    typeof window !== 'undefined' ? window.innerWidth * 0.42 : 440, 440,
  ));

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={isExiting ? { opacity: 0, scale: 1.06 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9999,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        overflow:       'hidden',
        // Deep ambient background — warm central spotlight for perceived depth
        background:     'radial-gradient(ellipse 72% 58% at 50% 48%, #18160f 0%, #101118 42%, #0B0C10 100%)',
      }}
    >

      {/* ── Counter (bottom-left, Inter, platinum) ────────────────────── */}
      <AnimatePresence>
        {showCounter && (
          <motion.div
            key="counter"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y:  0, transition: { duration: 0.35 } }}
            exit={{   opacity: 0, y: -10, transition: { duration: 0.22 } }}
            style={{
              position:           'absolute',
              bottom:             36,
              left:               44,
              fontFamily:         "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize:           'clamp(44px, 5.5vw, 72px)',
              fontWeight:         300,
              color:              PLATINUM,
              lineHeight:         1,
              letterSpacing:      '-0.04em',
              userSelect:         'none',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {String(count).padStart(2, '0')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Central stage ────────────────────────────────────────────────── */}
      <div style={{
        position:       'relative',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}>

        {/* Loading line — tracks counter */}
        <AnimatePresence>
          {showLine && (
            <motion.div
              key="line"
              exit={{ scaleX: 0, transition: { duration: 0.30, ease: [0.76, 0, 0.24, 1] } }}
              style={{
                width:           lineW,
                height:          SW,
                background:      GOLD,
                transformOrigin: 'center',
                boxShadow:       `0 0 12px ${GOLD}55, 0 0 28px ${GOLD}18`,
              }}
            />
          )}
        </AnimatePresence>

        {/* 3 contracting dashes */}
        <AnimatePresence>
          {showDashes && (
            <motion.div
              key="dashes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.12 } }}
              exit={{   opacity: 0, transition: { duration: 0.16 } }}
              style={{ display: 'flex', alignItems: 'center', gap: GAP }}
            >
              {['c','l','t'].map((id, i) => (
                <motion.div
                  key={id}
                  initial={{ width: 110 }}
                  animate={{ width: LW }}
                  transition={{ ...SPRING, delay: i * 0.05 }}
                  style={{ height: SW, background: GOLD, flexShrink: 0 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CLT letterforms + ourism */}
        <AnimatePresence>
          {showLetters && (
            <motion.div
              key="clt"
              initial={{ opacity: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: GAP }}
            >
              <LetterC d={0} />
              <LetterL d={0.14} />
              <LetterT d={0.28} />

              {/* 'ourism' slides in flush right of T — bold white */}
              <AnimatePresence>
                {showOurism && (
                  <motion.span
                    key="ourism"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x:  0 }}
                    exit={{   opacity: 0, x: 20 }}
                    transition={SPRING_SLOW}
                    style={{
                      fontFamily:    "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                      fontSize:      `${Math.round(LH * 0.72)}px`,
                      fontWeight:    700,
                      color:         WHITE,
                      letterSpacing: '0.03em',
                      lineHeight:    1,
                      userSelect:    'none',
                      pointerEvents: 'none',
                      whiteSpace:    'nowrap',
                      paddingBottom: '0.04em',
                      marginLeft:    2,
                    }}
                  >
                    ourism
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
};

export default Preloader;

