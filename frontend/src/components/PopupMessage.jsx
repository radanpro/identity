// src/components/PopupMessage.jsx
import { useEffect } from "react";
import PropTypes from "prop-types";

const PopupMessage = ({ message, type, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-700";
      case "error":
        return "bg-red-100 text-red-700";
      case "info":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-md shadow-lg ${getBackgroundColor()} flex items-center justify-between min-w-[300px] z-50`}
    >
      <div>{message}</div>
      <button
        onClick={onClose}
        className="ml-4 text-gray-500 hover:text-gray-700"
      >
        &times;
      </button>
    </div>
  );
};

PopupMessage.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["success", "error", "info"]),
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
};

export default PopupMessage;
