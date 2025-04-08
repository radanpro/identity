// components/AlertDetailsModal.jsx
import PropTypes from "prop-types";

const AlertDetailsModal = ({ show, onClose, alertDetails }) => {
  console.log(alertDetails);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">تفاصيل التنبيهات</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl"
          >
            &times;
          </button>
        </div>
        {alertDetails?.length > 0 ? (
          <ul className="space-y-4 max-h-[60vh] overflow-y-auto">
            {alertDetails.map((alert, index) => (
              <li
                key={index}
                className="border p-3 rounded-md bg-gray-100 shadow-sm"
              >
                <p>
                  <strong>الرسالة:</strong> {alert.alert_message}
                </p>
                <p>
                  <strong>النوع:</strong> {alert.alert_type}
                </p>
                <p>
                  <strong>التاريخ:</strong>{" "}
                  {new Date(alert.alert_timestamp).toLocaleString("ar-EG")}
                </p>
                <p>
                  <strong>الحالة:</strong>{" "}
                  {alert.is_read ? "مقروء" : "غير مقروء"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">لا توجد تنبيهات</p>
        )}
      </div>
    </div>
  );
};

AlertDetailsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  alertDetails: PropTypes.object,
};

export default AlertDetailsModal;
