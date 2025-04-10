import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../components/Header";
import PropTypes from "prop-types";

const UserForm = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const { userId } = useParams(); // استخدام username بدلاً من examId
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    user_id: "",
    username: "",
    password: "",
    role: "User", // قيمة افتراضية
  });

  useEffect(() => {
    if (userId) {
      setIsEdit(true);
      const fetchUser = async () => {
        try {
          const response = await axios.get(
            `http://127.0.0.1:3000/users/${userId}`
          );
          if (response.status === 200) {
            setFormData({
              user_id: response.data.id,
              username: response.data.username,
              role: response.data.role,
              password: "",
            });
          }
        } catch (error) {
          console.error("فشل في جلب بيانات المستخدم", error);
        }
      };
      fetchUser();
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // التأكد من ملء جميع الحقول المطلوبة
    if (
      !formData.username ||
      !formData.role ||
      (!isEdit && !formData.password)
    ) {
      alert("من فضلك قم بملء جميع الحقول المطلوبة");
      return;
    }

    try {
      const userData = {
        username: formData.username,
        role: formData.role,
        ...(formData.password && { password: formData.password }), // إرسال كلمة السر فقط إذا كانت موجودة
      };

      if (isEdit) {
        // وضع التعديل: تحديث بيانات المستخدم باستخدام PUT
        console.log(formData.user_id);

        await axios.put(
          `http://127.0.0.1:3000/users/${formData.user_id}`,
          userData
        );
        navigate("/users/index", {
          state: { message: "تم تحديث المستخدم بنجاح!" },
        });
      } else {
        await axios.post("http://127.0.0.1:3000/users", userData);
        navigate("/users/index", {
          state: { message: "تم إضافة المستخدم بنجاح!" },
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
        page={isEdit ? "تعديل المستخدم" : "إضافة مستخدم"}
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div className="flex  justify-center w-full h-screen bg-gray-50 p-8 pb-0">
        <div className="flex w-full m-4 mb-0 p-4 h-2/3 bg-inhirit rounded-lg shadow-lg overflow-hidden">
          {/* Left Section */}
          <div className="flex flex-col justify-center w-1/2 p-2 bg-inherit items-center rounded-md">
            <h1 className="text-4xl font-bold mb-4 text-blue-800">
              AI Exam Proctoring System
            </h1>
          </div>
          {/* Right Section - User Form */}
          <div className="w-1/2 p-8 bg-white rounded-md lg:m-8 shadow-md shadow-sky-200 ">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isEdit ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="اسم المستخدم"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {!isEdit && (
                <input
                  type="password"
                  placeholder="كلمة المرور"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              )}

              {isEdit && (
                <input
                  type="password"
                  placeholder="كلمة المرور الجديدة (اتركها فارغة إذا لم ترغب في التغيير)"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="User">مستخدم عادي</option>
                <option value="Admin">مدير</option>
              </select>

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
                  {isEdit ? "تحديث المستخدم" : "إضافة المستخدم"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

UserForm.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default UserForm;
