import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";

const SearchAddBar = ({ onSearch, onAdd }) => {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-md shadow-md mb-4">
      {/* حقل البحث */}
      <input
        type="text"
        placeholder={`ابحث عن ${onAdd}...`}
        onChange={(e) => onSearch(e.target.value)}
        className="border border-gray-300 rounded-md px-4 py-2 mr-4 "
      />

      {/* زر إضافة جديد */}
      <NavLink
        to="/add-student"
        className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md max-w-sm md:w-64 ml-4  hover:bg-blue-600 transition duration-300 text-center"
      >
        إضافة {onAdd}جديد
      </NavLink>
    </div>
  );
};

SearchAddBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onAdd: PropTypes.string.isRequired,
};
export default SearchAddBar;
