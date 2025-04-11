import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import PopupMessage from "../components/PopupMessage"; // ✅ تأكد من مسار المكون

const MainLayout = () => {
  const [serverError, setServerError] = useState(false);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch("http://127.0.0.1:3000/api/ping"); // ✅ عدّل هذا المسار حسب السيرفر عندك
        if (!res.ok) throw new Error("Server is down");
        setServerError(false);
      } catch (error) {
        setServerError(true);
        console.log(error);
      }
    };

    checkServer();

    // ⏳ يمكن إضافة إعادة المحاولة كل فترة (اختياري):
    // const interval = setInterval(checkServer, 30000);
    // return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      {/* ✅ تنبيه عند وجود خطأ في الاتصال بالسيرفر */}
      {serverError && (
        <div className="absolute top-4  transform -translate-x-1/2 z-50 right-0">
          <PopupMessage
            message="فشل الاتصال بالخادم. يرجى التحقق من الشبكة أو المحاولة لاحقًا."
            type="error"
            onClose={() => setServerError(false)}
            duration={8000}
          />
        </div>
      )}

      {/* محتوى الصفحات مثل تسجيل الدخول وإنشاء الحساب */}
      <main className="w-full sm-max-w-md p-6 bg-white rounded-2xl shadow-md">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
