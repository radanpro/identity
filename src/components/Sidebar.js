import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const isStudentActive =
    location.pathname.startsWith("/students") ||
    location.pathname.startsWith("/add-student");

  return (
    <aside className="w-64 bg-gray-100 p-4 h-screen rounded-lg shadow-lg">
      <div className="text-2xl font-bold mb-8">AI Exam</div>
      <nav className="space-y-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `block p-2 rounded-lg ${
              isActive ? "bg-blue-600 text-white" : "text-gray-700"
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/students"
          className={`block p-2 rounded-lg ${
            isStudentActive ? "bg-blue-600 text-white" : "text-gray-700"
          }`}
        >
          Student
        </NavLink>
        <NavLink
          to="/exam"
          className={({ isActive }) =>
            `block p-2 rounded-lg ${
              isActive ? "bg-blue-600 text-white" : "text-gray-700"
            }`
          }
        >
          Exam
        </NavLink>
        <NavLink
          to="/compare-image"
          className={({ isActive }) =>
            `block p-2 rounded-lg ${
              isActive ? "bg-blue-600 text-white" : "text-gray-700"
            }`
          }
        >
          Compare Image
        </NavLink>
        <NavLink
          to="/search-image"
          className={({ isActive }) =>
            `block p-2 rounded-lg ${
              isActive ? "bg-blue-600 text-white" : "text-gray-700"
            }`
          }
        >
          Search Image
        </NavLink>
        <NavLink
          to="/camera"
          className={({ isActive }) =>
            `block p-2 rounded-lg ${
              isActive ? "bg-blue-600 text-white" : "text-gray-700"
            }`
          }
        >
          search Real Time
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
