// src/monitoring/IdentityVerificationPage.jsx // this is from student

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import PropTypes from "prop-types";

import { getDeviceData } from "../utils/auth";
import { setWithExpiry, getWithExpiry } from "../utils/storage";
import Header from "../components/Header";
import VerificationResults from "./VerificationResults";
import CameraInput from "./CameraInput";

const IdentityVerificationPage = ({ isLoggedIn, isRegisterIn }) => {
  const [studentId, setStudentId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [deviceId, setDeviceId] = useState("");

  const navigate = useNavigate();
  const { onToggleSidebar } = useOutletContext();

  useEffect(() => {
    const cachedData = getWithExpiry("verificationData");
    if (cachedData) {
      setStudentId(cachedData.studentId);
      setDeviceId(cachedData.deviceId);
    }
  }, []);

  const formatAlertMessage = (result, currentDeviceId) => {
    const student = result.student_data;

    return `تم الكشف عن تنبيه:\n[التنبيه] ━━━━━━━━━━━━━━━━━━━━━━━
            [WARNING] الدخول من جهاز غير مصرح به!
            الطالب: ${student.student_id}
            رقم القيد: ${student.student_id}
            الاختبار: ${student.exam_id}
            الجهاز الحالي: ${currentDeviceId}
            الجهاز المخصص: ${student.device_number || "غير معروف"}
            الوقت: ${new Date().toLocaleTimeString()}
            التاريخ: ${new Date().toLocaleDateString()}
            ━━━━━━━━━━━━━━━━━━━━━━━`;
  };

  const handleEnterExam = async () => {
    if (verificationResult?.device_check?.is_correct === false) {
      try {
        const deviceData = getDeviceData();
        const currentDeviceId = deviceData?.device_number || "غير معروف";
        const alertPayload = {
          alert_type: 8,
          device_id: deviceId,
          exam_id: verificationResult.student_data.exam_id,
          message: formatAlertMessage(verificationResult, currentDeviceId),
          student_id: verificationResult.student_data.student_id,
        };

        await axios.post("http://127.0.0.1:3000/api/alerts/", alertPayload, {
          headers: { "Content-Type": "application/json" },
        });
      } catch (alertError) {
        console.error("Error sending alert:", alertError);
      }
    }
    navigate("/monitoring-model", { state: { autoStartCamera: true } });
  };

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
    console.log("Device ID:", currentDeviceId);

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("student_id", studentId);
    formData.append("device_id", currentDeviceId);

    const dummyResult = {
      student_data: {
        exam_id: "",
        student_id: studentId,
      },
      device_check: { is_correct: true },
    };

    setVerificationResult(dummyResult);
    setWithExpiry(
      "verificationData",
      { result: dummyResult, studentId, deviceId: currentDeviceId },
      2 * 60 * 60 * 1000
    );

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
            message: formatAlertMessage(result, currentDeviceId),
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
        setVerificationResult(result);
        setWithExpiry(
          "verificationData",
          { result, studentId, deviceId: currentDeviceId },
          2 * 60 * 60 * 1000
        );
      })
      .catch((err) => console.error("Verification failed:", err));

    navigate("/monitoring-model", { state: { autoStartCamera: true } });
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

        {/* حذف نموذج إدخال البيانات */}

        <div className="flex flex-col items-center gap-4">
          <input
            type="text"
            placeholder="رقم الطالب"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded w-full max-w-md"
          />
          <CameraInput onImageCapture={setSelectedFile} />
        </div>

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

IdentityVerificationPage.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default IdentityVerificationPage;
