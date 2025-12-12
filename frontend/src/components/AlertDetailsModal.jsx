// components/AlertDetailsModal.jsx
import PropTypes from "prop-types";
import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

const AlertDetailsModal = ({ show, onClose, alertDetails }) => {
  const [expandedAlerts, setExpandedAlerts] = useState({});

  if (!show) return null;

  const toggleExpand = (index) => {
    setExpandedAlerts((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getAlertStyle = (type) => {
    switch (type) {
      case "حالة محاولة غش":
        return {
          color: "text-red-800",
          badge: "bg-red-100 text-red-800",
          icon: <ShieldAlert className="text-red-600" size={20} />,
        };
      case "الدخول من جهاز غير المكان المخصص له":
        return {
          color: "text-amber-800",
          badge: "bg-amber-100 text-amber-800",
          icon: <AlertTriangle className="text-amber-600" size={20} />,
        };
      default:
        return {
          color: "text-blue-800",
          badge: "bg-blue-100 text-blue-800",
          icon: <Bell className="text-blue-600" size={20} />,
        };
    }
  };

  const parseMessageToColumns = (message) => {
    const lines = message.split(/\n+/);
    const columns = [];
    let currentAlert = null;
    let alertCount = 0;

    lines.forEach((line) => {
      line = line.trim();

      // اكتشاف بداية تنبيه جديد
      if (/^\[التنبيه \d+\]/.test(line)) {
        alertCount++;
        if (currentAlert) {
          columns.push(currentAlert);
        }
        currentAlert = {
          type: "alert",
          header: line,
          details: [],
          alertNumber: alertCount,
        };
      }
      // معالجة سطور التفاصيل داخل التنبيه
      else if (currentAlert) {
        if (line.includes("━━━━━━━━")) {
          return; // تجاهل الخطوط الفاصلة
        }

        // معالجة خاصة لسطر الوقت
        if (line.startsWith("الوقت:")) {
          const timeValue = line.replace("الوقت:", "").trim();
          currentAlert.details.push({
            label: "الوقت",
            value: timeValue,
            isTime: true,
          });
        }
        // معالجة باقي التفاصيل
        else if (line.includes(":")) {
          const [label, value] = line.split(/:\s*/);
          currentAlert.details.push({
            label: label.trim(),
            value: value.trim(),
            isTime: label.trim() === "الوقت",
          });
        } else if (line) {
          currentAlert.details.push({
            label: line,
            value: "",
            isTime: false,
          });
        }
      }
      // معالجة إحصائيات النهاية
      else if (line.startsWith("• إجمالي التحذيرات:")) {
        columns.push({
          type: "stats",
          label: "إحصائيات عامة",
          value:
            message.split("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")[1]?.trim() || "",
        });
      }
    });

    // إضافة آخر تنبيه إذا كان موجودًا
    if (currentAlert) {
      columns.push(currentAlert);
    }

    return columns;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4">
      <div
        className="bg-white rounded-xl p-5 w-full max-w-5xl shadow-2xl overflow-hidden border border-gray-100"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Bell size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              تفاصيل التنبيهات
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Alerts List */}
        {alertDetails?.length > 0 ? (
          <div className="space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
            {alertDetails.map((alert, index) => {
              const style = getAlertStyle(alert.alert_type);
              const isExpanded = expandedAlerts[index];
              const messageColumns = parseMessageToColumns(alert.alert_message);

              return (
                <div
                  key={index}
                  className={`border rounded-lg px-4 py-3 hover:shadow-sm transition-all duration-200 cursor-pointer ${
                    isExpanded ? "bg-gray-50" : "bg-white"
                  }`}
                  onClick={() => toggleExpand(index)}
                >
                  {/* Row Header */}
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                      {style.icon}
                      <div>
                        <h3 className={`font-semibold text-sm ${style.color}`}>
                          {alert.alert_type}
                        </h3>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(alert.alert_timestamp).toLocaleString(
                            "ar-EG"
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${style.badge}`}
                      >
                        {alert.is_read ? "مقروء" : "جديد"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="text-gray-400" size={16} />
                      ) : (
                        <ChevronDown className="text-gray-400" size={16} />
                      )}
                    </div>
                  </div>

                  {/* Expanded Message - Multi-column Layout */}
                  {isExpanded && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-3">
                        تفاصيل الرسالة (
                        {
                          messageColumns.filter((c) => c.type === "alert")
                            .length
                        }{" "}
                        تنبيهات):
                      </h4>
                      {messageColumns.map((item, index) => {
                        if (item.type === "alert") {
                          return (
                            <div key={`alert-${index}`} className="mb-6">
                              <div className="border-b border-gray-300 text-sm font-bold text-gray-700 py-1 mb-3">
                                {item.header}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {item.details.map((detail, i) => (
                                  <div
                                    key={`detail-${i}`}
                                    className="bg-white border border-gray-100 rounded-md p-3"
                                  >
                                    <div className="font-medium text-gray-600 text-xs mb-1">
                                      {detail.label}
                                    </div>
                                    <div className="text-gray-800 text-sm">
                                      {detail.isTime ? (
                                        <span className="font-semibold text-gray-800">
                                          {detail.value}
                                        </span>
                                      ) : (
                                        detail.value
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        if (item.type === "stats") {
                          return (
                            <div
                              key={`stats-${index}`}
                              className="mt-4 pt-3 border-t border-gray-200"
                            >
                              <h5 className="font-bold text-gray-700 mb-2">
                                {item.label}
                              </h5>
                              <div className="text-sm text-gray-600 whitespace-pre-line">
                                {item.value}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="text-gray-300 mb-3" size={32} />
            <p className="text-gray-500">لا توجد تنبيهات لعرضها</p>
            <p className="text-sm text-gray-400 mt-1">
              سيتم عرض التنبيهات هنا عند توفرها
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

AlertDetailsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  alertDetails: PropTypes.array.isRequired,
};

export default AlertDetailsModal;
