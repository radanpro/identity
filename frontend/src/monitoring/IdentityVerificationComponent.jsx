import { useState } from "react";
import axios from "axios";
import { getDeviceData } from "../utils/auth"; // تأكد من مسار الاستيراد الصحيح

const IdentityVerificationComponent = () => {
  const [studentId, setStudentId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    // console.log("Device Data:", deviceData);

    if (!deviceData || !deviceData.device_number) {
      setError("بيانات الجهاز غير متوفرة. يرجى التأكد من تسجيل الجهاز.");
      return;
    }
    const deviceId = deviceData.device_number;
    console.log("Device ID:", deviceId); // طباعة الـ device_id في وحدة التحكم

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
      formData.append("device_id", deviceId);

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
        <div className="mt-4 p-4 border rounded bg-green-100">
          <h3 className="font-bold">نتائج التحقق:</h3>
          <pre>{JSON.stringify(verificationResult, null, 2)}</pre>
        </div>
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
