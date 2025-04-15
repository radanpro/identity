import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import CameraCaptureOnly from "../components/CameraCaptureOnly";
import Header from "../components/Header";
import { Button } from "../shared/Button";
import PropTypes from "prop-types";

const EditStudent = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const { id } = useParams();
  const [number, setRegistrationNumber] = useState("");
  const [studentId, setstudentId] = useState("");
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [level, setLevel] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [gender, setGender] = useState(0);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [levels, setLevels] = useState([]);
  const [majors, setMajors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:3000/students/search?number=${id}`
        );
        const student = response.data[0];
        console.log(student);

        if (student) {
          console.log(student);
          setstudentId(student[0]);
          setName(student[1]);
          setRegistrationNumber(student[2]);
          setCollege(student[3]);
          setSpecialization(student[4]);
          setLevel(student[5]);
          setGender(student[6]);
          setImageUrl(student[7]); // رابط الصورة
        }
      } catch {
        alert("فشل في تحميل بيانات الطالب");
      }
    };

    fetchStudentData();
  }, [id]);

  useEffect(() => {
    const fetchColleges = async () => {
      const response = await axios.get(
        "http://127.0.0.1:3000/api/academic/colleges/"
      );
      setColleges(response.data);
    };
    fetchColleges();
  }, []);

  useEffect(() => {
    const fetchLevels = async () => {
      const response = await axios.get(
        "http://127.0.0.1:3000/api/academic/levels/"
      );
      setLevels(response.data);
    };
    fetchLevels();
  }, []);

  useEffect(() => {
    const fetchMajors = async () => {
      if (college) {
        const response = await axios.get(
          `http://127.0.0.1:3000/api/academic/majors/college/${college}`
        );
        setMajors(response.data);
        // console.log("majors", response.data);
      } else {
        setMajors([]);
      }
    };
    fetchMajors();
  }, [college]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!number || !name || !college || !level || !specialization) {
      alert("يرجى ملء جميع الحقول");
      return;
    }

    const formData = new FormData();
    formData.append("StudentName", name);
    formData.append("Number", number);
    formData.append("College", college);
    formData.append("Level", level);
    formData.append("Specialization", specialization);
    formData.append("Gender", gender);
    if (image) formData.append("image", image);

    try {
      await axios.put(`http://127.0.0.1:3000/students/${studentId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/students", {
        state: { message: "تم تحديث بيانات الطالب بنجاح" },
      });
    } catch (error) {
      alert(error.response ? error.response.data.detail : "حدث خطأ غير متوقع");
    }
  };

  const handleCapturedImage = (capturedData) => {
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
    }
  };

  return (
    <div className="flex-col">
      <Header
        page="edit-student"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div className="flex justify-center w-full h-fit bg-gray-50 p-8 pb-0">
        <div className="flex w-full m-4 mb-0 p-4 bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Left Section */}
          <div className="flex flex-col justify-center w-1/2 p-6 items-center bg-gradient-to-b from-blue-100 to-white rounded-md shadow-inner">
            <h1 className="text-4xl font-bold text-blue-800 mb-8">
              AI Exam Proctoring System
            </h1>

            <div
              className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg border border-blue-100"
              dir="rtl"
            >
              <h3 className="text-xl font-semibold text-blue-700 border-b pb-3 mb-5 text-right">
                بيانات الطالب الحالية
              </h3>

              <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-gray-800 text-sm">
                <div className="font-medium text-gray-600 text-right">
                  الرقم الجامعي:
                </div>
                <div className="font-semibold text-left">{number || "—"}</div>

                <div className="font-medium text-gray-600 text-right">
                  الاسم:
                </div>
                <div className="font-semibold text-left">{name || "—"}</div>

                <div className="font-medium text-gray-600 text-right">
                  الكلية:
                </div>
                <div className="font-semibold text-left">{college || "—"}</div>

                <div className="font-medium text-gray-600 text-right">
                  المستوى:
                </div>
                <div className="font-semibold text-left">
                  {levels.find((l) => l.level_id === parseInt(level))
                    ?.level_name || "—"}
                </div>

                <div className="font-medium text-gray-600 text-right">
                  التخصص:
                </div>
                <div className="font-semibold text-left">
                  {majors.find((m) => m.major_id === parseInt(specialization))
                    ?.name || "—"}
                </div>

                <div className="font-medium text-gray-600 text-right">
                  الجنس:
                </div>
                <div className="font-semibold text-left">
                  {gender === 1 ? "ذكر" : "أنثى"}
                </div>
              </div>

              {imageUrl && (
                <div className="mt-6 text-center">
                  <p className="text-gray-600 font-medium mb-2">
                    الصورة الحالية:
                  </p>
                  <img
                    src={`http://127.0.0.1:3000/static/${imageUrl}`}
                    alt="Student"
                    className="mx-auto h-32 rounded-md border border-gray-200 shadow-md"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Edit Form */}
          <div className="w-1/2 p-8 bg-white rounded-md lg:m-8 shadow-md shadow-sky-200">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
              Edit Student
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={number}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Registration Number"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Student Name"
              />

              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select College</option>
                {colleges.map((col) => (
                  <option key={col.college_id} value={col.college_id}>
                    {col.name}
                  </option>
                ))}
              </select>

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Level</option>
                {levels.map((lev) => (
                  <option key={lev.id} value={lev.id}>
                    {lev.level_name}
                  </option>
                ))}
              </select>

              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Female</option>
                <option value={1}>Male</option>
              </select>

              {!imageUrl && (
                <div className="flex gap-4 mb-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setUseCamera(false);
                      setImage(null);
                    }}
                    className={`w-1/2 ${
                      !useCamera ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  >
                    Choose Image
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setUseCamera(true);
                      setImage(null);
                    }}
                    className={`w-1/2 ${
                      useCamera ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  >
                    Use Camera
                  </Button>
                </div>
              )}

              {imageUrl && !image && (
                <div className="text-center">
                  <img
                    src={`http://127.0.0.1:3000/static/${imageUrl}`}
                    alt="Student"
                    className="mx-auto h-40 mb-2 rounded shadow"
                  />
                  <Button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="bg-yellow-400"
                  >
                    تعديل الصورة
                  </Button>
                </div>
              )}

              {!imageUrl && !useCamera && (
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="w-full px-4 py-2 border rounded-md"
                />
              )}

              {!imageUrl && useCamera && (
                <CameraCaptureOnly setCapturedImage={handleCapturedImage} />
              )}
              <div className="w-full space-x-3 flex justify-center mt-4">
                <button
                  type="submit"
                  className="w-1/3 relative items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-blue-400 hover:bg-gray-300"
                >
                  Update Student
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

EditStudent.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default EditStudent;
