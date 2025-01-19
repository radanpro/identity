import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import CameraControls from "./CameraControls";
import CameraView from "./CameraView";
import SearchResults from "./SearchResults";
import DeviceSelector from "./DeviceSelector";

const SearchRealTime = () => {
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [imageResults, setImageResults] = useState([]);
  const [flash, setFlash] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [studentsInfo, setStudentsInfo] = useState([]);

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

  const stopCamera = () => {
    if (cameraActive) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

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
        formData.append("threshold", 0.5);
        formData.append("limit", 5);

        setImageResults([]);
        setLoading(true);
        try {
          const response = await axios.post(
            "http://127.0.0.1:8080/vectors/vectors/search",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (response.status === 200 && response.data.results) {
            const faceData = response.data.results;
            setImageResults(faceData);
            fetchAllStudentsInfo(faceData);
          } else {
            console.error("Face detection failed:", response);
          }
        } catch (error) {
          console.error("Error in sending image:", error);
        } finally {
          setLoading(false);
        }
      };

      await sendImageToServer(blob);
    }
  }, []);

  const fetchAllStudentsInfo = async (faceData) => {
    const studentsInfoPromises = faceData.map(async (result) => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8080/students/info?number=${result.student_id}`
        );
        if (response.status === 200) {
          return response.data;
        } else {
          console.error("Failed to fetch student info:", response);
          return null;
        }
      } catch (error) {
        console.error("Error fetching student info:", error);
        return null;
      }
    });

    const studentsInfo = await Promise.all(studentsInfoPromises);
    setStudentsInfo(studentsInfo.filter((info) => info !== null));
  };

  return (
    <div className="flex flex-col items-center p-5 border border-gray-300 rounded-lg shadow-md">
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

      <CameraView
        videoRef={videoRef}
        canvasRef={canvasRef}
        flash={flash}
        loading={loading}
      />

      <SearchResults imageResults={imageResults} studentsInfo={studentsInfo} />
    </div>
  );
};

export default SearchRealTime;
