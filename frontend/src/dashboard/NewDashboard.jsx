// Dashboard.js
import { useState, useEffect } from "react";
import Header from "../components/Header"; // تأكد من مسار ملف Header الصحيح
import { CiGlobe } from "react-icons/ci";
import { LuFileText } from "react-icons/lu";
import PropTypes from "prop-types";

// المكون الرئيسي لصفحة Dashboard
const NewDashboard = ({ isLoggedIn, showRegister }) => {
  // حالات لتخزين التبويب النشط والفلترة والبيانات
  const [activeTab, setActiveTab] = useState("college");
  const [academicYears, setAcademicYears] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [majors, setMajors] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [studentId, setStudentId] = useState("");
  const [chartData, setChartData] = useState([]);

  // تحميل البيانات الأولية عند تحميل الصفحة
  useEffect(() => {
    fetch("/api/academic/years")
      .then((res) => res.json())
      .then((data) => setAcademicYears(data))
      .catch((err) => console.error(err));

    fetch("/api/academic/colleges")
      .then((res) => res.json())
      .then((data) => setColleges(data))
      .catch((err) => console.error(err));

    fetch("/api/academic/levels")
      .then((res) => res.json())
      .then((data) => setLevels(data))
      .catch((err) => console.error(err));
  }, []);

  // عند تغيير الكلية يتم تحميل التخصصات الخاصة بها
  useEffect(() => {
    if (selectedCollege) {
      fetch(`/api/academic/majors/college/${selectedCollege}`)
        .then((res) => res.json())
        .then((data) => setMajors(data))
        .catch((err) => console.error(err));
    } else {
      setMajors([]);
    }
  }, [selectedCollege]);

  // دالة لاستدعاء الـ API المناسبة بناءً على التبويب والفلترة
  const fetchChartData = () => {
    let url = "";
    if (activeTab === "college") {
      // إحصائيات الكليات (يمكن إرسال رقم السنة الدراسية إذا تم اختياره)
      url = `/api/alerts/alerts-colleges?year_id=${selectedYear}`;
    } else if (activeTab === "major") {
      // إحصائيات التخصص والمستوى
      url = `/api/alerts/alerts-major-level?college_id=${selectedCollege}&year_id=${selectedYear}`;
    } else if (activeTab === "course") {
      // إحصائيات المقررات؛ يمكن إرسال مرشحات إضافية
      url = `/api/alerts/course-stats?college_id=${selectedCollege}`;
      if (selectedMajor) url += `&major_id=${selectedMajor}`;
      if (selectedLevel) url += `&level_id=${selectedLevel}`;
      if (selectedYear) url += `&year_id=${selectedYear}`;
    } else if (activeTab === "student") {
      // تقارير الغش المفصلة للطالب بناءً على رقم الطالب
      url = `/api/alerts/${studentId}/cheating-reports`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => setChartData(data))
      .catch((err) => console.error(err));
  };

  return (
    <div className="flex-col">
      {/* رأس الصفحة */}
      <Header
        page="Dashboard"
        onToggleSidebar={() => {}}
        isLoggedIn={isLoggedIn}
        showRegister={showRegister}
      />

      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">
          Cheating Statistics Dashboard
        </h1>

        {/* لوحة الفلترة */}
        <FilterPanel
          academicYears={academicYears}
          colleges={colleges}
          majors={majors}
          levels={levels}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedCollege={selectedCollege}
          setSelectedCollege={setSelectedCollege}
          selectedMajor={selectedMajor}
          setSelectedMajor={setSelectedMajor}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          studentId={studentId}
          setStudentId={setStudentId}
        />

        {/* تبويبات لتحديد نوع العرض */}
        <div className="my-4">
          <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* زر لاستدعاء البيانات */}
        <div className="mb-4">
          <button
            onClick={fetchChartData}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Fetch Data
          </button>
        </div>

        {/* عرض النتائج */}
        <div className="mt-4">
          <ChartDisplay activeTab={activeTab} data={chartData} />
        </div>
      </div>
    </div>
  );
};

