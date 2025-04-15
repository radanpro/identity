import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router-dom";
import CameraCaptureOnly from "../components/CameraCaptureOnly";
import Header from "../components/Header";
import { Button } from "../shared/Button"; // استيراد مكون Button
import PropTypes from "prop-types";

const AddStudent = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const [number, setRegistrationNumber] = useState("");
  const [name, setName] = useState("");

  // تغيير حالة الكلية والمستوى والتخصص لتخزين الـ id المُختار
  const [college, setCollege] = useState("");
  const [level, setLevel] = useState("");
  const [specialization, setSpecialization] = useState("");

  const [gender, setGender] = useState(0); // 0 for female, 1 for male
  const [image, setImage] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [levels, setLevels] = useState([]);
  const [majors, setMajors] = useState([]);
  const navigate = useNavigate();

  // جلب بيانات الكليات عند تحميل الصفحة
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:3000/api/academic/colleges/"
        );
        setColleges(response.data);
      } catch (error) {
        console.error("Error fetching colleges:", error);
      }
    };
    fetchColleges();
  }, []);

  // جلب بيانات المستويات عند تحميل الصفحة
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:3000/api/academic/levels/"
        );
        setLevels(response.data);
      } catch (error) {
        console.error("Error fetching levels:", error);
      }
    };
    fetchLevels();
  }, []);

  // جلب بيانات التخصصات بناءً على الكلية المحددة
  useEffect(() => {
    const fetchMajors = async () => {
      if (college) {
        try {
          const response = await axios.get(
            `http://127.0.0.1:3000/api/academic/majors/college/${college}`
          );
          setMajors(response.data);
        } catch (error) {
          console.error("Error fetching majors:", error);
          setMajors([]);
        }
      } else {
        setMajors([]);
      }
    };
    fetchMajors();
  }, [college]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!number || !name || !college || !level || !specialization || !image) {
      alert("من فضلك قم بملء جميع الحقول");
      return;
    }

    const formData = new FormData();
    formData.append("StudentName", name);
    formData.append("Number", number);
    formData.append("College", college);
    formData.append("Level", level);
    formData.append("Specialization", specialization);
    formData.append("Gender", gender);
    formData.append("image", image); // تأكد من أن الاسم يتوافق مع ما يتوقعه الخادم

    try {
      await axios.post("http://127.0.0.1:3000/students/add", formData, {
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

  // دوال التبديل بين اختيار رفع صورة واستخدام الكاميرا
  const handleUseUploadImage = () => {
    setUseCamera(false);
    setImage(null);
  };

  const handleUseCamera = () => {
    setUseCamera(true);
    setImage(null);
  };

  const handleCapturedImage = (capturedData) => {
    // التحقق مما إذا كانت البيانات بصيغة Base64 وتحويلها إلى ملف
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
        page="add-student"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div className="flex justify-center w-full h-fit bg-gray-50 p-8 pb-0">
        <div className="flex w-full m-4 mb-0 p-4 bg-inhirit rounded-lg shadow-lg overflow-hidden">
          {/* Left Section */}
          <div className="flex flex-col justify-center w-1/2 p-2 bg-inherit items-center rounded-md">
            <h1 className="text-4xl font-bold mb-4 text-blue-800">
              AI Exam Proctoring System
            </h1>
          </div>
          {/* Right Section - Add Student Form */}
          <div className="w-1/2 p-8 bg-white rounded-md lg:m-8 shadow-md shadow-sky-200">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Add New Student
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Registration Number"
                value={number}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Student Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* قائمة الكليات */}
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select College</option>
                {colleges.map((col) => (
                  <option key={col.college_id} value={col.college_id}>
                    {col.name}
                  </option>
                ))}
              </select>

              {/* قائمة المستويات */}
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Level</option>
                {levels.map((lev) => (
                  <option key={lev.level_id} value={lev.level_id}>
                    {lev.level_name}
                  </option>
                ))}
              </select>

              {/* قائمة التخصصات */}
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Specialization</option>
                {majors.map((maj) => (
                  <option key={maj.id} value={maj.id}>
                    {maj.name}
                  </option>
                ))}
              </select>

              <select
                value={gender}
                onChange={(e) => setGender(parseInt(e.target.value))}
                className="w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Female</option>
                <option value={1}>Male</option>
              </select>

              <div className="flex gap-4 mb-4">
                <Button
                  type="button"
                  onClick={handleUseUploadImage}
                  className={`w-1/2 ${
                    !useCamera ? "bg-blue-500" : "bg-gray-200"
                  }`}
                >
                  Choose Image
                </Button>
                <Button
                  type="button"
                  onClick={handleUseCamera}
                  className={`w-1/2 ${
                    useCamera ? "bg-blue-500" : "bg-gray-200"
                  }`}
                >
                  Use Camera
                </Button>
              </div>

              {!useCamera && (
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 relative inline-flex border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 items-center"
                />
              )}

              {useCamera && (
                <CameraCaptureOnly setCapturedImage={handleCapturedImage} />
              )}

              <div className="w-full space-x-3 flex justify-center mt-4">
                <button
                  type="submit"
                  className="w-1/3 relative items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-blue-400 hover:bg-gray-300"
                >
                  Add Student
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/students")}
                  className="w-1/3 px-6 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

AddStudent.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default AddStudent;
