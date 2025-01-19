import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";

const SearchRealTime = () => {
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [imageResults, setImageResults] = useState([]);
  const [flash, setFlash] = useState(false);
  const [devices, setDevices] = useState([]); // قائمة الأجهزة
  const [selectedDeviceId, setSelectedDeviceId] = useState(null); // الكاميرا المختارة
  const [studentsInfo, setStudentsInfo] = useState([]); // معلومات جميع الطلاب

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
      const videoDevices = deviceInfos.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId); // افتراضيًا الكاميرا الأولى
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

      // نقل sendImageToServer هنا
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
  }, []); // لم تعد بحاجة إلى إضافة sendImageToServer كمُعتمَدية

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
      {/* قائمة الكاميرات */}
      <div className="mt-4">
        <label htmlFor="camera-select" className="mr-2 text-lg">
          اختر الكاميرا:
        </label>
        <select
          id="camera-select"
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          value={selectedDeviceId || ""}
          className="p-2 text-base border border-gray-300 rounded"
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>

      {/* أزرار التحكم بالكاميرا */}
      <div className="mt-4">
        {!cameraActive ? (
          <button
            onClick={startCamera}
            className="p-2 bg-green-500 text-white rounded"
          >
            فتح الكاميرا
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="p-2 bg-red-500 text-white rounded ml-4"
          >
            إغلاق الكاميرا
          </button>
        )}
      </div>

      <div className="mt-4">
        {cameraActive && (
          <button
            onClick={captureImage}
            className="p-2 bg-blue-500 text-white rounded"
          >
            التقاط صورة
          </button>
        )}
      </div>

      <div className="relative p-5 border border-gray-300 rounded-lg shadow-md mt-4">
        <video ref={videoRef} width="640" height="480" autoPlay />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 pointer-events-none z-10 w-40 h-40"
        />

        {flash && (
          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-50 z-20"></div>
        )}

        {loading && <p className="text-lg">جاري التحميل...</p>}
      </div>

      <div className="mt-4 flex w-full justify-center">
        {imageResults.length > 0 && (
          <div className="w-full max-w-4xl">
            <h2 className="text-xl font-bold mb-4">نتائج البحث:</h2>
            <div className="flex gap-8">
              <table className="w-2/3 border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">اسم الطالب</th>
                    <th className="p-3 text-left">الكلية</th>
                    <th className="p-3 text-left">درجة التشابه</th>
                  </tr>
                </thead>
                <tbody>
                  {imageResults.map((result, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 border-t border-gray-300">
                        {result.student_id}
                      </td>
                      <td className="p-3 border-t border-gray-300">
                        {result.college}
                      </td>
                      <td className="p-3 border-t border-gray-300">
                        {result.similarity.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="w-1/3 p-4 border border-gray-300 rounded-lg bg-gray-50">
                <h3 className="text-lg font-bold mb-4">معلومات الطلاب</h3>
                {studentsInfo.map((student, index) => (
                  <div key={index} className="mb-4">
                    <p>
                      <strong>الكلية:</strong> {student.College}
                    </p>
                    <p>
                      <strong>رقم القيد:</strong> {student.Number}
                    </p>
                    <p>
                      <strong>مسار الصورة:</strong>
                    </p>
                    <img
                      src={`http://127.0.0.1:8080/static/${student.ImagePath}`}
                      alt="Student"
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchRealTime;
