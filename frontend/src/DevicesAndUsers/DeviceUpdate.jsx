import { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import PropTypes from "prop-types";

const DeviceUpdate = ({ isLoggedIn, isRegisterIn }) => {
  const { id } = useParams();
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState(null);

  const [formData, setFormData] = useState({
    center_id: "",
    device_number: "",
    room_number: "",
  });
  const [centers, setCenters] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  useEffect(() => {
    // Fetch centers list
    const fetchCenters = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:3000/centers");
        setCenters(response.data);
      } catch (err) {
        console.error("Failed to fetch centers", err);
      }
    };

    // Fetch device details
    const fetchDeviceDetails = async () => {
      try {
        console.log(id);
        const response = await axios.get(
          `http://127.0.0.1:3000/api/devices/show?device_id=${id}`
        );
        const data = response.data.device;
        console.log(response.data.device);
        setFormData({
          center_id: data.center_id.toString(),
          device_number: data.device_number.toString(),
          room_number: data.room_number,
          device_token: data.device_token,
        });
      } catch (err) {
        setError("Failed to load device details.");
        console.error(err);
      }
    };

    fetchCenters();
    fetchDeviceDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        center_id: parseInt(formData.center_id, 10),
        device_number: parseInt(formData.device_number, 10),
        room_number: formData.room_number,
      };

      await axios.put(
        `http://127.0.0.1:3000/api/devices/update/${id}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setSuccessMessage("Device updated successfully.");
      navigate("/devices/index", {
        state: { message: "Device updated successfully!" },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update device.");
      console.error(err);
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
        isRegisterIn={isRegisterIn}
      />
      <div className="flex justify-center w-full h-screen bg-gray-50 p-8 pb-0">
        <div className="flex w-full m-4 mb-0 p-4 h-2/3 bg-inhirit rounded-lg shadow-lg overflow-hidden">
          {/* Left Section */}
          <div className="w-1/2 p-8 bg-white rounded-md  shadow-md shadow-sky-200">
            <div className="w-full max-w-3xl bg-white p-6 shadow m-6 rounded-md">
              <h1 className="text-2xl font-bold mb-4 text-center">
                Update Device
              </h1>
              {error && (
                <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
                  {successMessage}
                </div>
              )}
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                {/* Center */}
                <div>
                  <label className="block mb-1 font-semibold">Center</label>
                  <select
                    name="center_id"
                    value={formData.center_id}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Select Center</option>
                    {centers.map((center) => (
                      <option key={center.id} value={center.id}>
                        {center.center_name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Token */}
                <div>
                  <label className="block mb-1 font-semibold">Token</label>
                  <input
                    type="text"
                    name="device_token"
                    value={formData.device_token}
                    disabled
                    className="w-full border border-gray-300 rounded-md p-2 bg-gray-200 cursor-not-allowed"
                  />
                </div>

                {/* Device Number */}
                <div>
                  <label className="block mb-1 font-semibold">
                    Device Number
                  </label>
                  <input
                    type="number"
                    name="device_number"
                    value={formData.device_number}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>

                {/* Room Number */}
                <div>
                  <label className="block mb-1 font-semibold">
                    Room Number
                  </label>
                  <input
                    type="text"
                    name="room_number"
                    value={formData.room_number}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>

                {/* Control Buttons */}
                <div className="col-span-2 flex justify-center space-x-4 mt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    {isSubmitting ? "Updating..." : "Update Device"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/devices/index")}
                    className="px-6 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
          {/* Right Section */}
          <div className="flex flex-col justify-center w-1/2 p-2 bg-inherit items-center rounded-md">
            <h1 className="text-4xl font-bold mb-4 text-blue-800">
              AI Exam Proctoring System
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

DeviceUpdate.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default DeviceUpdate;
