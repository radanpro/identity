import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../components/Header";
import PopupMessage from "../components/PopupMessage"; // استيراد مكوّن PopupMessage
import PropTypes from "prop-types";

const ExamDistributionForm = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const { examId } = useParams();

  const [formData, setFormData] = useState({
    device_id: "",
    exam_id: examId || "",
    student_id: "",
    student_name: "",
  });

  const [students, setStudents] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // حالة لإظهار رسالة الـ Popup
  const [popup, setPopup] = useState(null);

  // دالة مساعدة لإظهار رسالة الـ Popup
  const showPopup = (message, type, callback = null) => {
    setPopup({ message, type, callback, visible: true });
  };

  // دالة الإغلاق الخاصة بالـ Popup
  const handlePopupClose = () => {
    if (popup && popup.callback) {
      popup.callback();
    }
    setPopup(null);
  };

  // جلب بيانات الطلاب
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:3000/students/");
        if (response.status === 200) {
          const formattedStudents = response.data.map((student) => ({
            id: student[2], // رقم القيد
            name: student[1], // اسم الطالب
          }));
          setStudents(formattedStudents);
        }
      } catch (err) {
        console.error("فشل في جلب بيانات الطلاب", err);
        setError("فشل في جلب بيانات الطلاب");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // جلب بيانات الأجهزة
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:3000/api/devices/index"
        );
        if (response.status === 200) {
          setDevices(response.data.devices);
        }
      } catch (err) {
        console.error("فشل في جلب بيانات الأجهزة", err);
        setError("فشل في جلب بيانات الأجهزة");
      }
    };

    fetchDevices();
  }, []);

  // تحديث القائمة المنسدلة للأجهزة
  const handleDeviceChange = (e) => {
    const selectedDeviceId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      device_id: selectedDeviceId,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // عند اختيار الطالب من القائمة المنسدلة
  const handleStudentSelect = (e) => {
    const selectedId = e.target.value;
    const selectedStudent = students.find((s) => s.id === selectedId);

    if (selectedStudent) {
      setFormData((prev) => ({
        ...prev,
        student_id: selectedStudent.id,
        student_name: selectedStudent.name,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // التحقق من ملء جميع الحقول
    if (
      !formData.device_id ||
      !formData.exam_id ||
      !formData.student_id ||
      !formData.student_name
    ) {
      showPopup("من فضلك قم بملء جميع الحقول المطلوبة", "error");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/api/exam-distributions/",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        // عرض رسالة نجاح ثم التنقل بعد إغلاقها
        showPopup("تم توزيع الامتحان على الطالب بنجاح!", "success", () => {
          navigate(`/exam/distributions/${formData.exam_id}`);
        });
      }
    } catch (error) {
      console.error("خطأ أثناء إرسال البيانات:", error);
      if (error.response) {
        switch (error.response.status) {
          case 400:
            showPopup(
              "بيانات غير صالحة: " + error.response.data.detail,
              "error"
            );
            break;
          case 404:
            showPopup("الجهاز أو الطالب غير موجود", "error");
            break;
          case 409:
            showPopup("هذا الامتحان مسجل بالفعل لهذا الطالب", "error");
            break;
          case 500:
            showPopup("خطأ في الخادم الداخلي", "error");
            break;
          default:
            showPopup("حدث خطأ غير متوقع", "error");
        }
      } else {
        showPopup("فشل في الاتصال بالخادم", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-col">
      <Header
        page="إضافة توزيع جديد"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />

      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          إضافة توزيع جديد
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">رقم الجهاز</label>
            <select
              name="device_id"
              value={formData.device_id}
              onChange={handleDeviceChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">اختر الجهاز...</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.device_number} - {device.room_number}
                </option>
              ))}
            </select>
          </div>

          {/* رقم الامتحان (يتم تعبئته تلقائياً إذا كان موجوداً في الرابط) */}
          <div>
            <label className="block text-gray-700 mb-2">رقم الامتحان</label>
            <input
              type="text"
              name="exam_id"
              value={formData.exam_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-100"
              readOnly={!!examId}
            />
          </div>

          {/* اختيار الطالب */}
          <div>
            <label className="block text-gray-700 mb-2">الطالب</label>
            <select
              onChange={handleStudentSelect}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">اختر الطالب...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.id}
                </option>
              ))}
            </select>
          </div>

          {/* اسم الطالب (يتم تعبئته تلقائياً عند الاختيار) */}
          <div>
            <label className="block text-gray-700 mb-2">اسم الطالب</label>
            <input
              type="text"
              name="student_name"
              value={formData.student_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-100"
              readOnly
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
            >
              رجوع
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
            >
              إضافة التوزيع
            </button>
          </div>
        </form>
      </div>

      {/* عرض الـ PopupMessage عند الحاجة */}
      {popup && popup.visible && (
        <PopupMessage
          message={popup.message}
          type={popup.type}
          onClose={handlePopupClose}
        />
      )}
    </div>
  );
};

ExamDistributionForm.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default ExamDistributionForm;
