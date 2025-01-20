import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import Header from "../components/Header";
import VectorSearchBar from "./components/VectorSearchBar";
import VectorTable from "./components/VectorTable";
import VectorPagination from "./components/VectorPagination";

const VectorList = () => {
  const [vectors, setVectors] = useState([]);
  const [filteredVectors, setFilteredVectors] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const location = useLocation();
  const navigate = useNavigate();
  const { onToggleSidebar } = useOutletContext();

  const fetchVectors = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8080/vectors/vectors");
      if (response.status === 200) {
        setVectors(response.data);
        setFilteredVectors(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch vectors", error);
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
    fetchVectors();
  }, [fetchVectors]);

  const handleSearch = (query) => {
    const filtered = vectors.filter(
      (vector) =>
        vector.student_id.toLowerCase().includes(query.toLowerCase()) ||
        vector.college.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredVectors(filtered);
    setCurrentPage(1);
  };

  const truncateVector = (vector) => {
    const vectorString = vector;
    return vectorString.length > 20
      ? vectorString.substring(0, 20) + "..."
      : vectorString;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVectors = filteredVectors.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleVerifyAllVectors = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8080/vectors/verify-all"
      );
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
  const handleAddVector = () => {
    navigate("/add-vector");
  };

  return (
    <div className="flex-col">
      <Header page="Vectors" onToggleSidebar={onToggleSidebar} />
      <div className="p-4">
        <VectorSearchBar
          onSearch={handleSearch}
          onAdd="متجه"
          onVerifyAll={handleVerifyAllVectors}
          onAddVector={handleAddVector}
        />
        {successMessage && (
          <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
            {successMessage}
          </div>
        )}
        <div className="mt-2 flex flex-col">
          <VectorTable
            currentVectors={currentVectors}
            truncateVector={truncateVector}
          />
          <VectorPagination
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