// مكون الـ FilterPanel لعرض القوائم المنبثقة وحقل رقم الطالب
const FilterPanel = ({
  academicYears,
  colleges,
  majors,
  levels,
  selectedYear,
  setSelectedYear,
  selectedCollege,
  setSelectedCollege,
  selectedMajor,
  setSelectedMajor,
  selectedLevel,
  setSelectedLevel,
  studentId,
  setStudentId,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="font-semibold">Academic Years:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full border p-2"
        >
          <option value="">Select Year</option>
          {academicYears.map((year) => (
            <option key={year.year_id} value={year.year_id}>
              {year.year_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="font-semibold">Colleges:</label>
        <select
          value={selectedCollege}
          onChange={(e) => setSelectedCollege(e.target.value)}
          className="w-full border p-2"
        >
          <option value="">Select College</option>
          {colleges.map((college) => (
            <option key={college.college_id} value={college.college_id}>
              {college.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="font-semibold">Majors:</label>
        <select
          value={selectedMajor}
          onChange={(e) => setSelectedMajor(e.target.value)}
          className="w-full border p-2"
        >
          <option value="">Select Major</option>
          {majors.map((major) => (
            <option key={major.id} value={major.id}>
              {major.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="font-semibold">Levels:</label>
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="w-full border p-2"
        >
          <option value="">Select Level</option>
          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.level_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="font-semibold">Student ID:</label>
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Enter Student ID"
          className="w-full border p-2"
        />
      </div>
    </div>
  );
};

// مكون تبويبات لتحديد نوع العرض (الكليات، التخصص/المستوى، المقررات، تقارير الطالب)
const TabSelector = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex space-x-4">
      <button
        onClick={() => setActiveTab("college")}
        className={`p-2 ${
          activeTab === "college" ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        College Stats
      </button>
      <button
        onClick={() => setActiveTab("major")}
        className={`p-2 ${
          activeTab === "major" ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        Major-Level Stats
      </button>
      <button
        onClick={() => setActiveTab("course")}
        className={`p-2 ${
          activeTab === "course" ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        Course Stats
      </button>
      <button
        onClick={() => setActiveTab("student")}
        className={`p-2 ${
          activeTab === "student" ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        Student Reports
      </button>
    </div>
  );
};

// مكون العرض الذي يقوم بعرض النتائج المردودة من الـ API
const ChartDisplay = ({ activeTab, data }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-2">Results</h2>
      {activeTab === "college" && (
        <div>
          <h3 className="font-semibold">College Cheating Statistics</h3>
          <ul>
            {data.map((item, index) => (
              <li key={index} className="mb-1">
                {item.academic_year} - {item.college_name}:{" "}
                {item.total_cheating_cases} cases,{" "}
                {item.cheating_students_count} students.
              </li>
            ))}
          </ul>
        </div>
      )}
      {activeTab === "major" && (
        <div>
          <h3 className="font-semibold">Major-Level Cheating Statistics</h3>
          <ul>
            {data.map((item, index) => (
              <li key={index} className="mb-1">
                {item.year_name} - {item.college_name} - {item.major_name} (
                {item.level_name}): {item.total_alerts} alerts,{" "}
                {item.alerted_students_count} students.
              </li>
            ))}
          </ul>
        </div>
      )}
      {activeTab === "course" && (
        <div>
          <h3 className="font-semibold">Course Cheating Statistics</h3>
          {data.success ? (
            <ul>
              {data.data.map((item, index) => (
                <li key={index} className="mb-1">
                  {item.academic_year} - {item.course_name}:{" "}
                  {item.total_cheating_cases} cases,{" "}
                  {item.cheating_students_count} students.
                </li>
              ))}
            </ul>
          ) : (
            <p>{data.error}</p>
          )}
        </div>
      )}
      {activeTab === "student" && (
        <div>
          <h3 className="font-semibold">Detailed Cheating Reports</h3>
          <ul>
            {data.map((exam, index) => (
              <li key={index} className="mb-2">
                <strong>{exam.course_name}</strong> - Exam ID: {exam.exam_id},
                Total alerts: {exam.total_alerts}
                <ul className="ml-4 mt-1">
                  {exam.alerts_details.map((alert, idx) => (
                    <li key={idx}>
                      {alert.alert_message} on{" "}
                      {new Date(alert.alert_timestamp).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

NewDashboard.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  showRegister: PropTypes.bool.isRequired,
};
export default NewDashboard;
