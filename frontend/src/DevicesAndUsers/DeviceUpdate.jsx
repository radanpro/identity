import { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import PropTypes from "prop-types";

const DeviceUpdate = ({ isLoggedIn }) => {
  const { id } = useParams();
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();

  const [deviceNumber, setDeviceNumber] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [examCenterName, setExamCenterName] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDeviceDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/devices/${id}`
        );
        const data = response.data;
        setDeviceNumber(data.device_number);
        setRoomNumber(data.room_number);
        setExamCenterName(data.exam_center_name);
        setStatus(data.status);
      } catch (err) {
        setError("Failed to load device details.", err);
      }
    };

    fetchDeviceDetails();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const payload = {
        device_number: parseInt(deviceNumber, 10),
        room_number: parseInt(roomNumber, 10),
        exam_center_name: examCenterName,
        status,
      };
      await axios.put(
        `http://localhost:5000/api/devices/update/${id}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      alert("Device updated successfully.");
      navigate("/devices");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update device.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1">
      <Header
        page="Update Device"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
      />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white p-6 shadow m-6 rounded-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Update Device</h1>
          {error && (
            <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {/* Device Number */}
            <div>
              <label className="block mb-1 font-semibold">Device Number</label>
              <input
                type="number"
                value={deviceNumber}
                onChange={(e) => setDeviceNumber(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            {/* Room Number */}
            <div>
              <label className="block mb-1 font-semibold">Room Number</label>
              <input
                type="number"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            {/* Exam Center Name (يمتد على عرض النموذج بالكامل) */}
            <div className="col-span-2">
              <label className="block mb-1 font-semibold">
                Exam Center Name
              </label>
              <input
                type="text"
                value={examCenterName}
                onChange={(e) => setExamCenterName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            {/* Status */}
            <div className="col-span-2">
              <label className="block mb-1 font-semibold">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* أزرار التحكم */}
            <div className="col-span-2 flex justify-center space-x-4 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Update Device
              </button>
              <button
                type="button"
                onClick={() => navigate("/devices")}
                className="px-6 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

DeviceUpdate.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};

export default DeviceUpdate;
