import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Header from "../components/Header";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils"; // Add this import
import { Pose } from "@mediapipe/pose";

// إعدادات افتراضية يمكن استبدالها من السيرفر
const config = {
  faceMeshOptions: {
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  },
  poseOptions: {
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  },
  camera: {
    width: 800,
    height: 600,
  },
  // عوامل تعديل مؤشر الانتباه
  attentionDecrementFactor: 5,
  attentionIncrementFactor: 1,
  noFaceDecrementFactor: 3,
};

const Monitoring = () => {
  const { onToggleSidebar } = useOutletContext();
  const [isCameraOn, setIsCameraOn] = useState(false);
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

  // تحويل الكود الأصلي إلى كلاس داخل React باستخدام refs والمتغيرات من config
  class AdvancedMonitor {
    constructor(refs, config) {
      this.video = refs.video.current;
      this.canvas = refs.canvas.current;
      this.ctx = this.canvas.getContext("2d");
      this.alert = refs.alert.current;
      this.gazeDirectionEl = refs.gazeDirection.current;
      this.focusTimeEl = refs.focusTime.current;
      this.headPositionEl = refs.headPosition.current;
      this.mouthStatusEl = refs.mouthStatus.current;
      this.warningCountEl = refs.warningCount.current;
      this.attentionScoreEl = refs.attentionScore.current;
      this.eventLogEl = refs.eventLog.current;

      // الإحصائيات والمتغيرات
      this.attentionScore = 100;
      this.warningCount = 0;
      this.lastUpdate = Date.now();
      this.faceResults = null;
      this.poseResults = null;
      this.currentGazeDirection = null;
      this.currentFocusStartTime = null;
      this.maxFocusTimes = {};

      this.config = config;

      // تهيئة النماذج
      this.initFaceMesh();
      this.initPose();
      this.setupEventHandlers();
    }

    // تهيئة نموذج FaceMesh
    initFaceMesh() {
      // نفترض أن FaceMesh متوفر عالمياً (من خلال السكربت الخارجي)
      this.faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      this.faceMesh.setOptions(this.config.faceMeshOptions);
      this.faceMesh.onResults(this.processFaceResults.bind(this));
    }

    // تهيئة نموذج Pose
    initPose() {
      this.pose = new Pose({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      this.pose.setOptions(this.config.poseOptions);
      this.pose.onResults(this.processPoseResults.bind(this));
    }

    async startCamera() {
      this.camera = new Camera(this.video, {
        onFrame: async () => {
          await this.faceMesh.send({ image: this.video });
          await this.pose.send({ image: this.video });
        },
        width: this.config.camera.width,
        height: this.config.camera.height,
      });
      await this.camera.start();
    }

    stopCamera() {
      if (this.video && this.video.srcObject) {
        this.video.srcObject.getTracks().forEach((track) => track.stop());
        this.video.srcObject = null;
      }
    }

    // استقبال نتائج FaceMesh
    processFaceResults(results) {
      this.faceResults = results;
      this.updateAnalysis();
    }

    // استقبال نتائج Pose
    processPoseResults(results) {
      this.poseResults = results;
      this.updateAnalysis();
    }

    updateAnalysis() {
      this.drawResultsOnCanvas();
      if (
        this.faceResults &&
        this.faceResults.multiFaceLandmarks &&
        this.faceResults.multiFaceLandmarks.length > 0
      ) {
        this.analyzeFaceLandmarks(this.faceResults.multiFaceLandmarks[0]);
        if (this.poseResults && this.poseResults.poseResults) {
          this.analyzePoseLandmarks(
            this.faceResults.multiFaceLandmarks[0],
            this.poseResults.poseLandmarks
          );
        } else {
          this.detectHeadPosition(this.faceResults.multiFaceLandmarks[0]);
        }
      } else {
        this.updateAttentionScore(false);
        this.showAlert("تحذير: لم يتم اكتشاف الوجه!", "danger");
      }
    }
    drawResultsOnCanvas() {
      if (this.faceResults && this.faceResults.image) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(
          this.faceResults.image,
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );
      }
    }

    analyzeFaceLandmarks(landmarks) {
      this.drawFaceLandmarks(landmarks);
      this.updateAttentionScore(true);
      this.trackGaze(landmarks);
      this.detectMouthActions(landmarks);
    }

    analyzePoseLandmarks(faceLandmarks, poseLandmarks) {
      this.detectHeadDirectionRelativeToShoulders(faceLandmarks, poseLandmarks);
    }

    // رسم معالم الوجه على canvas
    drawFaceLandmarks(landmarks) {
      this.ctx.fillStyle = "red";
      landmarks.forEach((point) => {
        const x = point.x * this.canvas.width;
        const y = point.y * this.canvas.height;
        this.drawPoint(x, y, 2);
      });
    }

    drawPoint(x, y, r) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, r, 0, 2 * Math.PI);
      this.ctx.fill();
    }

    trackGaze(landmarks) {
      const gaze = this.calculateGazeDirection(landmarks);
      if (this.gazeDirectionEl)
        this.gazeDirectionEl.textContent = `الاتجاه: ${gaze.direction} (${gaze.confidence}%)`;

      if (
        !this.currentGazeDirection ||
        this.currentGazeDirection !== gaze.direction
      ) {
        if (this.currentGazeDirection && this.currentFocusStartTime) {
          let elapsed = (Date.now() - this.currentFocusStartTime) / 1000;
          if (
            !this.maxFocusTimes[this.currentGazeDirection] ||
            elapsed > this.maxFocusTimes[this.currentGazeDirection]
          ) {
            this.maxFocusTimes[this.currentGazeDirection] = elapsed;
          }
        }
        this.currentGazeDirection = gaze.direction;
        this.currentFocusStartTime = Date.now();
      }
      let focusElapsed = (Date.now() - this.currentFocusStartTime) / 1000;
      if (this.focusTimeEl)
        this.focusTimeEl.textContent = `زمن التركيز: ${focusElapsed.toFixed(
          1
        )}s`;

      //   console.log(
      //     `أعلى زمن تركيز للاتجاه ${this.currentGazeDirection}: ${
      //       this.maxFocusTimes[this.currentGazeDirection] || 0
      //     }s`
      //   );

      if (gaze.confidence > 75 && !gaze.isCentered) {
        this.showAlert(`انحراف النظر إلى ${gaze.direction}`, "warning");
        this.updateAttentionScore(true);
      }
    }

    calculateGazeDirection(landmarks) {
      const leftIris = landmarks[468];
      const rightIris = landmarks[473];
      const eyeCenterX = (landmarks[133].x + landmarks[362].x) / 2;
      const eyeCenterY = (landmarks[133].y + landmarks[362].y) / 2;
      const offsetX = (leftIris.x + rightIris.x) / 2 - eyeCenterX;
      const offsetY = (leftIris.y + rightIris.y) / 2 - eyeCenterY;
      const direction = this.determineDirection(offsetX, offsetY);
      const confidence = Math.min(
        100,
        Math.round((Math.abs(offsetX) + Math.abs(offsetY)) * 500)
      );
      return {
        direction,
        confidence,
        isCentered: confidence < 60,
      };
    }

    determineDirection(x, y) {
      if (Math.abs(x) > Math.abs(y)) {
        return x > 0 ? "يمين" : "يسار";
      } else {
        return y > 0 ? "أسفل" : "أعلى";
      }
    }

    detectHeadPosition(landmarks) {
      const forehead = landmarks[10];
      const chin = landmarks[152];
      const verticalRatio = chin.y - forehead.y;
      if (verticalRatio < -0.1) {
        this.showAlert("الميل للأعلى!", "warning");
        if (this.headPositionEl)
          this.headPositionEl.textContent = "وضعية الرأس: مائل لأعلى";
        this.updateAttentionScore(true);
      } else if (verticalRatio > 0.1) {
        this.showAlert("الميل للأسفل!", "warning");
        if (this.headPositionEl)
          this.headPositionEl.textContent = "وضعية الرأس: مائل لأسفل";
        this.updateAttentionScore(true);
      } else {
        if (this.headPositionEl)
          this.headPositionEl.textContent = "وضعية الرأس: مستقيم";
      }
    }

    detectHeadDirectionRelativeToShoulders(faceLandmarks, poseLandmarks) {
      const nose = faceLandmarks[1];
      const leftShoulder = poseLandmarks[11];
      const rightShoulder = poseLandmarks[12];
      const shoulderMidpoint = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2,
      };
      const dx = nose.x - shoulderMidpoint.x;
      const threshold = 0.05;
      if (Math.abs(dx) < threshold) {
        if (this.headPositionEl)
          this.headPositionEl.textContent = "وضعية الرأس: متجه للأمام";
      } else if (dx > threshold) {
        this.showAlert("الرأس متجه لليمين!", "warning");
        if (this.headPositionEl)
          this.headPositionEl.textContent = "وضعية الرأس: متجه لليمين";
        this.updateAttentionScore(true);
      } else {
        this.showAlert("الرأس متجه لليسار!", "warning");
        if (this.headPositionEl)
          this.headPositionEl.textContent = "وضعية الرأس: متجه لليسار";
        this.updateAttentionScore(true);
      }
    }

    detectMouthActions(landmarks) {
      const upperLip = landmarks[13];
      const lowerLip = landmarks[14];
      const mouthOpen = lowerLip.y - upperLip.y;
      if (mouthOpen > 0.05) {
        this.showAlert("الفم مفتوح!", "danger");
        if (this.mouthStatusEl)
          this.mouthStatusEl.textContent = "حالة الفم: مفتوح";
      } else {
        if (this.mouthStatusEl)
          this.mouthStatusEl.textContent = "حالة الفم: مغلق";
      }
    }

    updateAttentionScore(faceDetected) {
      const timeDiff = (Date.now() - this.lastUpdate) / 1000;
      this.lastUpdate = Date.now();

      if (faceDetected) {
        const gaze = this.calculateGazeDirection(
          this.faceResults.multiFaceLandmarks[0]
        );
        const headPosition = this.headPositionEl
          ? this.headPositionEl.textContent
          : "";
        if (
          !gaze.isCentered ||
          headPosition.includes("مائل") ||
          headPosition.includes("متجه")
        ) {
          this.attentionScore = Math.max(
            0,
            this.attentionScore -
              timeDiff * this.config.attentionDecrementFactor
          );
        } else {
          this.attentionScore = Math.min(
            100,
            this.attentionScore +
              timeDiff * this.config.attentionIncrementFactor
          );
        }
      } else {
        this.attentionScore = Math.max(
          0,
          this.attentionScore - timeDiff * this.config.noFaceDecrementFactor
        );
      }
      if (this.attentionScoreEl)
        this.attentionScoreEl.textContent = `مؤشر الانتباه: ${Math.round(
          this.attentionScore
        )}%`;
    }

    showAlert(message, type) {
      if (this.alert) {
        this.alert.textContent = message;
        this.alert.style.background =
          type === "danger"
            ? "var(--danger-color)"
            : type === "warning"
            ? "var(--warning-color)"
            : "var(--success-color)";
        this.alert.style.display = "block";
        setTimeout(() => {
          this.alert.style.display = "none";
        }, 3000);
      }
      this.logEvent(message, type);
      if (type !== "info") this.warningCount++;
      if (this.warningCountEl)
        this.warningCountEl.textContent = `التحذيرات: ${this.warningCount}`;
    }

    logEvent(message, type) {
      if (this.eventLogEl) {
        const logEntry = document.createElement("div");
        logEntry.className = `log-item ${type}`;
        logEntry.innerHTML = `<span>${new Date().toLocaleTimeString()}</span> <strong>${message}</strong>`;
        this.eventLogEl.prepend(logEntry);
      }
    }

    setupEventHandlers() {
      window.addEventListener("resize", () => {
        if (this.video) {
          this.canvas.width = this.video.videoWidth;
          this.canvas.height = this.video.videoHeight;
        }
      });
    }
  } // End of AdvancedMonitor class

  // إنشاء المراقب عند تحميل الصفحة
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
    monitorRef.current = new AdvancedMonitor(refs, config);
    // بدء الكاميرا تلقائياً أو عند الضغط على زر التشغيل
    // monitorRef.current.startCamera();
    return () => {
      if (monitorRef.current) monitorRef.current.stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // دوال تشغيل/إيقاف الكاميرا
  const handleStartCamera = async () => {
    if (monitorRef.current) {
      await monitorRef.current.startCamera();
      setIsCameraOn(true);
    }
  };

  const handleStopCamera = () => {
    if (monitorRef.current) {
      monitorRef.current.stopCamera();
      setIsCameraOn(false);
    }
  };

  return (
    <div className="flex-col min-h-screen bg-gray-100 text-gray-900">
      <Header page="controller model" onToggleSidebar={onToggleSidebar} />
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
          style={{ width: config.camera.width, height: config.camera.height }}
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
          className="alert-badge fixed top-5 right-5 p-4 m-4 rounded text-white hidden animate-pulse"
          style={{ backgroundColor: "var(--danger-color)" }}
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

export default Monitoring;
