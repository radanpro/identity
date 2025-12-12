import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { NavLink, useLocation } from "react-router-dom";
import Header from "../components/Header";
import SearchAddBar from "../components/SearchAddBar";
import { Button } from "../shared/Button";
import { Pagination } from "../shared/Pagination";
import { useOutletContext } from "react-router-dom";
import PropTypes from "prop-types";
import useDelete from "../hooks/useDelete";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

const UsersList = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const location = useLocation();

  // جلب بيانات الامتحانات من الخادم
  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3000/users");
      if (response.status === 200) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (error) {
      console.error("فشل في جلب بيانات المستخدم", error);
    }
  }, [setUsers, setFilteredUsers]);

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
    fetchUsers();
  }, [fetchUsers]);

  // دالة البحث: يتم البحث عبر رقم الطالب أو المادة
  const handleSearch = (query) => {
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
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
    baseUrl: "http://127.0.0.1:3000/users",
    successDeleteMessageText: "تم حذف الاختبار بنجاح",
    errorDeleteMessageText: "حدث خطأ أثناء محاولة حذف الاختبار",
    refreshData: fetchUsers,
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
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // تغيير الصفحة
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex-col">
      <Header
        page="User"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div>
        <SearchAddBar
          onSearch={handleSearch}
          onAdd="مستخدم "
          link="/users/add"
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
                      رقم المستخدم
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      اسم المستخدم
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الانشاء
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الصلاحيه
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((users) => (
                    <tr key={users.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {users.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {users.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {users.created_at}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {users.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <NavLink
                          to={`/users/edit-users/${users.id}`}
                          className="text-indigo-600 hover:text-indigo-900 border border-gray-200 p-2 px-4 rounded-md"
                        >
                          تعديل
                        </NavLink>
                        <Button
                          onClick={() =>
                            openDeleteModal(users.id, users.username)
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
        {Math.ceil(filteredUsers.length / itemsPerPage) > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredUsers.length / itemsPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="تأكيد حذف الاختبار"
        message={`هل أنت متأكد من رغبتك في حذف الاختبار "${deleteModal.name}"؟`}
        confirmText="حذف"
        cancelText="إلغاء"
      />
    </div>
  );
};

UsersList.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default UsersList;
