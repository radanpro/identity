import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useOutletContext } from "react-router-dom";
import FilterComponent from "../components/FilterComponent";
import StatCard from "../components/StatCard";
import ChartComponent from "../components/ChartComponent";
import PopupMessage from "../components/PopupMessage";
import {
  FaUniversity,
  FaUserGraduate,
  FaBook,
  FaExclamationTriangle,
} from "react-icons/fa";
import PropTypes from "prop-types";

const CheatingDashboard = ({ isLoggedIn, isRegisterIn }) => {
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const { onToggleSidebar } = useOutletContext();
  const [filters, setFilters] = useState({});
  const [stats, setStats] = useState({
    colleges: [],
    majorLevel: [],
    courses: [],
    studentReports: [],
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("college");

  const showPopup = (message, type = "success") => {
    setPopup({
      show: true,
      message,
      type,
    });
  };
  const closePopup = () => {
    setPopup({
      show: false,
      message: "",
      type: "success",
    });
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      let responseData = {
        colleges: [],
        majorLevel: [],
        courses: [],
        studentReports: [],
      };

      switch (filters.statType) {
        case "college": {
          const params = {};
          if (filters.year_id) params.year_id = filters.year_id;
          const res = await axios.get(
            "http://127.0.0.1:3000/api/alerts/alerts-colleges",
            { params }
          );
          responseData.colleges = res.data;
          break;
        }
        case "major": {
          const params = {};
          if (filters.college_id) params.college_id = filters.college_id;
          if (filters.year_id) params.year_id = filters.year_id;
          const res = await axios.get(
            "http://127.0.0.1:3000/api/alerts/alerts-major-level",
            { params }
          );
          responseData.majorLevel = res.data;
          break;
        }
        case "course": {
          const params = {};
          if (filters.college_id) params.college_id = filters.college_id;
          if (filters.major_id) params.major_id = filters.major_id;
          if (filters.level_id) params.level_id = filters.level_id;
          if (filters.year_id) params.year_id = filters.year_id;
          const res = await axios.get(
            "http://127.0.0.1:3000/api/alerts/course-stats",
            { params }
          );
          responseData.courses = res.data.success ? res.data.data : [];
          break;
        }
        case "student": {
          if (filters.student_id) {
            const res = await axios.get(
              `http://127.0.0.1:3000/api/alerts/${filters.student_id}/cheating-reports`
            );
            responseData.studentReports = res.data;
          }
          break;
        }
        default:
          break;
      }

      setStats(responseData);
    } catch (error) {
      showPopup(`Error fetching statistics: ${error}`, "error");
      // console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // يتم استدعاء fetchStats فقط إذا كانت هناك قيمة في الفلاتر
    if (Object.keys(filters).length > 0) {
      fetchStats();
    }
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // يمكن أيضاً تعديل activeTab ليتوافق مع statType الحالي إذا رغبنا
    if (newFilters.statType) {
      setActiveTab(newFilters.statType);
    }
  };

  // إعداد بيانات المخططات (يتم عرضها فقط عند اختيار college أو major أو course)
  const collegeChartData = {
    labels: stats.colleges.map((item) => item.college_name),
    datasets: [
      {
        label: "Total Cheating Cases",
        data: stats.colleges.map((item) => item.total_cheating_cases),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Distinct Cheating Students",
        data: stats.colleges.map((item) => item.cheating_students_count),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const majorLevelChartData = {
    labels: stats.majorLevel.map(
      (item) => `${item.major_name} - ${item.level_name}`
    ),
    datasets: [
      {
        label: "Total Alerts",
        data: stats.majorLevel.map((item) => item.total_alerts),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const courseChartData = {
    labels: stats.courses.map((item) => item.course_name),
    datasets: [
      {
        label: "Cheating Cases",
        data: stats.courses.map((item) => item.total_cheating_cases),
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  // ملخص الإحصائيات (يتم عرضه فقط عند اختيار college)
  const totalCases = stats.colleges.reduce(
    (sum, item) => sum + item.total_cheating_cases,
    0
  );
  const totalStudents = stats.colleges.reduce(
    (sum, item) => sum + item.cheating_students_count,
    0
  );
  const avgCasesPerCollege =
    stats.colleges.length > 0
      ? (totalCases / stats.colleges.length).toFixed(1)
      : 0;

  return (
    <div className="flex-col">
      <Header
        page="Cheating Statistics Dashboard"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div>
        {popup.show && (
          <PopupMessage
            message={popup.message}
            type={popup.type}
            onClose={closePopup}
          />
        )}
      </div>
      <div className="p-4 bg-gray-50 min-h-screen">
        <FilterComponent onFilterChange={handleFilterChange} />

        {/* في حالة اختيار College Statistics يتم عرض بطاقة الإحصائيات الملخصة */}
        {filters.statType === "college" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Cheating Cases"
              value={totalCases}
              icon={<FaExclamationTriangle size={24} />}
              color="red"
            />
            <StatCard
              title="Distinct Cheating Students"
              value={totalStudents}
              icon={<FaUserGraduate size={24} />}
              color="blue"
            />
            <StatCard
              title="Colleges with Cases"
              value={stats.colleges.length}
              icon={<FaUniversity size={24} />}
              color="purple"
            />
            <StatCard
              title="Avg Cases per College"
              value={avgCasesPerCollege}
              icon={<FaBook size={24} />}
              color="green"
            />
          </div>
        )}

        {/* تبويب عرض النتائج بناءً على statType */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {activeTab === "college" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartComponent
                  type="bar"
                  data={collegeChartData}
                  title="Cheating Cases by College"
                />
                <ChartComponent
                  type="pie"
                  data={{
                    labels: collegeChartData.labels,
                    datasets: [collegeChartData.datasets[0]],
                  }}
                  title="Distribution of Cheating Cases"
                />
                <div className="bg-white p-4 rounded-lg shadow-md lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">
                    College Cheating Details
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            College
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Academic Year
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Cases
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Distinct Students
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.colleges.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.college_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.academic_year}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.total_cheating_cases}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.cheating_students_count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "major" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartComponent
                  type="bar"
                  data={majorLevelChartData}
                  title="Cheating Cases by Major and Level"
                />
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">
                    Major &amp; Level Details
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Major
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Level
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Year
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Alerts
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Distinct Students
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.majorLevel.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.major_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.level_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.year_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.total_alerts}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.alerted_students_count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "course" && stats.courses.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartComponent
                  type="bar"
                  data={courseChartData}
                  title="Cheating Cases by Course"
                />
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Course Details</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Major
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Level
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cases
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Students
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.courses.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.course_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.major_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.level_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.total_cheating_cases}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.cheating_students_count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "student" && filters.student_id && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">
                  Cheating Reports for Student ID: {filters.student_id}
                </h3>
                {stats.studentReports.length > 0 ? (
                  <div className="space-y-4">
                    {stats.studentReports.map((report, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium">
                              Course: {report.course_name}
                            </h4>
                            <p>College: {report.college_name}</p>
                            <p>Major: {report.major_name}</p>
                            <p>Level: {report.level_name}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Exam Details</h4>
                            <p>
                              Date:{" "}
                              {new Date(report.exam_date).toLocaleDateString()}
                            </p>
                            <p>
                              Time: {report.exam_start_time} -{" "}
                              {report.exam_end_time}
                            </p>
                            <p>
                              Location: {report.center_name}, Room{" "}
                              {report.room_number}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium">
                            Alerts ({report.total_alerts})
                          </h4>
                          <div className="mt-2 space-y-2">
                            {report.alerts_details.map((alert, alertIndex) => (
                              <div
                                key={alertIndex}
                                className="bg-gray-50 p-2 rounded"
                              >
                                <div className="flex justify-between">
                                  <span className="font-medium">
                                    {alert.alert_type}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(
                                      alert.alert_timestamp
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm mt-1">
                                  {alert.alert_message}
                                </p>
                                <div className="flex justify-between mt-1 text-sm">
                                  <span>Alert ID: {alert.alert_id}</span>
                                  <span
                                    className={
                                      alert.is_read === "true"
                                        ? "text-green-500"
                                        : "text-yellow-500"
                                    }
                                  >
                                    {alert.is_read === "true"
                                      ? "Read"
                                      : "Unread"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No cheating reports found for this student.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

CheatingDashboard.propTypes = {
  isLoggedIn: PropTypes.bool,
  isRegisterIn: PropTypes.bool,
};

export default CheatingDashboard;
