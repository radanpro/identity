import { NavLink, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const isStudentActive =
    location.pathname.startsWith("/students") ||
    location.pathname.startsWith("/add-student");

  const isVectorActive =
    location.pathname.startsWith("/vectors") ||
    location.pathname.startsWith("/add-vector");

  return (
    <aside
      className={`w-64 bg-gray-100 p-4 h-screen rounded-lg shadow-lg transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } fixed lg:relative lg:translate-x-0 z-50`}
    >
      <div className="text-2xl font-bold mb-8">AI Exam</div>
      <button
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 text-gray-700 hover:text-gray-900"
      >
        ✕
      </button>
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
          to="/vectors"
          className={`block p-2 rounded-lg ${
            isVectorActive ? "bg-blue-600 text-white" : "text-gray-700"
          }`}
        >
          vectors
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
Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;
