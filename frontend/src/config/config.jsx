// src/config/config.js

export const config = {
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
