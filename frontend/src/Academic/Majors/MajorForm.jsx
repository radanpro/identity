import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../../components/Header";
import PropTypes from "prop-types";

const MajorForm = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const { college_id, major_id } = useParams();
  const [isEdit, setIsEdit] = useState(false);
  const [collegeName, setCollegeName] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    college_id: college_id,
  });

  useEffect(() => {
    // جلب اسم الكلية
    const fetchCollegeName = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:3000/api/academic/colleges/${college_id}`
        );
        setCollegeName(response.data.name);
      } catch (error) {
        console.error("فشل في جلب بيانات الكلية", error);
      }
    };

    fetchCollegeName();

    if (major_id) {
      setIsEdit(true);
      const fetchMajor = async () => {
        try {
          const response = await axios.get(
            `http://127.0.0.1:3000/api/academic/majors/${major_id}`
          );
          if (response.status === 200) {
            setFormData({
              name: response.data.name,
              college_id: response.data.college_id,
            });
          }
        } catch (error) {
          console.error("فشل في جلب بيانات التخصص", error);
        }
      };
      fetchMajor();
    }
  }, [college_id, major_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert("من فضلك أدخل اسم التخصص");
      return;
    }

    try {
      if (isEdit) {
        await axios.put(
          `http://127.0.0.1:3000/api/academic/majors/${major_id}`,
          formData
        );
        navigate(`/academic/majors/college/${college_id}`, {
          state: { message: "تم تحديث التخصص بنجاح!" },
        });
      } else {
        await axios.post(
          "http://127.0.0.1:3000/api/academic/majors/",
          formData
        );
        navigate(`/academic/majors/college/${college_id}`, {
          state: { message: "تم إضافة التخصص بنجاح!" },
        });
      }
    } catch (error) {
      console.error("خطأ أثناء إرسال البيانات:", error);
      if (error.response) {
        if (error.response.status === 409) {
          alert("هذا التخصص موجود بالفعل في هذه الكلية!");
        } else if (error.response.status === 404) {
          alert("الكلية غير موجودة!");
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
        page={isEdit ? "تعديل التخصص" : `إضافة تخصص لـ ${collegeName}`}
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isEdit ? "تعديل التخصص" : "إضافة تخصص جديد"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم التخصص
            </label>
            <input
              type="text"
              placeholder="أدخل اسم التخصص"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate(`/academic/majors/college/${college_id}`)}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300"
            >
              رجوع
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
            >
              {isEdit ? "تحديث التخصص" : "إضافة التخصص"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

MajorForm.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default MajorForm;
