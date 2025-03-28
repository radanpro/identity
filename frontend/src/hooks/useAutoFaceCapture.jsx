import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";

const useAutoFaceCapture = (onCapture, captureDelay = 5000) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // لالتقاط الصورة
  const overlayRef = useRef(null); // لرسم معالم الوجه
  const [isCameraActive, setIsCameraActive] = useState(false);

  // تحميل نماذج face-api.js
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models"; // تأكد من أن النماذج موجودة في هذا المسار
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
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg", 1.0);
      onCapture(imageData);
      stopCamera();
    }
  }, [onCapture, stopCamera]);

  // دالة لرسم معالم الوجه باستخدام face-api.js
  const drawMarkers = useCallback(async () => {
    if (videoRef.current && overlayRef.current) {
      const video = videoRef.current;
      const overlay = overlayRef.current;
      overlay.width = video.videoWidth;
      overlay.height = video.videoHeight;
      const ctx = overlay.getContext("2d");
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      // استخدام TinyFaceDetector للحصول على الكائنات التي تحتوي على معالم الوجه
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();
      detections.forEach((detection) => {
        const landmarks = detection.landmarks.positions;
        landmarks.forEach((point) => {
          ctx.fillStyle = "red";
          ctx.beginPath();
          ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
          ctx.fill();
        });
      });
    }
  }, []);

  // بدء الكاميرا عند تحميل hook
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  // تحديث معالم الوجه كل ثانية
  useEffect(() => {
    let markerInterval;
    if (isCameraActive) {
      markerInterval = setInterval(() => {
        drawMarkers();
      }, 1000);
    }
    return () => {
      if (markerInterval) clearInterval(markerInterval);
    };
  }, [isCameraActive, drawMarkers]);

  // التقاط الصورة بعد captureDelay (مثلاً 5 ثوانٍ)
  useEffect(() => {
    let timeoutId;
    if (isCameraActive) {
      timeoutId = setTimeout(() => {
        captureImage();
      }, captureDelay);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isCameraActive, captureDelay, captureImage]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

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
