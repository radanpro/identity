import { useState } from "react";
import axios from "axios";
import Header from "../../components/Header";
import {
  useOutletContext,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import PropTypes from "prop-types";

const EditVector = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vectorId = searchParams.get("id");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleImageChange = (e) => setImage(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vectorId || !image) {
      setMessage("❗ يرجى إدخال رقم المتجه واختيار صورة.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.put(
        `http://127.0.0.1:3000/vectors/vectors/update-vector/${vectorId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMessage(
        response.status === 200
          ? "✅ تم تحديث المتجه بنجاح."
          : "⚠️ فشل في تحديث المتجه."
      );
    } catch (error) {
      console.error("خطأ أثناء التحديث:", error);
      setMessage("❌ حدث خطأ أثناء التحديث.");
    }
  };

  return (
    <div className="flex-col">
      <Header
        page="تحديث متجه"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />

      <div className="flex justify-center w-full h-screen bg-gray-50 p-8 pb-0">
        <div className="flex w-full m-4 mb-0 p-4 h-2/3 bg-inherit rounded-lg shadow-lg overflow-hidden">
          {/* Left Info Section */}
          <div className="flex flex-col justify-center w-1/2 p-2 bg-inherit items-center rounded-md">
            <h1 className="text-4xl mb-4">VECTOR</h1>
            <h1 className="text-4xl font-bold mb-4 text-blue-800">
              AI Exam Proctoring System
            </h1>
          </div>

          {/* Right Form Section */}
          <div className="w-1/2 p-8 bg-white rounded-md lg:m-8 shadow-md shadow-sky-200">
            <h2 className="text-2xl font-bold mb-6 text-center">
              تحديث بيانات المتجه
            </h2>

            {message && (
              <div className="mb-4 p-3 rounded-md bg-blue-100 text-blue-800 text-center">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم المتجه (ID)
                </label>
                <input
                  type="number"
                  value={vectorId || ""}
                  className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  readOnly
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اختيار صورة جديدة
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border rounded-md"
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
                  تحديث المتجه
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

EditVector.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default EditVector;
