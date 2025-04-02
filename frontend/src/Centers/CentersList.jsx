import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { NavLink, useLocation } from "react-router-dom";
import Header from "../components/Header";
import SearchAddBar from "../components/SearchAddBar";
import { Button } from "../shared/Button";
import { Pagination } from "../shared/Pagination";
import { useOutletContext } from "react-router-dom";
import PropTypes from "prop-types";

const CentersList = ({ isLoggedIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const [centers, setCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const location = useLocation();

  // جلب بيانات المراكز من الخادم
  const fetchCenters = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3000/centers");
      if (response.status === 200) {
        setCenters(response.data);
        setFilteredCenters(response.data);
      }
    } catch (error) {
      console.error("فشل في جلب بيانات المراكز", error);
    }
  }, []);

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
    fetchCenters();
  }, [fetchCenters]);

  const handleSearch = (query) => {
    const filtered = centers.filter(
      (center) =>
        center.center_name.toLowerCase().includes(query.toLowerCase()) ||
        center.center_code.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCenters(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async (centerCode) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المركز؟")) {
      try {
        await axios.delete(`http://127.0.0.1:3000/centers/${centerCode}`);
        setSuccessMessage("تم حذف المركز بنجاح");
        fetchCenters(); // إعادة تحميل البيانات بعد الحذف
      } catch (error) {
        console.error("فشل في حذف المركز", error);
        alert("حدث خطأ أثناء محاولة حذف المركز");
      }
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCenters.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex-col p-2">
      <Header
        page="المراكز"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
      />
      <div>
        <SearchAddBar
          onSearch={handleSearch}
          onAdd="إضافة مركز"
          link="/centers/add"
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
          <div className="grid grid-cols-5 bg-gray-50 p-4">
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              رقم المركز
            </div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              كود المركز
            </div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              اسم المركز
            </div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              الحالة
            </div>
            <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              الإجراءات
            </div>
          </div>

          {/* محتوى الأعمدة */}
          <div className="bg-white divide-y divide-gray-200">
            {currentItems.map((center) => (
              <div
                key={center.id}
                className="grid grid-cols-5 p-4 hover:bg-gray-50"
              >
                <div className="text-sm text-gray-900">{center.id}</div>
                <div className="text-sm text-gray-900">
                  {center.center_code}
                </div>
                <div className="text-sm text-gray-900">
                  {center.center_name}
                </div>
                <div className="text-sm text-gray-900">
                  {center.status === 1 ? (
                    <span className="text-green-600">نشط</span>
                  ) : (
                    <span className="text-red-600">غير نشط</span>
                  )}
                </div>
                <div className="text-sm font-medium space-x-2">
                  <NavLink
                    to={`/centers/edit-center/${center.id}`}
                    className="text-indigo-600 hover:text-indigo-900 border border-gray-200 p-2 px-4 rounded-md inline-block"
                  >
                    تعديل
                  </NavLink>
                  <Button
                    onClick={() => handleDelete(center.center_code)}
                    className="text-red-600 hover:text-red-900 border border-gray-200 p-2 px-4 rounded-md inline-block"
                  >
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* الترقيم */}
        {Math.ceil(filteredCenters.length / itemsPerPage) > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredCenters.length / itemsPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

CentersList.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};

export default CentersList;
