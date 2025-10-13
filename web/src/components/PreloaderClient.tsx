"use client";

import { useEffect, useRef, useState } from "react";

const WORDS = ['breathe','schön','calm','klar','großartig','gut gemacht','relax','inhale','exhale','strahlend','focus','almost there','brilliant','peaceful','mut','freundlich','sanft'];

function pick() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export default function PreloaderClient() {
  const [mounted, setMounted] = useState(true);
  const [hiding, setHiding] = useState(false);

  // characters currently displayed
  const [chars, setChars] = useState<string[]>([]);
  const [flips, setFlips] = useState<boolean[]>([]);
  const charsRef = useRef<string[]>([]);
  const flipsRef = useRef<boolean[]>([]);
  const timeouts = useRef<number[]>([]);

  // keep refs in sync
  useEffect(() => { charsRef.current = chars; }, [chars]);
  useEffect(() => { flipsRef.current = flips; }, [flips]);

  useEffect(() => {
    let intervalId: number | null = null;
    let hideTimer: number | null = null;

    function clearAll() {
      timeouts.current.forEach((t) => window.clearTimeout(t));
      timeouts.current = [];
    }

    function start() {
      const initial = pick();
  const arr = Array.from(initial).map((ch) => (ch === ' ' ? '\u00A0' : ch));
  setChars(arr);
      setFlips(new Array(arr.length).fill(false));
      charsRef.current = arr.slice();
      flipsRef.current = new Array(arr.length).fill(false);

      // change ~30% faster (1400ms)
      intervalId = window.setInterval(() => {
        const next = pick();
        const prev = charsRef.current.slice();
        const prevLen = prev.length;
        const nextLen = next.length;
        const max = Math.max(prevLen, nextLen);
        const stagger = 70; // ms between letters
        const mid = 200; // ms to swap at mid-flip

        // ensure chars/flips arrays are sized to max to avoid sticking
        setChars((prevState) => {
          const a = prevState.slice();
          while (a.length < max) a.push('');
          return a;
        });
        setFlips((prevState) => {
          const f = prevState.slice();
          while (f.length < max) f.push(false);
          return f;
        });
        // sync refs
        charsRef.current = charsRef.current.slice().concat(new Array(Math.max(0, max - charsRef.current.length)).fill(''));
        flipsRef.current = flipsRef.current.slice().concat(new Array(Math.max(0, max - flipsRef.current.length)).fill(false));

        // schedule flips per letter sequentially
        for (let i = 0; i < max; i++) {
          const startAt = i * stagger;
          const t1 = window.setTimeout(() => {
            // set flipping true for this letter (use ref update pattern)
            setFlips((prevF) => {
              const cp = prevF.slice();
              cp[i] = true;
              flipsRef.current = cp.slice();
              return cp;
            });

            const swap = window.setTimeout(() => {
              setChars((prevC) => {
                const arr2 = prevC.slice();
                const ch = next[i] ?? '';
                arr2[i] = ch === ' ' ? '\u00A0' : ch;
                charsRef.current = arr2.slice();
                return arr2;
              });
              // turn flipping off to animate back
              setFlips((prevF) => {
                const cp2 = prevF.slice();
                cp2[i] = false;
                flipsRef.current = cp2.slice();
                return cp2;
              });
            }, mid);
            timeouts.current.push(swap);
          }, startAt);
          timeouts.current.push(t1);
        }
      }, 1400);

      // hide 3s after load
      hideTimer = window.setTimeout(() => {
        clearAll();
        setHiding(true);
        window.setTimeout(() => setMounted(false), 600);
      }, 10000);
    }

    if (document.readyState === 'complete') {
      start();
    } else {
      const onLoad = () => start();
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
      if (hideTimer) window.clearTimeout(hideTimer);
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  return (
    <div id="sd-preloader" aria-hidden={false} className={hiding ? 'sd-preloader-hidden' : ''}>
      <div className="sd-preloader-word" aria-live="polite">
        {chars.map((c, i) => (
          <span key={i} className={`sd-letter ${flips[i] ? 'flipping' : ''}`} data-index={i}>
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
