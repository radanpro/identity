import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";

const useAutoFaceCapture = (onCapture, captureDelay = 5000) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    };
    loadModels();
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject;
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      video.srcObject = null;
      video.pause();
      video.removeAttribute("src");
      video.load();
      setIsCameraActive(false);
      console.log("🎥 الكاميرا توقفت بالكامل");
    }
  }, []);

  const captureImage = useCallback(() => {
    if (isCapturing) return;
    setIsCapturing(true);

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      stopCamera(); // إيقاف الكاميرا بعد الالتقاط

      const imageData = canvas.toDataURL("image/jpeg", 1.0);
      try {
        onCapture(imageData);
      } finally {
        setIsCapturing(false);
      }
    } else {
      setIsCapturing(false);
    }
  }, [onCapture, stopCamera, isCapturing]);

  const drawMarkers = useCallback(async () => {
    if (videoRef.current && overlayRef.current && !isCapturing) {
      const video = videoRef.current;
      const overlay = overlayRef.current;
      overlay.width = video.videoWidth;
      overlay.height = video.videoHeight;
      const ctx = overlay.getContext("2d");
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();
      detections.forEach((detection) => {
        detection.landmarks.positions.forEach((point) => {
          ctx.fillStyle = "red";
          ctx.beginPath();
          ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
          ctx.fill();
        });
      });
    }
  }, [isCapturing]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    let markerInterval;
    if (isCameraActive && !isCapturing) {
      markerInterval = setInterval(() => {
        drawMarkers();
      }, 1000);
    }
    return () => {
      clearInterval(markerInterval);
    };
  }, [isCameraActive, drawMarkers, isCapturing]);

  useEffect(() => {
    let timeoutId;
    if (isCameraActive && !isCapturing) {
      timeoutId = setTimeout(() => {
        captureImage();
      }, captureDelay);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isCameraActive, captureDelay, captureImage, isCapturing]);

  return {
    videoRef,
    canvasRef,
    overlayRef,
    isCameraActive,
    startCamera,
    stopCamera,
  };
};

export default useAutoFaceCapture;
