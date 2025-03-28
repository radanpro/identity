import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Header from "./Header";
import UploadImageComponent from "./UploadImageComponent";
import ManualCameraComponent from "./ManualCameraComponent";
import AutoFaceCaptureComponent from "./AutoFaceCaptureComponent";
import PropTypes from "prop-types";

const CaptureInterface = ({ isLoggedIn }) => {
  // captureMode يمكن أن تكون "upload", "manual", أو "auto"
  const [captureMode, setCaptureMode] = useState("upload");
  const { onToggleSidebar } = useOutletContext();
  // إعدادات مشتركة
  const [threshold, setThreshold] = useState(0.5);
  const [limit, setLimit] = useState(5);

  return (
    <div className="flex flex-col p-5 border border-gray-300 rounded-lg shadow-md">
      <Header
        page="Search Real Time"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
      />

      <div className="mb-4">
        <h2 className="text-2xl font-bold text-center">
          اختر وضع التقاط الصورة
        </h2>
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCaptureMode("upload")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            تحميل صورة
          </button>
          <button
            onClick={() => setCaptureMode("manual")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            التقاط يدوي
          </button>
          <button
            onClick={() => setCaptureMode("auto")}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          >
            التقاط تلقائي
          </button>
        </div>
      </div>

      {/* إعدادات إضافية مشتركة */}
      <div className="flex justify-center gap-4 mb-4">
        <div className="flex flex-col">
          <label htmlFor="threshold-select" className="text-lg font-medium">
            اختر قيمة Threshold:
          </label>
          <select
            id="threshold-select"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="p-2 border border-gray-300 rounded-md mt-1"
          >
            {Array.from({ length: 11 }, (_, i) => i * 0.1).map((value) => (
              <option key={value} value={value}>
                {value.toFixed(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="limit-select" className="text-lg font-medium">
            اختر قيمة Limit:
          </label>
          <select
            id="limit-select"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded-md mt-1"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {captureMode === "upload" && (
        <UploadImageComponent threshold={threshold} limit={limit} />
      )}
      {captureMode === "manual" && (
        <ManualCameraComponent threshold={threshold} limit={limit} />
      )}
      {captureMode === "auto" && (
        <AutoFaceCaptureComponent threshold={threshold} limit={limit} />
      )}
    </div>
  );
};
CaptureInterface.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};
export default CaptureInterface;
