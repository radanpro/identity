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

  const isAlertActive =
    location.pathname.startsWith("/alert-list") ||
    location.pathname.startsWith("/alert-info");

  const isModelActive =
    location.pathname.startsWith("/models-list") ||
    location.pathname.startsWith("/models-info");

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
      <div className="border-t-2 border-sky-300 mt-4 pt-2">
        <p className="text-gray-400 text-center p-3">Models</p>
        <NavLink
          to="alert-list"
          className={`block p-2 rounded-lg ${
            isAlertActive ? "bg-blue-600 text-white" : "text-gray-700"
          }`}
        >
          Alerts
        </NavLink>
        <NavLink
          to="models-list"
          className={`block p-2 rounded-lg ${
            isModelActive ? "bg-blue-600 text-white" : "text-gray-700"
          }`}
        >
          Models
        </NavLink>
      </div>
    </aside>
  );
};
Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;
