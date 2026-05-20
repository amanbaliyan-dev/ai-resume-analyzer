import { useEffect, useRef, useState, useCallback } from 'react';
import { Holistic } from '@mediapipe/holistic';
import { Camera } from '@mediapipe/camera_utils';
import { BodyLanguageAnalyzer } from '../services/bodyLanguage/analyzer';

export function useBodyLanguage(videoRef, canvasRef, isActive) {
  const holisticRef = useRef(null);
  const cameraRef   = useRef(null);
  const analyzerRef = useRef(new BodyLanguageAnalyzer());
  const [scores, setScores]   = useState(null);
  const [ready, setReady]     = useState(false);

  const drawOverlay = useCallback((results, ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);

    // Draw face mesh (subtle dots)
    if (results.faceLandmarks) {
      results.faceLandmarks.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x * w, pt.y * h, 1.2, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(127, 119, 221, 0.4)';
        ctx.fill();
      });
    }

    // Draw pose skeleton (shoulders, arms)
    if (results.poseLandmarks) {
      const connections = [
        [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
        [11, 23], [12, 24],
      ];
      connections.forEach(([a, b]) => {
        const pa = results.poseLandmarks[a];
        const pb = results.poseLandmarks[b];
        if (!pa || !pb) return;
        ctx.beginPath();
        ctx.moveTo(pa.x * w, pa.y * h);
        ctx.lineTo(pb.x * w, pb.y * h);
        ctx.strokeStyle = 'rgba(29, 158, 117, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }, []);

  useEffect(() => {
    if (!isActive || !videoRef.current || !canvasRef.current) {
      // Cleanup if not active
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (holisticRef.current) {
        holisticRef.current.close();
        holisticRef.current = null;
      }
      analyzerRef.current.reset();
      setReady(false);
      return;
    }

    const holistic = new Holistic({
      locateFile: file =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
    });

    holistic.setOptions({
      modelComplexity: navigator.userAgent.match(/Mobi|Android|iPhone/i) ? 0 : 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      refineFaceLandmarks: true, // enables iris landmarks (468+)
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    holistic.onResults(results => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      drawOverlay(results, ctx, canvas.width, canvas.height);

      const summary = analyzerRef.current.analyze(results);
      summary.overallScore = analyzerRef.current.getOverallScore(summary);
      setScores(summary);
    });

    holisticRef.current = holistic;

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (holistic) {
          await holistic.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start().then(() => setReady(true)).catch(err => console.error("Camera start failed:", err));
    cameraRef.current = camera;

    return () => {
      if (camera) {
        camera.stop();
      }
      if (holistic) {
        holistic.close();
      }
      analyzerRef.current.reset();
      setReady(false);
    };
  }, [isActive, videoRef, canvasRef, drawOverlay]);

  return { scores, ready };
}
