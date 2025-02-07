import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      {/* محتوى الصفحات مثل تسجيل الدخول وإنشاء الحساب */}
      <main className="w-full sm-max-w-md p-6 bg-white rounded-2xl shadow-md">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
