
import {
  PoseLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

let poseLandmarker: PoseLandmarker | null = null;

export async function initializePoseDetector() {
  if (poseLandmarker) return poseLandmarker;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
  );

  poseLandmarker = await PoseLandmarker.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
    }
  );

  return poseLandmarker;
}

export function resetPoseDetector() {
  if (poseLandmarker) {
    poseLandmarker.close();
    poseLandmarker = null;
  }
}
