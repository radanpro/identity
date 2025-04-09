import { Bell, User, Menu } from "lucide-react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ page, onToggleSidebar, isLoggedIn, isRegisterIn }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/users/profile");
  };

  return (
    <header className="flex justify-between items-center m-1 p-4 border-b bg-sky-50 shadow-md rounded-md lg:pb-10">
      <div className="flex items-center space-x-4">
        {/* Open Sidebar button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-gray-600 hover:text-gray-900"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <p className="text-sm text-gray-500">Page / {page}</p>
          <h1 className="text-xl font-bold text-gray-800">{page}</h1>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications icon */}
        <div className="relative">
          <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>
        {/* Check login status */}
        {isLoggedIn ? (
          // If logged in, show profile icon
          <div
            className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer"
            onClick={handleProfileClick}
          >
            <User className="w-6 h-6 text-gray-600" />
          </div>
        ) : (
          // If not logged in, show login/register buttons
          <div className="flex items-center space-x-4">
            <Link
              to="/users/login"
              className="bg-gray-300 font-medium hover:underline p-1 rounded-md text-blue-500"
            >
              Login
            </Link>
            {!isRegisterIn && (
              <Link
                to="/users/register"
                className="bg-green-500 font-medium hover:underline p-1 rounded-md text-white"
              >
                Register
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

Header.propTypes = {
  page: PropTypes.string.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  isRegisterIn: PropTypes.bool.isRequired,
};

export default Header;
