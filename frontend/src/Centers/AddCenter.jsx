import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../components/Header";
import PropTypes from "prop-types";

const CenterForm = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const { centerId } = useParams();
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    center_name: "",
    status: 0,
  });
  const hasLogged = useRef(false);

  useEffect(() => {
    if (centerId && !hasLogged.current) {
      hasLogged.current = true;
      setIsEdit(true);
      const fetchCenter = async () => {
        try {
          const response = await axios.get(
            `http://127.0.0.1:3000/centers/${centerId}`
          );
          if (response.status === 200) {
            setFormData(response.data);
          }
        } catch (error) {
          console.error("فشل في جلب بيانات المركز", error);
        }
      };

      fetchCenter();
    }
  }, [centerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({ ...prev, status: parseInt(e.target.value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // التأكد من ملء جميع الحقول المطلوبة
    if (!formData.center_name) {
      alert("من فضلك قم بملء جميع الحقول المطلوبة");
      return;
    }

    try {
      if (isEdit) {
        // وضع التعديل: تحديث بيانات المركز
        await axios.put(
          `http://127.0.0.1:3000/centers/${formData.id}`,
          formData
        );
        navigate("/centers/index", {
          state: { message: "تم تحديث المركز بنجاح!" },
        });
      } else {
        await axios.post("http://127.0.0.1:3000/centers", formData);
        navigate("/centers/index", {
          state: { message: "تم إضافة المركز بنجاح!" },
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
        page={isEdit ? "تعديل مركز" : "إضافة مركز"}
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div className="flex  justify-center w-full h-screen bg-gray-50 p-8 pb-0">
        <div className="flex w-full m-4 mb-0 p-4 h-2/3 bg-inhirit rounded-lg shadow-lg overflow-hidden">
          {/* Left Section */}
          <div className="flex flex-col justify-center w-1/2 p-2 bg-inherit items-center rounded-md">
            <h1 className="text-4xl  mb-4">CENTER</h1>
            <h1 className="text-4xl font-bold mb-4 text-blue-800">
              AI Exam Proctoring System
            </h1>
          </div>
          <div className="w-1/2 p-8 bg-white rounded-md lg:m-8 shadow-md shadow-sky-200 ">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isEdit ? "تعديل مركز" : "إضافة مركز جديد"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المركز
                </label>
                <input
                  type="text"
                  placeholder="اسم المركز"
                  name="center_name"
                  value={formData.center_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  حالة المركز
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleStatusChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>غير نشط</option>
                  <option value={1}>نشط</option>
                </select>
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
                  {isEdit ? "تحديث المركز" : "إضافة المركز"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

CenterForm.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default CenterForm;
