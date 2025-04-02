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
  FaUserPlus,
  FaUniversity,
  FaSchool,
  // FaGraduationCap,
} from "react-icons/fa";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  // حالة التحكم للقوائم المنسدلة باستخدام مفتاح العنصر
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menuKey) => {
    setOpenMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  // تعريف عناصر القائمة الرئيسية كمصفوفة من الكائنات
  const mainNav = [
    { label: "Dashboard", to: "/", icon: <FaHome /> },
    { label: "Student", to: "/students", icon: <FaUser /> },
    { label: "Vectors", to: "/vectors", icon: <FaVectorSquare /> },
    { label: "Exams", to: "/exam/index", icon: <FaClipboardList /> },
    { label: "Colleges", to: "/college/index", icon: <FaUniversity /> },
    { label: "Centers", to: "/centers/index", icon: <FaSchool /> },
    { label: "Search Real Time", to: "/camera", icon: <FaCamera /> },
  ];

  const modelsGroup = {
    group: "Models",
    items: [
      { label: "Alerts", to: "/alert-list", icon: <FaBell /> },
      { label: "Models", to: "/models-list", icon: <FaCube /> },
      { label: "Control Model", to: "/control-model", icon: <FaTools /> },
      { label: "Monitor Model", to: "/monitoring-model", icon: <FaDesktop /> },
    ],
  };

  const devicesGroup = {
    group: "Devices and Users",
    items: [
      {
        label: "Devices",
        icon: <FaDesktop />,
        children: [
          { label: "Device List", to: "/devices", icon: <FaClipboardList /> },
          {
            label: "Register Device",
            to: "/devices/register",
            icon: <FaUserPlus />,
          },
        ],
      },
    ],
  };

  // دالة للتحقق من حالة التفعيل بناءً على المسار الحالي
  const getLinkClasses = (to) =>
    `block p-2 rounded-lg ${
      location.pathname.startsWith(to)
        ? "bg-blue-600 text-white"
        : "text-gray-700"
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
      <div className="border-t-2 border-sky-300 mt-4 pt-2">
        <p className="text-gray-400 text-center p-3">{devicesGroup.group}</p>
        {devicesGroup.items.map((item, index) => (
          <div key={index}>
            <button
              onClick={() => toggleMenu(item.label)}
              className={`flex items-center gap-2 w-full text-left p-2 rounded-lg ${
                location.pathname.startsWith("/devices")
                  ? "bg-blue-600 text-white"
                  : "text-gray-700"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
            {item.children && openMenus[item.label] && (
              <div className="pl-4 space-y-2">
                {item.children.map((child) => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 p-2 rounded-lg ${
                        isActive ? "bg-blue-600 text-white" : "text-gray-700"
                      }`
                    }
                  >
                    {child.icon}
                    <span>{child.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;
