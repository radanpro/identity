import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../../components/Header";
import PropTypes from "prop-types";

const LevelForm = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const { levelId } = useParams();
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    level_name: "",
  });

  useEffect(() => {
    if (levelId) {
      setIsEdit(true);
      const fetchLevel = async () => {
        try {
          const response = await axios.get(
            `http://127.0.0.1:3000/api/academic/levels/${levelId}`
          );
          if (response.status === 200) {
            setFormData({
              level_name: response.data.level_name,
            });
          }
        } catch (error) {
          console.error("فشل في جلب بيانات المستوى", error);
        }
      };
      fetchLevel();
    }
  }, [levelId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.level_name) {
      alert("من فضلك أدخل اسم المستوى");
      return;
    }

    try {
      if (isEdit) {
        await axios.put(
          `http://127.0.0.1:3000/api/academic/levels/${levelId}`,
          {
            level_name: formData.level_name,
          }
        );
        navigate("/levels/index", {
          state: { message: "تم تحديث المستوى بنجاح!" },
        });
      } else {
        await axios.post("http://127.0.0.1:3000/api/academic/levels/", {
          level_name: formData.level_name,
        });
        navigate("/levels/index", {
          state: { message: "تم إضافة المستوى بنجاح!" },
        });
      }
    } catch (error) {
      console.error("خطأ أثناء إرسال البيانات:", error);
      if (error.response) {
        alert(
          `خطأ: ${error.response.data.detail || error.response.data.message}`
        );
      } else {
        alert("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  return (
    <div className="flex-col">
      <Header
        page={isEdit ? "تعديل المستوى" : "إضافة مستوى"}
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isEdit ? "تعديل المستوى" : "إضافة مستوى جديد"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم المستوى
            </label>
            <input
              type="text"
              placeholder="أدخل اسم المستوى"
              name="level_name"
              value={formData.level_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-between pt-4">
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
              {isEdit ? "تحديث المستوى" : "إضافة المستوى"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

LevelForm.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default LevelForm;
