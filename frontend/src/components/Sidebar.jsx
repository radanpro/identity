import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import {
  FaHome,
  FaUser,
  FaVectorSquare,
  FaCamera,
  FaBell,
  FaCube,
  FaTools,
  FaDesktop,
  FaClipboardList,
  // FaUserPlus,
  FaUniversity,
  FaSchool,
  FaUsers,
  FaBook,
  // FaGraduationCap,
} from "react-icons/fa";
import { useEffect } from "react";
import { isUserLoggedIn, validateDeviceToken } from "../utils/auth";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegisterIn, setIsRegisterIn] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    async function checkAuth() {
      const deviceValid = await validateDeviceToken();
      const userLogged = isUserLoggedIn();
      setIsLoggedIn(userLogged);
      setIsRegisterIn(deviceValid);
    }

    checkAuth();
    // sessionStorage.setItem("userToken", tokenFromAPI);
  }, []);

  const toggleMenu = (menuKey) => {
    setOpenMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  // تعريف عناصر القائمة الرئيسية كمصفوفة من الكائنات
  const mainNav = [
    isLoggedIn
      ? { label: "Dashboard", to: "/dashboard", icon: <FaHome /> }
      : null,
    isLoggedIn
      ? { label: "Users", to: "/users/index", icon: <FaUsers /> }
      : null,
    isLoggedIn
      ? { label: "Vectors", to: "/vectors", icon: <FaVectorSquare /> }
      : null,
    isRegisterIn
      ? { label: "Search Real Time", to: "/", icon: <FaCamera /> }
      : null,
    isRegisterIn
      ? {
          label: "Identity Verification",
          to: "/identity-verification",
          icon: <FaCamera />,
        }
      : null,
  ].filter(Boolean);

  const universityGroup = {
    group: "University",
    items: [
      isLoggedIn
        ? { label: "Student", to: "/students", icon: <FaUser /> }
        : null,
      isLoggedIn
        ? { label: "Exams", to: "/newexam/index", icon: <FaClipboardList /> }
        : null,
      isLoggedIn
        ? { label: "Colleges", to: "/college/index", icon: <FaUniversity /> }
        : null,
      isLoggedIn
        ? { label: "Centers", to: "/centers/index", icon: <FaSchool /> }
        : null,
      isLoggedIn
        ? { label: "Courses", to: "/courses/index", icon: <FaBook /> }
        : null,
      isLoggedIn
        ? { label: "Levels", to: "/levels/index", icon: <FaBook /> }
        : null,
      isLoggedIn
        ? { label: "Semesters", to: "/semesters/index", icon: <FaBook /> }
        : null,
      isLoggedIn
        ? { label: "Years", to: "/years/index", icon: <FaBook /> }
        : null,
    ].filter(Boolean),
  };
  const modelsGroup = {
    group: "Models",
    items: [
      isLoggedIn
        ? {
            label: "Alerts Types",
            to: "/alertsType/alert-list",
            icon: <FaBell />,
          }
        : null,
      isLoggedIn
        ? { label: "Alerts agent", to: "/alerts/alert-list", icon: <FaBell /> }
        : null,
      isLoggedIn
        ? { label: "Models", to: "/models-list", icon: <FaCube /> }
        : null,
      isLoggedIn
        ? { label: "Control Model", to: "/control-model", icon: <FaTools /> }
        : null,
      { label: "Monitor Model", to: "/monitoring-model", icon: <FaDesktop /> },
    ].filter(Boolean),
  };

  const devicesGroup = {
    group: "Devices and Users",
    items: [
      isLoggedIn
        ? {
            label: "Device List",
            to: "/devices/index",
            icon: <FaClipboardList />,
          }
        : null,
      // {
      //   label: "Register Device",
      //   to: "/devices/register",
      //   icon: <FaUserPlus />,
      // },
    ].filter(Boolean),
  };

  // دالة للتحقق من حالة التفعيل بناءً على المسار الحالي
  const getLinkClasses = (to) =>
    `block p-2 rounded-lg ${
      location.pathname === to ? "bg-blue-600 text-white" : "text-gray-700"
    }`;

  return (
    <aside
      className={`w-64 bg-gray-100 p-4 h-screen rounded-lg shadow-lg transform transition-transform duration-300 fixed ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 z-50`}
    >
      <div className="text-2xl font-bold mb-8">AI Exam</div>
      <button
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 text-gray-700 hover:text-gray-900"
      >
        ✕
      </button>
      <div className="overflow-y-auto h-[80%] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300">
        <nav className="space-y-4">
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 rounded-lg ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-700"
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        {/* مجموعة University */}
        {universityGroup.items.length ? (
          <div className="border-t-2 border-sky-300 mt-4 pt-2">
            {/* عنوان المجموعة لا يتغير لونه عند تفعيل أحد الأبناء */}
            <button
              onClick={() => toggleMenu("university")}
              className="flex items-center gap-2 w-full p-2 rounded-lg text-gray-700 focus:outline-none"
            >
              <FaUniversity />
              <span>{universityGroup.group}</span>
            </button>
            {openMenus["university"] && (
              <div className="pl-4 space-y-2">
                {universityGroup.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 p-2 rounded-lg ${
                        isActive ? "bg-blue-600 text-white" : "text-gray-700"
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ) : null}
        {/* قسم النماذج */}
        <div className="border-t-2 border-sky-300 mt-4 pt-2">
          <p className="text-gray-400 text-center p-3">{modelsGroup.group}</p>
          {modelsGroup.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={getLinkClasses(item.to)}
            >
              <div className="flex items-center gap-2">
                {item.icon}
                <span>{item.label}</span>
              </div>
            </NavLink>
          ))}
        </div>

        {/* قسم الأجهزة والمستخدمين */}
        {devicesGroup.items.length ? (
          <div className="border-t-2 border-sky-300 mt-4 pt-2">
            {/* <p className="text-gray-400 text-center p-3">{devicesGroup.group}</p> */}
            <button
              onClick={() => toggleMenu("DevicesAndUsers")}
              className="flex items-center gap-2 w-full p-2 rounded-lg text-gray-700 focus:outline-none"
            >
              <FaDesktop />
              <span>{devicesGroup.group}</span>
            </button>
            {openMenus["DevicesAndUsers"] && (
              <div className="pl-4 space-y-2">
                {devicesGroup.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 p-2 rounded-lg ${
                        isActive ? "bg-blue-600 text-white" : "text-gray-700"
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
      {isLoggedIn && (
        <div className="border-t-2 border-red-300 mt-4 pt-2">
          <NavLink
            to="/users/logout"
            className="flex items-center gap-2 p-2 rounded-lg text-red-600 hover:bg-red-100"
          >
            <FaUser />
            <span>تسجيل الخروج</span>
          </NavLink>
        </div>
      )}
    </aside>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;
