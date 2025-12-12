// Profile.js
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Automatically load the profile data from the backend in edit mode.
  useEffect(() => {
    const fetchUser = async () => {
      try {
        //   const response = await axios.get("http://localhost:5000/api/profile");
        const response = {};
        response.data = {
          id: 1,
          name: "Ahmed",
          Number: "123456789",
          imagePath:
            "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
          college: {
            id: 1,
            name: "College of Engineering",
          },
          gender: 1,
          status: "Active",
          created_at: "2021-08-01T12:00:00.000Z",
        };

        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUser();
  }, []);

  // Change handlers for text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCollegeChange = (e) => {
    setUser((prev) => ({
      ...prev,
      college: { ...prev.college, name: e.target.value },
    }));
  };

  // Handler for file selection
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Optionally update the preview immediately
      setUser((prev) => ({
        ...prev,
        imagePath: URL.createObjectURL(e.target.files[0]),
      }));
    }
  };

  // Trigger the hidden file input
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Save the updated profile data (including image file if selected)
  const handleSaveClick = async () => {
    try {
      const formData = new FormData();
      for (const key in user) {
        if (key === "college") {
          formData.append("college_id", user.college.id);
          formData.append("college_name", user.college.name);
        } else {
          formData.append(key, user[key]);
        }
      }
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      await axios.put(
        `http://localhost:5000/api/profile/${user.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("Profile updated successfully.");
      navigate("/users/profile"); // After saving, navigate to dashboard
    } catch (error) {
      console.error("Failed to update user profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  // Cancel button navigates back to the dashboard (or previous page)
  const handleCancelClick = () => {
    navigate("/");
  };

  if (!user) {
    return (
      <div className="p-4 bg-white rounded-md shadow-md">
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h2 className="text-3xl font-bold mb-6">Edit Profile</h2>

      <div className="flex flex-col md:flex-row items-center md:items-start">
        {/* Profile Image Section */}
        <div className="md:w-1/3 flex flex-col items-center md:border-r md:pr-6 mb-6 md:mb-0">
          {user.imagePath && (
            <img
              src={user.imagePath}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-full shadow-sm"
            />
          )}
          <button
            onClick={triggerFileInput}
            className="mt-4 text-blue-500 hover:underline"
          >
            Change Photo
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Profile Form Section */}
        <div className="md:w-2/3 md:pl-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium block mb-1" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={user.name || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-medium block mb-1" htmlFor="Number">
                Number
              </label>
              <input
                id="Number"
                type="text"
                name="Number"
                value={user.Number || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-medium block mb-1" htmlFor="college">
                College
              </label>
              <input
                id="college"
                type="text"
                value={user.college?.name || ""}
                onChange={handleCollegeChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-medium block mb-1" htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={user.gender || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Male</option>
                <option value="2">Female</option>
              </select>
            </div>
            <div>
              <label className="font-medium block mb-1" htmlFor="status">
                Status
              </label>
              <input
                id="status"
                type="text"
                name="status"
                value={user.status || ""}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-medium block mb-1" htmlFor="created_at">
                Created At
              </label>
              <input
                id="created_at"
                type="text"
                name="created_at"
                value={user.created_at || ""}
                onChange={handleChange}
                disabled
                className="border border-gray-300 rounded-md p-2 w-full bg-gray-100 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-6">
            <button
              onClick={handleSaveClick}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancelClick}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
