import axios from "axios";
import { useOutletContext, useLocation } from "react-router-dom";
import { CiGlobe } from "react-icons/ci";
import { LuFileText } from "react-icons/lu";
import { Pagination } from "../../shared/Pagination";
import { useCallback, useEffect, useState } from "react";
import Header from "../../components/Header";
import SearchAddBar from "../../components/SearchAddBar";
import PropTypes from "prop-types";

const ModelList = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const location = useLocation();

  const mapModels = (data) => {
    return data.map((model) => ({
      model_id: model[0],
      model_ip: model[1],
      model_MacID: model[2],
      model_number: model[3],
      model_room: model[4],
      PC_number: model[5],
      status: model[6],
      alert_count: model[7],
      loginDate: model[8],
      control: model[9],
    }));
  };

  const fetchModels = useCallback(async () => {
    try {
      const response = await axios.get("routeurl2");
      if (response.status === 200) {
        const mappedModels = mapModels(response.data);
        setModels(mappedModels);
        setFilteredModels(mappedModels);
      }
    } catch (error) {
      console.error("Failed to fetch Models", error);
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
    fetchModels();
  }, [fetchModels]);

  const handleSearch = (query) => {
    const filtered = models.filter((model) =>
      model.model_id.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredModels(filtered);
    setCurrentPage(1);
  };

  // const indexOfLestItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLestItem - itemsPerPage;
  // const currentItems = filteredModels.slice(indexOfFirstItem, indexOfLestItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex-col">
      <Header
        page="ModelList"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div>
        {/* عنوان الصفحة */}
        <SearchAddBar
          onSearch={handleSearch}
          onAdd="Model "
          link="/add-student"
        />
      </div>
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
          {successMessage}
        </div>
      )}
      <div className=" flex flex-col items-center justify-center bg-gray-50">
        <div className="flex justify-center p-2 w-full ">
          <div className=" flex items-center  justify-between bg-gray-400 m-2 rounded-xl  lg:px-8 lg:w-64 text-center">
            <h2 className="p-2 text-2xl text-white">Supervisors</h2>
            <CiGlobe className="text-4xl text-blue-500 p-2 cursor-pointer" />
          </div>
          <div className=" flex items-center justify-between bg-gray-400 m-2 rounded-xl  lg:px-8 lg:w-64 text-center ">
            <h2 className="p-2 text-2xl text-white">Models</h2>
            <LuFileText className="text-4xl text-blue-500 p-2 cursor-pointer" />
          </div>
        </div>
        {/* the table */}
        <div className="flex h-full justify-center  w-full">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8 ">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 ">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider"
                    >
                      MODEL INFO
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider"
                    >
                      Alerts
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider"
                    >
                      LoginDate
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider"
                    >
                      Control
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* {currentItems.map((model) => ( */}
                  {/* <tr key={model.model_id}> */}
                  <tr>
                    {/* model info  */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <h3>192.168.1.1</h3>
                      <h3>20-B0-D0-63-a2-26</h3>
                      <h3>001</h3>
                      {/* <h3>{model.model_ip}</h3>
                        <h3>{model.model_macID}</h3>
                        <h3>{model.model_number}</h3> */}
                    </td>
                    {/* location */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <h3>{model.model_room}</h3>
                        <h3>{model.PC_number}</h3> */}
                      <h3>Hall A</h3>
                      <h3>PC number : 012 </h3>
                    </td>
                    {/* status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <h3>{model.status}</h3> */}
                      <h3>Online</h3>
                    </td>
                    {/* Alert */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <h3>{model.alert_count}</h3> */}
                      <h3>4</h3>
                    </td>
                    {/* LoginDate */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <h3>{model.loginDate}</h3> */}
                      <h3>14/1/2025</h3>
                    </td>
                    {/* Control */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <h3>{model.control}</h3> */}
                      <h3>Delete</h3>
                    </td>
                  </tr>
                  <tr>
                    {/* model info  */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <h3>192.168.1.1</h3>
                      <h3>20-B0-D0-63-a2-26</h3>
                      <h3>001</h3>
                      {/* <h3>{model.model_ip}</h3>
                        <h3>{model.model_macID}</h3>
                        <h3>{model.model_number}</h3> */}
                    </td>
                    {/* location */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <h3>{model.model_room}</h3>
                        <h3>{model.PC_number}</h3> */}
                      <h3>Hall A</h3>
                      <h3>PC number : 012 </h3>
                    </td>
                    {/* status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <h3>{model.status}</h3> */}
                      <h3>Online</h3>
                    </td>
                    {/* Alert */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <h3>{model.alert_count}</h3> */}
                      <h3>4</h3>
                    </td>
                    {/* LoginDate */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <h3>{model.loginDate}</h3> */}
                      <h3>14/1/2025</h3>
                    </td>
                    {/* Control */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <h3>{model.control}</h3> */}
                      <h3>Delete</h3>
                    </td>
                  </tr>
                  <tr>
                    {/* model info  */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <h3>192.168.1.1</h3>
                      <h3>20-B0-D0-63-a2-26</h3>
                      <h3>001</h3>
                      {/* <h3>{model.model_ip}</h3>
                        <h3>{model.model_macID}</h3>
                        <h3>{model.model_number}</h3> */}
                    </td>
                    {/* location */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <h3>{model.model_room}</h3>
                        <h3>{model.PC_number}</h3> */}
                      <h3>Hall A</h3>
                      <h3>PC number : 012 </h3>
                    </td>
                    {/* status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <h3>{model.status}</h3> */}
                      <h3>Online</h3>
                    </td>
                    {/* Alert */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <h3>{model.alert_count}</h3> */}
                      <h3>4</h3>
                    </td>
                    {/* LoginDate */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <h3>{model.loginDate}</h3> */}
                      <h3>14/1/2025</h3>
                    </td>
                    {/* Control */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <h3>{model.control}</h3> */}
                      <h3>Delete</h3>
                    </td>
                  </tr>
                  {/* )) } */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Pagination */}
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredModels.length / itemsPerPage)}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

ModelList.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};
export default ModelList;
