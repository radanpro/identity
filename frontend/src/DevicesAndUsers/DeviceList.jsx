import { useState, useEffect, useCallback } from "react";
import { useOutletContext, useNavigate, useLocation } from "react-router-dom";
import { Pagination } from "../shared/Pagination";
import axios from "axios";
import SearchAddBar from "../components/SearchAddBar";
import Header from "../components/Header";
import PropTypes from "prop-types";
import useDelete from "../hooks/useDelete";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { Button } from "../shared/Button";

const DeviceList = ({ isLoggedIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    center_id: "",
    room_number: "",
  });

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.center_id) params.center_id = filters.center_id;
      if (filters.room_number) params.room_number = filters.room_number;

      const response = await axios.get(
        "http://127.0.0.1:3000/api/devices/index",
        { params }
      );

      if (response.status === 200) {
        const devicesWithStatus = response.data.devices.map((device) => ({
          ...device,
          statusText: device.status === 1 ? "Active" : "Inactive",
        }));
        setDevices(devicesWithStatus);
        setFilteredDevices(devicesWithStatus);
      }
    } catch (err) {
      setError("Failed to fetch devices.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleSearch = (query) => {
    const filtered = devices.filter(
      (device) =>
        device.device_number.toString().includes(query) ||
        device.room_number.includes(query)
    );
    setFilteredDevices(filtered);
    setCurrentPage(1);
  };

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

  // إضافة hook الحذف وتكوينه
  const {
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    feedback,
    setFeedback,
  } = useDelete({
    baseUrl: "http://127.0.0.1:3000/api/devices/id",
    successDeleteMessageText: "تم حذف الجهاز بنجاح",
    errorDeleteMessageText: "حدث خطأ أثناء محاولة حذف الجهاز",
    refreshData: fetchDevices,
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
  const currentItems = filteredDevices.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const applyFilters = () => {
    fetchDevices();
    setCurrentPage(1);
  };

  return (
    <div className="flex-col">
      <div>
        <Header
          page="Devices"
          onToggleSidebar={onToggleSidebar}
          isLoggedIn={isLoggedIn}
        />

        {/* فلترة الأجهزة */}
        <div className="bg-white shadow rounded-md p-6 mb-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* رقم الغرفة */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">
                رقم الغرفة
              </label>
              <input
                type="text"
                name="room_number"
                value={filters.room_number}
                onChange={(e) =>
                  setFilters({ ...filters, room_number: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* المركز */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700">
                المركز
              </label>
              <input
                type="text"
                name="center_id"
                value={filters.center_id}
                onChange={(e) =>
                  setFilters({ ...filters, center_id: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* أزرار الفلترة */}
            <div className="flex items-end gap-4">
              <button
                onClick={applyFilters}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                تطبيق الفلترة
              </button>
              <button
                onClick={() => {
                  setFilters({ center_id: "", room_number: "" });
                  fetchDevices();
                }}
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                إعادة تعيين
              </button>
            </div>
          </div>
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
        <div>
          <SearchAddBar
            onSearch={handleSearch}
            onAdd="Device"
            link="/devices/add"
          />
        </div>

        <div className="flex flex-col h-screen bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : currentItems.length > 0 ? (
            <div className="flex justify-center items-center w-full">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Device Info
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Location
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((device) => (
                        <tr
                          key={device.id}
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() =>
                            navigate(`/devices/update/${device.id}`)
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <h3>
                              Device #
                              <span className="text-sky-600 font-semibold text-xl ml-2">
                                {device.device_number}
                              </span>
                            </h3>
                            <h3 className="mt-2 hidden">
                              Token:
                              <span className="text-gray-600 font-mono text-sm ml-2">
                                {device.device_token?.substring(0, 10)}...
                              </span>
                            </h3>
                            <h3 className="mt-2">
                              Created At:
                              <span className="text-gray-600 ml-2">
                                {device.created_at}
                              </span>
                            </h3>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <h3>
                              Room Number #
                              <span className="text-sky-600 font-semibold text-xl ml-2">
                                {device.room_number}
                              </span>
                            </h3>
                            <h3 className="mt-2">
                              Center ID:
                              <span className="text-gray-600 ml-2">
                                {device.center_id}
                              </span>
                            </h3>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                device.status === 1
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {device.statusText}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/devices/update/${device.id}`);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(
                                  device.id,
                                  device.device_number
                                );
                              }}
                              className="ml-2 text-red-600 hover:text-red-900"
                            >
                              Delete
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
            <div className="flex justify-center items-center w-full h-[70%]">
              <h2 className="text-gray-500 text-2xl">
                {error || "No devices found"}
              </h2>
            </div>
          )}
          {/* Pagination */}
          {Math.ceil(filteredDevices.length / itemsPerPage) > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredDevices.length / itemsPerPage)}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="تأكيد حذف الجهاز"
        message={`هل أنت متأكد من رغبتك في حذف الجهاز "${deleteModal.name}"؟`}
        confirmText="حذف"
        cancelText="إلغاء"
      />
    </div>
  );
};

DeviceList.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};

export default DeviceList;
