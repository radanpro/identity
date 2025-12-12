import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { NavLink, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import SearchAddBar from "../../components/SearchAddBar";
import { Button } from "../../shared/Button";
import { Pagination } from "../../shared/Pagination";
import { useOutletContext } from "react-router-dom";
import PropTypes from "prop-types";
import useDelete from "../../hooks/useDelete";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

const CoursesList = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const location = useLocation();

  // جلب بيانات المواد الدراسية من الخادم
  const fetchCourses = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:3000/api/academic/courses/"
      );
      if (response.status === 200) {
        setCourses(response.data);
        setFilteredCourses(response.data);
      }
    } catch (error) {
      console.error("فشل في جلب بيانات المواد الدراسية", error);
    }
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state?.message]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // دالة البحث
  const handleSearch = (query) => {
    const filtered = courses.filter(
      (course) =>
        course.name.toLowerCase().includes(query.toLowerCase()) ||
        course.course_id.toString().includes(query)
    );
    setFilteredCourses(filtered);
    setCurrentPage(1);
  };

  const {
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    feedback,
    setFeedback,
  } = useDelete({
    baseUrl: "http://127.0.0.1:3000/api/academic/courses",
    successDeleteMessageText: "تم حذف المادة الدراسية بنجاح",
    errorDeleteMessageText: "حدث خطأ أثناء محاولة حذف المادة الدراسية",
    refreshData: fetchCourses,
  });

  useEffect(() => {
    if (feedback.success || feedback.error) {
      const timer = setTimeout(() => {
        setFeedback({ success: null, error: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback, setFeedback]);

  // حساب العناصر المعروضة للصفحة الحالية
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);

  // تغيير الصفحة
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex-col">
      <Header
        page="المواد الدراسية"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div>
        <SearchAddBar
          onSearch={handleSearch}
          onAdd="مادة دراسية "
          link="/courses/add"
        />
      </div>
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
          {successMessage}
        </div>
      )}
      {feedback.success && (
        <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
          {feedback.success}
        </div>
      )}
      {feedback.error && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-md">
          {feedback.error}
        </div>
      )}
      <div className="mt-2 flex flex-col">
        <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم المادة
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      اسم المادة
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المستوى
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التخصص
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الفصل الدراسي
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      السنة
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((course) => (
                    <tr key={course.course_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.course_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.level_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.major_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.semester_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.year_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <NavLink
                          to={`/courses/edit-course/${course.course_id}`}
                          className="text-indigo-600 hover:text-indigo-900 border border-gray-200 p-2 px-4 rounded-md"
                        >
                          تعديل
                        </NavLink>
                        <Button
                          onClick={() =>
                            openDeleteModal(course.course_id, course.name)
                          }
                          className="ml-2 text-red-600 hover:text-red-900"
                        >
                          حذف
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Pagination */}
        {Math.ceil(filteredCourses.length / itemsPerPage) > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredCourses.length / itemsPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="تأكيد حذف المادة الدراسية"
        message={`هل أنت متأكد من رغبتك في حذف المادة "${deleteModal.name}"؟`}
        confirmText="حذف"
        cancelText="إلغاء"
      />
    </div>
  );
};

CoursesList.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default CoursesList;
