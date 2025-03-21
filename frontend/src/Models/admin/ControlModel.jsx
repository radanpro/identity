import { useOutletContext } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Header from "../../components/Header";

const ControlModel = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef(null);
  let streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsCameraOn(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      setIsCameraOn(false);
    }
    setIsCameraOn(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);
  const { onToggleSidebar } = useOutletContext();
  return (
    <div className="flex-col">
      <Header page="controller model" onToggleSidebar={onToggleSidebar} />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-2xl mb-4">Camera Control</h1>
        <div className="border border-gray-700 rounded-lg overflow-hidden w-80 h-60">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full"
          ></video>
        </div>
        <div className="mt-4 space-x-4">
          {!isCameraOn ? (
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-green-500 rounded-lg"
            >
              Start Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="px-4 py-2 bg-red-500 rounded-lg"
            >
              Stop Camera
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlModel;
