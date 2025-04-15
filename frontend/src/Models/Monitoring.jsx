// src/Models/Monitoring.jsx
import { useState, useRef, useEffect } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import Header from "../components/Header";
import { AdvancedMonitor } from "../components/Monitoring/AdvancedMonitor";
import { fetchConfig, defaultConfig } from "../config/config";

const Monitoring = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const location = useLocation();
  // استقبل قيمة autoStartCamera من state الممررة من الراوت، واذا لم توجد فهي false
  const autoStartCameraFlag = location.state?.autoStartCamera || false;

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(defaultConfig);
  // إنشاء المراجع لعناصر الـ DOM
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const alertRef = useRef(null);
  const gazeDirectionRef = useRef(null);
  const focusTimeRef = useRef(null);
  const headPositionRef = useRef(null);
  const mouthStatusRef = useRef(null);
  const warningCountRef = useRef(null);
  const attentionScoreRef = useRef(null);
  const eventLogRef = useRef(null);
  const monitorRef = useRef(null);

  useEffect(() => {
    const loadConfig = async () => {
      const mergedConfig = await fetchConfig();
      setConfig(mergedConfig);
      setLoading(true);
    };
    loadConfig();
  }, []);

  // تهيئة AdvancedMonitor عند تركيب المكون
  useEffect(() => {
    const refs = {
      video: videoRef,
      canvas: canvasRef,
      alert: alertRef,
      gazeDirection: gazeDirectionRef,
      focusTime: focusTimeRef,
      headPosition: headPositionRef,
      mouthStatus: mouthStatusRef,
      warningCount: warningCountRef,
      attentionScore: attentionScoreRef,
      eventLog: eventLogRef,
    };
    // يمكن عرض قيمة config للتأكد من تحميل الإعدادات
    // console.log("config", config);
    monitorRef.current = new AdvancedMonitor(refs, config);
    return () => monitorRef.current?.stopCamera();
  }, [config, loading]);

  // دوال تشغيل وإيقاف الكاميرا
  const handleStartCamera = async () => {
    if (monitorRef.current) {
      await monitorRef.current.startCamera();
      setIsCameraOn(true);
    }
  };

  const handleStopCamera = () => {
    monitorRef.current?.stopCamera();
    setIsCameraOn(false);
  };

  // إذا كانت autoStartCameraFlag true فإننا نشغل الكاميرا تلقائيًا بعد تحميل المكون
  useEffect(() => {
    if (autoStartCameraFlag) {
      handleStartCamera();
    }
  }, [autoStartCameraFlag]);

  return (
    <div className="flex-col min-h-screen bg-gray-100 text-gray-900">
      <Header
        page="controller model"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div className="dashboard mx-auto p-4">
        <h1 className="text-3xl text-center mb-4">
          نظام مراقبة الامتحانات الذكي 🎓
        </h1>
        <div className="flex justify-center mt-6 space-x-4">
          {!isCameraOn ? (
            <button
              onClick={handleStartCamera}
              className="px-4 py-2 bg-green-500 rounded-lg text-white"
            >
              تشغيل الكاميرا
            </button>
          ) : (
            <button
              onClick={handleStopCamera}
              className="px-4 py-2 bg-red-500 rounded-lg text-white"
            >
              إيقاف الكاميرا
            </button>
          )}
        </div>
        <div
          className="video-container relative mx-auto shadow-lg rounded-lg overflow-hidden"
          style={
            loading
              ? {
                  width: config.camera.width,
                  height: config.camera.height,
                }
              : {}
          }
        >
          <video
            id="video"
            ref={videoRef}
            playsInline
            autoPlay
            className="w-full h-full object-cover"
          ></video>
          <canvas
            id="canvas"
            ref={canvasRef}
            className="absolute top-0 left-0"
          ></canvas>
        </div>
        <div
          id="alert"
          ref={alertRef}
          className="alert-badge fixed top-5 right-5 p-2 m-4 text-white hidden animate-pulse rounded-xl"
          style={{ backgroundColor: "#c91919" }}
        ></div>

        <div className="stats-panel grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="stat-card bg-white p-4 rounded shadow">
            <h3 className="text-xl mb-2">👀 تتبع النظر</h3>
            <p id="gaze-direction" ref={gazeDirectionRef}>
              الاتجاه: -
            </p>
            <p id="focus-time" ref={focusTimeRef}>
              زمن التركيز: 0s
            </p>
          </div>
          <div className="stat-card bg-white p-4 rounded shadow">
            <h3 className="text-xl mb-2">🎭 تعابير الوجه</h3>
            <p id="head-position" ref={headPositionRef}>
              وضعية الرأس: مستقيم
            </p>
            <p id="mouth-status" ref={mouthStatusRef}>
              حالة الفم: مغلق
            </p>
          </div>
          <div className="stat-card bg-white p-4 rounded shadow">
            <h3 className="text-xl mb-2">📊 الإحصائيات</h3>
            <p id="warning-count" ref={warningCountRef}>
              التحذيرات: 0
            </p>
            <p id="attention-score" ref={attentionScoreRef}>
              مؤشر الانتباه: 100%
            </p>
          </div>
        </div>

        <div className="history-log bg-white mt-6 p-4 rounded shadow max-h-80 overflow-y-auto">
          <h3 className="text-xl mb-2">سجل الأحداث 📜</h3>
          <div id="event-log" ref={eventLogRef}></div>
        </div>
      </div>
    </div>
  );
};

Monitoring.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default Monitoring;
