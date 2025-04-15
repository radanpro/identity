// src/components/IdentityVerificationComponent.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import PropTypes from "prop-types";

import { getDeviceData } from "../utils/auth";
import { setWithExpiry, getWithExpiry } from "../utils/storage";
import Header from "../components/Header";
import VerificationResults from "./VerificationResults";
import IdentityVerificationForm from "./IdentityVerificationForm";

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
          { result, studentId, deviceId: currentDeviceId },
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
      { result: dummyResult, studentId, deviceId: currentDeviceId },
      2 * 60 * 60 * 1000
    );

    // إطلاق الطلب في الخلفية (fire-and-forget)
    axios
      .post("http://127.0.0.1:3000/identity/verify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        const result = response.data;
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
        // تحديث البيانات عند الوصول للاستجابة
        setVerificationResult(result);
        setWithExpiry(
          "verificationData",
          { result, studentId, deviceId: currentDeviceId },
          2 * 60 * 60 * 1000
        );
      })
      .catch((err) => console.error("Verification failed:", err));

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

        {/* استخدام مكون النموذج للتعامل مع إدخال البيانات */}
        <IdentityVerificationForm
          studentId={studentId}
          setStudentId={setStudentId}
          handleFileChange={handleFileChange}
          loading={loading}
          handleSubmit={handleSubmit}
        />

        <div className="mt-6 flex justify-center p-2">
          <button
            onClick={handleDirectExamEntry}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 shadow-md"
          >
            دخول الاختبار
          </button>
        </div>

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
