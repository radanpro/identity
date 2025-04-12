import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getDeviceData } from "../utils/auth"; // تأكد من مسار الاستيراد الصحيح
import VerificationResults from "./VerificationResults";

const IdentityVerificationComponent = () => {
  const [studentId, setStudentId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [id, setId] = useState("");

  const navigate = useNavigate();

  // دالة لتغيير الملف عند الاختيار
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // دالة إرسال البيانات والتحقق
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setVerificationResult(null);

    // استرجاع بيانات الجهاز المُحفَظة
    const deviceData = getDeviceData();
    if (!deviceData || !deviceData.device_number) {
      setError("بيانات الجهاز غير متوفرة. يرجى التأكد من تسجيل الجهاز.");
      return;
    }
    // console.log(deviceData.id);
    setId(deviceData.id);
    const currentDeviceId = deviceData.device_number;
    setDeviceId(currentDeviceId);

    // التحقق من صحة المدخلات
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
        setVerificationResult(response.data);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("حدث خطأ أثناء التحقق من الهوية.");
      }
    } finally {
      setLoading(false);
    }
  };

  // دالة دخول الاختبار
  const handleEnterExam = async () => {
    // إذا كانت نتيجة فحص الجهاز غير صحيحة يتم إرسال تنبيه
    if (
      verificationResult &&
      verificationResult.device_check &&
      !verificationResult.device_check.is_correct
    ) {
      try {
        // بناء الجسم المرسل للتنبيه باستخدام البيانات من النتائج
        const alertPayload = {
          alert_type: 8,
          device_id: id,
          exam_id: verificationResult.student_data.exam_id,
          message: "The student entered from an unauthorized device.",
          student_id: verificationResult.student_data.student_id,
        };
        console.log("Alert Payload:", alertPayload);

        await axios.post("http://127.0.0.1:3000/api/alerts/", alertPayload, {
          headers: { "Content-Type": "application/json" },
        });
      } catch (alertError) {
        console.error("Error sending alert:", alertError);
        // يمكن التعامل مع الخطأ هنا حسب الحاجة مثلاً عرض رسالة تنبيه للمستخدم
      }
    }
    // بعد إجراء التنبيه أو إذا كانت النتيجة صحيحة يتم التوجيه للصفحة التالية
    navigate("/monitoring-model");
  };

  return (
    <div className="p-4 border rounded shadow-sm">
      <h2 className="text-2xl font-bold mb-4 text-center">التحقق من الهوية</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="studentId" className="block text-lg font-medium">
            رقم الطالب
          </label>
          <input
            type="text"
            id="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="image" className="block text-lg font-medium">
            تحميل صورة الطالب (الوجه)
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 p-2 border rounded w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "جارٍ التحقق..." : "التحقق من الهوية"}
        </button>
      </form>

      {verificationResult && (
        <>
          <VerificationResults
            result={verificationResult}
            studentId={studentId}
            selectedFile={selectedFile}
            deviceId={deviceId}
          />
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleEnterExam}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              دخول الاختبار
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="mt-4 p-4 border rounded bg-red-100">
          <h3 className="font-bold">خطأ:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default IdentityVerificationComponent;
