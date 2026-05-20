import { useEffect, useRef, useState, useCallback } from 'react';
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

    let active = true;
    let checkInterval = null;

    const initMediaPipe = () => {
      const HolisticLib = window.Holistic || globalThis.Holistic;
      const CameraLib = window.Camera || globalThis.Camera;

      if (!HolisticLib || !CameraLib) {
        // Not loaded yet, try again
        return false;
      }

      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }

      if (!active) return true;

      const holistic = new HolisticLib({
        locateFile: file =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      });

      holistic.setOptions({
        modelComplexity: navigator.userAgent.match(/Mobi|Android|iPhone/i) ? 0 : 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        refineFaceLandmarks: true,
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

      const camera = new CameraLib(videoRef.current, {
        onFrame: async () => {
          if (holistic && active) {
            await holistic.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      camera.start().then(() => {
        if (active) setReady(true);
      }).catch(err => console.error("Camera start failed:", err));
      cameraRef.current = camera;

      return true;
    };

    // Attempt immediately
    const success = initMediaPipe();
    if (!success) {
      // Set up interval to poll until loaded
      checkInterval = setInterval(() => {
        if (initMediaPipe()) {
          clearInterval(checkInterval);
        }
      }, 300);
    }

    return () => {
      active = false;
      if (checkInterval) clearInterval(checkInterval);
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
    };
  }, [isActive, videoRef, canvasRef, drawOverlay]);

  return { scores, ready };
}
