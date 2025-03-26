import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DevicePage = () => {
  const navigate = useNavigate();

  // Form state
  const [deviceNumber, setDeviceNumber] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [examCenterName, setExamCenterName] = useState("");
  const [status, setStatus] = useState("active");
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const deviceToken = localStorage.getItem("device_token");

  useEffect(() => {
    if (deviceToken) {
      fetchDeviceDetails();
    }
  }, [deviceToken]);

  // Fetch device details if registered
  const fetchDeviceDetails = async () => {
    try {
      const response = await fetch("/api/devices/info", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${deviceToken}`, // Send token to backend
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch device info.");
      }

      const data = await response.json();
      setDeviceNumber(data.device_number);
      setRoomNumber(data.room_number);
      setExamCenterName(data.exam_center_name);
      setStatus(data.status);
      setIsRegistered(true);
    } catch (err) {
      console.error(err);
      setError("Failed to load device details.");
    }
  };

  // Handle form submission (register or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        device_number: parseInt(deviceNumber, 10),
        room_number: parseInt(roomNumber, 10),
        exam_center_name: examCenterName,
        status: status,
      };
      //   console.log(payload);

      const url = isRegistered
        ? "/api/devices/update"
        : "/api/devices/register";
      const method = isRegistered ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          ...(deviceToken && { Authorization: `Bearer ${deviceToken}` }), // Attach token if updating
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Request failed.");
      }

      const data = await response.json();
      if (!isRegistered && data.device_token) {
        localStorage.setItem("device_token", data.device_token);
      }

      setIsRegistered(true);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logout the device
  const handleLogout = () => {
    localStorage.removeItem("device_token");
    setDeviceNumber("");
    setRoomNumber("");
    setExamCenterName("");
    setStatus("active");
    setIsRegistered(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {isRegistered ? "Update Device" : "Register Device"}
        </h1>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Device Number</label>
            <input
              type="number"
              value={deviceNumber}
              onChange={(e) => setDeviceNumber(e.target.value)}
              required
              className="w-full border border-gray-300 rounded p-2"
              placeholder="Enter device number"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Room Number</label>
            <input
              type="number"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              required
              className="w-full border border-gray-300 rounded p-2"
              placeholder="Enter room number"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Exam Center Name</label>
            <input
              type="text"
              value={examCenterName}
              onChange={(e) => setExamCenterName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded p-2"
              placeholder="Enter exam center name"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {isRegistered ? "Update Device" : "Register Device"}
            </button>

            {isRegistered && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Logout Device
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DevicePage;
