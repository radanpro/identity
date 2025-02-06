import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import CameraCaptureOnly from "../components/CameraCaptureOnly";
import Header from "../components/Header";
import { Button } from "../shared/Button"; // استيراد مكون Button

const EditStudent = () => {
  const { onToggleSidebar } = useOutletContext();
  const { id } = useParams(); // الحصول على معرف الطالب من الرابط
  const [number, setRegistrationNumber] = useState("");
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [level, setLevel] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [gender, setGender] = useState(0); // 0 for female, 1 for male
  const [image, setImage] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // جلب بيانات الطالب الحالية عند تحميل المكون
    const fetchStudentData = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:3000/students/${id}`
        );
        const student = response.data;
        setRegistrationNumber(student.Number);
        setName(student.StudentName);
        setCollege(student.College);
        setLevel(student.Level);
        setSpecialization(student.Specialization);
        setGender(student.Gender);
        setImage(student.Image); // قد تحتاج إلى تعديل هذا بناءً على كيفية تخزين الصورة
      } catch {
        alert("Failed to fetch student data.");
      }
    };

    fetchStudentData();
  }, [id]);

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
      await axios.put(`http://127.0.0.1:3000/students/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/students", {
        state: { message: "Student updated successfully!" },
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
      <Header page="edit-student" onToggleSidebar={onToggleSidebar} />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Edit Student</h2>
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
          <select
            value={gender}
            onChange={(e) => setGender(parseInt(e.target.value))}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>Female</option>
            <option value={1}>Male</option>
          </select>

          <div className="flex gap-4 mb-4">
            <Button
              type="button"
              onClick={handleCameraToggle}
              className={`w-1/2 ${!useCamera ? "bg-blue-500" : "bg-gray-200"}`}
            >
              Choose Image
            </Button>
            <Button
              type="button"
              onClick={handleCameraToggle}
              className={`w-1/2 ${useCamera ? "bg-blue-500" : "bg-gray-200"}`}
            >
              Use Camera
            </Button>
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

          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            Update Student
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditStudent;
