// DeviceList.js
import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
// import axios from "axios";
import Header from "../components/Header";
import PropTypes from "prop-types";

const DeviceList = ({ isLoggedIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        // const response = await axios.get("http://localhost:5000/api/devices");
        const response = {};
        response.data = [
          {
            id: 1,
            device_number: "1",
            room_number: "1",
            exam_center_name: "Center 1",
            status: "Active",
          },
          {
            id: 2,
            device_number: "2",
            room_number: "2",
            exam_center_name: "Center 2",
            status: "Active",
          },
          {
            id: 3,
            device_number: "3",
            room_number: "3",
            exam_center_name: "Center 3",
            status: "Inactive",
          },
          {
            id: 4,
            device_number: "4",
            room_number: "4",
            exam_center_name: "Center 4",
            status: "Active",
          },
        ];
        setDevices(response.data);
      } catch (err) {
        setError("Failed to fetch devices.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <div className="flex-1 p-4">
          <Header
            page="Devices"
            onToggleSidebar={onToggleSidebar}
            isLoggedIn={isLoggedIn}
          />
          <div className="p-4">Loading devices...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <div className="flex-1 p-4">
          <Header
            page="Devices"
            onToggleSidebar={onToggleSidebar}
            isLoggedIn={isLoggedIn}
          />
          <div className="p-4 text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        page="Devices"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
      />

      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Device List</h2>

        {/* عرض رسالة التحميل */}
        {loading && (
          <p className="text-center text-gray-600">Loading devices...</p>
        )}

        {/* عرض رسالة الخطأ */}
        {error && <p className="text-center text-red-600">{error}</p>}

        {/* جدول الأجهزة */}
        {!loading && !error && (
          <div className="overflow-x-auto rounded-md">
            <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-2xl">
              <thead className="bg-gray-100">
                <tr className="text-left">
                  <th className="px-4 py-2 border">Device Number</th>
                  <th className="px-4 py-2 border">Room Number</th>
                  <th className="px-4 py-2 border">Exam Center</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr
                    key={device.id}
                    className="cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => navigate(`/devices/update/${device.id}`)}
                  >
                    <td className="px-4 py-2 border">{device.device_number}</td>
                    <td className="px-4 py-2 border">{device.room_number}</td>
                    <td className="px-4 py-2 border">
                      {device.exam_center_name}
                    </td>
                    <td className="px-4 py-2 border">
                      <span
                        className={`px-2 py-1 rounded-md text-white font-semibold ${
                          device.status === "Active"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      >
                        {device.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

DeviceList.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};

export default DeviceList;
