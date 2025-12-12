// src/config/config.js
export const defaultConfig = {
  faceMeshOptions: {
    maxNumFaces: 2,
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
      upThreshold: 0.9,
      downThreshold: 0.7,
      lateralThreshold: 15,
      duration: 3000,
      enabled: {
        up: true,
        down: true,
        left: true,
        right: true,
        forward: true,
      },
      detectTurnOnly: true,
      maxDownAlerts: 5, // Maximum number of down alerts before critical warning
      maxLeftAlerts: 5, // Maximum number of left turn alerts before critical warning
      maxRightAlerts: 5, // Maximum number of right turn alerts before critical warning
      resetInterval: 60000, // Reset counters after 1 minute
    },
    mouth: {
      threshold: 0.01,
      duration: 3000,
      enabled: true,
    },
    gaze: {
      duration: 3000,
      enabled: true,
    },
    headPose: {
      neutralRange: 5,
      smoothingFrames: 10,
      referenceFrames: 30,
    },
    multipleFaces: {
      enabled: true,
      duration: 3000, // مدة بين التنبيهات (بالمللي ثانية)
      maxAlerts: 3, // الحد الأقصى للتنبيهات قبل إصدار تحذير حرج
    },
  },
};

function deepMerge(target, source) {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        if (!target[key] || typeof target[key] !== "object") {
          target[key] = {};
        }
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

// دالة لجلب الإعدادات من السيرفر
export async function fetchConfig() {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/model-config/");
    if (!response.ok) {
      throw new Error("خطأ في استرجاع الإعدادات من السيرفر");
    }
    const serverConfig = await response.json();
    console.log("✅ تم جلب الإعدادات من السيرفر");

    const mergedConfig = deepMerge(
      JSON.parse(JSON.stringify(defaultConfig)),
      serverConfig
    );
    mergedConfig._source = "server";
    console.log(mergedConfig);

    return mergedConfig;
  } catch (error) {
    console.warn(
      "⚠️ تعذر الاتصال بالسيرفر، استخدام الإعدادات الافتراضية",
      error
    );
    return { ...defaultConfig, _source: "default" };
  }
}
