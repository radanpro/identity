import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";

const FilterComponent = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    statType: "college", // حقل جديد لتحديد نوع الإحصائية
    year_id: "",
    college_id: "",
    major_id: "",
    level_id: "",
    student_id: "",
  });
  const [options, setOptions] = useState({
    years: [],
    colleges: [],
    majors: [],
    levels: [],
  });
  const [loading, setLoading] = useState({
    years: false,
    colleges: false,
    majors: false,
    levels: false,
  });

  useEffect(() => {
    // جلب البيانات الأولية
    fetchYears();
    fetchColleges();
    fetchLevels();
  }, []);

  useEffect(() => {
    if (filters.college_id) {
      fetchMajors(filters.college_id);
    } else {
      setOptions((prev) => ({ ...prev, majors: [] }));
      setFilters((prev) => ({ ...prev, major_id: "" }));
    }
  }, [filters.college_id]);

  const fetchYears = async () => {
    setLoading((prev) => ({ ...prev, years: true }));
    try {
      const response = await axios.get(
        "http://127.0.0.1:3000/api/academic/years/"
      );
      setOptions((prev) => ({ ...prev, years: response.data }));
    } catch (error) {
      console.error("Error fetching years:", error);
    } finally {
      setLoading((prev) => ({ ...prev, years: false }));
    }
  };

  const fetchColleges = async () => {
    setLoading((prev) => ({ ...prev, colleges: true }));
    try {
      const response = await axios.get(
        "http://127.0.0.1:3000/api/academic/colleges/"
      );
      setOptions((prev) => ({ ...prev, colleges: response.data }));
    } catch (error) {
      console.error("Error fetching colleges:", error);
    } finally {
      setLoading((prev) => ({ ...prev, colleges: false }));
    }
  };

  const fetchMajors = async (collegeId) => {
    setLoading((prev) => ({ ...prev, majors: true }));
    try {
      const response = await axios.get(
        `http://127.0.0.1:3000/api/academic/majors/college/${collegeId}`
      );
      setOptions((prev) => ({ ...prev, majors: response.data }));
    } catch (error) {
      console.error("Error fetching majors:", error);
    } finally {
      setLoading((prev) => ({ ...prev, majors: false }));
    }
  };

  const fetchLevels = async () => {
    setLoading((prev) => ({ ...prev, levels: true }));
    try {
      const response = await axios.get(
        "http://127.0.0.1:3000/api/academic/levels/"
      );
      setOptions((prev) => ({ ...prev, levels: response.data }));
    } catch (error) {
      console.error("Error fetching levels:", error);
    } finally {
      setLoading((prev) => ({ ...prev, levels: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // تحديث الفلاتر محليًا ثم إرسالها للمكون الأب
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Filter Statistics</h2>

      {/* اختيار نوع الإحصائية */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Statistics Type
        </label>
        <select
          name="statType"
          value={filters.statType}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="college">College Statistics</option>
          <option value="major">Major &amp; Level Statistics</option>
          <option value="course">Course Statistics</option>
          <option value="student">Student Reports</option>
        </select>
      </div>

      {/* باقي الحقول فقط تظهر حسب الحاجة */}
      {filters.statType === "college" ||
      filters.statType === "major" ||
      filters.statType === "course" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <select
                name="year_id"
                value={filters.year_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={loading.years}
              >
                <option value="">All Years</option>
                {options.years.map((year) => (
                  <option key={`year-${year.year_id}`} value={year.year_id}>
                    {year.year_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                College
              </label>
              <select
                name="college_id"
                value={filters.college_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={loading.colleges}
              >
                <option value="">All Colleges</option>
                {options.colleges.map((college) => (
                  <option
                    key={`college-${college.college_id}`}
                    value={college.college_id}
                  >
                    {college.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Major
              </label>
              <select
                name="major_id"
                value={filters.major_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={loading.majors || !filters.college_id}
              >
                <option value="">All Majors</option>
                {options.majors.map((major) => (
                  <option
                    key={`major-${major.major_id}`}
                    value={major.major_id}
                  >
                    {major.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Level
              </label>
              <select
                name="level_id"
                value={filters.level_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={loading.levels}
              >
                <option value="">All Levels</option>
                {options.levels.map((level) => (
                  <option
                    key={`level-${level.level_id}`}
                    value={level.level_id}
                  >
                    {level.level_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      ) : null}

      {/* حقل خاص بتقرير الطالب يظهر فقط عند اختيار Student Reports */}
      {filters.statType === "student" && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Student ID
          </label>
          <input
            type="text"
            name="student_id"
            value={filters.student_id}
            onChange={handleChange}
            placeholder="Enter student ID"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      )}
    </div>
  );
};

FilterComponent.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
};

export default FilterComponent;
