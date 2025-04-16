import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { NavLink, useLocation } from "react-router-dom";
import Header from "../components/Header";
import SearchAddBar from "../components/SearchAddBar";
import { Button } from "../shared/Button";
import { Pagination } from "../shared/Pagination";
import { useOutletContext } from "react-router-dom";
import PropTypes from "prop-types";
import PopupMessage from "../components/PopupMessage";

const StudentList = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const location = useLocation();

  const [vectorStudentIds, setVectorStudentIds] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);
  const [popupType, setPopupType] = useState("info");

  useEffect(() => {
    const fetchVectorStudentIds = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:3000/vectors/vectors/all-student-ids"
        );
        if (response.status === 200) {
          setVectorStudentIds(response.data);
        }
      } catch (error) {
        console.error("فشل في جلب أرقام الفكتور:", error);
      }
    };

    fetchVectorStudentIds();
  }, []);

  const handleAddToVector = async () => {
    try {
      console.log("Adding student ID:", selectedStudentId); // Debugging line

      const response = await axios.post(
        "http://127.0.0.1:3000/api/students-to-vectors",
        [selectedStudentId]
      );

      if (response.status === 200 && !response.data.failure_count) {
        setPopupMessage("تمت الإضافة بنجاح");
        setPopupType("success");
        setVectorStudentIds((prev) => [...prev, selectedStudentId]);
      } else {
        throw new Error("لم يتم الإضافة");
      }
    } catch (error) {
      setPopupMessage("حدث خطأ أثناء الإضافة");
      setPopupType("error");
      console.error(error);
    } finally {
      setShowConfirmPopup(false);
      setSelectedStudentId(null);
    }
  };

  const mapStudents = (data) => {
    return data.map((student) => ({
      student_id: student[0],
      name: student[1],
      Number: student[2],
      College: student[3],
      Level: student[4],
      Specialization: student[5],
      status: student[6],
      ImagePath: student[7],
      date: student[8],
    }));
  };

  const fetchStudents = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3000/students");
      if (response.status === 200) {
        const mappedStudents = mapStudents(response.data);
        setStudents(mappedStudents);
        setFilteredStudents(mappedStudents);
      }
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  }, []);

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
  }, [fetchStudents]);

  // دالة البحث
  const handleSearch = (query) => {
    const filtered = students.filter((student) =>
      student.Number.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStudents(filtered);
    setCurrentPage(1); // العودة إلى الصفحة الأولى بعد البحث
  };

  // حساب البيانات المعروضة في الصفحة الحالية
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // تغيير الصفحة
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex-col">
      <Header
        page="Student"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div>
        {/* عنوان الصفحة */}
        <SearchAddBar
          onSearch={handleSearch}
          onAdd="طالب "
          link="/add-student"
        />
      </div>
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
          {successMessage}
        </div>
      )}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md text-center">
            <p className="mb-4">هل أنت متأكد من إضافة الطالب إلى (Vector)؟</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleAddToVector}
                className="relative  items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-green-500 hover:bg-gray-50"
              >
                نعم
              </button>
              <Button
                onClick={() => {
                  setShowConfirmPopup(false);
                  setSelectedStudentId(null);
                }}
                className="bg-gray-300 text-black hover:bg-gray-400"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-2 flex flex-col">
        <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      الصورة
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      الاسم
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      رقم القيد
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      الكلية
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      المستوى
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      التخصص
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((student) => (
                    <tr key={student.student_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={`http://127.0.0.1:3000/static/${student.ImagePath}`}
                          alt={student.Number}
                          className="w-10 h-10 rounded-full"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.Number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.College}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.Level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.Specialization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <NavLink
                          to={`/edit-student/${student.Number}`} // رابط التعديل مع معرف الطالب
                          className="text-indigo-600 hover:text-indigo-900 border border-gray-200 p-2 px-4 rounded-md"
                        >
                          تعديل
                        </NavLink>
                        <Button className="ml-2 text-red-600 hover:text-red-900 hidden">
                          حذف
                        </Button>
                        {!vectorStudentIds.includes(student.Number) && (
                          <Button
                            className="ml-2 text-gray-600 hover:text-gray-900"
                            onClick={() => {
                              setSelectedStudentId(student.Number.toString());
                              setShowConfirmPopup(true);
                            }}
                          >
                            اضافة الى (vector)
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Pagination */}
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredStudents.length / itemsPerPage)}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      {popupMessage && (
        <PopupMessage
          message={popupMessage}
          type={popupType}
          onClose={() => setPopupMessage(null)}
        />
      )}
    </div>
  );
};

StudentList.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};
export default StudentList;
