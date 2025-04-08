import Header from "../components/Header";
import { useOutletContext, useLocation, NavLink } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import SearchAddBar from "../components/SearchAddBar";
import PropTypes from "prop-types";
import { Pagination } from "../shared/Pagination";

const AlertTypeList = ({ isLoggedIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const location = useLocation();
  const [alertTypes, setAlertTypes] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchAlertTypes = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:3000/api/alert-types/"
      );
      if (response.status === 200) {
        setAlertTypes(response.data);
        setFilteredTypes(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch alert types", error);
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
    fetchAlertTypes();
  }, [fetchAlertTypes]);

  const handleSearch = (query) => {
    const filtered = alertTypes.filter((type) =>
      type.type_name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTypes(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this alert type?")) {
      try {
        await axios.delete(`http://127.0.0.1:3000/api/alert-types/${id}`);
        setAlertTypes((prev) => prev.filter((type) => type.id !== id));
        setFilteredTypes((prev) => prev.filter((type) => type.id !== id));
      } catch (error) {
        console.error("Failed to delete alert type", error);
      }
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTypes.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex-col">
      <Header
        page="Alert Types"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
      />

      <div className="px-4">
        <SearchAddBar
          onSearch={handleSearch}
          onAdd="Alert Type"
          link="/alert-types/add"
        />

        {successMessage && (
          <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
            {successMessage}
          </div>
        )}

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type Name
                </th>
                <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Control
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((type) => (
                <tr key={type.id} className="border-b border-gray-200">
                  <td className="py-3 px-6">{type.id}</td>
                  <td className="py-3 px-6">{type.type_name}</td>
                  <td className="py-3 px-6 text-sm font-medium space-x-2">
                    <NavLink
                      to={`/alert-types/edit/${type.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </NavLink>
                    <button
                      onClick={() => handleDelete(type.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No alert types found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredTypes.length / itemsPerPage)}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

AlertTypeList.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};

export default AlertTypeList;
