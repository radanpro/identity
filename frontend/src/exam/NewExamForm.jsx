import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../components/Header";
import PropTypes from "prop-types";

const NewExamForm = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const { examId } = useParams();
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState(null);

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
    exam_date: "",
    exam_start_time: "",
    exam_end_time: "",
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

  useEffect(() => {
    const fetchFilteredCourses = async () => {
      if (formData.major_id && formData.semester_id) {
        try {
          console.log("major_id", formData.major_id);
          console.log("semester_id", formData.semester_id);
          const coursesRes = await axios.get(
            `http://127.0.0.1:3000/api/academic/courses/filter?major_id=${formData.major_id}&semester_id=${formData.semester_id}`
          );
          setCourses(coursesRes.data);
          const currentCourseExists = coursesRes.data.some(
            (course) => course.course_id === formData.course_id
          );
          if (currentCourseExists) {
            setFormData((prev) => ({ ...prev, course_id: "" }));
          }
        } catch (error) {
          console.error("Error fetching filtered courses:", error);
        }
      }
    };

    fetchFilteredCourses();
  }, [
    formData.major_id,
    formData.semester_id,
    formData.course_id,
    formData.college_id,
  ]);

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
      !formData.exam_start_time ||
      !formData.exam_end_time ||
      !formData.level_id ||
      !formData.major_id ||
      !formData.semester_id ||
      !formData.year_id
    ) {
      alert("من فضلك قم بملء جميع الحقول");
      return;
    }

    try {
      // Prepare data with all required fields
      const examData = {
        college_id: parseInt(formData.college_id),
        course_id: parseInt(formData.course_id),
        exam_date: formData.exam_date,
        exam_start_time:
          formData.exam_start_time.length === 5
            ? formData.exam_start_time + ":00"
            : formData.exam_start_time,
        exam_end_time:
          formData.exam_end_time.length === 5
            ? formData.exam_end_time + ":00"
            : formData.exam_end_time,
        level_id: parseInt(formData.level_id),
        major_id: parseInt(formData.major_id),
        semester_id: parseInt(formData.semester_id),
        year_id: parseInt(formData.year_id),
      };

      // Validate that all IDs are positive integers
      if (
        isNaN(examData.college_id) ||
        isNaN(examData.course_id) ||
        isNaN(examData.level_id) ||
        isNaN(examData.major_id) ||
        isNaN(examData.semester_id) ||
        isNaN(examData.year_id) ||
        examData.college_id <= 0 ||
        examData.course_id <= 0 ||
        examData.level_id <= 0 ||
        examData.major_id <= 0 ||
        examData.semester_id <= 0 ||
        examData.year_id <= 0
      ) {
        alert("يجب أن تكون جميع المعرفات أعداد صحيحة موجبة");
        return;
      }

      if (isEdit) {
        await axios.put(
          `http://127.0.0.1:3000/api/academic/exams/${examId}`,
          examData
        );
        navigate("/newexam/index", {
          state: { message: "تم تحديث الاختبار بنجاح!" },
        });
      } else {
        await axios.post("http://127.0.0.1:3000/api/academic/exams/", examData);
        navigate("/newexam/index", {
          state: { message: "تم إضافة الاختبار بنجاح!" },
        });
      }
    } catch (error) {
      // console.error("خطأ أثناء إرسال البيانات:", error);

      if (error.response) {
        setError(error.response.data.error);
        // serError(`خطأ: ${error.response.data.detail}`);
      } else {
        setError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  });

  return (
    <div className="flex-col">
      <Header
        page={isEdit ? "تعديل الاختبار" : "إضافة اختبار"}
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isEdit ? "تعديل الاختبار" : "إضافة اختبار جديد"}
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-md">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <option key={major.major_id} value={major.major_id}>
                    {major.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <option key={level.level_id} value={level.level_id}>
                    {level.level_name}
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
                  <option
                    key={semester.semester_id}
                    value={semester.semester_id}
                  >
                    {semester.semester_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                disabled={!formData.major_id || !formData.semester_id}
              >
                <option value="">اختر المادة</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.name}
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
          </div>

          {/* Fourth Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Exam Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                وقت بدء الامتحان
              </label>
              <input
                type="time"
                name="exam_start_time"
                value={formData.exam_start_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Exam End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                وقت انتهاء الامتحان
              </label>
              <input
                type="time"
                name="exam_end_time"
                value={formData.exam_end_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Buttons Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="flex justify-end md:justify-start">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 transition duration-300"
              >
                رجوع
              </button>
            </div>
            <div className="flex justify-start md:justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition duration-300"
              >
                {isEdit ? "تحديث الاختبار" : "إضافة الاختبار"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

NewExamForm.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default NewExamForm;
