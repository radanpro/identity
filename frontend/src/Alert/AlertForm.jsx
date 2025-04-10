import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import Header from "../components/Header";
import PropTypes from "prop-types";

const AlertForm = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    alert_type: "",
    device_id: "",
    exam_id: "",
    message: "",
    student_id: "",
  });

  const [alertTypes, setAlertTypes] = useState([]);
  const [devices, setDevices] = useState([]);
  const [exams, setExams] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:3000/api/alert-types/")
      .then((res) => setAlertTypes(res.data))
      .catch((err) => console.error("فشل في جلب أنواع التنبيهات", err));

    axios
      .get("http://127.0.0.1:3000/api/devices/index")
      .then((res) => setDevices(res.data.devices))
      .catch((err) => console.error("فشل في جلب الأجهزة", err));

    axios
      .get("http://127.0.0.1:3000/api/academic/exams/filter")
      .then((res) => setExams(res.data))
      .catch((err) => console.error("فشل في جلب الامتحانات", err));
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
      [name]: name === "alert_type" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "alert_type",
      "device_id",
      "exam_id",
      "message",
      "student_id",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setErrorMessage(`يرجى تعبئة الحقل: ${field}`);
        return;
      }
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/api/alerts/",
        formData
      );
      if (response.status === 201) {
        setSuccessMessage("تم إرسال التنبيه بنجاح!");
        navigate("/alerts/alert-list", {
          state: { message: "تم إنشاء التنبيه بنجاح!" },
        });
      }
    } catch (error) {
      console.error("خطأ أثناء إرسال التنبيه:", error);
      if (error.response) {
        setErrorMessage(
          `خطأ: ${error.response.data.detail || error.response.data.message}`
        );
      } else {
        setErrorMessage("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  return (
    <div className="flex-col">
      <Header
        page="إرسال تنبيه"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div className="flex  justify-center w-full h-screen bg-gray-50 p-8 pb-0">
        <div className="flex w-full m-4 mb-0 p-4 h-2/3 bg-inhirit rounded-lg shadow-lg overflow-hidden">
          {/* Left Section */}
          <div className="flex flex-col justify-center w-1/2 p-2 bg-inherit items-center rounded-md">
            <h1 className="text-3xl  mb-4">ALERT</h1>
            <h1 className="text-4xl font-bold mb-4 text-blue-800">
              AI Exam Proctoring System
            </h1>
          </div>
          <div className="w-1/2 p-8 bg-white rounded-md lg:m-8 shadow-md shadow-sky-200 ">
            <h2 className="text-2xl font-bold mb-6 text-center">
              إرسال تنبيه جديد
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

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع التنبيه
                </label>
                <select
                  name="alert_type"
                  value={formData.alert_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md"
                >
                  <option value="">اختر نوع التنبيه</option>
                  {alertTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الجهاز
                </label>
                <select
                  name="device_id"
                  value={formData.device_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md"
                >
                  <option value="">اختر الجهاز</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {`رقم ${device.device_number} - غرفة ${device.room_number}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الامتحان
                </label>
                <select
                  name="exam_id"
                  value={formData.exam_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md"
                >
                  <option value="">اختر الامتحان</option>
                  {exams.map((exam) => (
                    <option key={exam.exam_id} value={exam.exam_id}>
                      {`ID ${exam.exam_id} - ${
                        exam.course?.course_name ?? "دون اسم"
                      }`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الطالب
                </label>
                <input
                  type="number"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الرسالة
                </label>
                <input
                  type="text"
                  name="message"
                  placeholder="مثال: Student using phone"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>

              <div className="col-span-2 flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-1/2 mx-2 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  رجوع
                </button>
                <button
                  type="submit"
                  className="w-1/2 mx-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  إرسال التنبيه
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

AlertForm.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default AlertForm;
