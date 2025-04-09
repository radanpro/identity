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

  return (
    <form
      className="flex flex-wrap gap-4 bg-white p-4 shadow rounded-md mb-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          رقم الغرفة
        </label>
        <input
          type="text"
          name="type"
          value={filters.type || ""}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          المركز
        </label>
        <select
          name="center"
          value={filters.center}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        >
          <option value="">الكل</option>
          {centers.map((center) => (
            <option key={center.id} value={center.id}>
              {center.center_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          تاريخ الاختبار
        </label>
        <select
          name="exam"
          value={filters.exam}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        >
          <option value="">الكل</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.exam_date}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          وقت بدأ الاختبار
        </label>
        <select
          name="exam_start_time"
          value={filters.exam_start_time || ""}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        >
          <option value="">الكل</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.exam_start_time}>
              {exam.exam_start_time}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          وقت نهاية الاختبار
        </label>
        <select
          name="exam_end_time"
          value={filters.exam_end_time || ""}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        >
          <option value="">الكل</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.exam_end_time}>
              {exam.exam_end_time}
            </option>
          ))}
        </select>
      </div>

      <div className="self-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          تطبيق الفلترة
        </button>
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
