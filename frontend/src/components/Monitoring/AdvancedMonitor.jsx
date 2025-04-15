import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { Pose } from "@mediapipe/pose";
import { notifyBackendAlert } from "./AlertNotifier";

// مرشح كالمان لتنعيم القياسات
export class KalmanFilter {
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
    this.eventLogEl = refs.eventLog ? refs.eventLog.current : null;

    // مراجع إضافية للعدادات (إذا كانت متاحة في DOM)
    this.headDownAlertCountEl = refs.headDownAlertCount
      ? refs.headDownAlertCount.current
      : null;
    this.headLeftAlertCountEl = refs.headLeftAlertCount
      ? refs.headLeftAlertCount.current
      : null;
    this.headRightAlertCountEl = refs.headRightAlertCount
      ? refs.headRightAlertCount.current
      : null;
    this.mouthAlertCountEl = refs.mouthAlertCount
      ? refs.mouthAlertCount.current
      : null;
    this.multipleFacesAlertCountEl = refs.multipleFacesAlertCount
      ? refs.multipleFacesAlertCount.current
      : null;

    // متغيرات مرشحات كالمان
    this.yawFilter = new KalmanFilter();
    this.pitchFilter = new KalmanFilter();

    // الإحصائيات والمتغيرات الأساسية
    this.attentionScore = 100;
    this.warningCount = 0;
    this.mouthAlertCount = 0;
    this.headDownAlertCount = 0;
    this.headLeftAlertCount = 0;
    this.headRightAlertCount = 0;
    this.multipleFacesAlertCount = 0;
    this.lastUpdate = Date.now();
    this.lastResetTime = Date.now();

    this.faceResults = null;
    this.poseResults = null;
    this.currentGazeDirection = null;
    this.currentFocusStartTime = null;
    this.maxFocusTimes = {};
    this.headAngleHistory = [];
    this.referenceAngles = null;
    this.isCalibrating = true;
    this.counters = { left: 0, right: 0, up: 0, down: 0 };

    // لتخزين أوقات التنبيه الأخيرة لكل نوع
    this.lastAlertTimes = {
      head: { up: 0, down: 0, left: 0, right: 0, forward: 0 },
      mouth: 0,
      gaze: 0,
      multipleFaces: 0,
    };

    // تجميع تفاصيل التنبيهات لإرسالها للخلفية
    this.alertDetails = [];
    this.lastBackendAlertTime = 0;

    this.config = config;

