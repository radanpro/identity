// src/components/AdvancedMonitor.js

import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { Pose } from "@mediapipe/pose";
import { notifyBackendAlert } from "./AlertNotifier";

export class AdvancedMonitor {
  constructor(refs, config) {
    // حفظ المراجع لعناصر DOM
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
    this.startAlertTimer();

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

    this.alertDetails = [];
    this.lastBackendAlertTime = 0;

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
    const pitch =
      Math.atan2(-m12, Math.sqrt(m22 * m22 + m02 * m02)) * (180 / Math.PI);
    const yaw = Math.atan2(m20, m00) * (180 / Math.PI);
    const roll = Math.atan2(m01, m11) * (180 / Math.PI);
    return { pitch, yaw, roll };
  }

  setReferencePosition(angles) {
    this.headAngleHistory.push(angles);
    if (this.headAngleHistory.length >= this.config.headPose.referenceFrames) {
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
        smoothed.yaw / this.headAngleHistory.length - this.referenceAngles.yaw,
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
    const { pitch, yaw } = angles;
    const now = Date.now();
    const absoluteYaw = Math.abs(yaw);
    const direction = yaw > 0 ? "right" : "left";
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
      this.focusTimeEl.textContent = `زمن التركيز: ${focusElapsed.toFixed(1)}s`;
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

  detectHeadPosition(landmarks) {
    const forehead = landmarks[10];
    const chin = landmarks[152];
    if (!forehead || !chin) {
      console.warn("Forehead or chin landmarks not detected!");
      return;
    }
    const verticalRatio = chin.y - forehead.y;
    if (verticalRatio < this.config.alerts.head.upThreshold) {
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

  detectHeadDirectionRelativeToShoulders(faceLandmarks, poseLandmarks) {
    const nose = faceLandmarks[1];
    const leftShoulder = poseLandmarks[11];
    const rightShoulder = poseLandmarks[12];
    const shoulderWidth = rightShoulder.x - leftShoulder.x;
    const noseOffset = nose.x - (leftShoulder.x + rightShoulder.x) / 2;
    const lateralRatio = (noseOffset / shoulderWidth) * 100;
    const lateralThreshold = 15;
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
          this.attentionScore - timeDiff * this.config.attentionDecrementFactor
        );
      } else {
        this.attentionScore = Math.min(
          100,
          this.attentionScore + timeDiff * this.config.attentionIncrementFactor
        );
      }
    } else {
      this.attentionScore = Math.max(
        0,
        this.attentionScore - timeDiff * this.config.noFaceDecrementFactor
      );
    }
    // if (this.attentionScoreEl)
    //   this.attentionScoreEl.textContent = `مؤشر الانتباه: ${Math.round(
    //     this.attentionScore
    //   )}%`;
  }

  // داخل الكلاس AdvancedMonitor

  // دالة عرض التنبيهات مع تجميعها
  showAlert(message, type) {
    // عرض التنبيه للمستخدم
    if (this.alert) {
      this.alert.textContent = message;
      this.alert.style.background =
        type === "danger"
          ? "bg-red-500"
          : type === "warning"
          ? "bg-yellow-500"
          : "#c91919";
      this.alert.style.display = "block";
      if (this.alertTimeout) {
        clearTimeout(this.alertTimeout);
      }
      this.alertTimeout = setTimeout(() => {
        this.alert.style.display = "none";
        this.alertTimeout = null;
      }, 5000);
    }
    this.logEvent(message, type);
    if (type !== "info") this.warningCount++;
    if (this.warningCountEl)
      this.warningCountEl.textContent = `التحذيرات: ${this.warningCount}`;

    // حفظ بيانات التنبيه مع كافة التفاصيل
    const alertDetails = {
      timestamp: Date.now(),
      type,
      message,
      headAngles:
        this.headAngleHistory.length > 0
          ? this.headAngleHistory[this.headAngleHistory.length - 1]
          : null,
      gazeDirection: this.currentGazeDirection,
      attentionScore: this.attentionScore,
      mouthStatus: this.mouthStatusEl?.textContent,
    };

    // إضافة التنبيه إلى المصفوفة
    this.alertDetails.push(alertDetails);

    // تحديد حد أقصى لحجم المصفوفة (مثلاً 50 تنبيه)
    if (this.alertDetails.length > 50) {
      this.alertDetails.splice(0, this.alertDetails.length - 50);
    }

    if (this.alertDetails.length > 10) {
      this.processAndSendAlerts();
    }
  }

  // دالة لفحص التنبيهات وإرسالها
  processAndSendAlerts() {
    // نسخ التنبيهات الحالية وحذفها فوراً لتجنب التكرار
    const alertsToSend = [...this.alertDetails];
    this.alertDetails = []; // تفريغ المصفوفة فوراً

    // إذا كانت التنبيهات أقل من 10، لا نرسل ونعيدها للمصفوفة
    if (alertsToSend.length < 10) {
      this.alertDetails.push(...alertsToSend);
      return;
    }

    // حساب التنبيهات الحرجة من النسخة
    const criticalAlerts = alertsToSend.filter(
      (alert) => alert.type === "danger" || alert.type === "warning"
    );

    // التحقق من شروط الإرسال
    if (criticalAlerts.length > 5 || alertsToSend.length > 10) {
      const aggregatedMessage = this.generateAggregatedMessage(alertsToSend);
      notifyBackendAlert(aggregatedMessage).then((response) => {
        if (!response) {
          // إذا فشل الإرسال، نعيد التنبيهات للمصفوفة
          this.alertDetails.push(...alertsToSend);
          console.error("فشل الإرسال، سيتم إعادة المحاولة لاحقاً");
        } else {
          this.lastBackendAlertTime = Date.now();
        }
      });
    } else {
      // إذا لم تستوف الشروط، نعيد التنبيهات للمصفوفة
      this.alertDetails.push(...alertsToSend);
    }
  }

  // دالة بدء المؤقت لفحص التنبيهات كل دقيقة
  startAlertTimer() {
    setInterval(() => {
      if (this.alertDetails.length > 0) {
        this.processAndSendAlerts();
      }
    }, 60000); // 60000 مللي ثانية = دقيقة واحدة
  }

  // دالة لدمج التنبيهات إلى رسالة واحدة
  generateAggregatedMessage(alerts) {
    let summary = `تم الكشف عن ${alerts.length} تنبيه:\n`;
    alerts.forEach((alert) => {
      let details = [];

      // إضافة تفاصيل انحدار الرأس إذا كانت متوفرة
      if (alert.headAngles) {
        details.push(
          `انحدار الرأس: ${Math.abs(alert.headAngles.pitch).toFixed(
            1
          )}° (أعلى/أسفل), ` +
            `${Math.abs(alert.headAngles.yaw).toFixed(1)}° (يمين/يسار)`
        );
      }

      // إضافة تفاصيل اتجاه النظر إذا كان متوفراً
      if (alert.gazeDirection) {
        details.push(`انحراف النظر: ${alert.gazeDirection}`);
      }

      // إضافة تفاصيل حالة الفم إذا كانت متوفرة
      if (alert.mouthStatus && alert.mouthStatus.includes("مفتوح")) {
        details.push(`فتحة الفم: ${alert.mouthStatus.split(":")[1].trim()}`);
      }

      // إضافة درجة الانتباه فقط إذا كانت فوق عتبة معينة
      if (alert.attentionScore > 30) {
        details.push(`الانتباه: ${Math.round(alert.attentionScore)}%`);
      }

      summary += `[${alert.type.toUpperCase()}] ${
        alert.message
      } | ${details.join(" | ")}\n`;
    });
    return summary;
  }

  getHighestSeverityAlert(alerts) {
    const severityLevels = { danger: 3, warning: 2, info: 1 };
    return alerts.reduce((highest, current) => {
      return severityLevels[current.type] > severityLevels[highest.type]
        ? current
        : highest;
    }, alerts[0]);
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
}
