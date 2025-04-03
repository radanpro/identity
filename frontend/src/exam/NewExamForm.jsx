import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../components/Header";
import PropTypes from "prop-types";

const NewExamForm = ({ isLoggedIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const { examId } = useParams();
  const [isEdit, setIsEdit] = useState(false);

  // States for dropdown options
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [levels, setLevels] = useState([]);
  const [majors, setMajors] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [years, setYears] = useState([]);

  const [formData, setFormData] = useState({
    college_id: "",
    course_id: "",
    exam_id: "",
    exam_date: "",
    exam_time: "",
    level_id: "",
    major_id: "",
    semester_id: "",
    year_id: "",
  });

  // Fetch dropdown options on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch colleges
        const collegesRes = await axios.get(
          "http://127.0.0.1:3000/api/academic/colleges"
        );
        setColleges(collegesRes.data);

        // Fetch courses
        const coursesRes = await axios.get(
          "http://127.0.0.1:3000/api/academic/courses"
        );
        setCourses(coursesRes.data);

        // Fetch levels
        const levelsRes = await axios.get(
          "http://127.0.0.1:3000/api/academic/levels"
        );
        setLevels(levelsRes.data);

        // Fetch semesters
        const semestersRes = await axios.get(
          "http://127.0.0.1:3000/api/academic/semesters"
        );
        setSemesters(semestersRes.data);

        // Fetch years
        const yearsRes = await axios.get(
          "http://127.0.0.1:3000/api/academic/years"
        );
        setYears(yearsRes.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, []);

  // Fetch majors when college_id changes
  useEffect(() => {
    if (formData.college_id) {
      const fetchMajors = async () => {
        try {
          const majorsRes = await axios.get(
            `http://127.0.0.1:3000/api/academic/majors/college/${formData.college_id}`
          );
          setMajors(majorsRes.data);
        } catch (error) {
          console.error("Error fetching majors:", error);
        }
      };
      fetchMajors();
    }
  }, [formData.college_id]);

  useEffect(() => {
    if (examId) {
      setIsEdit(true);
      const fetchExam = async () => {
        try {
          const response = await axios.get(
            `http://127.0.0.1:3000/api/academic/exams/${examId}`
          );
          if (response.status === 200) {
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
      !formData.college_id ||
      !formData.course_id ||
      !formData.exam_date ||
      !formData.exam_time ||
      !formData.level_id ||
      !formData.major_id ||
      !formData.semester_id ||
      !formData.year_id
    ) {
      alert("من فضلك قم بملء جميع الحقول");
      return;
    }

    try {
      if (isEdit) {
        // وضع التعديل: تحديث بيانات الاختبار باستخدام PUT
        await axios.put(
          `http://127.0.0.1:3000/api/academic/exams/${formData.exam_id}`,
          formData
        );
        navigate("/newexam/index", {
          state: { message: "تم تحديث الاختبار بنجاح!" },
        });
      } else {
        await axios.post("http://127.0.0.1:3000/api/academic/exams", formData);
        navigate("/newexam/index", {
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
          {/* College Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الكلية
            </label>
            <select
              name="college_id"
              value={formData.college_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">اختر الكلية</option>
              {colleges.map((college) => (
                <option key={college.college_id} value={college.college_id}>
                  {college.name}
                </option>
              ))}
            </select>
          </div>

          {/* Major Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              التخصص
            </label>
            <select
              name="major_id"
              value={formData.major_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!formData.college_id}
            >
              <option value="">اختر التخصص</option>
              {majors.map((major) => (
                <option key={major.id} value={major.id}>
                  {major.name}
                </option>
              ))}
            </select>
          </div>

          {/* Level Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المستوى
            </label>
            <select
              name="level_id"
              value={formData.level_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">اختر المستوى</option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.level_name}
                </option>
              ))}
            </select>
          </div>

          {/* Course Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المادة
            </label>
            <select
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">اختر المادة</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الفصل الدراسي
            </label>
            <select
              name="semester_id"
              value={formData.semester_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">اختر الفصل الدراسي</option>
              {semesters.map((semester) => (
                <option key={semester.semester_id} value={semester.semester_id}>
                  {semester.semester_name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              السنة
            </label>
            <select
              name="year_id"
              value={formData.year_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">اختر السنة</option>
              {years.map((year) => (
                <option key={year.year_id} value={year.year_id}>
                  {year.year_name}
                </option>
              ))}
            </select>
          </div>

          {/* Exam ID (only in edit mode) */}
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                معرف الامتحان
              </label>
              <input
                type="number"
                name="exam_id"
                value={formData.exam_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>
          )}

          {/* Exam Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تاريخ الامتحان
            </label>
            <input
              type="date"
              name="exam_date"
              value={formData.exam_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Exam Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              وقت الامتحان
            </label>
            <input
              type="time"
              name="exam_time"
              value={formData.exam_time}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
              {isEdit ? "تحديث الاختبار" : "إضافة الاختبار"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

NewExamForm.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};

export default NewExamForm;
