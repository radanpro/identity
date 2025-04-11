import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../components/Header";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // جلب بيانات الجهاز عند تحميل المكون
  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        // استرجاع البيانات من localStorage
        const storedDeviceData = localStorage.getItem("deviceData");
        const parsedDeviceData = JSON.parse(storedDeviceData);
        // console.log("Stored Device Data:", parsedDeviceData.id);

        // إذا كنت تريد استخدامها في state
        if (parsedDeviceData && parsedDeviceData.id) {
          setFormData((prev) => ({
            ...prev,
            device_id: parsedDeviceData.id,
            room_number: parsedDeviceData.room_number, // مثال: يمكنك إضافة المزيد من الحقول
          }));
        }
      } catch (error) {
        console.error("Error validating token:", error);
      }
    };

    fetchDeviceData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // عند اختيار الطالب من القائمة المنسدلة
  const handleStudentSelect = (e) => {
    const selectedId = e.target.value;
    const selectedStudent = students.find((s) => s.id === selectedId);

    if (selectedStudent) {
      setFormData({
        ...formData,
        student_id: selectedStudent.id,
        student_name: selectedStudent.name,
      });
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
      alert("من فضلك قم بملء جميع الحقول المطلوبة");
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
        alert("تم توزيع الامتحان على الطالب بنجاح!");
        navigate(`/exam-distributions/report/${formData.exam_id}`);
      }
    } catch (error) {
      console.error("خطأ أثناء إرسال البيانات:", error);
      if (error.response) {
        switch (error.response.status) {
          case 400:
            alert("بيانات غير صالحة: " + error.response.data.detail);
            break;
          case 404:
            alert("الجهاز أو الطالب غير موجود");
            break;
          case 409:
            alert("هذا الامتحان مسجل بالفعل لهذا الطالب");
            break;
          case 500:
            alert("خطأ في الخادم الداخلي");
            break;
          default:
            alert("حدث خطأ غير متوقع");
        }
      } else {
        alert("فشل في الاتصال بالخادم");
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
          {/* رقم الجهاز (يتم تعبئته تلقائياً) */}
          <div>
            <label className="block text-gray-700 mb-2">رقم الجهاز</label>
            <input
              type="text"
              name="device_id"
              value={formData.device_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-100"
              readOnly
            />
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
    </div>
  );
};

ExamDistributionForm.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default ExamDistributionForm;
