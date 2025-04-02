import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../components/Header";
import PropTypes from "prop-types";

const CollegeForm = ({ isLoggedIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const { collegeId } = useParams();
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    college_id: "",
    name: "",
  });
  const hasLogged = useRef(false);

  useEffect(() => {
    if (collegeId && !hasLogged.current) {
      console.log("collegeId", collegeId);
      hasLogged.current = true;
      setIsEdit(true);
      const fetchCollege = async () => {
        try {
          const response = await axios.get(
            `http://127.0.0.1:3000/api/academic/colleges/${collegeId}`
          );
          if (response.status === 200) {
            setFormData(response.data);
          }
        } catch (error) {
          console.error("فشل في جلب بيانات الكلية", error);
        }
      };
      fetchCollege();
    }
  }, [collegeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // التأكد من ملء جميع الحقول
    if (!formData.name) {
      alert("من فضلك قم بملء جميع الحقول");
      return;
    }

    try {
      if (isEdit) {
        // وضع التعديل: تحديث بيانات الاختبار باستخدام PUT
        await axios.put(
          `http://127.0.0.1:3000/api/academic/colleges/${formData.college_id}`,
          formData
        );
        navigate("/college/index", {
          state: { message: "تم تحديث كلية بنجاح!" },
        });
      } else {
        await axios.post(
          "http://127.0.0.1:3000/api/academic/colleges/",
          formData
        );
        navigate("/college/index", {
          state: { message: "تم إضافة كلية بنجاح!" },
        });
      }
    } catch (error) {
      console.error("خطأ أثناء إرسال البيانات:", error);
      if (error.response) {
        alert(`خطأ: ${error.response.data.detail}`);
      } else {
        alert("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  return (
    <div className="flex-col">
      <Header
        page={isEdit ? "تعديل كلية" : "إضافة كلية"}
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
      />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isEdit ? "تعديل كلية" : "إضافة كلية  جديد"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="اسم الكلية "
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
            >
              رجوع
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
            >
              {isEdit ? "تحديث كلية" : "إضافة كلية"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CollegeForm.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};

export default CollegeForm;
