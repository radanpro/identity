import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import Header from "../components/Header";
import PropTypes from "prop-types";

const AddDevice = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    center_id: "",
    device_number: "",
    room_number: "",
  });

  const [centers, setCenters] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // جلب قائمة المراكز
    axios
      .get("http://127.0.0.1:3000/centers")
      .then((res) => setCenters(res.data))
      .catch((err) => console.error("فشل في جلب المراكز", err));
  }, []);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // التحقق من الحقول المطلوبة
    const requiredFields = ["center_id", "device_number", "room_number"];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setErrorMessage(`يرجى تعبئة الحقل: ${field}`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/api/devices/register",
        {
          center_id: parseInt(formData.center_id),
          device_number: parseInt(formData.device_number),
          room_number: formData.room_number,
        }
      );

      if (response.status === 201) {
        setSuccessMessage("تم تسجيل الجهاز بنجاح!");
        navigate("/devices/index", {
          state: { message: "تم إضافة الجهاز بنجاح!" },
        });
      }
    } catch (error) {
      console.error("خطأ أثناء تسجيل الجهاز:", error);
      if (error.response) {
        console.log(error.response.data);

        setErrorMessage(
          error.response.data.error ||
            `خطأ: ${error.response.status} - ${error.response.statusText}`
        );
      } else {
        setErrorMessage("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-col">
      <Header
        page="إضافة جهاز"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div className="flex  justify-center w-full h-screen bg-gray-50 p-8 pb-0">
        <div className="flex w-full m-4 mb-0 p-4 h-2/3 bg-inhirit rounded-lg shadow-lg overflow-hidden">
          {/* Left Section */}
          <div className="flex flex-col justify-center w-1/2 p-2 bg-inherit items-center rounded-md">
            <h1 className="text-4xl font-bold mb-4 text-blue-800">
              AI Exam Proctoring System
            </h1>
          </div>
          {/* Right Section - Add Device Form */}
          <div className="w-1/2 p-8 bg-white rounded-md lg:m-8 shadow-md shadow-sky-200 ">
            <h2 className="text-2xl font-bold mb-6 text-center">
              إضافة جهاز جديد
            </h2>

            {successMessage && (
              <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-md">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المركز
                </label>
                <select
                  name="center_id"
                  value={formData.center_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                >
                  <option value="">اختر المركز</option>
                  {centers.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.center_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الجهاز
                </label>
                <input
                  type="number"
                  name="device_number"
                  placeholder="أدخل رقم الجهاز"
                  value={formData.device_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الغرفة
                </label>
                <input
                  type="text"
                  name="room_number"
                  placeholder="أدخل رقم الغرفة"
                  value={formData.room_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-1/2 mx-2 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                  disabled={isSubmitting}
                >
                  رجوع
                </button>
                <button
                  type="submit"
                  className="w-1/2 mx-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "جاري الإرسال..." : "تسجيل الجهاز"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

AddDevice.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default AddDevice;
