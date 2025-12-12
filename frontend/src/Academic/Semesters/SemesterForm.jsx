import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../../components/Header";
import PropTypes from "prop-types";

const SemesterForm = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const { semesterId } = useParams();
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    semester_name: "",
  });

  useEffect(() => {
    if (semesterId) {
      setIsEdit(true);
      const fetchSemester = async () => {
        try {
          const response = await axios.get(
            `http://127.0.0.1:3000/api/academic/semesters/${semesterId}`
          );
          if (response.status === 200) {
            setFormData({
              semester_name: response.data.semester_name,
            });
          }
        } catch (error) {
          console.error("فشل في جلب بيانات الفصل الدراسي", error);
        }
      };
      fetchSemester();
    }
  }, [semesterId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.semester_name) {
      alert("من فضلك أدخل اسم الفصل الدراسي");
      return;
    }

    try {
      if (isEdit) {
        await axios.put(
          `http://127.0.0.1:3000/api/academic/semesters/${semesterId}`,
          {
            semester_name: formData.semester_name,
          }
        );
        navigate("/semesters/index", {
          state: { message: "تم تحديث الفصل الدراسي بنجاح!" },
        });
      } else {
        await axios.post("http://127.0.0.1:3000/api/academic/semesters/", {
          semester_name: formData.semester_name,
        });
        navigate("/semesters/index", {
          state: { message: "تم إضافة الفصل الدراسي بنجاح!" },
        });
      }
    } catch (error) {
      console.error("خطأ أثناء إرسال البيانات:", error);
      if (error.response) {
        if (error.response.status === 409) {
          alert("هذا الفصل الدراسي موجود بالفعل!");
        } else {
          alert(
            `خطأ: ${error.response.data.detail || error.response.data.message}`
          );
        }
      } else {
        alert("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  return (
    <div className="flex-col">
      <Header
        page={isEdit ? "تعديل الفصل الدراسي" : "إضافة فصل دراسي"}
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div className="flex  justify-center w-full h-screen bg-gray-50 p-8 pb-0">
        <div className="flex w-full m-4 mb-0 p-4 h-2/3 bg-inhirit rounded-lg shadow-lg overflow-hidden">
          {/* Left Section */}
          <div className="flex flex-col justify-center w-1/2 p-2 bg-inherit items-center rounded-md">
            <h1 className="text-4xl mb-4 ">SEMESTER</h1>
            <h1 className="text-4xl font-bold mb-4 text-blue-800">
              AI Exam Proctoring System
            </h1>
          </div>
          <div className="w-1/2 p-8 bg-white rounded-md lg:m-8 shadow-md shadow-sky-200 ">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isEdit ? "تعديل الفصل الدراسي" : "إضافة فصل دراسي جديد"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الفصل الدراسي
                </label>
                <input
                  type="text"
                  placeholder="أدخل اسم الفصل الدراسي"
                  name="semester_name"
                  value={formData.semester_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-1/2 mx-2 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
                >
                  رجوع
                </button>
                <button
                  type="submit"
                  className="w-1/2 mx-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
                >
                  {isEdit ? "تحديث الفصل" : "إضافة الفصل"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

SemesterForm.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default SemesterForm;
