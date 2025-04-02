import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { NavLink, useLocation } from "react-router-dom";
import Header from "../components/Header";
import SearchAddBar from "../components/SearchAddBar";
import { Button } from "../shared/Button";
import { Pagination } from "../shared/Pagination";
import { useOutletContext } from "react-router-dom";
import PropTypes from "prop-types";

const CollegeList = ({ isLoggedIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const location = useLocation();

  // جلب بيانات الامتحانات من الخادم
  const fetchColleges = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:3000/api/academic/colleges"
      );
      if (response.status === 200) {
        setColleges(response.data);
        setFilteredColleges(response.data);
      }
    } catch (error) {
      console.error("فشل في جلب بيانات الكيات", error);
    }
  }, [setColleges, setFilteredColleges]);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state?.message]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  const handleSearch = (query) => {
    const filtered = colleges.filter((college) =>
      college.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredColleges(filtered);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredColleges.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // تغيير الصفحة
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex-col p-2">
      <Header
        page="College"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
      />
      <div>
        <SearchAddBar
          onSearch={handleSearch}
          onAdd="الكية "
          link="/college/add"
        />
      </div>
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
          {successMessage}
        </div>
      )}
      <div className="m-2 mt-2">
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          {/* رأس الأعمدة */}
          <div className="grid grid-cols-3 bg-gray-50 p-4">
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              رقم الكلية
            </div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              اسم الكلية
            </div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              الإجراءات
            </div>
          </div>

          {/* محتوى الأعمدة */}
          <div className="bg-white divide-y divide-gray-200">
            {currentItems.map((college) => (
              <div
                key={college.college_id}
                className="grid grid-cols-3 p-4 hover:bg-gray-50"
              >
                <div className="text-sm text-gray-900">
                  {college.college_id}
                </div>
                <div className="text-sm text-gray-900">{college.name}</div>
                <div className="text-sm font-medium space-x-2">
                  <NavLink
                    to={`/college/edit-college/${college.college_id}`}
                    className="text-indigo-600 hover:text-indigo-900 border border-gray-200 p-2 px-4 rounded-md inline-block"
                  >
                    تعديل
                  </NavLink>
                  <Button className="text-red-600 hover:text-red-900 border border-gray-200 p-2 px-4 rounded-md inline-block">
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* الترقيم */}
        {Math.ceil(filteredColleges.length / itemsPerPage) > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredColleges.length / itemsPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

CollegeList.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};

export default CollegeList;
