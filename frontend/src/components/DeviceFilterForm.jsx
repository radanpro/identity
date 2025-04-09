import axios from "axios";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const DeviceFilterForm = ({ filters, setFilters, onSubmit }) => {
  const [centers, setCenters] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:3000/centers")
      .then((res) => setCenters(res.data))
      .catch((err) => console.error("Error fetching centers:", err));
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
    <div className="bg-white shadow rounded-md p-6 mb-4 mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* رقم الغرفة */}
        <div className="flex flex-col">
          <label className=" text-sm font-medium text-gray-700">
            رقم الغرفة
          </label>
          <input
            type="text"
            name="type"
            value={filters.type || ""}
            onChange={handleChange}
            className="text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-10 mt-4 "
          />
        </div>

        {/* المركز */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">المركز</label>
          <select
            name="center"
            value={filters.center || ""}
            onChange={handleChange}
            className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 h-10 mt-4 text-center rounded-lg text-sm"
          >
            <option value="">الكل</option>
            {centers.map((center) => (
              <option key={`center-${center.id}`} value={center.id}>
                {center.center_name}
              </option>
            ))}
          </select>
        </div>

        {/* أزرار الفلترة */}
        <div className="flex items-end gap-4">
          {/* <button
            type="submit"
            className="w-full md:w-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Filter
          </button> */}
          <button
            type="button"
            onClick={handleClear}
            className="w-full md:w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

DeviceFilterForm.propTypes = {
  filters: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default DeviceFilterForm;
