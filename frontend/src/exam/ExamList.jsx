import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { NavLink, useLocation } from "react-router-dom";
import Header from "../components/Header";
import SearchAddBar from "../components/SearchAddBar";
import { Button } from "../shared/Button";
import { Pagination } from "../shared/Pagination";
import { useOutletContext } from "react-router-dom";
import PropTypes from "prop-types";

const ExamList = ({ isLoggedIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const location = useLocation();
  const mapExams = (data) => {
    return data.map((exam) => ({
      id: exam[0],
      student_number: exam[1],
      subject: exam[2],
      seat_number: exam[3],
      exam_room: exam[4],
      exam_center: exam[5],
      exam_datetime: exam[6],
      duration: exam[7],
    }));
  };

  // جلب بيانات الامتحانات من الخادم
  const fetchExams = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3000/exams");
      if (response.status === 200) {
        const mappedExams = mapExams(response.data);
        setExams(mappedExams);
        setFilteredExams(mappedExams);
      }
    } catch (error) {
      console.error("فشل في جلب بيانات الامتحانات", error);
    }
  }, [setExams, setFilteredExams]);

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
    fetchExams();
  }, [fetchExams]);

  // دالة البحث: يتم البحث عبر رقم الطالب أو المادة
  const handleSearch = (query) => {
    const filtered = exams.filter(
      (exam) =>
        exam.student_number.toLowerCase().includes(query.toLowerCase()) ||
        exam.subject.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredExams(filtered);
    setCurrentPage(1); // العودة إلى الصفحة الأولى بعد البحث
  };

  // حساب العناصر المعروضة للصفحة الحالية
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredExams.slice(indexOfFirstItem, indexOfLastItem);

  // تغيير الصفحة
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex-col">
      <Header
        page="Exam"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
      />
      <div>
        <SearchAddBar
          onSearch={handleSearch}
          onAdd="امتحان "
          link="/exam/add"
        />
      </div>
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
          {successMessage}
        </div>
      )}
      <div className="mt-2 flex flex-col">
        <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم الامتحان
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم الطالب
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المادة
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم المقعد
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      قاعة الامتحان
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      مركز الامتحان
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الامتحان
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المدة
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((exam) => (
                    <tr key={exam.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.student_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.seat_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.exam_room}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.exam_center}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(exam.exam_datetime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <NavLink
                          to={`/exam/edit-exam/${exam.student_number}`}
                          className="text-indigo-600 hover:text-indigo-900 border border-gray-200 p-2 px-4 rounded-md"
                        >
                          تعديل
                        </NavLink>
                        <Button className="ml-2 text-red-600 hover:text-red-900">
                          حذف
                        </Button>
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
            totalPages={Math.ceil(filteredExams.length / itemsPerPage)}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

ExamList.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};

export default ExamList;
