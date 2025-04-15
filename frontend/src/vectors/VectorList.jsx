import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import Header from "../components/Header";
import VectorSearchBar from "./components/VectorSearchBar";
import VectorTable from "./components/VectorTable";
import VectorPagination from "./components/VectorPagination";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import useDelete from "../hooks/useDelete";
import PropTypes from "prop-types";

const VectorList = ({ isLoggedIn, isRegisterIn }) => {
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
      const response = await axios.get("http://127.0.0.1:3000/vectors/vectors");
      if (response.status === 200) {
        setVectors(response.data);
        setFilteredVectors(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch vectors", error);
    }
  }, []);

  const {
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    feedback,
  } = useDelete({
    baseUrl: "http://127.0.0.1:3000/vectors/vectors",
    successDeleteMessageText: "تم حذف المتجه بنجاح!",
    errorDeleteMessageText: "حدث خطأ أثناء حذف المتجه.",
    refreshData: fetchVectors,
  });

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
        "http://127.0.0.1:3000/vectors/verify-all"
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

  const confirmDelete = (id, name) => {
    openDeleteModal(id, name);
  };

  return (
    <div className="flex-col">
      <Header
        page="Vectors"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div className="p-4">
        {feedback.success && (
          <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
            {feedback.success}
          </div>
        )}
        {feedback.error && (
          <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-md">
            {feedback.error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
            {successMessage}
          </div>
        )}
        <VectorSearchBar
          onSearch={handleSearch}
          onAdd="متجه"
          onVerifyAll={handleVerifyAllVectors}
          onAddVector={handleAddVector}
        />
        <div className="mt-2 flex flex-col">
          <VectorTable
            currentVectors={currentVectors}
            truncateVector={truncateVector}
            onDelete={confirmDelete}
          />
          <VectorPagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredVectors.length / itemsPerPage)}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        itemName={deleteModal.name}
      />
    </div>
  );
};

VectorList.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default VectorList;
