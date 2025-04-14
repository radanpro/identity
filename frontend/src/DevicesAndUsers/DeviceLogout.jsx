// src/components/DeviceLogout.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { getDeviceData } from "../utils/auth";

const DeviceLogout = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogout = async () => {
    const deviceData = getDeviceData();
    if (!deviceData || !deviceData.id) {
      setMessage("لم يتم العثور على بيانات الجهاز.");
      return;
    }

    const deviceId = deviceData.id;
    setLoading(true);
    console.log(deviceData);

    try {
      const response = await axios.patch(
        `http://127.0.0.1:3000/api/devices/toggle/${deviceId}/status`
      );
      if (response.status === 200) {
        setMessage("✅ تم تسجيل خروج الجهاز بنجاح!");
        localStorage.removeItem("deviceToken");
        localStorage.removeItem("deviceData");
      } else {
        setMessage("❌ فشل تسجيل خروج الجهاز.");
      }
    } catch (error) {
      console.error("خطأ أثناء تسجيل خروج الجهاز:", error);
      setMessage("⚠️ حدث خطأ أثناء محاولة تسجيل خروج الجهاز.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative z-10 bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          تسجيل خروج الجهاز
        </h2>

        {/* Confirmation message */}
        <p className="text-center text-gray-600 mb-6">
          هل تريد بالفعل تسجيل خروج الجهاز؟
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-xl transition-colors duration-200 disabled:opacity-60"
          >
            {loading ? "جارٍ تسجيل الخروج..." : "نعم، سجل الخروج"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-2 rounded-xl transition-colors duration-200"
          >
            إلغاء
          </button>
        </div>

        {/* Feedback message */}
        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
};

DeviceLogout.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default DeviceLogout;
