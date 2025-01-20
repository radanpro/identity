import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
