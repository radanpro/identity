import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    center_id: "",
    device_number: "",
    room_number: "",
  });

  const [centers, setCenters] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:3000/centers")
      .then((res) => setCenters(res.data))
      .catch((err) => console.error("Failed to fetch centers", err));
  }, []);

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
    setError(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/api/devices/register",
        {
          center_id: parseInt(formData.center_id),
          device_number: parseInt(formData.device_number),
          room_number: formData.room_number,
        }
      );

      if (response.status === 201) {
        localStorage.setItem("deviceToken", response.data.token);
        localStorage.setItem(
          "deviceData",
          JSON.stringify(response.data.device)
        );
        navigate("/", {
          state: { message: response.data.message },
        });
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setError(
        error.response?.data?.error || "Registration failed, please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center w-full h-screen bg-gray-50 p-8 pb-0">
      <div className="flex w-full m-4 mb-0 p-4 h-2/3 bg-inhirit rounded-lg shadow-lg overflow-hidden">
        {/* Left Section */}
        <div className="flex flex-col justify-center w-1/2 p-2 bg-inherit items-center rounded-md">
          <h1 className="text-4xl font-bold mb-4 text-blue-800">
            AI Exam Proctoring System
          </h1>
        </div>

        {/* Right Section - Register Form */}
        <div className="w-1/2 p-8 bg-white rounded-md lg:m-8 shadow-md shadow-sky-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center mb-6">
              Register Device
            </h2>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="center_id" className="text-gray-400">
                Center
              </label>
              <select
                name="center_id"
                value={formData.center_id}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Center</option>
                {centers.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.center_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="device_number" className="text-gray-400">
                Device Number
              </label>
              <input
                type="number"
                name="device_number"
                value={formData.device_number}
                onChange={handleChange}
                placeholder="Enter device number"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="room_number" className="text-gray-400">
                Room Number
              </label>
              <input
                type="text"
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                placeholder="Enter room number"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-1/3 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                type="submit"
                className="w-1/3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
