import { NavLink, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useState } from "react";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [deviceMenuOpen, setDeviceMenuOpen] = useState(false);
  const [examMenuOpen, setExamMenuOpen] = useState(false);

  const toggleDeviceMenu = () => {
    setDeviceMenuOpen(!deviceMenuOpen);
  };
  const toggleExamMenu = () => {
    setExamMenuOpen(!examMenuOpen);
  };

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
  const isControlModelActive = location.pathname.startsWith("/control-model");
  const isMonitorModelActive =
    location.pathname.startsWith("/monitoring-model");
  const isDeviceActive = location.pathname.startsWith("/devices");
  const isExamActive = location.pathname.startsWith("/exam");

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
          Vectors
        </NavLink>
        <NavLink
          to="/camera"
          className={({ isActive }) =>
            `block p-2 rounded-lg ${
              isActive ? "bg-blue-600 text-white" : "text-gray-700"
            }`
          }
        >
          Search Real Time
        </NavLink>
      </nav>
      <div className="border-t-2 border-sky-300 mt-4 pt-2">
        <p className="text-gray-400 text-center p-3">Models</p>
        <NavLink
          to="/alert-list"
          className={`block p-2 rounded-lg ${
            isAlertActive ? "bg-blue-600 text-white" : "text-gray-700"
          }`}
        >
          Alerts
        </NavLink>
        <NavLink
          to="/models-list"
          className={`block p-2 rounded-lg ${
            isModelActive ? "bg-blue-600 text-white" : "text-gray-700"
          }`}
        >
          Models
        </NavLink>
        <NavLink
          to="/control-model"
          className={`block p-2 rounded-lg ${
            isControlModelActive ? "bg-blue-600 text-white" : "text-gray-700"
          }`}
        >
          Control Model
        </NavLink>
        <NavLink
          to="/monitoring-model"
          className={`block p-2 rounded-lg ${
            isMonitorModelActive ? "bg-blue-600 text-white" : "text-gray-700"
          }`}
        >
          Monitor Model
        </NavLink>
      </div>
      <div className="border-t-2 border-sky-300 mt-4 pt-2">
        <p className="text-gray-400 text-center p-3">Devices and Users</p>
        <div className="space-y-2">
          <button
            onClick={toggleDeviceMenu}
            className={`w-full text-left p-2 rounded-lg ${
              isDeviceActive ? "bg-blue-600 text-white" : "text-gray-700"
            }`}
          >
            Devices
          </button>
          {deviceMenuOpen && (
            <div className="pl-4 space-y-2">
              <NavLink
                to="/devices"
                className={({ isActive }) =>
                  `block p-2 rounded-lg ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-700"
                  }`
                }
              >
                Device List
              </NavLink>
              <NavLink
                to="/devices/register"
                className={({ isActive }) =>
                  `block p-2 rounded-lg ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-700"
                  }`
                }
              >
                Register Device
              </NavLink>
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="space-y-2">
          <button
            onClick={toggleExamMenu}
            className={`w-full text-left p-2 rounded-lg ${
              isExamActive ? "bg-blue-600 text-white" : "text-gray-700"
            }`}
          >
            Exam
          </button>
          {examMenuOpen && (
            <div className="pl-4 space-y-2">
              <NavLink
                to="/exam/index"
                className={({ isActive }) =>
                  `block p-2 rounded-lg ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-700"
                  }`
                }
              >
                Exam List
              </NavLink>
              <NavLink
                to="/exam/add"
                className={({ isActive }) =>
                  `block p-2 rounded-lg ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-700"
                  }`
                }
              >
                add Exam
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;
