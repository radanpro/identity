// components/AlertDetailsModal.jsx
import PropTypes from "prop-types";

const AlertDetailsModal = ({ show, onClose, alertDetails }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div
        className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg"
        dir="rtl"
      >
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-2xl font-bold text-gray-800">تفاصيل التنبيهات</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
            aria-label="إغلاق"
          >
            &times;
          </button>
        </div>

        {alertDetails?.length > 0 ? (
          <ul className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {alertDetails.map((alert, index) => (
              <li
                key={index}
                className="border p-4 rounded-md bg-gray-50 shadow-sm"
              >
                <p>
                  <span className="font-semibold text-gray-700">الرسالة:</span>{" "}
                  {alert.alert_message}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">النوع:</span>{" "}
                  {alert.alert_type}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">التاريخ:</span>{" "}
                  {new Date(alert.alert_timestamp).toLocaleString("ar-EG")}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">الحالة:</span>{" "}
                  {alert.is_read ? "مقروء" : "غير مقروء"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 mt-4">
            لا توجد تنبيهات حالياً
          </p>
        )}
      </div>
    </div>
  );
};

AlertDetailsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  alertDetails: PropTypes.array,
};

export default AlertDetailsModal;
