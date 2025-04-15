// CentersList.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { NavLink, useLocation } from "react-router-dom";
import Header from "../components/Header";
import SearchAddBar from "../components/SearchAddBar";
import { Button } from "../shared/Button";
import { Pagination } from "../shared/Pagination";
import { useOutletContext } from "react-router-dom";
import PropTypes from "prop-types";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import useDelete from "../hooks/useDelete";

const CentersList = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const [centers, setCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const location = useLocation();

  const fetchCenters = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3000/centers");
      if (response.status === 200) {
        setCenters(response.data);
        setFilteredCenters(response.data);
      }
    } catch (error) {
      console.error("فشل في جلب بيانات المراكز", error);
    }
  }, []);

  useEffect(() => {
    fetchCenters();
  }, [fetchCenters]);

  const handleSearch = (query) => {
    const filtered = centers.filter((center) =>
      center.center_name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCenters(filtered);
    setCurrentPage(1);
  };

  // استخدام hook الحذف مع ضبط المدة إلى 5 ثوانٍ
  const {
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    feedback,
    setFeedback,
  } = useDelete({
    baseUrl: "http://127.0.0.1:3000/centers",
    successDeleteMessageText: "تم حذف المركز بنجاح",
    errorDeleteMessageText: "حدث خطأ أثناء محاولة حذف المركز",
    refreshData: fetchCenters,
  });

  // مؤثر لرسائل النجاح القادمة من location
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

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
  const currentItems = filteredCenters.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex-col p-2">
      <Header
        page="المراكز"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div>
        <SearchAddBar
          onSearch={handleSearch}
          onAdd=" مركز "
          link="/centers/add"
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
      <div className="m-2 mt-2">
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          {/* رأس الأعمدة */}
          <div className="grid grid-cols-5 bg-gray-50 p-4">
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              رقم المركز
            </div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              اسم المركز
            </div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              الحالة
            </div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              الإجراءات
            </div>
          </div>

          {/* محتوى الأعمدة */}
          <div className="bg-white divide-y divide-gray-200">
            {currentItems.map((center) => (
              <div
                key={center.id}
                className="grid grid-cols-5 p-4 hover:bg-gray-50"
              >
                <div className="text-sm text-gray-900">{center.id}</div>
                <div className="text-sm text-gray-900">
                  {center.center_name}
                </div>
                <div className="text-sm text-gray-900">
                  {center.status === 1 ? (
                    <span className="text-green-600">نشط</span>
                  ) : (
                    <span className="text-red-600">غير نشط</span>
                  )}
                </div>
                <div className="text-sm font-medium space-x-2">
                  <NavLink
                    to={`/centers/edit-center/${center.id}`}
                    className="text-indigo-600 hover:text-indigo-900 border border-gray-200 p-2 px-4 rounded-md inline-block"
                  >
                    تعديل
                  </NavLink>
                  <Button
                    onClick={() =>
                      openDeleteModal(center.id, center.center_name)
                    }
                    className="text-red-600 hover:text-red-900 border border-gray-200 p-2 px-4 rounded-md inline-block"
                  >
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* الترقيم */}
        {Math.ceil(filteredCenters.length / itemsPerPage) > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredCenters.length / itemsPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="تأكيد حذف المركز"
        message={`هل أنت متأكد من رغبتك في حذف المركز "${deleteModal.id}"؟`}
        confirmText="حذف"
        cancelText="إلغاء"
      />
    </div>
  );
};

CentersList.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default CentersList;
