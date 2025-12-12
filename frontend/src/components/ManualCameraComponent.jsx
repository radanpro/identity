import { useRef, useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import DeviceSelector from "./DeviceSelector";
import SearchResults from "./SearchResults";

const ManualCameraComponent = ({ threshold, limit }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [imageResult, setImageResult] = useState(null);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null); // حالة جديدة للصورة الملتقطة

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
      const videoDevices = deviceInfos.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    });
  }, []);

  const startCamera = async () => {
    setCapturedImage(null); // إعادة تعيين الصورة عند بدء الكاميرا
    if (!cameraActive && selectedDeviceId) {
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: selectedDeviceId },
            width: 1280,
            height: 720,
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        setError("حدث خطأ أثناء الوصول إلى الكاميرا.", err);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 1.0);

    setCapturedImage(imageData); // حفظ الصورة الملتقطة
    stopCamera(); // إيقاف الكاميرا

    try {
      const blob = await (await fetch(imageData)).blob();
      const formData = new FormData();
      formData.append("image", blob, "image.jpg");
      formData.append("threshold", threshold);
      formData.append("limit", limit);

      setError(null);
      setImageResult(null);

      const response = await axios.post(
        "http://127.0.0.1:3000/vectors/vectors/search",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.status === 200 && response.data.results) {
        setImageResult(response.data.results);
      } else {
        setError(response.data.message || "لم يتم العثور على نتائج.");
      }
    } catch (err) {
      setError("حدث خطأ أثناء التقاط الصورة.", err);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="p-4 border rounded shadow-sm">
      <h3 className="text-xl font-bold mb-2 text-center">التقاط صورة يدويًا</h3>

      <DeviceSelector
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        setSelectedDeviceId={setSelectedDeviceId}
      />

      {!cameraActive && (
        <button
          onClick={startCamera}
          className="mt-2 w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          بدء الكاميرا
        </button>
      )}

      {cameraActive && (
        <div className="mt-2 flex flex-col gap-2">
          <button
            onClick={captureImage}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            التقاط صورة
          </button>
          <button
            onClick={stopCamera}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            إيقاف الكاميرا
          </button>
        </div>
      )}

      <div className="mt-4 flex flex-col items-center">
        {capturedImage ? (
          <img
            src={capturedImage}
            className="w-full max-w-lg border rounded"
            alt="الصورة الملتقطة"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            className="w-full max-w-lg border rounded"
          ></video>
        )}
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      </div>

      {imageResult && (
        <SearchResults
          imageResults={{ results: imageResult }}
          errorMessage={error}
        />
      )}
      {error && <div className="mt-2 text-red-500 text-center">{error}</div>}
    </div>
  );
};

ManualCameraComponent.propTypes = {
  threshold: PropTypes.number.isRequired,
  limit: PropTypes.number,
};

export default ManualCameraComponent;
