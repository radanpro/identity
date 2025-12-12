import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";

const AlertFilterForm = ({ filters, setFilters, onSubmit }) => {
  const [centers, setCenters] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:3000/centers")
      .then((res) => setCenters(res.data))
      .catch((err) => console.error("Error fetching centers:", err));

    axios
      .get("http://127.0.0.1:3000/api/academic/exams/filter")
      .then((res) => setExams(res.data))
      .catch((err) => console.error("Error fetching exams:", err));
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleClear = () => {
    setFilters({
      type: "",
      center: "",
      exam: "",
      exam_start_time: "",
      exam_end_time: "",
    });
    onSubmit();
  };

  return (
    <form
      className="bg-white shadow rounded-md p-6 mb-4 mx-auto"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* رقم الغرفة */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700">
            رقم الغرفة
          </label>
          <input
            type="text"
            name="type"
            value={filters.type || ""}
            onChange={handleChange}
            className="mt-1 p-[9px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* المركز */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700">
            المركز
          </label>
          <select
            name="center"
            value={filters.center || ""}
            onChange={handleChange}
            className="mt-1 p-[9px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">الكل</option>
            {centers.map((center) => (
              <option key={`center-${center.id}`} value={center.id}>
                {center.center_name}
              </option>
            ))}
          </select>
        </div>

        {/* تاريخ الاختبار */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700">
            تاريخ الاختبار
          </label>
          <select
            name="exam"
            value={filters.exam || ""}
            onChange={handleChange}
            className="mt-1 p-[9px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">الكل</option>
            {exams.map((exam) => (
              <option key={exam.exam_id} value={exam.exam_date}>
                {exam.exam_date}
              </option>
            ))}
          </select>
        </div>

        {/* وقت بدأ الاختبار */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700">
            وقت بدأ الاختبار
          </label>
          <select
            name="exam_start_time"
            value={filters.exam_start_time || ""}
            onChange={handleChange}
            className="mt-1 p-[9px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">الكل</option>
            {exams.map((exam) => (
              <option
                key={`start-time-${exam.exam_id}`}
                value={exam.exam_start_time || ""}
              >
                {exam.exam_start_time}
              </option>
            ))}
          </select>
        </div>

        {/* وقت نهاية الاختبار */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700">
            وقت نهاية الاختبار
          </label>
          <select
            name="exam_end_time"
            onChange={handleChange}
            className="mt-1 p-[9px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">الكل</option>
            {exams.map((exam, index) => (
              <option
                key={`end-time-${exam.id}-${index}`}
                value={exam.exam_end_time}
              >
                {exam.exam_end_time}
              </option>
            ))}
          </select>
        </div>

        {/* قسم الأزرار */}
        <div className="flex justify-center items-center mt-6 p-2 w-full col-span-1 gap-4">
          <button
            type="submit"
            className="w-full md:w-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="w-full md:w-1/2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
};

AlertFilterForm.propTypes = {
  filters: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default AlertFilterForm;
