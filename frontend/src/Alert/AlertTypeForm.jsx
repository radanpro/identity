import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../components/Header";
import PropTypes from "prop-types";

const AlertTypeForm = ({ isLoggedIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const { typeId } = useParams();
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    type_name: "",
  });

  const hasFetched = useRef(false);

  useEffect(() => {
    if (typeId && !hasFetched.current) {
      hasFetched.current = true;
      setIsEdit(true);
      axios
        .get(`http://127.0.0.1:3000/api/alert-types/${typeId}`)
        .then((res) => {
          if (res.status === 200) {
            setFormData(res.data);
          }
        })
        .catch((err) => {
          console.error("فشل في جلب نوع التنبيه:", err);
          setErrorMessage("حدث خطأ أثناء تحميل البيانات.");
        });
    }
  }, [typeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.type_name || formData.type_name.length < 2) {
      setErrorMessage("الاسم يجب أن يكون على الأقل مكون من حرفين.");
      return;
    }

    try {
      if (isEdit) {
        await axios.put(
          `http://127.0.0.1:3000/api/alert-types/${typeId}`,
          formData
        );
        setSuccessMessage("تم تعديل نوع التنبيه بنجاح!");
      } else {
        await axios.post("http://127.0.0.1:3000/api/alert-types/", formData);
        setSuccessMessage("تم إنشاء نوع التنبيه بنجاح!");
      }

      navigate("/alertsType/alert-list", {
        state: { message: isEdit ? "تم التعديل بنجاح" : "تم الإنشاء بنجاح" },
      });
    } catch (error) {
      console.error("خطأ أثناء إرسال البيانات:", error);
      if (error.response) {
        setErrorMessage(
          `خطأ: ${error.response.data.error || error.response.data.detail}`
        );
      } else {
        setErrorMessage("حدث خطأ غير متوقع. حاول لاحقًا.");
      }
    }
  };
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  return (
    <div className="flex-col">
      <Header
        page={isEdit ? "تعديل نوع تنبيه" : "إضافة نوع تنبيه"}
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
      />

      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isEdit ? "تعديل نوع التنبيه" : "إضافة نوع تنبيه جديد"}
        </h2>
        {successMessage && (
          <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-md">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم نوع التنبيه
            </label>
            <input
              type="text"
              name="type_name"
              placeholder="مثال: Cheating Attempt"
              value={formData.type_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            >
              رجوع
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              {isEdit ? "تحديث" : "إنشاء"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AlertTypeForm.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};

export default AlertTypeForm;
