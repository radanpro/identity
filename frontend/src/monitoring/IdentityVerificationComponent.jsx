import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import { getDeviceData } from "../utils/auth";
import VerificationResults from "./VerificationResults";
import Header from "../components/Header";
import PropTypes from "prop-types";

// دالة لتخزين البيانات مع صلاحية محددة
const setWithExpiry = (key, value, ttl) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  console.log(`تخزين ${key}:`, item);
  localStorage.setItem(key, JSON.stringify(item));
};

// دالة لاسترجاع البيانات مع التحقق من انتهاء الصلاحية
const getWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  console.log(`استرجاع ${key}:`, item);
  return item.value;
};

const IdentityVerificationComponent = ({ isLoggedIn, isRegisterIn }) => {
  const [studentId, setStudentId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [id, setId] = useState("");

  const navigate = useNavigate();
  const { onToggleSidebar } = useOutletContext();

  // عند تحميل المكون يتم التحقق من وجود بيانات محفوظة سابقاً
  useEffect(() => {
    const cachedData = getWithExpiry("verificationData");
    if (cachedData) {
      setStudentId(cachedData.studentId);
      setDeviceId(cachedData.deviceId);
    }
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // دالة التحقق التقليدية التي تنتظر استجابة السيرفر
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setVerificationResult(null);

    const deviceData = getDeviceData();
    if (!deviceData || !deviceData.device_number) {
      setError("بيانات الجهاز غير متوفرة. يرجى التأكد من تسجيل الجهاز.");
      return;
    }

    setId(deviceData.id);
    const currentDeviceId = deviceData.device_number;
    setDeviceId(currentDeviceId);

    if (!studentId || !selectedFile) {
      setError("يرجى إدخال رقم الطالب وتحميل صورة.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("student_id", studentId);
      formData.append("device_id", currentDeviceId);

      const response = await axios.post(
        "http://127.0.0.1:3000/identity/verify",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200) {
        const result = response.data;
        setVerificationResult(result);

        // تخزين النتيجة مع صلاحية لمدة ساعتين
        setWithExpiry(
          "verificationData",
          {
            result,
            studentId,
            deviceId: currentDeviceId,
          },
          2 * 60 * 60 * 1000
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "حدث خطأ أثناء التحقق من الهوية."
      );
    } finally {
      setLoading(false);
    }
  };

  // دالة دخول الاختبار التي تنتظر استجابة السيرفر قبل إرسال التنبيه
  const handleEnterExam = async () => {
    if (verificationResult?.device_check?.is_correct === false) {
      try {
        const alertPayload = {
          alert_type: 8,
          device_id: id,
          exam_id: verificationResult.student_data.exam_id,
          message: "The student entered from an unauthorized device.",
          student_id: verificationResult.student_data.student_id,
        };

        await axios.post("http://127.0.0.1:3000/api/alerts/", alertPayload, {
          headers: { "Content-Type": "application/json" },
        });
      } catch (alertError) {
        console.error("Error sending alert:", alertError);
      }
    }
    navigate("/monitoring-model");
  };

  // دالة دخول الاختبار مباشرة دون الانتظار لاستجابة عملية التحقق
  const handleDirectExamEntry = (event) => {
    event.preventDefault();

    // التحقق من إدخال بيانات الطالب والصورة
    if (!studentId || !selectedFile) {
      setError("يرجى إدخال رقم الطالب وتحميل صورة.");
      return;
    }

    const deviceData = getDeviceData();
    if (!deviceData || !deviceData.device_number) {
      console.error("بيانات الجهاز غير متوفرة.");
      setError("بيانات الجهاز غير متوفرة. يرجى التأكد من تسجيل الجهاز.");
      return;
    }
    const currentDeviceId = deviceData.device_number;

    // تجهيز بيانات الفورم
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("student_id", studentId);
    formData.append("device_id", currentDeviceId);

    // إنشاء نتيجة تحقق افتراضية لتجنب حدوث خطأ في الصفحة التالية
    const dummyResult = {
      student_data: {
        exam_id: "", // يمكن تعديلها بقيمة افتراضية مناسبة
        student_id: studentId,
      },
      device_check: { is_correct: true },
    };

    // تخزين البيانات افتراضياً قبل الانتقال
    setVerificationResult(dummyResult);
    setWithExpiry(
      "verificationData",
      {
        result: dummyResult,
        studentId,
        deviceId: currentDeviceId,
      },
      2 * 60 * 60 * 1000
    );

    // إطلاق الطلب في الخلفية (fire-and-forget)
    axios
      .post("http://127.0.0.1:3000/identity/verify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        const result = response.data;
        // في حال كانت نتيجة التحقق غير صحيحة، يتم إرسال تنبيه بالخلفية
        if (result.device_check && result.device_check.is_correct === false) {
          const alertPayload = {
            alert_type: 8,
            device_id: deviceData.id,
            exam_id: result.student_data.exam_id,
            message: "The student entered from an unauthorized device.",
            student_id: result.student_data.student_id,
          };
          axios
            .post("http://127.0.0.1:3000/api/alerts/", alertPayload, {
              headers: { "Content-Type": "application/json" },
            })
            .catch((alertError) =>
              console.error("Error sending alert:", alertError)
            );
        }
        // يمكنك تحديث النتيجة في الخلفية إذا رغبت في ذلك
        setVerificationResult(result);
        setWithExpiry(
          "verificationData",
          {
            result,
            studentId,
            deviceId: currentDeviceId,
          },
          2 * 60 * 60 * 1000
        );
      })
      .catch((err) => console.error("Verification failed:", err));

    // التوجيه مباشرة إلى صفحة الاختبار دون انتظار نتيجة الطلب
    navigate("/monitoring-model");
  };

  return (
    <div className="flex flex-col p-5 border border-gray-300 rounded-lg shadow-md">
      <Header
        page="Identity Verification"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />

      <div className="mt-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          التحقق من الهوية
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <label
                htmlFor="studentId"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                رقم الطالب
              </label>
              <input
                type="text"
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="mt-1 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="أدخل رقم الطالب"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="image"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                تحميل صورة الطالب (الوجه)
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 p-2 border border-gray-300 rounded-lg w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-center p-2">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed mx-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  جارٍ التحقق...
                </span>
              ) : (
                "التحقق من الهوية"
              )}
            </button>
            <button
              onClick={handleDirectExamEntry}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 shadow-md"
            >
              دخول الاختبار
            </button>
          </div>
        </form>

        {verificationResult && (
          <div className="mt-8">
            <VerificationResults
              result={verificationResult}
              studentId={studentId}
              selectedFile={selectedFile}
              deviceId={deviceId}
            />

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleEnterExam}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 shadow-md"
              >
                دخول الاختبار
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 border border-red-300 rounded-lg bg-red-50">
            <h3 className="font-bold text-red-700">خطأ:</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

IdentityVerificationComponent.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default IdentityVerificationComponent;
