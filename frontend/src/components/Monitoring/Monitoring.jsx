import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Header from "../Header";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { Pose } from "@mediapipe/pose";

// إعدادات افتراضية يمكن تعديلها من السيرفر
const config = {
  faceMeshOptions: {
    maxNumFaces: 2, // تعديل لاكتشاف وجهين بدلاً من وجه واحد
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
      downThreshold: 0.9, // Adjusted threshold for better sensitivity
      lateralThreshold: 0.7,
      duration: 3000,
      enabled: {
        down: true,
        left: true, // تفعيل تنبيهات اليسار
        right: true, // تفعيل تنبيهات اليمين
      },
      detectTurnOnly: true,
      maxDownAlerts: 5, // Maximum number of down alerts before critical warning
      maxLeftAlerts: 5, // Maximum number of left turn alerts before critical warning
      maxRightAlerts: 5, // Maximum number of right turn alerts before critical warning
      resetInterval: 60000, // Reset counters after 1 minute
    },
    mouth: {
      threshold: 0.01, // عتبة فتح الفم (يمكنك تعديل القيمة حسب الحاجة)
      duration: 10000, // مدة استمرار فتح الفم قبل التنبيه (بالمللي ثانية)
      enabled: true, // تمكين أو تعطيل تنبيهات الفم
    },
    multipleFaces: {
      enabled: true,
      duration: 3000, // مدة بين التنبيهات (بالمللي ثانية)
      maxAlerts: 3, // الحد الأقصى للتنبيهات قبل إصدار تحذير حرج
    },
  },
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

  class KalmanFilter {
    constructor() {
      this.q = 0.01; // الضوضاء العملية
      this.r = 0.1; // ضوضاء القياس
      this.p = 1;
      this.x = 0;
      this.k = 0;
    }

    update(measurement) {
      // تحديث مرشح كالمان
      this.p += this.q;
      this.k = this.p / (this.p + this.r);
      this.x += this.k * (measurement - this.x);
      this.p *= 1 - this.k;
      return this.x;
    }
  }

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

      // إضافة مراجع لعناصر عدادات التنبيهات
      this.headDownAlertCountEl = null;
      this.headLeftAlertCountEl = null;
      this.headRightAlertCountEl = null;
      this.mouthAlertCountEl = null;

      // مرشحات كالمان
      this.yawFilter = new KalmanFilter();
      this.pitchFilter = new KalmanFilter();

      // الإحصائيات والمتغيرات
      this.attentionScore = 100;
      this.warningCount = 0;
      this.mouthAlertCount = 0;
      this.headDownAlertCount = 0;
      this.headLeftAlertCount = 0; // إضافة عداد لحركات الرأس لليسار
      this.headRightAlertCount = 0; // إضافة عداد لحركات الرأس لليمين
      this.multipleFacesAlertCount = 0; // إضافة عداد لتنبيهات تعدد الوجوه
      this.lastUpdate = Date.now();
      this.lastResetTime = Date.now(); // وقت آخر إعادة تعيين للعدادات

      this.faceResults = null;
      this.poseResults = null;
      this.currentGazeDirection = null;
      this.currentFocusStartTime = null;
      this.maxFocusTimes = {};
      this.previousHeadState = "stable";
      this.lastHeadMovementTime = Date.now();
      this.counters = { left: 0, right: 0, up: 0, down: 0 };

      // لتخزين أوقات التنبيه الأخيرة لكل نوع
      this.lastAlertTimes = {
        head: { up: 0, down: 0, left: 0, right: 0, forward: 0 },
        mouth: 0,
        gaze: 0,
        multipleFaces: 0, // إضافة وقت آخر تنبيه لتعدد الوجوه
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

      // اكتشاف تعدد الوجوه
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 1) {
        this.detectMultipleFaces(results.multiFaceLandmarks.length);
      }

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
      this.updateHeadPositionDisplay(angles); // تحديث واجهة المستخدم
      this.checkHeadPositionAlerts(angles); // التحقق من التنبيهات
    }
    updateHeadPositionDisplay(angles) {
      const { pitch } = angles;
      const filteredPitch = this.pitchFilter.update(pitch);

      let status = "مستقيم";
      const now = Date.now();

      // Reset counters if reset interval has passed
      // إعادة تعيين العدادات إذا مر وقت إعادة التعيين
      if (now - this.lastResetTime > this.config.alerts.head.resetInterval) {
        this.headDownAlertCount = 0;
        this.headLeftAlertCount = 0;
        this.headRightAlertCount = 0;
        this.multipleFacesAlertCount = 0; // إضافة إعادة تعيين عداد تعدد الوجوه
        this.lastResetTime = now;

        // تحديث واجهة المستخدم بعد إعادة تعيين العدادات
        if (this.headDownAlertCount) {
          this.headDownAlertCountEl.textContent = `تنبيهات النظر للأسفل: ${this.headDownAlertCount}`;
        }
        if (this.headLeftAlertCount) {
          this.headLeftAlertCountEl.textContent = `تنبيهات النظر لليسار: ${this.headLeftAlertCount}`;
        }
        if (this.headRightAlertCount) {
          this.headRightAlertCountEl.textContent = `تنبيهات النظر لليمين: ${this.headRightAlertCount}`;
        }
      }

      if (filteredPitch > this.config.alerts.head.downThreshold) {
        status = "متجه للأسفل";
        if (
          this.config.alerts.head.enabled.down &&
          now - this.lastAlertTimes.head.down > this.config.alerts.head.duration
        ) {
          this.headDownAlertCount++;

          if (
            this.headDownAlertCount >= this.config.alerts.head.maxDownAlerts
          ) {
            this.showAlert("تحذير حرج: حركات رأس متكررة للأسفل!", "danger");
            this.headDownAlertCount = 0;
          } else {
            this.showAlert("⚠️ الرأس متجه للأسفل!", "warning");
          }

          this.lastAlertTimes.head.down = now;
        }
      }

      if (this.headPositionEl) {
        this.headPositionEl.textContent = `وضعية الرأس: ${status}`;
      }
    }

    checkHeadPositionAlerts(angles) {
      const { pitch } = angles;
      const now = Date.now();

      // تصفية القيم باستخدام مرشحات كالمان
      const filteredPitch = this.pitchFilter.update(pitch);

      // التحقق من النظر للأسفل فقط
      if (filteredPitch > this.config.alerts.head.downThreshold) {
        if (
          this.config.alerts.head.enabled.down &&
          now - this.lastAlertTimes.head.down > this.config.alerts.head.duration
        ) {
          this.showAlert("تنبيه: الرأس متجه للأسفل!", "warning");
          this.lastAlertTimes.head.down = now;
        }
      }

      // تعطيل الإشعارات للالتفاف لليمين أو لليسار
      // تم حذف منطق الالتفاف لليمين أو لليسار
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

      //  استدعاء كشف الالتفاف فقط إن كان مفعّل
      if (this.config.alerts.head.detectTurnOnly) {
        this.detectHeadTurnOnly(landmarks);
      }
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

    determineHeadState(yaw, pitch) {
      const downThreshold = this.config.alerts.head.downThreshold;

      if (pitch > downThreshold) return "down";
      return "stable";
    }

    detectHeadPosition(landmarks) {
      const noseTip = landmarks[1];
      const forehead = landmarks[10];
      const chin = landmarks[152];

      if (!noseTip || !forehead || !chin) {
        console.warn("لم يتم اكتشاف جميع معالم الوجه المطلوبة!");
        return;
      }

      const verticalDistance = this.calculateDistance(forehead, chin);
      const nosePosition = (noseTip.y - forehead.y) / verticalDistance;
      const pitch = this.pitchFilter.update(nosePosition);

      const currentHeadState = this.determineHeadState(null, pitch);

      if (
        currentHeadState === "down" &&
        Date.now() - this.lastAlertTimes.head.down >
          this.config.alerts.head.duration
      ) {
        this.showAlert("⚠️ الرأس مائل للأسفل بشكل مريب!", "warning");
        this.lastAlertTimes.head.down = Date.now();
        this.counters.down++;
      }
    }

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
          // this.showAlert("الرأس متجه لليمين!", "warning");
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
          // this.showAlert("الرأس متجه لليسار!", "warning");
          this.lastAlertTimes.head.left = Date.now();
        }
        if (this.headPositionEl)
          this.headPositionEl.textContent = `وضعية الرأس: متجه لليسار (${Math.abs(
            lateralRatio
          ).toFixed(1)}%)`;
        this.updateAttentionScore(true);
      }
    }

    detectMouthActions(landmarks) {
      const upperLip = landmarks[13];
      const lowerLip = landmarks[14];
      const mouthOpen = lowerLip.y - upperLip.y;

      if (mouthOpen > this.config.alerts.mouth.threshold) {
        const now = Date.now();

        // Check if 10 seconds have passed since the last alert
        if (now - this.lastAlertTimes.mouth >= 10000) {
          this.lastAlertTimes.mouth = now; // Update the last alert time

          // Increment mouth alert count
          this.mouthAlertCount++;

          // Update the mouth alert count in the UI
          if (this.mouthAlertCountEl) {
            this.mouthAlertCountEl.textContent = `تنبيهات الفم: ${this.mouthAlertCount}`;
          }

          if (this.mouthAlertCount === 5) {
            // Issue a critical warning when alert count reaches 5
            this.showAlert("تحذير: الفم مفتوح بشكل متكرر!", "danger");
            this.mouthAlertCount = 0; // Reset the count after the critical warning

            // Update the UI after resetting the count
            if (this.mouthAlertCountEl) {
              this.mouthAlertCountEl.textContent = `تنبيهات الفم: ${this.mouthAlertCount}`;
            }
          } else {
            // Issue a simple warning
            this.showAlert("تنبيه: يرجى إغلاق الفم!", "warning");
          }
        }

        // Update the mouth status in the UI
        if (this.mouthStatusEl) {
          this.mouthStatusEl.textContent = "حالة الفم: مفتوح";
        }
      } else {
        // Update the mouth status in the UI when the mouth is closed
        if (this.mouthStatusEl) {
          this.mouthStatusEl.textContent = "حالة الفم: مغلق";
        }
      }
    }

    // إضافة دالة جديدة لاكتشاف تعدد الوجوه
    detectMultipleFaces(faceCount) {
      const now = Date.now();

      if (
        now - this.lastAlertTimes.multipleFaces >
        this.config.alerts.multipleFaces.duration
      ) {
        // تحديث عداد تنبيهات تعدد الوجوه
        this.multipleFacesAlertCount++;

        // تحديث عنصر واجهة المستخدم إن وجد
        if (this.multipleFacesAlertCountEl) {
          this.multipleFacesAlertCountEl.textContent = `تنبيهات تعدد الوجوه: ${this.multipleFacesAlertCount}`;
        }

        if (
          this.multipleFacesAlertCount >=
          this.config.alerts.multipleFaces.maxAlerts
        ) {
          // إصدار تحذير حرج عند وصول العداد إلى الحد الأقصى
          this.showAlert(
            `تحذير حرج: تم اكتشاف ${faceCount} وجوه في الكاميرا! محاولة غش محتملة!`,
            "danger"
          );
          this.multipleFacesAlertCount = 0; // إعادة تعيين العداد بعد التحذير الحرج

          // تحديث واجهة المستخدم بعد إعادة تعيين العداد
          if (this.multipleFacesAlertCountEl) {
            this.multipleFacesAlertCountEl.textContent = `تنبيهات تعدد الوجوه: ${this.multipleFacesAlertCount}`;
          }
        } else {
          // إصدار تنبيه بسيط
          this.showAlert(
            `⚠️ تم اكتشاف ${faceCount} وجوه في الكاميرا!`,
            "warning"
          );
        }

        this.lastAlertTimes.multipleFaces = now;
      }
    }

    detectHeadTurnOnly(landmarks) {
      const noseTip = landmarks[1]; // طرف الأنف
      const leftEye = landmarks[33]; // العين اليسرى
      const rightEye = landmarks[263]; // العين اليمنى
      const forehead = landmarks[10]; // الجبهة
      const chin = landmarks[152]; // الذقن

      if (!noseTip || !leftEye || !rightEye || !forehead || !chin) return;

      // حساب الالتفات الأفقي (يمين/يسار)
      const eyeCenterX = (leftEye.x + rightEye.x) / 2;
      const faceWidth = Math.abs(leftEye.x - rightEye.x);
      const turnRatio = (noseTip.x - eyeCenterX) / faceWidth;
      const yaw = this.yawFilter.update(turnRatio);

      // حساب الالتفات العمودي (للأسفل)
      const faceHeight = Math.abs(forehead.y - chin.y);
      const noseVerticalPosition = (noseTip.y - forehead.y) / faceHeight;
      const pitch = this.pitchFilter.update(noseVerticalPosition);

      const yawThreshold = 0.2;
      const pitchThreshold = 0.7; // عتبة الالتفات للأسفل
      const now = Date.now();

      // إعادة تعيين العدادات إذا مر وقت إعادة التعيين
      if (now - this.lastResetTime > this.config.alerts.head.resetInterval) {
        this.headDownAlertCount = 0;
        this.headLeftAlertCount = 0;
        this.headRightAlertCount = 0;
        this.multipleFacesAlertCount = 0; // إضافة إعادة تعيين عداد تعدد الوجوه
        this.lastResetTime = now;

        // تحديث واجهة المستخدم بعد إعادة تعيين العدادات
        if (this.headDownAlertCount) {
          this.headDownAlertCountEl.textContent = `تنبيهات النظر للأسفل: ${this.headDownAlertCount}`;
        }
        if (this.headLeftAlertCount) {
          this.headLeftAlertCountEl.textContent = `تنبيهات النظر لليسار: ${this.headLeftAlertCount}`;
        }
        if (this.headRightAlertCount) {
          this.headRightAlertCountEl.textContent = `تنبيهات النظر لليمين: ${this.headRightAlertCount}`;
        }
      }

      // التحقق من الالتفات للأسفل
      if (
        pitch > pitchThreshold &&
        now - this.lastAlertTimes.head.down > this.config.alerts.head.duration
      ) {
        // تحديث عداد حركات الرأس للأسفل
        this.headDownAlertCount++;

        // تحديث عنصر واجهة المستخدم إن وجد
        if (this.headDownAlertCount) {
          this.headDownAlertCountEl.textContent = `تنبيهات النظر للأسفل: ${this.headDownAlertCount}`;
        }

        if (this.headDownAlertCount >= this.config.alerts.head.maxDownAlerts) {
          // إصدار تحذير حرج عند وصول العداد إلى الحد الأقصى
          this.showAlert(
            "تحذير حرج: النظر للأسفل بشكل متكرر، محاولة غش محتملة!",
            "danger"
          );
          this.headDownAlertCount = 0; // إعادة تعيين العداد بعد التحذير الحرج

          // تحديث واجهة المستخدم بعد إعادة تعيين العداد
          if (this.headDownAlertCount) {
            this.headDownAlertCountEl.textContent = `تنبيهات النظر للأسفل: ${this.headDownAlertCount}`;
          }
        } else {
          // إصدار تنبيه بسيط
          this.showAlert("⚠️ الرأس مائل للأسفل بشكل مريب!", "warning");
        }

        this.lastAlertTimes.head.down = now;
      }

      // التحقق من الالتفات لليمين
      if (
        yaw > yawThreshold &&
        now - this.lastAlertTimes.head.right >
          this.config.alerts.head.duration &&
        this.config.alerts.head.enabled.right
      ) {
        // تحديث عداد حركات الرأس لليمين
        this.headRightAlertCount++;

        // تحديث عنصر واجهة المستخدم إن وجد
        if (this.headRightAlertCountEl) {
          this.headRightAlertCountEl.textContent = `تنبيهات النظر لليمين: ${this.headRightAlertCount}`;
        }

        if (
          this.headRightAlertCount >= this.config.alerts.head.maxRightAlerts
        ) {
          // إصدار تحذير حرج عند وصول العداد إلى الحد الأقصى
          this.showAlert(
            "تحذير حرج: النظر لليمين بشكل متكرر، محاولة غش محتملة!",
            "danger"
          );
          this.headRightAlertCount = 0; // إعادة تعيين العداد بعد التحذير الحرج

          // تحديث واجهة المستخدم بعد إعادة تعيين العداد
          if (this.headRightAlertCountEl) {
            this.headRightAlertCountEl.textContent = `تنبيهات النظر لليمين: ${this.headRightAlertCount}`;
          }
        } else {
          // إصدار تنبيه بسيط
          this.showAlert("⚠️ يلتفت لليمين، هل ينظر إلى زميله؟", "warning");
        }

        this.lastAlertTimes.head.right = now;
      }

      // التحقق من الالتفات لليسار
      if (
        yaw < -yawThreshold &&
        now - this.lastAlertTimes.head.left >
          this.config.alerts.head.duration &&
        this.config.alerts.head.enabled.left
      ) {
        // تحديث عداد حركات الرأس لليسار
        this.headLeftAlertCount++;

        // تحديث عنصر واجهة المستخدم إن وجد
        if (this.headLeftAlertCountEl) {
          this.headLeftAlertCountEl.textContent = `تنبيهات النظر لليسار: ${this.headLeftAlertCount}`;
        }

        if (this.headLeftAlertCount >= this.config.alerts.head.maxLeftAlerts) {
          // إصدار تحذير حرج عند وصول العداد إلى الحد الأقصى
          this.showAlert(
            "تحذير حرج: النظر لليسار بشكل متكرر، محاولة غش محتملة!",
            "danger"
          );
          this.headLeftAlertCount = 0; // إعادة تعيين العداد بعد التحذير الحرج

          // تحديث واجهة المستخدم بعد إعادة تعيين العداد
          if (this.headLeftAlertCountEl) {
            this.headLeftAlertCountEl.textContent = `تنبيهات النظر لليسار: ${this.headLeftAlertCount}`;
          }
        } else {
          // إصدار تنبيه بسيط
          this.showAlert("⚠️ يلتفت لليسار، هل يحاول الغش؟", "warning");
        }

        this.lastAlertTimes.head.left = now;
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
        // تحديث نص الإشعار
        this.alert.textContent = message;

        // تحديد لون الخلفية ولون النص بناءً على النوع
        this.alert.style.background =
          type === "danger"
            ? "#ff4d4d"
            : type === "warning"
            ? "#ffd700"
            : "#c91919";
        this.alert.style.color =
          type === "warning" || type === "danger" ? "#000" : "#fff"; // لون النص

        // عرض الإشعار
        this.alert.style.display = "block";

        // إخفاء الإشعار بعد 5 ثوانٍ
        setTimeout(() => {
          this.alert.style.display = "none";
        }, 3000);
      }

      // تسجيل الحدث في سجل الأحداث
      this.logEvent(message, type);

      // زيادة عدد التحذيرات إذا لم يكن النوع "info"
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

    calculateDistance(point1, point2) {
      const dx = point1.x - point2.x;
      const dy = point1.y - point2.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    handleHeadMovement(state) {
      this.counters[state]++;
      switch (state) {
        case "متجه لليمين":
          this.showAlert("⚠️ يلتفت لليمين، هل ينظر إلى زميله؟", "warning");
          break;
        case "متجه لليسار":
          this.showAlert("⚠️ يلتفت لليسار، هل يحاول الغش؟", "warning");
          break;
        case "متجه للأسفل":
          this.showAlert("⚠️ الرأس مائل للأسفل بشكل مريب!", "warning");
          break;
        default:
          break;
      }
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
            <p
              id="mouth-alert-count"
              ref={(el) => {
                if (monitorRef.current) {
                  monitorRef.current.mouthAlertCountEl = el;
                }
              }}
            >
              تنبيهات الفم: 0
            </p>
            <p
              id="head-down-alert-count"
              ref={(el) => {
                if (monitorRef.current) {
                  monitorRef.current.headDownAlertCountEl = el;
                }
              }}
            >
              تنبيهات النظر للأسفل: 0
            </p>
            <p
              id="head-left-alert-count"
              ref={(el) => {
                if (monitorRef.current) {
                  monitorRef.current.headLeftAlertCountEl = el;
                }
              }}
            >
              تنبيهات النظر لليسار: 0
            </p>
            <p
              id="head-right-alert-count"
              ref={(el) => {
                if (monitorRef.current) {
                  monitorRef.current.headRightAlertCountEl = el;
                }
              }}
            >
              تنبيهات النظر لليمين: 0
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
