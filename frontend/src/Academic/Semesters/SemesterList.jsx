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

const SemesterList = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const [semesters, setSemesters] = useState([]);
  const [filteredSemesters, setFilteredSemesters] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const location = useLocation();

  const fetchSemesters = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:3000/api/academic/semesters/"
      );
      if (response.status === 200) {
        setSemesters(response.data);
        setFilteredSemesters(response.data);
      }
    } catch (error) {
      console.error("فشل في جلب بيانات الفصول الدراسية", error);
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
    fetchSemesters();
  }, [fetchSemesters]);

  const handleSearch = (query) => {
    const filtered = semesters.filter(
      (semester) =>
        semester.semester_name.toLowerCase().includes(query.toLowerCase()) ||
        semester.semester_id.toString().includes(query)
    );
    setFilteredSemesters(filtered);
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
    baseUrl: "http://127.0.0.1:3000/api/academic/semesters",
    successDeleteMessageText: "تم حذف الفصل الدراسي بنجاح",
    errorDeleteMessageText: "حدث خطأ أثناء محاولة حذف الفصل الدراسي",
    refreshData: fetchSemesters,
  });

  useEffect(() => {
    if (feedback.success || feedback.error) {
      const timer = setTimeout(() => {
        setFeedback({ success: null, error: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback, setFeedback]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSemesters.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex-col">
      <Header
        page="الفصول الدراسية"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div>
        <SearchAddBar
          onSearch={handleSearch}
          onAdd="فصل دراسي "
          link="/semesters/add"
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
                      رقم الفصل
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      اسم الفصل الدراسي
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((semester) => (
                    <tr key={semester.semester_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {semester.semester_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {semester.semester_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <NavLink
                          to={`/semesters/edit-semester/${semester.semester_id}`}
                          className="text-indigo-600 hover:text-indigo-900 border border-gray-200 p-2 px-4 rounded-md"
                        >
                          تعديل
                        </NavLink>
                        <Button
                          onClick={() =>
                            openDeleteModal(
                              semester.semester_id,
                              semester.semester_name
                            )
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
        {Math.ceil(filteredSemesters.length / itemsPerPage) > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredSemesters.length / itemsPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="تأكيد حذف الفصل الدراسي"
        message={`هل أنت متأكد من رغبتك في حذف الفصل الدراسي "${deleteModal.name}"؟`}
        confirmText="حذف"
        cancelText="إلغاء"
      />
    </div>
  );
};

SemesterList.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default SemesterList;
