// components/AlertDetailsModal.jsx
import PropTypes from "prop-types";

const AlertDetailsModal = ({ show, onClose, alertDetails }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div
        className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-lg" // تم تكبير حجم المكون هنا
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
          <ul className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
            {alertDetails.map((alert, index) => (
              <li
                key={index}
                className="border p-4 rounded-md bg-gray-50 shadow-sm"
              >
                <p>
                  <span className="font-semibold text-gray-700">
                    نوع التنبيه:
                  </span>{" "}
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
                <div className="mt-2">
                  <span className="font-semibold text-gray-700">الرسالة:</span>
                  {alert.alert_message ? (
                    Array.isArray(alert.alert_message) ? (
                      // إذا كانت رسالة على شكل مصفوفة، نستخدمها مباشرة كما هو موجود في الكود السابق
                      <ul className="mt-2 space-y-2">
                        {alert.alert_message.map((msg, i) => (
                          <li
                            key={i}
                            className="border p-2 rounded-md bg-white shadow-sm"
                          >
                            <p>
                              <strong>الحالة:</strong> {msg.severity}
                            </p>
                            <p>
                              <strong>الوصف:</strong> {msg.description}
                            </p>
                            <p>
                              <strong>الاتجاه:</strong> {msg.look}
                            </p>
                            <p>
                              <strong>مؤشر الانتباه:</strong> {msg.attention}
                            </p>
                            <p>
                              <strong>حالة الفم:</strong> {msg.mouth}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      // إذا كانت alert_message نصاً، نقوم بتقسيمه بناءً على "\n"
                      <div className="mt-2 space-y-2">
                        {alert.alert_message
                          .split("\n")
                          .filter((line) => line.trim() !== "") // للتخلص من السطور الفارغة
                          .map((line, index) => (
                            <p
                              key={index}
                              className="border p-2 rounded-md bg-white shadow-sm"
                            >
                              {line}
                            </p>
                          ))}
                      </div>
                    )
                  ) : (
                    <span>لا توجد رسائل مُفصلة</span>
                  )}
                </div>
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
