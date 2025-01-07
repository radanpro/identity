import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import SearchAddBar from "../components/SearchAddBar";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const location = useLocation();

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8080/api/students");
      setStudents(response.data);
      setFilteredStudents(response.data); // لتحديث القائمة المفلترة أيضًا
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  // إعداد الرسالة الأولية من التنقل
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);

      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location.state?.message]);

  useEffect(() => {
    fetchStudents();
  }, []);

  // دالة البحث
  const handleSearch = (query) => {
    const filtered = students.filter((student) =>
      student.Number.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  return (
    <div className="flex-col">
      <Header page="Student" />
      <div>
        {/* title of page */}
        <SearchAddBar onSearch={handleSearch} onAdd="طالب " />
      </div>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-200 rounded-lg shadow-md">
        {successMessage && (
          <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
            {successMessage}
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4">Student List</h2>
        <ul className="space-y-4">
          {filteredStudents.map((student) => (
            <li
              key={student.StudentID}
              className="p-4 border-b border-gray-200 flex items-start"
            >
              <img
                src={student.ImagePath}
                alt={student.Number}
                className="w-16 h-16 rounded-full mr-4"
              />
              <div className="flex flex-1 gap-4 border-spacing-2 justify-between text-center items-center font-semibold">
                <p>
                  <strong>Number:</strong> {student.Number}
                </p>
                <p>
                  <strong>College:</strong> {student.College}
                </p>
                <p>
                  <strong>Level:</strong> {student.Level}
                </p>
                <p>
                  <strong>Specialization:</strong> {student.Specialization}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudentList;
