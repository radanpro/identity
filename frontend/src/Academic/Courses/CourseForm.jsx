import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../../components/Header";
import PropTypes from "prop-types";

const CourseForm = ({ isLoggedIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const { course_id } = useParams();
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    course_id: "",
    name: "",
    level_id: "",
    major_id: "",
    semester_id: "",
    year_id: "",
  });

  useEffect(() => {
    if (course_id) {
      setIsEdit(true);
      const fetchCourse = async () => {
        try {
          const response = await axios.get(
            `http://127.0.0.1:3000/api/academic/courses/${course_id}`
          );
          if (response.status === 200) {
            setFormData(response.data);
          }
        } catch (error) {
          console.error("فشل في جلب بيانات المادة الدراسية", error);
        }
      };
      fetchCourse();
    }
  }, [course_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // التأكد من ملء جميع الحقول المطلوبة
    if (
      !formData.name ||
      !formData.level_id ||
      !formData.major_id ||
      !formData.semester_id ||
      !formData.year_id
    ) {
      alert("من فضلك قم بملء جميع الحقول المطلوبة");
      return;
    }

    try {
      const courseData = {
        name: formData.name,
        level_id: formData.level_id,
        major_id: formData.major_id,
        semester_id: formData.semester_id,
        year_id: formData.year_id,
      };

      if (isEdit) {
        await axios.put(
          `http://127.0.0.1:3000/api/academic/courses/${formData.course_id}`,
          courseData
        );
        navigate("/courses/index", {
          state: { message: "تم تحديث المادة الدراسية بنجاح!" },
        });
      } else {
        console.log(courseData);

        await axios.post(
          "http://127.0.0.1:3000/api/academic/courses/",
          courseData
        );
        navigate("/courses/index", {
          state: { message: "تم إضافة المادة الدراسية بنجاح!" },
        });
      }
    } catch (error) {
      console.error("خطأ أثناء إرسال البيانات:", error);
      if (error.response) {
        alert(
          `خطأ: ${error.response.data.detail || error.response.data.message}`
        );
      } else {
        alert("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  return (
    <div className="flex-col">
      <Header
        page={isEdit ? "تعديل المادة الدراسية" : "إضافة مادة دراسية"}
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
      />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isEdit ? "تعديل المادة الدراسية" : "إضافة مادة دراسية جديدة"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم المادة
            </label>
            <input
              type="text"
              placeholder="اسم المادة الدراسية"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المستوى
            </label>
            <input
              type="number"
              placeholder="رقم المستوى"
              name="level_id"
              value={formData.level_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              التخصص
            </label>
            <input
              type="number"
              placeholder="رقم التخصص"
              name="major_id"
              value={formData.major_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الفصل الدراسي
            </label>
            <input
              type="number"
              placeholder="رقم الفصل الدراسي"
              name="semester_id"
              value={formData.semester_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              السنة
            </label>
            <input
              type="number"
              placeholder="رقم السنة"
              name="year_id"
              value={formData.year_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-between pt-4">
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
              {isEdit ? "تحديث المادة" : "إضافة المادة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CourseForm.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};

export default CourseForm;
