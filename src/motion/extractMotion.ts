
import {
  initializePoseDetector,
  resetPoseDetector,
} from "./poseDetector";

export interface MotionLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface MotionFrame {
  timestamp: number;
  imageLandmarks: MotionLandmark[];
  landmarks: MotionLandmark[];
}

function seekVideo(
  video: HTMLVideoElement,
  time: number
): Promise<void> {
  if (Math.abs(video.currentTime - time) < 0.001) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Video seeking timed out."));
    }, 10000);

    function cleanup() {
      window.clearTimeout(timeout);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("error", handleError);
    }

    function handleSeeked() {
      cleanup();
      resolve();
    }

    function handleError() {
      cleanup();
      reject(new Error("Unable to seek video."));
    }

    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("error", handleError);

    video.currentTime = time;
  });
}

export async function extractMotion(
  video: HTMLVideoElement,
  onProgress: (progress: number) => void
): Promise<MotionFrame[]> {
  resetPoseDetector();

  const detector = await initializePoseDetector();

  const frames: MotionFrame[] = [];

  const fps = 30;
  const duration = video.duration;
  const totalFrames = Math.ceil(duration * fps);

  const originalTime = video.currentTime;

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("Invalid video duration.");
  }

  try {
    for (let i = 0; i < totalFrames; i++) {
      const timestamp = i / fps;

      await seekVideo(video, timestamp);

      const result = detector.detectForVideo(
        video,
        Math.round(timestamp * 1000)
      );

      if (
        result.landmarks?.[0] &&
        result.worldLandmarks?.[0]
      ) {
        const imageLandmarks = result.landmarks[0].map(
          (point) => ({
            x: point.x,
            y: point.y,
            z: point.z,
            visibility: point.visibility,
          })
        );

        const worldLandmarks = result.worldLandmarks[0].map(
          (point) => ({
            x: point.x,
            y: point.y,
            z: point.z,
            visibility: point.visibility,
          })
        );

        frames.push({
          timestamp,
          imageLandmarks,
          landmarks: worldLandmarks,
        });
      }

      onProgress(
        Math.round(((i + 1) / totalFrames) * 100)
      );
    }

    return frames;
  } finally {
    await seekVideo(video, originalTime).catch(() => {});
  }
}
