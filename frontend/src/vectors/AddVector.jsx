import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "../shared/Button";

const AddVector = () => {
  const [inputValue, setInputValue] = useState(""); // حالة لحفظ المدخل الحالي
  const [studentIds, setStudentIds] = useState([]); // حالة لحفظ قائمة IDs
  const [message, setMessage] = useState(null); // رسالة النجاح
  const [errorDetails, setErrorDetails] = useState([]); // تفاصيل الأخطاء
  const [loading, setLoading] = useState(false); // حالة التحميل
  const navigate = useNavigate();

  // دالة لإضافة ID عند الضغط على Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // منع إعادة تحميل الصفحة
      const id = parseInt(inputValue.trim());
      if (!isNaN(id)) {
        setStudentIds([...studentIds, id]); // إضافة ID إلى القائمة
        setInputValue(""); // مسح المدخل
        setErrorDetails([]); // مسح رسائل الخطأ
      } else {
        setErrorDetails(["يرجى إدخال رقم صحيح."]);
      }
    }
  };

  // دالة لإرسال البيانات إلى الخادم
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (studentIds.length === 0) {
      setErrorDetails(["يرجى إدخال قائمة صحيحة من Student IDs."]);
      return;
    }

    setLoading(true); // بدء التحميل
    setMessage(null); // مسح الرسائل السابقة
    setErrorDetails([]); // مسح الأخطاء السابقة

    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/api/students-to-vectors",
        studentIds,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);

      // تحقق من حالة الطلب وعرض الرسائل القادمة من الباك اند
      if (response.status === 200) {
        setMessage(response.data.message); // عرض رسالة النجاح من الباك اند
        setErrorDetails([]); // مسح الأخطاء
      }

      // عرض تفاصيل الإخفاقات إذا كانت موجودة
      if (response.data.failure_details?.length > 0) {
        setErrorDetails(
          response.data.failure_details.map(
            (detail) => `Student ID: ${detail.student_id} - ${detail.error}`
          )
        );
      }
    } catch (error) {
      // التعامل مع الأخطاء القادمة من الباك اند
      setErrorDetails([
        error.response?.data?.error || "حدث خطأ أثناء الاتصال بالخادم.",
      ]);
    } finally {
      setLoading(false); // إنهاء التحميل
    }
  };

  // دالة لحذف ID من القائمة
  const handleDeleteId = (idToDelete) => {
    const updatedIds = studentIds.filter((id) => id !== idToDelete);
    setStudentIds(updatedIds);
  };

  return (
    <div className="flex  justify-center w-full h-screen bg-gray-50 p-8 pb-0">
      <div className="flex w-full m-4 mb-0 p-4 h-2/3 bg-inhirit rounded-lg shadow-lg overflow-hidden">
        {/* Left Section */}
        <div className="flex flex-col justify-center w-1/2 p-2 bg-inherit items-center rounded-md">
          <h1 className="text-4xl font-bold mb-4 text-blue-800">
            AI Exam Proctoring System
          </h1>
        </div>
        {/* Right Section - Add Vector Form */}
        <div className="w-1/2 p-8 bg-white rounded-md lg:m-8 shadow-md shadow-sky-200 text-center">
          <h1 className="text-2xl font-bold mb-4">إضافة متجهات جديدة</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="studentIds" className="block text-lg mb-2">
                أدخل Student IDs (اضغط Enter بعد كل ID):
              </label>
              <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md">
                {studentIds.map((id, index) => (
                  <span
                    key={index}
                    className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {id}
                    <button
                      type="button"
                      onClick={() => handleDeleteId(id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  id="studentIds"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 p-1 border-none focus:outline-none"
                  placeholder="أدخل ID واضغط Enter"
                />
              </div>
            </div>

            {/* مؤشر التحميل */}
            {loading && <p>جاري المعالجة...</p>}

            {/* عرض رسائل النجاح */}
            {message && (
              <div className="bg-green-100 text-green-700 p-4 rounded-md">
                <p>{message}</p>
              </div>
            )}

            {/* عرض تفاصيل الأخطاء */}
            {errorDetails.length > 0 && (
              <div className="bg-red-100 text-red-700 p-4 rounded-md">
                <h3 className="font-bold">تفاصيل الأخطاء:</h3>
                <ul className="list-disc list-inside">
                  {errorDetails.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* أزرار الإرسال والعودة */}
            <div className="flex gap-4 justify-center">
              <Button type="submit" className="bg-blue-500 text-black">
                إضافة المتجهات
              </Button>
              <Button
                type="button"
                onClick={() => navigate("/vectors")}
                className="bg-gray-500 text-black"
              >
                العودة إلى القائمة
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVector;
