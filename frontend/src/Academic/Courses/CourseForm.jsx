import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../../components/Header";
import PropTypes from "prop-types";

const CourseForm = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const { course_id } = useParams();
  const [isEdit, setIsEdit] = useState(false);

  // States for dropdown options
  const [colleges, setColleges] = useState([]);
  const [levels, setLevels] = useState([]);
  const [majors, setMajors] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [years, setYears] = useState([]);

  const [formData, setFormData] = useState({
    college_id: "",
    course_id: "",
    name: "",
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

  // Fetch majors when college_id changes
  useEffect(() => {
    if (formData.college_id) {
      const fetchMajors = async () => {
        try {
          const majorsRes = await axios.get(
            `http://127.0.0.1:3000/api/academic/majors/college/${formData.college_id}`
          );
          setMajors(majorsRes.data);
          // Reset major_id when college changes
          setFormData((prev) => ({ ...prev, major_id: "" }));
        } catch (error) {
          console.error("Error fetching majors:", error);
        }
      };
      fetchMajors();
    } else {
      setMajors([]);
      setFormData((prev) => ({ ...prev, major_id: "" }));
    }
  }, [formData.college_id]);

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
      // Prepare data without college_id and ensure all IDs are integers
      const courseData = {
        name: formData.name,
        level_id: parseInt(formData.level_id),
        major_id: parseInt(formData.major_id),
        semester_id: parseInt(formData.semester_id),
        year_id: parseInt(formData.year_id),
      };

      // Validate that all IDs are positive integers
      if (
        isNaN(courseData.level_id) ||
        isNaN(courseData.major_id) ||
        isNaN(courseData.semester_id) ||
        isNaN(courseData.year_id) ||
        courseData.level_id <= 0 ||
        courseData.major_id <= 0 ||
        courseData.semester_id <= 0 ||
        courseData.year_id <= 0
      ) {
        alert("يجب أن تكون جميع المعرفات أعداد صحيحة موجبة");
        return;
      }

      if (isEdit) {
        await axios.put(
          `http://127.0.0.1:3000/api/academic/courses/${formData.course_id}`,
          courseData
        );
        navigate("/courses/index", {
          state: { message: "تم تحديث المادة الدراسية بنجاح!" },
        });
      } else {
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
        isRegisterIn={isRegisterIn}
      />
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isEdit ? "تعديل المادة الدراسية" : "إضافة مادة دراسية جديدة"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Row - Course Name and College */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          {/* Second Row - Level and Major */}
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
                <option value="">
                  {formData.college_id
                    ? "اختر التخصص"
                    : "الرجاء اختيار الكلية أولاً"}
                </option>
                {majors.map((major) => (
                  <option key={major.major_id} value={major.major_id}>
                    {major.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Third Row - Semester and Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Course ID (only in edit mode) */}
          {isEdit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم المادة
                </label>
                <input
                  type="text"
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
              </div>
              <div></div> {/* Empty div to maintain grid structure */}
            </div>
          )}

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
                {isEdit ? "تحديث المادة" : "إضافة المادة"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

CourseForm.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default CourseForm;
