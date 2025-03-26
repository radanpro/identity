import { useState } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import CameraCaptureOnly from "../components/CameraCaptureOnly";
import Header from "../components/Header";
import PropTypes from "prop-types";

const AddExam = ({ isLoggedIn }) => {
  const [number, setRegistrationNumber] = useState("");
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [level, setLevel] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [image, setImage] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const navigate = useNavigate();
  const { onToggleSidebar } = useOutletContext();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!number || !name || !college || !level || !specialization || !image) {
      alert("من فضلك قم بملء جميع الحقول");
      return;
    }

    const formData = new FormData();
    formData.append("number", number);
    formData.append("name", name);
    formData.append("college", college);
    formData.append("level", level);
    formData.append("specialization", specialization);
    formData.append("image_file", image);

    try {
      await axios.post("http://localhost:8000/api/add_student", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/students", {
        state: { message: "Student added successfully!" },
      });
    } catch (error) {
      if (error.response) {
        alert(`Error: ${error.response.data.detail}`);
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleCameraToggle = () => {
    setUseCamera(!useCamera);
    setImage(null); // إعادة تعيين الصورة عند تغيير الخيار
  };

  const handleCapturedImage = (capturedData) => {
    // التحقق مما إذا كانت البيانات Base64 وتحويلها إلى ملف
    if (capturedData.startsWith("data:image")) {
      const byteString = atob(capturedData.split(",")[1]);
      const mimeString = capturedData.split(",")[0].split(":")[1].split(";")[0];
      const arrayBuffer = new Uint8Array(byteString.length);

      for (let i = 0; i < byteString.length; i++) {
        arrayBuffer[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([arrayBuffer], { type: mimeString });
      const file = new File([blob], "captured_image.jpg", { type: mimeString });
      setImage(file);
    } else {
      alert("Invalid image format received from the camera.");
    }
  };

  return (
    <div className="flex-col">
      <Header
        page="Dashboard"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
      />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Add New Student</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Registration Number"
            value={number}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Student Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="College"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={handleCameraToggle}
              className={`w-1/2 p-2 rounded ${
                !useCamera ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Choose Image
            </button>
            <button
              type="button"
              onClick={handleCameraToggle}
              className={`w-1/2 p-2 rounded ${
                useCamera ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Use Camera
            </button>
          </div>

          {!useCamera && (
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          {useCamera && (
            <CameraCaptureOnly setCapturedImage={handleCapturedImage} />
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Add Student
          </button>
        </form>
      </div>
    </div>
  );
};
AddExam.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};

export default AddExam;
