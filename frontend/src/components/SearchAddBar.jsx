import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";

const SearchAddBar = ({
  onSearch = null,
  onAdd,
  link,
  showBackButton = false,
  onBack = () => {},
  children = null,
}) => {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-md shadow-md mb-4">
      <div className="flex items-center space-x-4">
        {/* زر الرجوع */}
        {showBackButton && (
          <button
            onClick={onBack}
            className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition duration-300"
          >
            الرجوع
          </button>
        )}

        {/* حقل البحث */}
        {onSearch && (
          <input
            type="text"
            placeholder={`ابحث عن ${onAdd}...`}
            onChange={(e) => onSearch(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 w-64"
          />
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Slot للأطفال (أي عناصر إضافية) */}
        {children}

        {/* زر الإضافة */}
        <NavLink
          to={link}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
        >
          إضافة {onAdd} جديد
        </NavLink>
      </div>
    </div>
  );
};

SearchAddBar.propTypes = {
  onSearch: PropTypes.func,
  onAdd: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  showBackButton: PropTypes.bool,
  onBack: PropTypes.func,
  children: PropTypes.node,
};
export default SearchAddBar;
