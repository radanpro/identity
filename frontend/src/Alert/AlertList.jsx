import Header from "../components/Header";
import { useOutletContext, useLocation } from "react-router-dom";
import { CiGlobe } from "react-icons/ci";
import { LuFileText } from "react-icons/lu";
import { Pagination } from "../shared/Pagination";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import SearchAddBar from "../components/SearchAddBar";
import { MdOutlineMessage } from "react-icons/md";
import { IoIosSunny } from "react-icons/io";

const AlertList = () => {
  const { onToggleSidebar } = useOutletContext();
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const location = useLocation();

  const mapAlerts = (data) => {
    return data.map((alert) => ({
      alert_id: alert[0],
      alert_ip: alert[1],
      alert_MacID: alert[2],
      alert_number: alert[3],
      alert_room: alert[4],
      PC_number: alert[5],
      status: alert[6],
      alert_count: alert[7],
      loginDate: alert[8],
      control: alert[9],
    }));
  };

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await axios.get("routeurl2");
      if (response.status === 200) {
        const mappedAlerts = mapAlerts(response.data);
        setAlerts(mappedAlerts);
        setFilteredAlerts(mappedAlerts);
      }
    } catch (error) {
      console.error("Failed to fetch alerts", error);
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
    fetchAlerts();
  }, [fetchAlerts]);

  const handleSearch = (query) => {
    const filtered = alerts.filter((alert) =>
      alert.alert_id.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredAlerts(filtered);
    setCurrentPage(1);
  };

  // const indexOfLestItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLestItem - itemsPerPage;
  // const currentItems = filteredAlerts.slice(indexOfFirstItem, indexOfLestItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex-col">
      <div>
        <Header page="alertList" onToggleSidebar={onToggleSidebar} />
        <div>
          {/* عنوان الصفحة */}
          <SearchAddBar onSearch={handleSearch} onAdd="Alert " />
        </div>
        {successMessage && (
          <div className="bg-green-100 text-green-700 p-4 mb-4 rounded-md">
            {successMessage}
          </div>
        )}
        <div className="flex justify-center p-2 w-full ">
          <div className=" flex items-center  justify-between bg-gray-400 m-2 rounded-xl  lg:px-8 lg:w-64 text-center">
            <h2 className="p-2 text-2xl text-white">Supervisors</h2>
            <CiGlobe className="text-4xl text-blue-500 p-2 cursor-pointer" />
          </div>
          <div className=" flex items-center justify-between bg-gray-400 m-2 rounded-xl  lg:px-8 lg:w-64 text-center ">
            <h2 className="p-2 text-2xl text-white">Alerts</h2>
            <LuFileText className="text-4xl text-blue-500 p-2 cursor-pointer" />
          </div>
        </div>

        <div className=" flex flex-col h-screen bg-gray-50">
          {/* the table */}
          <div className="flex justify-center items-center w-full ">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider"
                      >
                        alert INFO
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
                    {/* {currentItems.map((alert) => ( */}
                    {/* <tr key={alert.alert_id}> */}
                    <tr>
                      {/* alert info  */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <h3>192.168.1.1</h3>
                        <h3>20-B0-D0-63-a2-26</h3>
                        <h3>001</h3>
                        {/* <h3>{alert.alert_ip}</h3>
                        <h3>{alert.alert_macID}</h3>
                        <h3>{alert.alert_number}</h3> */}
                      </td>
                      {/* location */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.alert_room}</h3>
                        <h3>{alert.PC_number}</h3> */}
                        <h3>Hall A</h3>
                        <h3>PC number : 012 </h3>
                      </td>
                      {/* status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.status}</h3> */}
                        <h3 className="bg-green-500 text-center rounded-md p-1 text-white font-semibold">
                          Online
                        </h3>
                      </td>
                      {/* Alert */}
                      <td className="relative px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center relative">
                          <MdOutlineMessage className="text-yellow-300 text-4xl" />
                          <IoIosSunny className="text-red-600 text-4xl absolute -top-5 right-8 flex items-center justify-center shadow-md bg-null rounded-full" />
                          <div className="-mt-1 ml-1 absolute -top-2 right-11 bg-red-600  text-white text-sm font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                            4
                          </div>
                        </div>
                      </td>
                      {/* LoginDate */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.loginDate}</h3> */}
                        <h3>14/1/2025</h3>
                      </td>
                      {/* Control */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.control}</h3> */}
                        <h3>Delete</h3>
                      </td>
                    </tr>
                    <tr>
                      {/* alert info  */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <h3>192.168.1.1</h3>
                        <h3>20-B0-D0-63-a2-26</h3>
                        <h3>001</h3>
                        {/* <h3>{alert.alert_ip}</h3>
                        <h3>{alert.alert_macID}</h3>
                        <h3>{alert.alert_number}</h3> */}
                      </td>
                      {/* location */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.alert_room}</h3>
                        <h3>{alert.PC_number}</h3> */}
                        <h3>Hall A</h3>
                        <h3>PC number : 012 </h3>
                      </td>
                      {/* status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.status}</h3> */}
                        <h3 className="bg-red-500 text-center rounded-md p-1 text-white font-semibold">
                          Offline
                        </h3>
                      </td>
                      {/* Alert */}
                      <td className="relative px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center relative">
                          <MdOutlineMessage className="text-yellow-300 text-4xl" />
                          <IoIosSunny className="text-red-600 text-4xl absolute -top-5 right-8 flex items-center justify-center shadow-md bg-null rounded-full" />
                          <div className="-mt-1 ml-1 absolute -top-2 right-11 bg-red-600  text-white text-sm font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                            4
                          </div>
                        </div>
                      </td>
                      {/* LoginDate */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.loginDate}</h3> */}
                        <h3>14/1/2025</h3>
                      </td>
                      {/* Control */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.control}</h3> */}
                        <h3>Delete</h3>
                      </td>
                    </tr>
                    <tr>
                      {/* alert info  */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <h3>192.168.1.1</h3>
                        <h3>20-B0-D0-63-a2-26</h3>
                        <h3>001</h3>
                        {/* <h3>{alert.alert_ip}</h3>
                        <h3>{alert.alert_macID}</h3>
                        <h3>{alert.alert_number}</h3> */}
                      </td>
                      {/* location */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.alert_room}</h3>
                        <h3>{alert.PC_number}</h3> */}
                        <h3>Hall A</h3>
                        <h3>PC number : 012 </h3>
                      </td>
                      {/* status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.status}</h3> */}
                        <h3 className="bg-green-500 text-center rounded-md p-1 text-white font-semibold">
                          Online
                        </h3>
                      </td>
                      {/* Alert */}
                      <td className="relative px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center relative">
                          <MdOutlineMessage className="text-yellow-300 text-4xl" />
                          <IoIosSunny className="text-red-600 text-4xl absolute -top-5 right-8 flex items-center justify-center shadow-md bg-null rounded-full" />
                          <div className="-mt-1 ml-1 absolute -top-2 right-11 bg-red-600  text-white text-sm font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                            4
                          </div>
                        </div>
                      </td>
                      {/* LoginDate */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.loginDate}</h3> */}
                        <h3>14/1/2025</h3>
                      </td>
                      {/* Control */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.control}</h3> */}
                        <h3>Delete</h3>
                      </td>
                    </tr>
                    <tr>
                      {/* alert info  */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <h3>192.168.1.1</h3>
                        <h3>20-B0-D0-63-a2-26</h3>
                        <h3>001</h3>
                        {/* <h3>{alert.alert_ip}</h3>
                        <h3>{alert.alert_macID}</h3>
                        <h3>{alert.alert_number}</h3> */}
                      </td>
                      {/* location */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.alert_room}</h3>
                        <h3>{alert.PC_number}</h3> */}
                        <h3>Hall A</h3>
                        <h3>PC number : 012 </h3>
                      </td>
                      {/* status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.status}</h3> */}
                        <h3 className="bg-red-500 text-center rounded-md p-1 text-white font-semibold">
                          Offline
                        </h3>
                      </td>
                      {/* Alert */}
                      <td className="relative px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center relative">
                          <MdOutlineMessage className="text-yellow-300 text-4xl" />
                          <IoIosSunny className="text-red-600 text-4xl absolute -top-5 right-8 flex items-center justify-center shadow-md bg-null rounded-full" />
                          <div className="-mt-1 ml-1 absolute -top-2 right-11 bg-red-600  text-white text-sm font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                            4
                          </div>
                        </div>
                      </td>
                      {/* LoginDate */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.loginDate}</h3> */}
                        <h3>14/1/2025</h3>
                      </td>
                      {/* Control */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.control}</h3> */}
                        <h3>Delete</h3>
                      </td>
                    </tr>
                    <tr>
                      {/* alert info  */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <h3>192.168.1.1</h3>
                        <h3>20-B0-D0-63-a2-26</h3>
                        <h3>001</h3>
                        {/* <h3>{alert.alert_ip}</h3>
                        <h3>{alert.alert_macID}</h3>
                        <h3>{alert.alert_number}</h3> */}
                      </td>
                      {/* location */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.alert_room}</h3>
                        <h3>{alert.PC_number}</h3> */}
                        <h3>Hall A</h3>
                        <h3>PC number : 012 </h3>
                      </td>
                      {/* status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.status}</h3> */}
                        <h3 className="bg-green-500 text-center rounded-md p-1 text-white font-semibold">
                          Online
                        </h3>
                      </td>
                      {/* Alert */}
                      <td className="relative px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center relative">
                          <MdOutlineMessage className="text-yellow-300 text-4xl" />
                          <IoIosSunny className="text-red-600 text-4xl absolute -top-5 right-8 flex items-center justify-center shadow-md bg-null rounded-full" />
                          <div className="-mt-1 ml-1 absolute -top-2 right-11 bg-red-600  text-white text-sm font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                            4
                          </div>
                        </div>
                      </td>
                      {/* LoginDate */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.loginDate}</h3> */}
                        <h3>14/1/2025</h3>
                      </td>
                      {/* Control */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.control}</h3> */}
                        <h3>Delete</h3>
                      </td>
                    </tr>
                    <tr>
                      {/* alert info  */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <h3>192.168.1.1</h3>
                        <h3>20-B0-D0-63-a2-26</h3>
                        <h3>001</h3>
                        {/* <h3>{alert.alert_ip}</h3>
                        <h3>{alert.alert_macID}</h3>
                        <h3>{alert.alert_number}</h3> */}
                      </td>
                      {/* location */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.alert_room}</h3>
                        <h3>{alert.PC_number}</h3> */}
                        <h3>Hall A</h3>
                        <h3>PC number : 012 </h3>
                      </td>
                      {/* status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.status}</h3> */}
                        <h3 className="bg-red-500 text-center rounded-md p-1 text-white font-semibold">
                          Offline
                        </h3>
                      </td>
                      {/* Alert */}
                      <td className="relative px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center relative">
                          <MdOutlineMessage className="text-yellow-300 text-4xl" />
                          <IoIosSunny className="text-red-600 text-4xl absolute -top-5 right-8 flex items-center justify-center shadow-md bg-null rounded-full" />
                          <div className="-mt-1 ml-1 absolute -top-2 right-11 bg-red-600  text-white text-sm font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                            4
                          </div>
                        </div>
                      </td>
                      {/* LoginDate */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.loginDate}</h3> */}
                        <h3>14/1/2025</h3>
                      </td>
                      {/* Control */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <h3>{alert.control}</h3> */}
                        <h3>Delete</h3>
                      </td>
                    </tr>

                    {/* ))} */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Pagination */}
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAlerts.length / itemsPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertList;
