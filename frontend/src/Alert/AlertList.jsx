import Header from "../components/Header";
import { useOutletContext, useLocation } from "react-router-dom";
import { Pagination } from "../shared/Pagination";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import SearchAddBar from "../components/SearchAddBar";
import { MdOutlineMessage } from "react-icons/md";
import { IoIosSunny } from "react-icons/io";
import PropTypes from "prop-types";
import AlertDetailsModal from "../components/AlertDetailsModal";
import AlertFilterForm from "../components/AlertFilterForm"; // استيراد مكوّن الفلاتر
import useDeleteAlert from "../hooks/useDeleteAlert";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { Button } from "../shared/Button";
import PopupMessage from "../components/PopupMessage"; // استيراد مكون الرسالة المنبثقة

const AlertList = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [selectedAlertDetails, setSelectedAlertDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // الدالة المستخدمة لتهيئة البيانات إذا احتجت لعمل map
  const mapAlerts = (data) => {
    return data.map((alert) => ({
      alert_count: alert.alert_count,
      alert_id: alert.alert_id,
      center_name: alert.center_name,
      device_id: alert.device_id,
      device_number: alert.device_number,
      exam_date: alert.exam_date,
      exam_id: alert.exam_id,
      exam_period: alert.exam_period,
      last_alert_time: alert.last_alert_time,
      room_number: alert.room_number,
      status: alert.status,
      student_id: alert.student_id,
      unread_count: alert.unread_count,
    }));
  };

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:3000/api/alerts/devices"
      );
      if (response.status === 200) {
        const mappedAlerts = mapAlerts(response.data);
        setAlerts(mappedAlerts);
        setFilteredAlerts(mappedAlerts);
      }
    } catch (error) {
      console.error("Failed to fetch alerts", error);
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
    fetchAlerts();
  }, [fetchAlerts]);

  const handleSearch = (query) => {
    const filtered = alerts.filter((alert) =>
      alert.alert_id?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredAlerts(filtered);
    setCurrentPage(1);
  };

  // دالة لجلب تفاصيل التنبيه عند النقر على صف من الجدول
  const fetchAlertDetails = async (device_id, exam_id, student_id) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/api/alerts/alerts/mark-and-get",
        {
          device_id,
          exam_id,
          student_id,
        }
      );
      if (response.status === 200) {
        console.log("تفاصيل التنبيه:", response.data);

        setSelectedAlertDetails(response.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error("فشل في جلب التفاصيل:", error);
    }
  };
  const handleRowClick = (alert) => {
    fetchAlertDetails(alert.device_id, alert.exam_id, alert.student_id);
  };

  const indexOfLestItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLestItem - itemsPerPage;
  const currentItems = filteredAlerts.slice(indexOfFirstItem, indexOfLestItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const {
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    feedback,
    setFeedback,
  } = useDeleteAlert({
    baseUrl: "http://127.0.0.1:3000/api/alerts",
    successDeleteMessageText: "تم حذف التنبيه بنجاح",
    errorDeleteMessageText: "حدث خطأ أثناء محاولة حذف التنبيه",
    refreshData: fetchAlerts,
  });

  useEffect(() => {
    if (feedback.success || feedback.error) {
      const timer = setTimeout(() => {
        setFeedback({ success: null, error: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback, setFeedback]);

  // حالة الفلاتر بناءً على AlertFilterForm
  const [filters, setFilters] = useState({
    type: "",
    center: "",
    exam: "",
    exam_start_time: "",
    exam_end_time: "",
  });

  useEffect(() => {
    if (
      filters.type === "" &&
      filters.center === "" &&
      filters.exam === "" &&
      filters.exam_start_time === "" &&
      filters.exam_end_time === ""
    ) {
      fetchAlerts();
    }
  }, [filters, fetchAlerts]);

  const applyFilters = async () => {
    try {
      setIsLoading(true);

      const params = {};
      if (filters.type) params.room_number = filters.type;
      if (filters.center) params.center_id = filters.center;
      if (filters.exam) params.exam_date = filters.exam;
      if (filters.exam_start_time) params.start_time = filters.exam_start_time;
      if (filters.exam_end_time) params.end_time = filters.exam_end_time;

      const response = await axios.get(
        "http://127.0.0.1:3000/api/alerts/devices",
        { params }
      );
      if (response.status === 200) {
        const mappedAlerts = mapAlerts(response.data);
        setAlerts(mappedAlerts);
        setFilteredAlerts(mappedAlerts);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("فشل في تطبيق الفلاتر", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-col">
      <div>
        <Header
          page="alertList"
          onToggleSidebar={onToggleSidebar}
          isLoggedIn={isLoggedIn}
          isRegisterIn={isRegisterIn}
        />

        {/* مكوّن الفلاتر المدمج */}
        <AlertFilterForm
          filters={filters}
          setFilters={setFilters}
          onSubmit={applyFilters}
        />
        <div>
          <SearchAddBar
            onSearch={handleSearch}
            onAdd="Alert "
            link="/alerts/add-alert"
          />
        </div>
        {successMessage && (
          <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
            {successMessage}
          </div>
        )}
        {feedback.error && (
          <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-md">
            {feedback.error}
          </div>
        )}

        {/* عرض رسالة منبثقة عند نجاح الحذف */}
        {feedback.success && (
          <PopupMessage
            message={feedback.success}
            type="success"
            onClose={() => setFeedback({ success: null, error: null })}
            duration={5000}
          />
        )}

        <div className="flex flex-col h-screen bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : currentItems.length > 0 ? (
            <div className="flex justify-center items-center w-full ">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider"
                        >
                          alert INFO
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider"
                        >
                          Location
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider"
                        >
                          Alerts
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider">
                          new Alert
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider"
                        >
                          LoginDate
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider"
                        >
                          Control
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((alert) => (
                        <tr
                          key={alert.alert_id}
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => handleRowClick(alert)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <h3>
                              Device #
                              <span className="text-sky-600 font-semibold text-xl">
                                {alert.device_number}
                              </span>
                            </h3>
                            <h3 className="hidden">
                              Device Id #
                              <span className="text-sky-600 font-semibold text-xl">
                                {alert.device_id}
                              </span>
                            </h3>
                            <h3>
                              Student ID#
                              <span className="text-sky-600 font-semibold text-xl">
                                {alert.student_id}
                              </span>
                            </h3>
                            <h3>
                              Alert Count #
                              <span className="text-sky-600 font-semibold text-xl">
                                {alert.alert_count}
                              </span>
                            </h3>
                          </td>
                          {/* location */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <h3>
                              Room #
                              <span className="text-sky-600 font-semibold text-xl">
                                {alert.room_number}
                              </span>
                            </h3>
                            <h3>
                              Center Name #
                              <span className="text-sky-600 font-semibold text-xl">
                                {alert.center_name}
                              </span>
                            </h3>
                            <h3>
                              Exam_id #
                              <span className="text-sky-600 font-semibold text-xl">
                                {alert.exam_id}
                              </span>
                            </h3>
                          </td>
                          {/* status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <h3
                              className={`${
                                alert.status === 1
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              } text-center rounded-md p-1 text-white font-semibold`}
                            >
                              {alert.status === 1 ? "Online" : "Offline"}
                            </h3>
                          </td>
                          {/* Alert */}
                          <td className="relative px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center relative">
                              <MdOutlineMessage className="text-yellow-300 text-4xl" />
                              <IoIosSunny className="text-red-600 text-4xl absolute -top-5 right-8 flex items-center justify-center shadow-md bg-null rounded-full" />
                              <div className="-mt-1 ml-1 absolute -top-2 right-11 bg-red-600 text-white text-sm font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                                <span className="text-ml">
                                  {alert.alert_count}
                                </span>
                              </div>
                            </div>
                          </td>
                          {/* Unread Count Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <h3
                              className={`${
                                alert.unread_count > 0
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              } text-center rounded-md p-1 text-white font-semibold`}
                            >
                              New Alert #{alert.unread_count}
                            </h3>
                          </td>
                          {/* LoginDate */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <h3>
                              تاريخ الاختبار #
                              <span className="text-sky-600 font-semibold text-xl">
                                {new Date(alert.exam_date).toLocaleDateString(
                                  "ar-EG",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                            </h3>
                            <h3>
                              فترة الاختبار #
                              <span className="text-sky-600 font-semibold text-xl">
                                {alert.exam_period}
                              </span>
                            </h3>
                            <h3>
                              تاريخ اخر تنبية #
                              <span className="text-sky-600 font-semibold text-xl">
                                {new Date(alert.last_alert_time).toLocaleString(
                                  "ar-EG",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: true,
                                  }
                                )}
                              </span>
                            </h3>
                          </td>
                          {/* Control */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(
                                  alert.device_id,
                                  alert.exam_id,
                                  alert.student_id
                                );
                              }}
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
          ) : (
            <div className="flex justify-center items-center w-full  h-[70%] ">
              <h2 className="text-gray-500 text-2xl">No alerts found</h2>
            </div>
          )}
          {/* Pagination */}
          {Math.ceil(filteredAlerts.length / itemsPerPage) > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredAlerts.length / itemsPerPage)}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          title="تأكيد حذف التنبيه"
          message="هل أنت متأكد من رغبتك في حذف التنبيه؟"
          confirmText="حذف"
          cancelText="إلغاء"
        />
      </div>
      <AlertDetailsModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          fetchAlerts();
        }}
        alertDetails={selectedAlertDetails}
      />
    </div>
  );
};

AlertList.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default AlertList;
