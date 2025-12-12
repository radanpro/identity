import { useState, useEffect } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import PropTypes from "prop-types";
import { Button } from "../shared/Button";
import SearchAddBar from "../components/SearchAddBar";
import { Pagination } from "../shared/Pagination";
import PopupMessage from "../components/PopupMessage";

const ExamList = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const { examId } = useParams();
  const navigate = useNavigate();
  const [distributionReport, setDistributionReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // حالة لتخزين حالة التمدد/الطي لكل مجموعة
  const [expandedGroups, setExpandedGroups] = useState({});

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

  useEffect(() => {
    const fetchDistributionReport = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://127.0.0.1:3000/api/exam-distributions/report/${examId}`
        );
        setDistributionReport(response.data.groups || []);
      } catch (err) {
        console.error(err);
        setError("فشل في تحميل التقرير");
        showPopup("فشل في تحميل التقرير", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchDistributionReport();
  }, [examId]);

  // Handle pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = distributionReport.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleBack = () => {
    navigate("/newexam/index");
  };

  // دالة لتبديل حالة المجموعة (تمديد/طي)
  const toggleGroup = (index) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="flex-col">
      <div>
        <Header
          page="تقرير توزيع الطلاب"
          onToggleSidebar={onToggleSidebar}
          isLoggedIn={isLoggedIn}
          isRegisterIn={isRegisterIn}
        />

        {popup.show && (
          <PopupMessage
            message={popup.message}
            type={popup.type}
            onClose={closePopup}
          />
        )}

        <div className="px-4">
          <SearchAddBar
            onAdd="توزيع"
            link={`/exam/add-exam-distributions/${examId}`}
            showBackButton={true}
            onBack={handleBack}
          >
            {/* يمكنك إضافة أي عناصر إضافية هنا */}
            <Button
              onClick={() => navigate("/newexam/index")}
              className="bg-green-500 hover:bg-green-600"
            >
              رجوع
            </Button>
          </SearchAddBar>
        </div>

        <div className="flex flex-col h-fit bg-gray-50 p-4 ">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500 text-xl">{error}</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500 text-xl">لا توجد بيانات متاحة</p>
            </div>
          ) : (
            currentItems.map((group, index) => (
              <div
                key={index}
                className="mb-8 bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* رأس المجموعة مع زر التمدد/الطي */}
                <div className="bg-blue-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-blue-800">
                    تفاصيل المجموعة {index + 1}
                  </h2>
                  <Button
                    onClick={() => toggleGroup(index)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-1 rounded"
                  >
                    {expandedGroups[index] ? "طي" : "تمديد"}
                  </Button>
                </div>

                {/* تفاصيل المجموعة: يتم عرضها فقط إذا كانت المجموعة مفتوحة */}
                {expandedGroups[index] && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-2">
                          المعلومات الأكاديمية
                        </h3>
                        <p>
                          <span className="text-gray-500">العام الدراسي:</span>{" "}
                          <span className="font-medium">
                            {group.header.academic_year}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">الكلية:</span>{" "}
                          <span className="font-medium">
                            {group.header.college_name}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">القسم:</span>{" "}
                          <span className="font-medium">
                            {group.header.major_name}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">المستوى:</span>{" "}
                          <span className="font-medium">
                            {group.header.level_name}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">المقرر:</span>{" "}
                          <span className="font-medium">
                            {group.header.course_name}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">الفصل:</span>{" "}
                          <span className="font-medium">
                            {group.header.semester_name}
                          </span>
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-2">
                          معلومات الامتحان
                        </h3>
                        <p>
                          <span className="text-gray-500">تاريخ الامتحان:</span>{" "}
                          <span className="font-medium">
                            {group.header.exam_date}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">الوقت:</span>{" "}
                          <span className="font-medium">
                            من {group.header.exam_start_time} إلى{" "}
                            {group.header.exam_end_time}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">المركز:</span>{" "}
                          <span className="font-medium">
                            {group.header.center_name}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">رقم القاعة:</span>{" "}
                          <span className="font-medium">
                            {group.header.room_number}
                          </span>
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-2">
                          إحصائيات
                        </h3>
                        <p>
                          <span className="text-gray-500">عدد الطلاب:</span>{" "}
                          <span className="font-medium">
                            {group.students.length}
                          </span>
                        </p>
                        <div className="mt-4">
                          <Button
                            onClick={() =>
                              navigate(
                                `/exam-distributions/edit/${examId}/${index}`
                              )
                            }
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            تعديل التوزيع
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6">
                      <h3 className="text-lg font-semibold mb-4">
                        قائمة الطلاب
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                #
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                رقم الطالب
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                اسم الطالب
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                رقم الجهاز
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {group.students.map((student, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {idx + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {student.student_id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {student.student_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                                  {student.device_number}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}

          {/* Pagination */}
          {Math.ceil(distributionReport.length / itemsPerPage) > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(distributionReport.length / itemsPerPage)}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ExamList.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default ExamList;
