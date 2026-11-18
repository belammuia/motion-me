
import { useEffect, useRef } from "react";
import type { MotionFrame } from "../motion/extractMotion";

interface Props {
  frames: MotionFrame[];
  frameIndex: number;
}

const connections = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [27, 29],
  [29, 31],
  [24, 26],
  [26, 28],
  [28, 30],
  [30, 32],
  [15, 17],
  [15, 19],
  [15, 21],
  [16, 18],
  [16, 20],
  [16, 22],
] as const;

export default function SkeletonViewer({
  frames,
  frameIndex,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frames[frameIndex];

    if (!canvas || !frame) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#181818";
    ctx.fillRect(0, 0, width, height);

    const points = frame.imageLandmarks;

    // Convert normalized coordinates to canvas coordinates
    function position(index: number) {
      const point = points[index];

      return {
        x: point.x * width,
        y: point.y * height,
      };
    }

    // Draw connections
    ctx.strokeStyle = "#858cff";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    connections.forEach(([a, b]) => {
      const p1 = points[a];
      const p2 = points[b];

      if (
        !p1 ||
        !p2 ||
        (p1.visibility ?? 1) < 0.5 ||
        (p2.visibility ?? 1) < 0.5
      ) {
        return;
      }

      const start = position(a);
      const end = position(b);

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });

    // Draw landmarks
    points.forEach((point, index) => {
      if ((point.visibility ?? 1) < 0.5) return;

      const p = position(index);

      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);

      ctx.fillStyle = "#ffffff";
      ctx.fill();
    });
  }, [frames, frameIndex]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{
          display: "block",
          width: "100%",
          maxWidth: "640px",
          height: "auto",
          background: "#181818",
        }}
      />

      <p>
        Frame {frameIndex + 1} of {frames.length}
      </p>
    </div>
  );
}
