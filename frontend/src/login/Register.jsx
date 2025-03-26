import { useState, useEffect } from "react";
import axios from "axios";

const Register = () => {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [colleges, setColleges] = useState([]); // For the dropdown
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch the list of colleges from the API on component mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/colleges");
        setColleges(response.data);
      } catch (error) {
        console.error("Failed to fetch colleges:", error);
      }
    };

    fetchColleges();
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // Use FormData to send text fields + file
      const formData = new FormData();
      formData.append("name", name);
      formData.append("number", number);
      formData.append("college_id", collegeId);
      formData.append("gender", gender);
      formData.append("password", password);
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await axios.post(
        "http://localhost:5000/api/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(response.data.message);
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed, please try again.");
    }
  };

  return (
    <div className="flex justify-center w-full h-screen bg-gray-50 p-8 pb-0">
      <div className="flex w-full m-4 mb-0 p-4 bg-inherit rounded-lg shadow-lg overflow-hidden">
        {/* Left Section */}
        <div className="flex flex-col justify-center w-1/2 p-2 bg-inherit items-center rounded-md">
          <h1 className="text-4xl font-bold mb-4 text-blue-800">
            AI Exam Proctoring System
          </h1>
        </div>

        {/* Right Section - Register Form */}
        <div className="w-1/2 p-8 bg-white rounded-md lg:m-8 shadow-md shadow-sky-200">
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center mb-6">Sign Up</h2>

            {/* Name */}
            <div>
              <label htmlFor="name" className="text-gray-400">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Number */}
            <div>
              <label htmlFor="number" className="text-gray-400">
                Number
              </label>
              <input
                id="number"
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* College Dropdown */}
            <div>
              <label htmlFor="collegeId" className="text-gray-400">
                College
              </label>
              <select
                id="collegeId"
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select College</option>
                {colleges.map((college) => (
                  <option key={college._id} value={college._id}>
                    {college.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="text-gray-400">
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="1">Male</option>
                <option value="2">Female</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-gray-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="text-gray-400">
                Profile Image
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gray-600 text-white rounded-lg lg:mt-4 hover:bg-blue-400 transition-colors"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
