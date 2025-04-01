import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../components/Header";
import PropTypes from "prop-types";

const ExamForm = ({ isLoggedIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const { examId } = useParams(); // إذا كان موجودًا نعتبر الوضع تعديل
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    student_number: "",
    subject: "",
    seat_number: "",
    exam_room: "",
    exam_center: "",
    exam_datetime: "",
    duration: "",
  });

  useEffect(() => {
    if (examId) {
      // في حالة التعديل، نجلب بيانات الاختبار الحالي
      setIsEdit(true);
      const fetchExam = async () => {
        try {
          const response = await axios.get(
            `http://127.0.0.1:3000/exam/${examId}`
          );
          if (response.status === 200) {
            // يجب أن تكون response.data كائن يحتوي على الحقول المطلوبة
            setFormData(response.data);
          }
        } catch (error) {
          console.error("فشل في جلب بيانات الاختبار", error);
        }
      };
      fetchExam();
    }
  }, [examId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // التأكد من ملء جميع الحقول
    if (
      !formData.student_number ||
      !formData.subject ||
      !formData.seat_number ||
      !formData.exam_room ||
      !formData.exam_center ||
      !formData.exam_datetime ||
      !formData.duration
    ) {
      alert("من فضلك قم بملء جميع الحقول");
      return;
    }

    try {
      if (isEdit) {
        // وضع التعديل: تحديث بيانات الاختبار باستخدام PUT
        await axios.put(
          `http://127.0.0.1:3000/exam/${formData.student_number}`,
          formData
        );
        navigate("/exams", {
          state: { message: "تم تحديث الاختبار بنجاح!" },
        });
      } else {
        // وضع الإضافة: إضافة اختبار جديد باستخدام POST
        await axios.post("http://127.0.0.1:3000/exam", formData);
        navigate("/exams", {
          state: { message: "تم إضافة الاختبار بنجاح!" },
        });
      }
    } catch (error) {
      console.error("خطأ أثناء إرسال البيانات:", error);
      if (error.response) {
        alert(`خطأ: ${error.response.data.detail}`);
      } else {
        alert("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  return (
    <div className="flex-col">
      <Header
        page={isEdit ? "تعديل الاختبار" : "إضافة اختبار"}
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
      />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isEdit ? "تعديل الاختبار" : "إضافة اختبار جديد"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="رقم الطالب"
            name="student_number"
            value={formData.student_number}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isEdit} // في حالة التعديل، يتم قفل هذا الحقل إذا كان يعتبر مفتاحًا أساسيًا
          />
          <input
            type="text"
            placeholder="المادة"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="رقم المقعد"
            name="seat_number"
            value={formData.seat_number}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="قاعة الامتحان"
            name="exam_room"
            value={formData.exam_room}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="مركز الامتحان"
            name="exam_center"
            value={formData.exam_center}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="datetime-local"
            placeholder="تاريخ ووقت الامتحان"
            name="exam_datetime"
            value={formData.exam_datetime}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="المدة (بالدقائق)"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

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
              {isEdit ? "تحديث الاختبار" : "إضافة الاختبار"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ExamForm.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};

export default ExamForm;
