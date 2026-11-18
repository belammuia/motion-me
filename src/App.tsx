
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import {
  extractMotion,
  type MotionFrame,
} from "./motion/extractMotion";

import SkeletonViewer from "./components/SkeletonViewer";

function App() {
  const [video, setVideo] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [progress, setProgress] = useState(0);
  const [motion, setMotion] = useState<MotionFrame[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");

  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Clean up video URL
  useEffect(() => {
    if (!video) return;

    return () => {
      URL.revokeObjectURL(video);
    };
  }, [video]);

  // Automatic skeleton playback
  useEffect(() => {
    if (!isPlaying || motion.length === 0) return;

    const interval = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % motion.length);
    }, 1000 / 30);

    return () => window.clearInterval(interval);
  }, [isPlaying, motion.length]);

  // Handle video upload
  function handleVideoUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setVideo(URL.createObjectURL(file));

    setMotion([]);
    setProgress(0);
    setFrameIndex(0);
    setIsPlaying(false);
    setError("");
  }

  // Extract body movement
  async function handleExtraction() {
    if (!videoRef.current) return;

    try {
      setExtracting(true);
      setError("");
      setProgress(0);
      setMotion([]);
      setFrameIndex(0);
      setIsPlaying(false);

      const frames = await extractMotion(
        videoRef.current,
        setProgress
      );

      setMotion(frames);

      if (frames.length === 0) {
        setError("No body movement detected in this video.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Motion extraction failed."
      );
    } finally {
      setExtracting(false);
    }
  }

  return (
    <main>
      <header>
        <h2>MotionMe</h2>
        <p>Personal motion capture studio</p>
      </header>

      <hr />

      {/* SOURCE VIDEO */}
      <section>
        <h3>1. Source video</h3>

        <input
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          onChange={handleVideoUpload}
        />

        {video && (
          <div>
            <video
              ref={videoRef}
              src={video}
              controls
              width="480"
              style={{ maxWidth: "100%" }}
            />
          </div>
        )}
      </section>

      <hr />

      {/* MOTION EXTRACTION */}
      <section>
        <h3>2. Motion extraction</h3>

        <p>Upload a video to prepare for pose detection.</p>

        <button
          disabled={!video || extracting}
          onClick={handleExtraction}
        >
          {extracting ? "Extracting..." : "Extract movement"}
        </button>

        {extracting && (
          <p>Processing: {progress}%</p>
        )}

        {motion.length > 0 && (
          <p>
            Successfully extracted {motion.length} frames.
          </p>
        )}

        {error && (
          <p style={{ color: "red" }}>{error}</p>
        )}
      </section>

      {/* SKELETON VISUALIZATION */}
      {motion.length > 0 && (
        <>
          <hr />

          <section>
            <h3>3. Skeleton visualization</h3>

            <SkeletonViewer
              frames={motion}
              frameIndex={frameIndex}
            />

            {/* PLAYBACK CONTROLS */}
            <div>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setFrameIndex(0);
                }}
              >
                Reset
              </button>

              <input
                type="range"
                min={0}
                max={motion.length - 1}
                value={frameIndex}
                onChange={(event) => {
                  setIsPlaying(false);
                  setFrameIndex(Number(event.target.value));
                }}
                style={{
                  width: "300px",
                  maxWidth: "100%",
                }}
              />

              <p>
                Frame: {frameIndex + 1} / {motion.length}
              </p>

              <p>
                Timestamp:{" "}
                {motion[frameIndex]?.timestamp.toFixed(2)} seconds
              </p>
            </div>
          </section>
        </>
      )}

      <hr />

      {/* 3D CHARACTER */}
      <section>
        <h3>4. 3D character</h3>
        <p>Character preview will appear here.</p>
      </section>
    </main>
  );
}

export default App;
