// src/components/CameraInput.jsx
import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

const CameraInput = ({ onImageCapture }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // بدء تشغيل الكاميرا عند فتحها
  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const file = new File([blob], "captured-image.png", {
          type: "image/png",
        });
        setCapturedImage(file);
        onImageCapture(file);
        setIsCameraOpen(false); // إغلاق الكاميرا بعد الالتقاط
      }, "image/png");
    }
  };

  const toggleCamera = () => {
    setIsCameraOpen(!isCameraOpen);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!isCameraOpen ? (
        <div className="flex flex-col items-center">
          {capturedImage ? (
            <div className="flex flex-col items-center gap-2">
              <img
                src={URL.createObjectURL(capturedImage)}
                alt="Captured"
                className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300"
              />
              <button
                onClick={() => setCapturedImage(null)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
              >
                إزالة الصورة
              </button>
            </div>
          ) : (
            <button
              onClick={toggleCamera}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              فتح الكاميرا
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-auto max-h-96 rounded-lg border-2 border-gray-300"
          />
          <div className="flex gap-2">
            <button
              onClick={captureImage}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
            >
              التقاط صورة
            </button>
            <button
              onClick={toggleCamera}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
            >
              إغلاق الكاميرا
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

CameraInput.propTypes = {
  onImageCapture: PropTypes.func.isRequired,
};

export default CameraInput;
