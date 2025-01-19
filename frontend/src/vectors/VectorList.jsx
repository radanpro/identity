import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import SearchVectorAddBar from "../components/SearchVectorAddBar";
import { Button } from "../shared/Button";
import { Pagination } from "../shared/Pagination";

const VectorList = () => {
  const [vectors, setVectors] = useState([]); // حالة لتخزين المتجهات
  const [filteredVectors, setFilteredVectors] = useState([]); // حالة للبحث
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // عدد العناصر في كل صفحة
  const location = useLocation();

  // دالة لجلب المتجهات
  const fetchVectors = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8080/vectors/vectors");
      if (response.status === 200) {
        setVectors(response.data); // تخزين المتجهات في الحالة
        setFilteredVectors(response.data); // تعيين المتجهات المفلترة
      }
    } catch (error) {
      console.error("Failed to fetch vectors", error);
    }
  }, []);

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

  // جلب المتجهات عند تحميل المكون
  useEffect(() => {
    fetchVectors();
  }, [fetchVectors]);

  // دالة البحث
  const handleSearch = (query) => {
    const filtered = vectors.filter(
      (vector) =>
        vector.student_id.toLowerCase().includes(query.toLowerCase()) || // البحث برقم الطالب
        vector.college.toLowerCase().includes(query.toLowerCase()) // البحث بالكلية
    );
    setFilteredVectors(filtered);
    setCurrentPage(1); // العودة إلى الصفحة الأولى بعد البحث
  };

  // دالة لتقليل عرض المتجه
  const truncateVector = (vector) => {
    const vectorString = vector; // تحويل المصفوفة إلى نص
    return vectorString.length > 20
      ? vectorString.substring(0, 20) + "..."
      : vectorString;
  };

  // حساب البيانات المعروضة في الصفحة الحالية
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVectors = filteredVectors.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // تغيير الصفحة
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // دالة للتحقق من جميع بيانات الطلاب المحولة إلى متجهات
  const handleVerifyAllVectors = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8080/vectors/verify-all"
      ); // افتراضيًا، استخدم هذا المسار
      if (response.status === 200) {
        setSuccessMessage("تم التحقق من جميع المتجهات بنجاح!");
      } else {
        setSuccessMessage("فشل التحقق من المتجهات.");
      }
    } catch (error) {
      console.error("Error verifying vectors:", error);
      setSuccessMessage("حدث خطأ أثناء التحقق من المتجهات.");
    }
  };
  // دالة البحث

  return (
    <div className="flex-col">
      <Header page="Vectors" />
      <div>
        {/* عنوان الصفحة */}
        <SearchVectorAddBar
          onSearch={handleSearch}
          onAdd="متجه "
          onVerifyAll={handleVerifyAllVectors}
        />
      </div>
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
          {successMessage}
        </div>
      )}
      <div className="mt-2 flex flex-col">
        {/* جدول المتجهات */}
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
                      رقم الطالب
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
                      المتجه (20 رقم أولى)
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
                  {currentVectors.map((vector, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vector.student_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vector.college}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {truncateVector(vector.vector)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button className="text-indigo-600 hover:text-indigo-900">
                          تعديل
                        </Button>
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
            totalPages={Math.ceil(filteredVectors.length / itemsPerPage)}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default VectorList;
