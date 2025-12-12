import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import CameraControls from "./CameraControls";
import CameraView from "./CameraView";
import SearchResults from "./SearchResults";
import DeviceSelector from "./DeviceSelector";
import Header from "./Header";
import { useOutletContext } from "react-router-dom";

const SearchRealTime = () => {
  const { onToggleSidebar } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [imageResults, setImageResults] = useState([]);
  const [flash, setFlash] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [threshold, setThreshold] = useState(0.5);
  const [limit, setLimit] = useState(5);
  const [errorMessage, setErrorMessage] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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

  const startCamera = () => {
    if (!cameraActive && selectedDeviceId) {
      setImageResults(false);
      navigator.mediaDevices
        .getUserMedia({
          video: {
            deviceId: { exact: selectedDeviceId },
            width: 1280,
            height: 720,
          },
        })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        })
        .catch((err) => {
          console.error("Error accessing webcam:", err);
        });
    }
  };

  const stopCamera = useCallback(() => {
    if (cameraActive) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  }, [cameraActive]);

  const captureImage = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const ctx = canvasRef.current.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

      const imageData = canvasRef.current.toDataURL("image/jpeg", 1.0);

      setFlash(true);
      setTimeout(() => setFlash(false), 300);

      const byteString = atob(imageData.split(",")[1]);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uintArray = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        uintArray[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([arrayBuffer], { type: "image/jpeg" });

      const sendImageToServer = async (imageBlob) => {
        const formData = new FormData();
        formData.append("image", imageBlob, "image.jpg");
        formData.append("threshold", threshold);
        formData.append("limit", limit);

        // إعادة تعيين الحالات قبل بدء البحث الجديد
        setImageResults([]);
        setErrorMessage(null);

        setLoading(true);
        stopCamera();
        try {
          const response = await axios.post(
            "http://127.0.0.1:3000/vectors/vectors/search",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (response.status === 200 && response.data.results) {
            setImageResults(response.data.results);
          } else {
            setErrorMessage(response.data.message || "No results found.");
          }
        } catch (error) {
          setErrorMessage(
            error.response?.data?.message ||
              "An error occurred while searching."
          );
        } finally {
          setLoading(false);
        }
      };

      await sendImageToServer(blob);
    }
  }, [stopCamera, limit, threshold]);

  return (
    <div className="flex flex-col  p-5 border border-gray-300 rounded-lg shadow-md">
      <Header page="Search Real Time" onToggleSidebar={onToggleSidebar} />
      <DeviceSelector
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        setSelectedDeviceId={setSelectedDeviceId}
      />

      <CameraControls
        cameraActive={cameraActive}
        startCamera={startCamera}
        stopCamera={stopCamera}
        captureImage={captureImage}
      />
      <div className="flex justify-around w-full m-4 p-4 border border-sky-300 shadow-md shadow-sky-100 rounded-lg ">
        <div className="flex-1 mt-4 mr-3  relative p-5 border border-gray-300 rounded-lg shadow-md">
          {/* قائمة منسدلة لـ threshold */}
          <div className="mt-4">
            <label htmlFor="threshold-select" className="mr-2 text-lg">
              اختر قيمة Threshold:
            </label>
            <select
              id="threshold-select"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="p-2 border border-gray-300  w-full text-center text-xl rounded-md flex "
            >
              {Array.from({ length: 11 }, (_, i) => i * 0.1).map((value) => (
                <option key={value} value={value}>
                  {value.toFixed(1)}
                </option>
              ))}
            </select>
          </div>
          {/* قائمة منسدلة لـ limit */}
          <div className="mt-4">
            <label htmlFor="limit-select" className="mr-2 text-lg">
              اختر قيمة Limit:
            </label>
            <select
              id="limit-select"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="p-2 border border-gray-300 w-full text-center text-xl rounded-md flex "
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>TODO:[Search by college or all ...etc]</div>
        </div>
        <CameraView
          videoRef={videoRef}
          canvasRef={canvasRef}
          flash={flash}
          loading={loading}
        />
      </div>

      {/* تمرير errorMessage إلى SearchResults */}
      <SearchResults imageResults={imageResults} errorMessage={errorMessage} />
    </div>
  );
};

export default SearchRealTime;