    this.initFaceMesh();
    this.initPose();
    this.setupEventHandlers();
    this.startAlertTimer();
  }

  // تهيئة مكتبة FaceMesh
  initFaceMesh() {
    this.faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });
    this.faceMesh.setOptions(this.config.faceMeshOptions);
    this.faceMesh.onResults(this.processFaceResults.bind(this));
  }

  // تهيئة مكتبة Pose
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

    // التحقق من تعدد الوجوه
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
    // حساب الزوايا بالدرجات (pitch, yaw, roll)
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
    // في النسخة المدمجة يتم تطبيق تنعيم بواسطة قائمة التاريخ
    this.headAngleHistory.push(angles);
    if (this.headAngleHistory.length > this.config.headPose.smoothingFrames) {
      this.headAngleHistory.shift();
    }
    // حساب المتوسط وتطبيق انحراف الزوايا عن قيم المعايرة
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
    // تحديث عرض وضعية الرأس في واجهة المستخدم
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

    // مثال على الكشف عن ميل الرأس للأسفل أو الصعود بناءً على العتبات
    if (pitch > this.config.alerts.head.downThreshold) {
      if (
        this.config.alerts.head.enabled.down &&
        now - this.lastAlertTimes.head.down > this.config.alerts.head.duration
      ) {
        this.showAlert("تنبيه: الرأس مائل للأسفل!", "warning");
        this.lastAlertTimes.head.down = now;
      }
    }

    // الكشف عن اتجاه الرأس لليمين أو لليسار
    if (yaw > this.config.alerts.head.lateralThreshold) {
      if (
        this.config.alerts.head.enabled.right &&
        now - this.lastAlertTimes.head.right > this.config.alerts.head.duration
      ) {
        this.showAlert("تنبيه: الرأس متجه لليمين!", "warning");
        this.lastAlertTimes.head.right = now;
      }
    } else if (yaw < -this.config.alerts.head.lateralThreshold) {
      if (
        this.config.alerts.head.enabled.left &&
        now - this.lastAlertTimes.head.left > this.config.alerts.head.duration
      ) {
        this.showAlert("تنبيه: الرأس متجه لليسار!", "warning");
        this.lastAlertTimes.head.left = now;
      }
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

    // خيار إضافي إذا كان مطلوب كشف الالتفاف فقط
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
    if (
      !landmarks ||
      !landmarks[468] ||
      !landmarks[473] ||
      !landmarks[133] ||
      !landmarks[362]
    ) {
      return {
        direction: "غير معروف",
        confidence: 0,
        isCentered: true,
      };
    }
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
    // طريقة بديلة لحساب وضعية الرأس باستخدام معالم محددة (مثل الجبين والذقن)
    const forehead = landmarks[10];
    const chin = landmarks[152];
    if (!forehead || !chin) {
      console.warn("لم يتم اكتشاف معالم الجبين أو الذقن!");
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
      const now = Date.now();
      if (
        this.config.alerts.mouth.enabled &&
        now - this.lastAlertTimes.mouth > this.config.alerts.mouth.duration
      ) {
        // تحديث عداد التنبيهات للفم في حال توفر العنصر في الـ DOM
        this.mouthAlertCount++;
        if (this.mouthAlertCountEl) {
          this.mouthAlertCountEl.textContent = `تنبيهات الفم: ${this.mouthAlertCount}`;
        }
        if (this.mouthAlertCount === 5) {
          this.showAlert("تحذير: الفم مفتوح بشكل متكرر!", "danger");
          this.mouthAlertCount = 0;
          if (this.mouthAlertCountEl) {
            this.mouthAlertCountEl.textContent = `تنبيهات الفم: ${this.mouthAlertCount}`;
          }
        } else {
          this.showAlert("تنبيه: يرجى إغلاق الفم!", "warning");
        }
        this.lastAlertTimes.mouth = now;
      }
      if (this.mouthStatusEl)
        this.mouthStatusEl.textContent = "حالة الفم: مفتوح";
    } else {
      if (this.mouthStatusEl)
        this.mouthStatusEl.textContent = "حالة الفم: مغلق";
    }
  }

  // دالة اختيارية للكشف عن حركة الالتفاف فقط (يمين/يسار/أسفل)
  detectHeadTurnOnly(landmarks) {
    const noseTip = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const forehead = landmarks[10];
    const chin = landmarks[152];

    if (!noseTip || !leftEye || !rightEye || !forehead || !chin) return;

    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const faceWidth = Math.abs(leftEye.x - rightEye.x);
    const turnRatio = (noseTip.x - eyeCenterX) / faceWidth;
    const yaw = this.yawFilter.update(turnRatio);

    const faceHeight = Math.abs(forehead.y - chin.y);
    const noseVerticalPosition = (noseTip.y - forehead.y) / faceHeight;
    const pitch = this.pitchFilter.update(noseVerticalPosition);

    const yawThreshold = 0.2;
    const pitchThreshold = 0.7;
    const now = Date.now();

    if (
      pitch > pitchThreshold &&
      now - this.lastAlertTimes.head.down > this.config.alerts.head.duration
    ) {
      this.headDownAlertCount++;
      if (this.headDownAlertCountEl) {
        this.headDownAlertCountEl.textContent = `تنبيهات النظر للأسفل: ${this.headDownAlertCount}`;
      }
      if (this.headDownAlertCount >= this.config.alerts.head.maxDownAlerts) {
        this.showAlert(
          "تحذير حرج: النظر للأسفل بشكل متكرر، محاولة غش محتملة!",
          "danger"
        );
        this.headDownAlertCount = 0;
      } else {
        this.showAlert("⚠️ الرأس مائل للأسفل بشكل مريب!", "warning");
      }
      this.lastAlertTimes.head.down = now;
    }

    if (
      yaw > yawThreshold &&
      now - this.lastAlertTimes.head.right > this.config.alerts.head.duration &&
      this.config.alerts.head.enabled.right
    ) {
      this.headRightAlertCount++;
      if (this.headRightAlertCountEl) {
        this.headRightAlertCountEl.textContent = `تنبيهات النظر لليمين: ${this.headRightAlertCount}`;
      }
      if (this.headRightAlertCount >= this.config.alerts.head.maxRightAlerts) {
        this.showAlert(
          "تحذير حرج: النظر لليمين بشكل متكرر، محاولة غش محتملة!",
          "danger"
        );
        this.headRightAlertCount = 0;
      } else {
        this.showAlert("⚠️ يلتفت لليمين، هل ينظر إلى زميله؟", "warning");
      }
      this.lastAlertTimes.head.right = now;
    }

    if (
      yaw < -yawThreshold &&
      now - this.lastAlertTimes.head.left > this.config.alerts.head.duration &&
      this.config.alerts.head.enabled.left
    ) {
      this.headLeftAlertCount++;
      if (this.headLeftAlertCountEl) {
        this.headLeftAlertCountEl.textContent = `تنبيهات النظر لليسار: ${this.headLeftAlertCount}`;
      }
      if (this.headLeftAlertCount >= this.config.alerts.head.maxLeftAlerts) {
        this.showAlert(
          "تحذير حرج: النظر لليسار بشكل متكرر، محاولة غش محتملة!",
          "danger"
        );
        this.headLeftAlertCount = 0;
      } else {
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
    if (this.attentionScoreEl) {
      this.attentionScoreEl.textContent = `مؤشر الانتباه: ${Math.round(
        this.attentionScore
      )}%`;
    }
  }

  // دوال التنبيه وتجميعها وإرسالها للبنية الخلفية
  showAlert(message, type) {
    let gazeInfo = { direction: "غير معروف", confidence: 0 };
    try {
      if (this.faceResults?.multiFaceLandmarks?.[0]) {
        gazeInfo = this.calculateGazeDirection(
          this.faceResults.multiFaceLandmarks[0]
        );
      }
    } catch (error) {
      console.error("Error getting gaze info for alert:", error);
    }
    if (this.alert) {
      this.alert.textContent = message;
      this.alert.style.background =
        type === "danger"
          ? "bg-red-500"
          : type === "warning"
          ? "bg-yellow-500"
          : "#c91919";
      this.alert.style.display = "block";
      if (this.alertTimeout) clearTimeout(this.alertTimeout);
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
      gazeDirection: gazeInfo.direction,
      gazeConfidence: gazeInfo.confidence,
      focusDuration: this.currentFocusStartTime
        ? (Date.now() - this.currentFocusStartTime) / 1000
        : 0,
      headPosition: this.headPositionEl?.textContent,
      mouthStatus: this.mouthStatusEl?.textContent,
      attentionScore: this.attentionScore,
    };

    // إضافة التنبيه إلى المصفوفة
    this.alertDetails.push(alertDetails);
    if (this.alertDetails.length > 50) {
      this.alertDetails.splice(0, this.alertDetails.length - 50);
    }
    if (this.alertDetails.length > 10) {
      this.processAndSendAlerts();
    }
  }

  processAndSendAlerts() {
    // نسخ التنبيهات الحالية ثم تفريغ المصفوفة
    const alertsToSend = [...this.alertDetails];
    this.alertDetails = [];

    if (alertsToSend.length < 10) {
      this.alertDetails.push(...alertsToSend);
      return;
    }

    const criticalAlerts = alertsToSend.filter(
      (alert) => alert.type === "danger" || alert.type === "warning"
    );

    if (criticalAlerts.length > 5 || alertsToSend.length > 10) {
      const aggregatedMessage = this.generateAggregatedMessage(alertsToSend);
      notifyBackendAlert(aggregatedMessage).then((response) => {
        if (!response) {
          this.alertDetails.push(...alertsToSend);
          console.error("فشل الإرسال، سيتم إعادة المحاولة لاحقاً");
        } else {
          this.lastBackendAlertTime = Date.now();
        }
      });
    } else {
      this.alertDetails.push(...alertsToSend);
    }
  }

  generateAggregatedMessage(alerts) {
    let summary = `تم الكشف عن ${alerts.length} تنبيه:\n`;
    let alertCounter = 1;
    alerts.forEach((alert) => {
      let details = [];
      const alertTime = new Date(alert.timestamp).toLocaleTimeString();
      details.push(`الوقت: ${alertTime}`);
      if (alert.headAngles) {
        details.push(
          `انحراف الرأس:\n• أعلى/أسفل: ${Math.abs(
            alert.headAngles.pitch
          ).toFixed(1)}°\n• يمين/يسار: ${Math.abs(alert.headAngles.yaw).toFixed(
            1
          )}°`
        );
      }
      if (alert.gazeDirection) {
        details.push(
          `اتجاه النظر: ${alert.gazeDirection}\nنسبة الثقة: ${alert.gazeConfidence}%`
        );
      }
      if (this.focusTimeEl) {
        const focusTime = this.focusTimeEl.textContent.replace(
          "زمن التركيز: ",
          ""
        );
        details.push(`زمن التركيز: ${focusTime}`);
      }
      if (alert.headPosition) {
        details.push(`وضعية الرأس: ${alert.headPosition}`);
      }
      if (alert.mouthStatus && alert.mouthStatus.includes("مفتوح")) {
        details.push(`فتحة الفم: ${alert.mouthStatus.split(":")[1].trim()}`);
      }
      if (alert.attentionScore > 30) {
        details.push(`الانتباه: ${Math.round(alert.attentionScore)}%`);
      }
      summary += `[التنبيه ${alertCounter++}] ━━━━━━━━━━━━━━━━━━━━━━━\n[${alert.type.toUpperCase()}] ${
        alert.message
      }\n${details.join("\n")}\n\n`;
    });
    summary += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nإحصائيات عامة:\n• إجمالي التحذيرات: ${
      this.warningCount
    }\n• أقصى زمن تركيز: ${
      Math.max(...Object.values(this.maxFocusTimes))?.toFixed(1) || 0
    } ثانية\n• آخر تحديث: ${new Date().toLocaleString()}`;
    return summary;
  }

  startAlertTimer() {
    setInterval(() => {
      if (this.alertDetails.length > 0) {
        this.processAndSendAlerts();
      }
    }, 60000);
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
