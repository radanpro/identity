import { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";
import PopupMessage from "./components/PopupMessage"; // ✅ تأكد من مسار المكون

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [serverError, setServerError] = useState(false);
  const intervalRef = useRef(null);
  const [shouldReload, setShouldReload] = useState(false);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch("http://127.0.0.1:3000/api/ping");
        if (!res.ok) throw new Error("Server is down");

        if (serverError) {
          // ✅ السيرفر عاد للعمل
          clearInterval(intervalRef.current);
          setServerError(false);
          setShouldReload(true); // نطلب تحديث الصفحة
        }
      } catch (error) {
        console.log("Server error:", error);
        if (!serverError) {
          setServerError(true);
          intervalRef.current = setInterval(checkServer, 1000);
        }
      }
    };

    checkServer();
    if (serverError) {
      if (shouldReload) {
        const timeout = setTimeout(() => {
          console.log("Reloading page...");
          window.location.reload();
        }, 1000);

        return () => clearTimeout(timeout);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [serverError, shouldReload]);

  // ✅ هذا هو اللي يقوم بالتحديث فعلاً
  useEffect(() => {
    if (shouldReload) {
      const timeout = setTimeout(() => {
        console.log("Reloading page...");
        window.location.reload();
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [shouldReload]);

  // إغلاق الـ Sidebar تلقائيًا عند تصغير الشاشة
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // تعيين الحالة الأولية

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // دالة لتبديل حالة الـ Sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div>
      {/* ✅ تنبيه عند وجود خطأ في الاتصال بالسيرفر */}
      {serverError && (
        <div className="absolute top-16 right-0 transform -translate-x-1/2 z-50">
          <PopupMessage
            message="فشل الاتصال بالخادم. سيتم إعادة المحاولة..."
            type="error"
            onClose={() => setServerError(false)}
            duration={8000}
          />
        </div>
      )}
      {/* Sidebar ثابت */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {/* الـ main مع تعديل لتعويض مساحة الـ Sidebar */}
      <main className="ml-0 lg:ml-64 transition-margin duration-300">
        <Outlet context={{ onToggleSidebar: toggleSidebar }} />
      </main>
    </div>
  );
};

export default Layout;
