import Header from "../components/Header";
import PropTypes from "prop-types";
import { useOutletContext } from "react-router-dom";
import { CiGlobe } from "react-icons/ci";
import { LuFileText } from "react-icons/lu";
import { IoEllipse } from "react-icons/io5";

const Dashboard = ({ isLoggedIn, isRegisterIn }) => {
  const { onToggleSidebar } = useOutletContext();
  return (
    <div className="flex-col">
      <Header
        page="Dashboard"
        onToggleSidebar={onToggleSidebar}
        isLoggedIn={isLoggedIn}
        isRegisterIn={isRegisterIn}
      />
      <div className=" flex flex-col items-center justify-center h-screen bg-gray-50">
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
        <div className="flex h-full justify-center items-center space-x-6">
          {/* بطاقة المشرفين */}
          <div className="bg-gray-500 p-4 rounded-xl w-96">
            {/* العنوان */}
            <div className="flex justify-between items-center p-2">
              <h3 className="text-lg text-white">INFO</h3>
              <h2 className="text-2xl font-semibold text-white">Subervisors</h2>
              <div className="px-2 text-xl text-white bg-gray-400/50 rounded-lg">
                ...
              </div>
            </div>

            {/* المحتوى */}
            <div className="flex justify-between items-center p-2">
              {/* التفاصيل */}
              <div className="space-y-2 w-full mr-6">
                <div className="bg-white p-2 rounded-lg shadow flex justify-between items-between">
                  <div>
                    <h2 className="text-sm font-semibold">Number</h2>
                    <h2 className="text-lg">165</h2>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold flex items-center">
                      State
                    </h2>
                    <h2 className="text-sm font-semibold flex items-center">
                      Conacted <IoEllipse className="text-green-500 ml-1" />
                    </h2>
                  </div>
                </div>

                <div className="bg-white p-2 rounded-lg shadow flex justify-between items-between">
                  <div>
                    <h2 className="text-sm font-semibold">Number</h2>
                    <h2 className="text-lg">15</h2>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold flex  text-center">
                      State
                    </h2>
                    <h2 className="text-sm font-semibold flex items-center">
                      Not Conacted <IoEllipse className="text-red-500 ml-1" />
                    </h2>
                  </div>
                </div>
              </div>

              {/* الرسم الدائري */}
              <div className="relative flex items-center justify-center">
                <div className="w-32 h-32 flex flex-col items-center justify-center bg-transparent border-8 border-green-400 rounded-full shadow-lg">
                  <h3 className="text-lg font-semibold">Models</h3>
                  <h3 className="text-2xl font-bold text-white">150</h3>
                  <h3 className="text-sm ">Total</h3>
                </div>
              </div>
            </div>
          </div>

          {/* بطاقة النماذج */}
          <div className="bg-gray-500 p-4 rounded-xl w-96">
            {/* العنوان */}
            <div className="flex justify-between items-center p-2">
              <h3 className="text-lg text-white">INFO</h3>
              <h2 className="text-2xl font-semibold text-white">Models</h2>
              <div className="px-2 text-xl text-white bg-gray-400/50 rounded-lg">
                ...
              </div>
            </div>

            {/* المحتوى */}
            <div className="flex justify-between items-center p-2">
              {/* التفاصيل */}
              <div className="space-y-2 w-full mr-6">
                <div className="bg-white p-2 rounded-lg shadow flex justify-between items-between">
                  <div>
                    <h2 className="text-sm font-semibold">Number</h2>
                    <h2 className="text-lg">520</h2>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold flex items-center">
                      State
                    </h2>
                    <h2 className="text-sm font-semibold flex items-center">
                      Conacted <IoEllipse className="text-green-500 ml-1" />
                    </h2>
                  </div>
                </div>

                <div className="bg-white p-2 rounded-lg shadow flex justify-between items-between">
                  <div>
                    <h2 className="text-sm font-semibold">Number</h2>
                    <h2 className="text-lg">50</h2>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold flex  text-center">
                      State
                    </h2>
                    <h2 className="text-sm font-semibold flex items-center">
                      Not Conacted <IoEllipse className="text-red-500 ml-1" />
                    </h2>
                  </div>
                </div>
              </div>

              {/* الرسم الدائري */}
              <div className="relative flex items-center justify-center">
                <div className="w-32 h-32 flex flex-col items-center justify-center bg-transparent border-8 border-green-400 rounded-full shadow-lg">
                  <h3 className="text-lg font-semibold">Models</h3>
                  <h3 className="text-2xl font-bold text-white">600</h3>
                  <h3 className="text-sm ">Total</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Dashboard.propTypes = {
  isLoggedIn: PropTypes.bool,
  isRegisterIn: PropTypes.bool,
};

export default Dashboard;
