import { useEffect, useRef } from "react";

interface Props {
  opacity: number;
  spacing: number;
}

// Three dotted sine "waves" marching across the bottom of the viewport — the
// dashboard's ambient sea backdrop. Each line is a row of amber dots traced
// along a layered sine curve, rolling sideways at its own speed and amplitude,
// with a gentle per-dot brightness shimmer. Spacing sets dot density; opacity
// scales overall alpha.
const WAVE_LINES = [
  { baseH: 150, amp: 18, freq: 0.014, speed: 1.0, stepBump: 0, alpha: 0.85 },
  { baseH: 95, amp: 26, freq: 0.020, speed: 1.5, stepBump: 2, alpha: 0.6 },
  { baseH: 45, amp: 14, freq: 0.028, speed: 2.2, stepBump: 4, alpha: 0.4 },
];

export function DotMatrixBackground({ opacity, spacing }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let count = 0;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { width: w, height: h } = canvas;
      ctx.shadowBlur = 4;
      ctx.shadowColor = "#ffc879";

      for (const line of WAVE_LINES) {
        const step = spacing + line.stepBump;
        const phase = count * line.speed;
        for (let x = 0; x <= w; x += step) {
          // Layered sines give the surface an irregular, sea-like roll rather
          // than a single clean wave; baseH anchors it above the bottom edge.
          const y =
            h -
            line.baseH -
            Math.sin(x * line.freq + phase) * line.amp -
            Math.sin(x * line.freq * 0.5 - phase * 1.3) * line.amp * 0.5;
          const pulse = 0.6 + 0.4 * Math.sin(x * 0.05 + phase * 2);
          ctx.fillStyle = `rgba(255, 200, 121, ${line.alpha * pulse * opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, 2.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      count += 0.022;
      if (!reduceMotion) animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [opacity, spacing]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10" />;
}
