import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Header from "../components/Header";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { Pose } from "@mediapipe/pose";
import PropTypes from "prop-types";
// إعدادات افتراضية يمكن تعديلها من السيرفر
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
  // إعدادات التنبيهات
  alerts: {
    head: {
      upThreshold: -0.5, // قيمة حركة الرأس للأعلى
      downThreshold: 0.5, // قيمة حركة الرأس للأسفل
      lateralThreshold: 15,
      duration: 3000, // مدة استمرار الحركة قبل التنبيه (بالمللي ثانية)
      enabled: {
        up: true,
        down: true,
        left: true,
        right: true,
        forward: true,
      },
    },
    mouth: {
      threshold: 0.05, // عتبة فتح الفم
      duration: 3000, // مدة استمرار الحالة قبل التنبيه
      enabled: true,
    },
    gaze: {
      duration: 3000, // مدة استمرار عدم التركيز قبل التنبيه
      enabled: true,
    },
    headPose: {
      neutralRange: 5,
      smoothingFrames: 10,
      referenceFrames: 30,
    },
  },
};

const Monitoring = ({ isLoggedIn, isRegisterIn }) => {
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

      // لتخزين أوقات التنبيه الأخيرة لكل نوع
      this.lastAlertTimes = {
        head: { up: 0, down: 0, left: 0, right: 0, forward: 0 },
        mouth: 0,
        gaze: 0,
      };

      this.config = config;
      this.headAngleHistory = [];
      this.referenceAngles = null;
      this.isCalibrating = true;

      this.initFaceMesh();
      this.initPose();
      this.setupEventHandlers();
    }

    initFaceMesh() {
      this.faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      this.faceMesh.setOptions(this.config.faceMeshOptions);
      this.faceMesh.onResults(this.processFaceResults.bind(this));
    }

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

    processFaceResults(results) {
      this.faceResults = results;
      if (
        results.multiFaceLandmarks?.length > 0 &&
        results.multiFaceTransformationMatrixes?.length > 0
      ) {
        const matrix = results.multiFaceTransformationMatrixes[0];
        const angles = this.matrixToAngles(matrix);

        if (this.isCalibrating) {
          this.setReferencePosition(angles);
        } else {
          this.processHeadPose(angles);
        }

        this.analyzeFaceLandmarks(results.multiFaceLandmarks[0]);
      }
      this.updateAnalysis();
    }

    matrixToAngles(matrix) {
      const rotation = matrix.data;
      const [m00, m01, m02, m10, m11, m12, m20, m21, m22] = rotation;

      // تصحيح حساب الزوايا وفقًا للنظام الإحداثي الصحيح
      const pitch =
        Math.atan2(-m12, Math.sqrt(m22 * m22 + m02 * m02)) * (180 / Math.PI);
      const yaw = Math.atan2(m20, m00) * (180 / Math.PI);
      const roll = Math.atan2(m01, m11) * (180 / Math.PI);

      return { pitch, yaw, roll };
    }
    setReferencePosition(angles) {
      this.headAngleHistory.push(angles);

      if (
        this.headAngleHistory.length >= this.config.headPose.referenceFrames
      ) {
        const sum = this.headAngleHistory.reduce(
          (acc, curr) => ({
            pitch: acc.pitch + curr.pitch,
            yaw: acc.yaw + curr.yaw,
            roll: acc.roll + curr.roll,
          }),
          { pitch: 0, yaw: 0, roll: 0 }
        );

        this.referenceAngles = {
          pitch: sum.pitch / this.config.headPose.referenceFrames,
          yaw: sum.yaw / this.config.headPose.referenceFrames,
          roll: sum.roll / this.config.headPose.referenceFrames,
        };

        this.isCalibrating = false;
        this.headAngleHistory = [];
        this.showAlert("المعايرة اكتملت!", "info");
      }
    }
    processHeadPose(angles) {
      this.headAngleHistory.push(angles);
      if (this.headAngleHistory.length > this.config.headPose.smoothingFrames) {
        this.headAngleHistory.shift();
      }

      const smoothed = this.headAngleHistory.reduce(
        (acc, curr) => ({
          pitch: acc.pitch + curr.pitch,
          yaw: acc.yaw + curr.yaw,
          roll: acc.roll + curr.roll,
        }),
        { pitch: 0, yaw: 0, roll: 0 }
      );

      const current = {
        pitch:
          smoothed.pitch / this.headAngleHistory.length -
          this.referenceAngles.pitch,
        yaw:
          smoothed.yaw / this.headAngleHistory.length -
          this.referenceAngles.yaw,
        roll:
          smoothed.roll / this.headAngleHistory.length -
          this.referenceAngles.roll,
      };

      this.updateHeadPositionDisplay(current);
      this.checkHeadPositionAlerts(current);
    }
    updateHeadPositionDisplay(angles) {
      const { pitch, yaw, roll } = angles;
      let directions = [];

      if (Math.abs(pitch) > this.config.headPose.neutralRange) {
        directions.push(
          `${pitch > 0 ? "أسفل" : "أعلى"} (${Math.abs(pitch).toFixed(1)}°)`
        );
      }
      if (Math.abs(yaw) > this.config.headPose.neutralRange) {
        directions.push(
          `${yaw > 0 ? "يمين" : "يسار"} (${Math.abs(yaw).toFixed(1)}°)`
        );
      }
      if (Math.abs(roll) > this.config.headPose.neutralRange) {
        directions.push(`مائل (${Math.abs(roll).toFixed(1)}°)`);
      }

      const status =
        directions.length > 0 ? `مائل: ${directions.join("، ")}` : "مستقيم";

      if (this.headPositionEl) {
        this.headPositionEl.textContent = `وضعية الرأس: ${status}`;
      }
    }
    checkHeadPositionAlerts(angles) {
      // const { yaw } = angles;
      const { pitch, yaw, roll } = angles;
      const now = Date.now();
      // استخدام القيمة المطلقة للزاوية مع مراعاة الاتجاه
      const absoluteYaw = Math.abs(yaw);
      const direction = yaw > 0 ? "right" : "left";

      // Vertical detection
      if (Math.abs(pitch) < this.config.alerts.head.upThreshold) {
        this.handleHeadAlert(
          direction,
          now,
          `الميل الحاد للأعلى (${absoluteYaw.toFixed(1)}°)`
        );
      } else if (Math.abs(pitch) > this.config.alerts.head.downThreshold) {
        this.handleHeadAlert(
          "down",
          now,
          `الميل الحاد للأسفل (${absoluteYaw.toFixed(1)}°)`
        );
      }

      // Horizontal detection
      if (yaw > this.config.alerts.head.lateralThreshold) {
        this.handleHeadAlert(
          "right",
          now,
          `الميل الحاد لليمين (${yaw.toFixed(1)}°)`
        );
      } else if (yaw < -this.config.alerts.head.lateralThreshold) {
        this.handleHeadAlert(
          "left",
          now,
          `الميل الحاد لليسار (${yaw.toFixed(1)}°)`
        );
      }
    }
    handleHeadAlert(direction, currentTime, message) {
      if (
        this.config.alerts.head.enabled[direction] &&
        currentTime - this.lastAlertTimes.head[direction] >
          this.config.alerts.head.duration
      ) {
        this.showAlert(message, "warning");
        this.lastAlertTimes.head[direction] = currentTime;
        this.updateAttentionScore(true);
      }
    }

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
        const landmarks = this.faceResults.multiFaceLandmarks[0];
        this.analyzeFaceLandmarks(landmarks);
        if (this.poseResults && this.poseResults.poseLandmarks) {
          this.analyzePoseLandmarks(landmarks, this.poseResults.poseLandmarks);
        } else {
          this.detectHeadPosition(landmarks);
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
        this.lastAlertTimes.gaze = Date.now();
      }
      let focusElapsed = (Date.now() - this.currentFocusStartTime) / 1000;
      if (this.focusTimeEl)
        this.focusTimeEl.textContent = `زمن التركيز: ${focusElapsed.toFixed(
          1
        )}s`;

      if (
        gaze.confidence > 75 &&
        !gaze.isCentered &&
        this.config.alerts.gaze.enabled &&
        Date.now() - this.lastAlertTimes.gaze > this.config.alerts.gaze.duration
      ) {
        this.showAlert(`انحراف النظر إلى ${gaze.direction}`, "warning");
        this.lastAlertTimes.gaze = Date.now();
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

    // ضبط تنبيهات حركة الرأس باستخدام عتبات منفصلة للاتجاهات
    detectHeadPosition(landmarks) {
      const forehead = landmarks[10];
      const chin = landmarks[152];

      // Check if forehead or chin are undefined
      if (!forehead || !chin) {
        console.warn("Forehead or chin landmarks not detected!");
        return;
      }

      const verticalRatio = chin.y - forehead.y;

      console.log("verticalRatio:", verticalRatio);
      console.log("upThreshold:", this.config.alerts.head.upThreshold);
      console.log("downThreshold:", this.config.alerts.head.downThreshold);

      if (verticalRatio < this.config.alerts.head.upThreshold) {
        // Head tilted upwards
        if (
          this.config.alerts.head.enabled.up &&
          Date.now() - this.lastAlertTimes.head.up >
            this.config.alerts.head.duration
        ) {
          this.showAlert("وضعية الرأس: الميل للأعلى!", "warning");
          this.lastAlertTimes.head.up = Date.now();
        }
        if (this.headPositionEl)
          this.headPositionEl.textContent = "وضعية الرأس: مائل لأعلى";
        this.updateAttentionScore(true);
      } else if (verticalRatio > this.config.alerts.head.downThreshold) {
        // Head tilted downwards
        if (
          this.config.alerts.head.enabled.down &&
          Date.now() - this.lastAlertTimes.head.down >
            this.config.alerts.head.duration
        ) {
          this.showAlert("وضعية الرأس: الميل للأسفل!", "warning");
          this.lastAlertTimes.head.down = Date.now();
        }
        if (this.headPositionEl)
          this.headPositionEl.textContent = "وضعية الرأس: مائل لأسفل";
        this.updateAttentionScore(true);
      } else {
        if (this.headPositionEl)
          this.headPositionEl.textContent = "وضعية الرأس: مستقيم";
      }
    }

    // استخدام نتائج Pose لمزيد من دقة تحديد اتجاه الرأس الأفقي
    detectHeadDirectionRelativeToShoulders(faceLandmarks, poseLandmarks) {
      const nose = faceLandmarks[1];
      const leftShoulder = poseLandmarks[11];
      const rightShoulder = poseLandmarks[12];
      // حساب الزاوية النسبية بين الأنف والكتفين
      const shoulderWidth = rightShoulder.x - leftShoulder.x;
      const noseOffset = nose.x - (leftShoulder.x + rightShoulder.x) / 2;

      // تحويل الإزاحة إلى نسبة مئوية من عرض الكتفين
      const lateralRatio = (noseOffset / shoulderWidth) * 100;

      // تحديد العتبات بناء على نسبة الحركة
      const lateralThreshold = 15; // نسبة مئوية من عرض الكتفين
      if (Math.abs(lateralRatio) < lateralThreshold) {
        if (this.headPositionEl)
          this.headPositionEl.textContent = "وضعية الرأس: متجه للأمام";
      } else if (lateralRatio > lateralThreshold) {
        if (
          this.config.alerts.head.enabled.right &&
          Date.now() - this.lastAlertTimes.head.right >
            this.config.alerts.head.duration
        ) {
          this.showAlert("الرأس متجه لليمين!", "warning");
          this.lastAlertTimes.head.right = Date.now();
        }
        if (this.headPositionEl)
          this.headPositionEl.textContent = `وضعية الرأس: متجه لليمين (${Math.abs(
            lateralRatio
          ).toFixed(1)}%)`;
        this.updateAttentionScore(true);
      } else {
        if (
          this.config.alerts.head.enabled.left &&
          Date.now() - this.lastAlertTimes.head.left >
            this.config.alerts.head.duration
        ) {
          this.showAlert("الرأس متجه لليسار!", "warning");
          this.lastAlertTimes.head.left = Date.now();
        }
        if (this.headPositionEl)
          this.headPositionEl.textContent = `وضعية الرأس: متجه لليسار (${Math.abs(
            lateralRatio
          ).toFixed(1)}%)`;
        this.updateAttentionScore(true);
      }
    }

    // تنبيه فتح الفم: يصدر فقط إذا تجاوزت قيمة الفم عتبة محددة واستمر الوضع لفترة معينة
    detectMouthActions(landmarks) {
      const upperLip = landmarks[13];
      const lowerLip = landmarks[14];
      const mouthOpen = lowerLip.y - upperLip.y;
      if (mouthOpen > this.config.alerts.mouth.threshold) {
        if (
          this.config.alerts.mouth.enabled &&
          Date.now() - this.lastAlertTimes.mouth >
            this.config.alerts.mouth.duration
        ) {
          this.showAlert("الفم مفتوح!", "danger");
          this.lastAlertTimes.mouth = Date.now();
        }
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
        // استخدام فئات Tailwind أو style inline
        this.alert.style.background =
          type === "danger"
            ? "bg-red-500"
            : type === "warning"
            ? "bg-yellow-500"
            : "#c91919";
        this.alert.style.display = "block";
        setTimeout(() => {
          this.alert.style.display = "none";
        }, 5000);
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
    return () => monitorRef.current?.stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
