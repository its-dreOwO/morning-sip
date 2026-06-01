import { useEffect, useRef } from "react";

interface Props {
  opacity: number;
  spacing: number;
}

// Full-viewport canvas of amber dots whose size/brightness undulate on layered
// sine waves — the dashboard's ambient "dot matrix" backdrop.
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
      const cols = Math.floor(canvas.width / spacing) + 1;
      const rows = Math.floor(canvas.height / spacing) + 1;
      ctx.shadowBlur = 3;
      ctx.shadowColor = "#ffc879";

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const w1 = Math.sin(x * 0.12 + count);
          const w2 = Math.cos(y * 0.15 - count * 0.75);
          const w3 = Math.sin(x * 0.08 - y * 0.08 + count * 1.2);
          const wave = (w1 + w2 + w3) / 3;
          const size = 0.8 + wave * 0.5;
          const dotOpacity = (0.1 + (wave + 1) * 0.25) * opacity;
          ctx.fillStyle = `rgba(255, 200, 121, ${dotOpacity})`;
          ctx.beginPath();
          ctx.arc(x * spacing, y * spacing, Math.max(size, 0.1), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      count += 0.025;
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
