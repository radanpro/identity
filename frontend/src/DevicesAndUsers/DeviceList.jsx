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
import DeviceFilterForm from "../components/DeviceFilterForm";
import PopupMessage from "../components/PopupMessage";

const DeviceList = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    center_id: "",
    room_number: "",
  });
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "success",
  });
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

  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filters.center) params.center_id = filters.center;
      if (filters.type) params.room_number = filters.type;

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
      setIsLoading(false);
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
      showPopup(location.state.message, "success");
    }
  }, [location.state?.message]);

  // إضافة hook الحذف وتكوينه
  const {
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    feedback,
  } = useDelete({
    baseUrl: "http://127.0.0.1:3000/api/devices/id",
    successDeleteMessageText: "تم حذف الجهاز بنجاح",
    errorDeleteMessageText: "حدث خطأ أثناء محاولة حذف الجهاز",
    refreshData: fetchDevices,
  });

  useEffect(() => {
    if (feedback.success) {
      showPopup(feedback.success, "success");
    } else if (feedback.error) {
      showPopup(feedback.error, "error");
    }
  }, [feedback]);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDevices.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleDeviceStatus = async (deviceId) => {
    try {
      const response = await axios.patch(
        `http://127.0.0.1:3000/api/devices/toggle/${deviceId}/status`
      );

      if (response.status === 200) {
        showPopup(
          `Device status changed to ${
            response.data.new_status === 1 ? "Active" : "Inactive"
          }`,
          "success"
        );
        setDevices((prevDevices) =>
          prevDevices.map((device) =>
            device.id === deviceId
              ? {
                  ...device,
                  status: response.data.new_status,
                  statusText:
                    response.data.new_status === 1 ? "Active" : "Inactive",
                }
              : device
          )
        );
        setFilteredDevices((prevDevices) =>
          prevDevices.map((device) =>
            device.id === deviceId
              ? {
                  ...device,
                  status: response.data.new_status,
                  statusText:
                    response.data.new_status === 1 ? "Active" : "Inactive",
                }
              : device
          )
        );
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      showPopup("Failed to toggle device status", "error");
    }
  };

  const applyFilters = async () => {
    try {
      setIsLoading(true);

      const params = {};
      if (filters.type) params.room_number = filters.type;
      if (filters.center) params.center_id = filters.center;
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
    } catch (error) {
      setError("Failed to fetch devices.");
      console.error("فشل في تطبيق الفلاتر", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTokenHandle = async (deviceId) => {
    try {
      console.log(deviceId);
      if (!deviceId) {
        showPopup("Device ID is required", "error");
        return;
      }

      setIsLoading(true);
      setError(null);

      const response = await axios.patch(
        `http://127.0.0.1:3000/api/devices/update-token/${deviceId}/token`
      );

      if (response.data) {
        showPopup(response.data.message, "success");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          showPopup("Device not found", "error");
        } else if (error.response.status === 500) {
          showPopup("Internal server error", "error");
        } else {
          showPopup("Failed to update device token", "error");
        }
      } else {
        showPopup("Network error - please check your connection", "error");
      }
      console.error("Error updating device token:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-col">
      <div>
        <Header
          page="Devices"
          onToggleSidebar={onToggleSidebar}
          isLoggedIn={isLoggedIn}
          isRegisterIn={isRegisterIn}
        />

        {/* ✅ فلترة الأجهزة - باستخدام مكون منفصل */}
        <DeviceFilterForm
          filters={filters}
          setFilters={setFilters}
          onSubmit={applyFilters}
        />
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
        {popup.show && (
          <PopupMessage
            message={popup.message}
            type={popup.type}
            onClose={closePopup}
          />
        )}
        <div>
          <SearchAddBar
            onSearch={handleSearch}
            onAdd="جهاز   "
            link="/devices/add"
          />
        </div>

        <div className="flex flex-col h-screen bg-gray-50">
          {isLoading ? (
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDeviceStatus(device.id);
                              }}
                              className={`px-3 py-1 rounded-full text-sm font-semibold focus:outline-none ${
                                device.status === 1
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-red-100 text-red-800 hover:bg-red-200"
                              }`}
                            >
                              {device.statusText}
                            </button>
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
                                updateTokenHandle(device.id);
                              }}
                              className="ml-2 text-green-800 hover:text-green-900"
                            >
                              Update Token
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
  isRegisterIn: PropTypes.bool.isRequired,
};

export default DeviceList;
